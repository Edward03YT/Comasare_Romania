import os
import json
import struct

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_RAW_DIR = os.path.join(BASE_DIR, "data_raw")
OUTPUT_DIR = os.path.join(BASE_DIR, "public", "data")
os.makedirs(OUTPUT_DIR, exist_ok=True)

def citeste_dbf(dbf_path):
    with open(dbf_path, 'rb') as f:
        data = f.read()
    num_records, header_len, record_len = struct.unpack('<IHH', data[4:12])
    num_fields = (header_len - 33) // 32
    fields = []
    for i in range(num_fields):
        offset = 32 + i * 32
        name = data[offset:offset+11].split(b'\x00')[0].decode('ascii')
        typ = chr(data[offset+11])
        length = data[offset+16]
        fields.append((name, typ, length))
    
    records = []
    for i in range(num_records):
        start = header_len + i * record_len
        if data[start] == 0x2A: # deleted
            continue
        rec = {}
        pos = 1
        for name, typ, length in fields:
            val = data[start + pos : start + pos + length].decode('latin1', errors='replace').strip()
            rec[name] = val
            pos += length
        records.append(rec)
    return records

def extrage_adiacenta():
    dbf_file = os.path.join(DATA_RAW_DIR, "ro_admin_lau_simplified_line.dbf")
    if not os.path.exists(dbf_file):
        print(f"[Avertisment] Nu s-a gasit {dbf_file}")
        return {}
    
    print("[Procesare] Citire adiacenta din dbf...")
    records = citeste_dbf(dbf_file)
    adiacenta = {}
    
    for r in records:
        try:
            left_id = int(r.get('leftId', 0))
            right_id = int(r.get('rightId', 0))
            if left_id > 0 and right_id > 0 and left_id != right_id:
                if left_id not in adiacenta:
                    adiacenta[left_id] = set()
                if right_id not in adiacenta:
                    adiacenta[right_id] = set()
                adiacenta[left_id].add(right_id)
                adiacenta[right_id].add(left_id)
        except ValueError:
            continue
    
    print(f"[OK] Graful contine adiacente pentru {len(adiacenta)} UAT-uri")
    # Convertim set la list pentru JSON
    return {str(k): sorted(list(v)) for k, v in adiacenta.items()}

def proceseaza():
    # 1. Citire date financiare
    fin_file = os.path.join(DATA_RAW_DIR, "fin_data.json")
    with open(fin_file, 'r', encoding='utf-8') as f:
        fin_data = json.load(f)
    print(f"[OK] Date financiare incarcate: {len(fin_data)} inregistrari")

    # 2. Citire adiacenta
    adiacenta = extrage_adiacenta()

    # 3. Citire GeoJSON complet
    geo_file = os.path.join(DATA_RAW_DIR, "maxp_result.geojson")
    with open(geo_file, 'r', encoding='utf-8') as f:
        geojson = json.load(f)
    print(f"[OK] GeoJSON incarcat: {len(geojson['features'])} poligoane")

    # 4. Imbinare date
    uat_national = []
    uat_arges = []
    adiacenta_arges = {}
    index_national = []

    siruta_arges_set = set()

    for feat in geojson['features']:
        props = feat['properties']
        siruta = str(props.get('siruta', '')).strip()
        siruta_int = int(siruta) if siruta.isdigit() else 0
        
        judet = str(props.get('judet', '')).strip()
        nume = str(props.get('denumire', '')).strip()
        
        fin = fin_data.get(siruta, {})
        populatie = int(fin.get('population', props.get('populatie', 0)) or 0)
        
        # Deductie tip UAT
        nume_upper = nume.upper()
        if "MUNICIPIUL" in nume_upper or props.get('natLevName') == 'Municipiu':
            tip = "Municipiu"
        elif "ORAS" in nume_upper or props.get('natLevName') == 'Oras':
            tip = "Oras"
        else:
            tip = "Comuna"

        curated_props = {
            "siruta": siruta_int,
            "nume": nume,
            "judet": judet,
            "tip": tip,
            "populatie": populatie,
            "cheltuieli_functionare": float(fin.get('chelt_functionare', 0) or 0),
            "cheltuieli_dezvoltare": float(fin.get('chelt_dezvoltare', 0) or 0),
            "venituri_proprii": float(fin.get('own_revenues', 0) or 0),
            "venituri_totale": float(fin.get('total_venituri', 0) or 0),
            "chelt_personal": float(fin.get('chelt_personal', 0) or 0),
            "exec_personnel": float(fin.get('exec_personnel', 0) or 0),
            "impozit_venit_colectat": float(fin.get('pit_total', 0) or 0),
            "are_date_buget": bool(siruta in fin_data)
        }

        # Rotunjire coordonate la 5 zecimale (~1m precizie, reduce drastic dimensiunea fisierului)
        def rotunjeste(coords):
            if isinstance(coords[0], (int, float)):
                return [round(coords[0], 5), round(coords[1], 5)]
            return [rotunjeste(c) for c in coords]

        clean_geom = {
            "type": feat['geometry']['type'],
            "coordinates": rotunjeste(feat['geometry']['coordinates'])
        }

        import unicodedata
        def strip_accents(s):
            return ''.join(c for c in unicodedata.normalize('NFKD', s) if not unicodedata.combining(c))

        judet_norm = strip_accents(judet).upper()

        curated_feat = {
            "type": "Feature",
            "id": siruta_int,
            "properties": curated_props,
            "geometry": clean_geom
        }

        uat_national.append(curated_feat)
        index_national.append(curated_props)

        if judet_norm == "ARGES":
            uat_arges.append(curated_feat)
            siruta_arges_set.add(siruta_int)

    # Adiacenta restransa la Arges
    for s_id in siruta_arges_set:
        s_str = str(s_id)
        if s_str in adiacenta:
            # pastram toti vecinii din adiacenta
            adiacenta_arges[s_str] = adiacenta[s_str]

    # Salvare fisiere
    with open(os.path.join(OUTPUT_DIR, "uat_arges.json"), "w", encoding="utf-8") as f:
        json.dump({"type": "FeatureCollection", "features": uat_arges}, f, ensure_ascii=False)
    print(f"[Salvat] uat_arges.json ({len(uat_arges)} UAT-uri)")

    with open(os.path.join(OUTPUT_DIR, "adiacenta_arges.json"), "w", encoding="utf-8") as f:
        json.dump(adiacenta_arges, f, ensure_ascii=False)
    print(f"[Salvat] adiacenta_arges.json ({len(adiacenta_arges)} noduri)")

    with open(os.path.join(OUTPUT_DIR, "uat_national.json"), "w", encoding="utf-8") as f:
        json.dump({"type": "FeatureCollection", "features": uat_national}, f, ensure_ascii=False)
    print(f"[Salvat] uat_national.json ({len(uat_national)} UAT-uri)")

    with open(os.path.join(OUTPUT_DIR, "adiacenta_national.json"), "w", encoding="utf-8") as f:
        json.dump(adiacenta, f, ensure_ascii=False)
    print(f"[Salvat] adiacenta_national.json ({len(adiacenta)} noduri)")

    with open(os.path.join(OUTPUT_DIR, "uat_index.json"), "w", encoding="utf-8") as f:
        json.dump(index_national, f, ensure_ascii=False)
    print(f"[Salvat] uat_index.json ({len(index_national)} inregistrari index)")

if __name__ == "__main__":
    proceseaza()
