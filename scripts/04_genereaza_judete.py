import json
import os

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
judete_path = os.path.join(BASE_DIR, "public", "data", "judete_national.json")

def calculeaza_centroid_inel(coords):
    # Algoritm standard centroid poligon (Green's theorem)
    area = 0.0
    cx = 0.0
    cy = 0.0
    n = len(coords)
    if n < 3:
        return (coords[0][0], coords[0][1], 0.0)

    for i in range(n - 1):
        x0, y0 = coords[i]
        x1, y1 = coords[i + 1]
        cross = x0 * y1 - x1 * y0
        area += cross
        cx += (x0 + x1) * cross
        cy += (y0 + y1) * cross

    area = area * 0.5
    if abs(area) < 1e-9:
        # fallback pe media aritmetica daca poligonul e degenerat
        x_avg = sum(c[0] for c in coords[:-1]) / (n - 1)
        y_avg = sum(c[1] for c in coords[:-1]) / (n - 1)
        return (x_avg, y_avg, 0.0)

    cx = cx / (6.0 * area)
    cy = cy / (6.0 * area)
    return (cx, cy, abs(area))

def calculeaza_centroid_geometrie(geom):
    gtype = geom['type']
    coords = geom['coordinates']

    if gtype == 'Polygon':
        cx, cy, _ = calculeaza_centroid_inel(coords[0])
        return [round(cy, 5), round(cx, 5)] # lat, lng

    elif gtype == 'MultiPolygon':
        total_area = 0.0
        weighted_cx = 0.0
        weighted_cy = 0.0

        for poly in coords:
            cx, cy, area = calculeaza_centroid_inel(poly[0])
            weighted_cx += cx * area
            weighted_cy += cy * area
            total_area += area

        if total_area > 0:
            cx = weighted_cx / total_area
            cy = weighted_cy / total_area
        else:
            cx, cy, _ = calculeaza_centroid_inel(coords[0][0])
        return [round(cy, 5), round(cx, 5)] # [lat, lng]

    return [45.94, 24.96]

def proceseaza_judete():
    with open(judete_path, 'r', encoding='utf-8') as f:
        data = json.load(f)

    features = data['features']
    print(f"Procesare {len(features)} judete...")

    judete_arges = []

    for feat in features:
        judet_nume = feat['properties'].get('judet', '')
        centroid = calculeaza_centroid_geometrie(feat['geometry'])
        feat['properties']['centroid'] = centroid
        feat['properties']['nume_formatat'] = judet_nume.upper()

        if judet_nume.upper() in ['ARGEȘ', 'ARGES']:
            judete_arges.append(feat)

    # Salvare national
    with open(judete_path, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False)
    print(f"[OK] public/data/judete_national.json actualizat cu centroizi ({len(features)} judete)")

    # Salvare Arges
    arges_path = os.path.join(BASE_DIR, "public", "data", "judete_arges.json")
    with open(arges_path, 'w', encoding='utf-8') as f:
        json.dump({"type": "FeatureCollection", "features": judete_arges}, f, ensure_ascii=False)
    print(f"[OK] public/data/judete_arges.json salvat ({len(judete_arges)} judet)")

if __name__ == "__main__":
    proceseaza_judete()
