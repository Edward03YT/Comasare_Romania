import os
import sys
import json
import argparse
import urllib.request

def seed(scope="arges"):
    supabase_url = os.environ.get("NEXT_PUBLIC_SUPABASE_URL")
    supabase_key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY") or os.environ.get("NEXT_PUBLIC_SUPABASE_ANON_KEY")

    if not supabase_url or not supabase_key:
        print("[Info] Variabilele NEXT_PUBLIC_SUPABASE_URL si SUPABASE_SERVICE_ROLE_KEY nu sunt configurate in mediu.")
        print("[Info] Pentru a rula seed-ul direct in Supabase:")
        print("  1. Creati un fisier .env.local cu NEXT_PUBLIC_SUPABASE_URL si SUPABASE_SERVICE_ROLE_KEY")
        print("  2. Aplicati migratia din supabase/migrations/20260914000000_init_uat_schema.sql in Supabase SQL Editor")
        print("  3. Rulati: python scripts/03_seed_supabase.py --scope arges (sau --scope all)")
        print("[Info] Fisierele GeoJSON si datele JSON sunt pregatite in public/data/ pentru utilizare imediata.")
        return

    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    filename = "uat_arges.json" if scope == "arges" else "uat_national.json"
    uat_path = os.path.join(base_dir, "public", "data", filename)
    
    with open(uat_path, "r", encoding="utf-8") as f:
        geojson = json.load(f)

    rows = []
    for feat in geojson["features"]:
        p = feat["properties"]
        rows.append({
            "siruta_cod": p["siruta"],
            "nume": p["nume"],
            "judet": p["judet"],
            "tip": p["tip"],
            "populatie": p["populatie"],
            "cheltuieli_functionare": p["cheltuieli_functionare"],
            "cheltuieli_dezvoltare": p["cheltuieli_dezvoltare"],
            "venituri_proprii": p["venituri_proprii"],
            "venituri_totale": p["venituri_totale"]
        })

    print(f"[Supabase] Trimitere {len(rows)} inregistrari UAT ({scope})...")
    endpoint = f"{supabase_url}/rest/v1/uat"
    headers = {
        "apikey": supabase_key,
        "Authorization": f"Bearer {supabase_key}",
        "Content-Type": "application/json",
        "Prefer": "resolution=merge-duplicates"
    }

    # trimitere in batch-uri de 200
    batch_size = 200
    for i in range(0, len(rows), batch_size):
        batch = rows[i:i+batch_size]
        req = urllib.request.Request(endpoint, data=json.dumps(batch).encode('utf-8'), headers=headers, method="POST")
        try:
            with urllib.request.urlopen(req) as resp:
                print(f"  Batch {i//batch_size + 1}/{(len(rows)-1)//batch_size + 1} trimis. Status: {resp.status}")
        except Exception as e:
            print(f"  Eroare la batch {i}: {e}")

    print("[Supabase] Seed UAT finalizat.")

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--scope", default="arges", choices=["arges", "all"])
    args = parser.parse_args()
    seed(args.scope)
