import os
import sys
import json
import struct
import zlib
import urllib.request
import math

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_RAW_DIR = os.path.join(BASE_DIR, "data_raw")
OUTPUT_DIR = os.path.join(BASE_DIR, "public", "data")
os.makedirs(DATA_RAW_DIR, exist_ok=True)
os.makedirs(OUTPUT_DIR, exist_ok=True)

ZIP_URL = "https://download.geofabrik.de/europe/romania-latest-free.shp.zip"

def rdp(points, epsilon):
    """Simplificare Ramer-Douglas-Peucker pentru linii geografice."""
    if len(points) <= 2:
        return points
    p1 = points[0]
    p2 = points[-1]
    dx = p2[0] - p1[0]
    dy = p2[1] - p1[1]
    dist_sq = dx * dx + dy * dy
    if dist_sq == 0:
        return [p1, p2]
    
    max_d = 0.0
    index = 0
    inv_dist = 1.0 / math.sqrt(dist_sq)
    for i in range(1, len(points) - 1):
        p = points[i]
        num = abs(dy * p[0] - dx * p[1] + p2[0] * p1[1] - p2[1] * p1[0])
        d = num * inv_dist
        if d > max_d:
            max_d = d
            index = i
            
    if max_d > epsilon:
        left = rdp(points[:index+1], epsilon)
        right = rdp(points[index:], epsilon)
        return left[:-1] + right
    else:
        return [p1, p2]

def descarca_fisier_zip_entry(url, offset, comp_size, output_path):
    """Descarca si dezarhiveaza o intrare dintr-un zip folosind HTTP Range."""
    if os.path.exists(output_path) and os.path.getsize(output_path) > 1000:
        print(f"[CACHE] {os.path.basename(output_path)} exista deja.")
        return
    
    print(f"[DESCARCARE] Extragere {os.path.basename(output_path)} ({round(comp_size/1048576, 1)} MB)...")
    req = urllib.request.Request(url, headers={'Range': f'bytes={offset}-{offset+100}'})
    hdr = urllib.request.urlopen(req).read()
    nlen, elen = struct.unpack('<HH', hdr[26:30])
    
    data_start = offset + 30 + nlen + elen
    data_end = data_start + comp_size - 1
    
    req_data = urllib.request.Request(url, headers={'Range': f'bytes={data_start}-{data_end}'})
    
    # Descarcare in bucati de 4MB
    d = zlib.decompressobj(-zlib.MAX_WBITS)
    with urllib.request.urlopen(req_data) as resp, open(output_path, 'wb') as out_f:
        descarcat = 0
        while True:
            chunk = resp.read(4 * 1024 * 1024)
            if not chunk:
                break
            descarcat += len(chunk)
            out_f.write(d.decompress(chunk))
            print(f"   {round(descarcat/1048576, 1)} / {round(comp_size/1048576, 1)} MB...", end='\r')
        out_f.write(d.flush())
    print(f"\n[OK] Salvat {output_path} ({round(os.path.getsize(output_path)/1048576, 1)} MB)")

def citeste_dbf_matching(dbf_path):
    """Citeste DBF si gaseste inregistrarile care reprezinta autostrazi sau drumuri nationale."""
    print(f"[PROCESARE] Scanare {dbf_path}...")
    with open(dbf_path, 'rb') as f:
        data = f.read()
    
    num_records, header_len, record_len = struct.unpack('<IHH', data[4:12])
    print(f"   Total inregistrari DBF: {num_records:,}")
    
    # fclass este la offset 1 + 12 + 4 = 17, lungime 28
    # name este la offset 1 + 12 + 4 + 28 = 45, lungime 100
    # ref este la offset 1 + 12 + 4 + 28 + 100 = 145, lungime 20
    matching = {}
    fclass_valide = {
        'motorway': 'motorway',
        'motorway_link': 'motorway',
        'trunk': 'national',
        'trunk_link': 'national',
        'primary': 'national',
        'primary_link': 'national',
    }
    
    for i in range(num_records):
        pos = header_len + i * record_len
        fclass_raw = data[pos+17:pos+45].split(b'\x00')[0].strip().decode('ascii', errors='ignore')
        if fclass_raw in fclass_valide:
            tip = fclass_valide[fclass_raw]
            name = data[pos+45:pos+145].split(b'\x00')[0].strip().decode('latin1', errors='replace')
            ref = data[pos+145:pos+165].split(b'\x00')[0].strip().decode('ascii', errors='ignore')
            matching[i] = {
                'fclass': fclass_raw,
                'tip': tip,
                'name': name,
                'ref': ref
            }
    
    print(f"[OK] Drumuri selectate: {len(matching):,} inregistrari")
    return matching

def proceseaza_shp(shp_path, matching):
    """Extrage si simplifica geometria doar pentru drumurile potrivite."""
    print(f"[PROCESARE] Extragere geometrii din {shp_path}...")
    
    features_national = []
    features_arges = []
    
    # Bounding box Arges aproximativ
    ARGES_BBOX = (24.25, 44.35, 25.45, 45.65)
    
    with open(shp_path, 'rb') as f:
        shp_data = f.read()
    
    file_len = len(shp_data)
    pos = 100 # Salt peste headerul shp de 100 bytes
    rec_index = 0
    
    while pos < file_len:
        rec_num, content_len = struct.unpack('>II', shp_data[pos:pos+8])
        rec_bytes = content_len * 2
        content_pos = pos + 8
        
        if rec_index in matching:
            info = matching[rec_index]
            shape_type = struct.unpack('<I', shp_data[content_pos:content_pos+4])[0]
            
            if shape_type == 3: # PolyLine
                box = struct.unpack('<dddd', shp_data[content_pos+4:content_pos+36]) # xmin, ymin, xmax, ymax
                num_parts, num_points = struct.unpack('<II', shp_data[content_pos+36:content_pos+44])
                
                parts = struct.unpack(f'<{num_parts}I', shp_data[content_pos+44:content_pos+44+num_parts*4])
                points_pos = content_pos + 44 + num_parts * 4
                
                # Extragere puncte
                raw_coords = []
                for p_idx in range(num_points):
                    px, py = struct.unpack('<dd', shp_data[points_pos + p_idx*16 : points_pos + (p_idx+1)*16])
                    raw_coords.append((px, py))
                
                # Separa pe parti (linii)
                part_lines = []
                for p_i in range(num_parts):
                    start_idx = parts[p_i]
                    end_idx = parts[p_i + 1] if p_i + 1 < num_parts else num_points
                    line_pts = raw_coords[start_idx:end_idx]
                    
                    # Simplificare RDP (epsilon ~ 0.0006 coordonate geografice, aprox 50m)
                    if len(line_pts) > 2:
                        line_pts = rdp(line_pts, 0.0006)
                    
                    # Rotunjire la 4 zecimale (~11m, optim pentru harta web)
                    simplified = [[round(pt[0], 4), round(pt[1], 4)] for pt in line_pts]
                    if len(simplified) >= 2:
                        part_lines.append(simplified)
                
                if part_lines:
                    geom = {
                        "type": "MultiLineString" if len(part_lines) > 1 else "LineString",
                        "coordinates": part_lines if len(part_lines) > 1 else part_lines[0]
                    }
                    
                    feat = {
                        "type": "Feature",
                        "properties": {
                            "fclass": info['fclass'],
                            "tip": info['tip'],
                            "name": info['name'],
                            "ref": info['ref']
                        },
                        "geometry": geom
                    }
                    
                    features_national.append(feat)
                    
                    # Verificare intersectie Arges
                    if not (box[0] > ARGES_BBOX[2] or box[2] < ARGES_BBOX[0] or box[1] > ARGES_BBOX[3] or box[3] < ARGES_BBOX[1]):
                        features_arges.append(feat)
                        
        pos += 8 + rec_bytes
        rec_index += 1
        if rec_index % 100000 == 0:
            print(f"   Scanat {rec_index:,} / 1,060,523 inregistrari...", end='\r')
            
    print(f"\n[OK] Finalizat: {len(features_national):,} segmente nationale, {len(features_arges):,} segmente Arges")
    return features_national, features_arges

def main():
    dbf_local = os.path.join(DATA_RAW_DIR, "gis_osm_roads_free_1.dbf")
    shp_local = os.path.join(DATA_RAW_DIR, "gis_osm_roads_free_1.shp")
    
    # Descarca DBF (offset 453831059, comp_size 8588658)
    descarca_fisier_zip_entry(ZIP_URL, 453831059, 8588658, dbf_local)
    
    # Descarca SHP (offset 462420003, comp_size 173617343)
    descarca_fisier_zip_entry(ZIP_URL, 462420003, 173617343, shp_local)
    
    # Filtrare
    matching = citeste_dbf_matching(dbf_local)
    feat_nat, feat_arg = proceseaza_shp(shp_local, matching)
    
    # Salvare GeoJSON
    out_nat = os.path.join(OUTPUT_DIR, "drumuri_national.json")
    out_arg = os.path.join(OUTPUT_DIR, "drumuri_arges.json")
    
    print(f"[SALVARE] Scriere {out_nat}...")
    with open(out_nat, 'w', encoding='utf-8') as f:
        json.dump({"type": "FeatureCollection", "features": feat_nat}, f, separators=(',', ':'))
    print(f"[OK] drumuri_national.json: {round(os.path.getsize(out_nat)/1048576, 2)} MB")
    
    print(f"[SALVARE] Scriere {out_arg}...")
    with open(out_arg, 'w', encoding='utf-8') as f:
        json.dump({"type": "FeatureCollection", "features": feat_arg}, f, separators=(',', ':'))
    print(f"[OK] drumuri_arges.json: {round(os.path.getsize(out_arg)/1048576, 2)} MB")

if __name__ == "__main__":
    main()
