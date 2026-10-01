import os
import urllib.request
import zipfile
import io

DATA_RAW_DIR = os.path.join(os.path.dirname(__file__), "..", "data_raw")
os.makedirs(DATA_RAW_DIR, exist_ok=True)

SOURCES = {
    "fin_data.json": "https://cosettechichirau.github.io/reformaadm/fin_data.json",
    "maxp_result.geojson": "https://cosettechichirau.github.io/reformaadm/maxp_result.geojson",
    "ro_admin_lau_simplified_line.zip": "https://services.geo-spatial.org/data/administrative_boundaries/lau/ro_admin_lau_simplified_line.zip",
    "siruta_s1_2026.csv": "https://data.gov.ro/dataset/721c9059-5f87-4c79-9854-a1d5c18f58d5/resource/dac903f0-32b5-489a-89e7-2c80d96cf68d/download/siruta_s1_2026.csv"
}

headers = {'User-Agent': 'Mozilla/5.0'}

def descarca_fisiere():
    for filename, url in SOURCES.items():
        dest = os.path.join(DATA_RAW_DIR, filename)
        if os.path.exists(dest) and os.path.getsize(dest) > 1000:
            print(f"[OK Deja descarcat] {filename} ({os.path.getsize(dest)} octeti)")
            continue
        print(f"[Descarcare] {filename} de la {url}...")
        try:
            req = urllib.request.Request(url, headers=headers)
            with urllib.request.urlopen(req, timeout=60) as resp:
                data = resp.read()
                with open(dest, "wb") as f:
                    f.write(data)
                print(f"[Salvat] {filename} ({len(data)} octeti)")
        except Exception as e:
            print(f"[Eroare la {filename}]: {e}")

    # Dezarhivare linii granita daca exista zip
    zip_path = os.path.join(DATA_RAW_DIR, "ro_admin_lau_simplified_line.zip")
    if os.path.exists(zip_path):
        with zipfile.ZipFile(zip_path, 'r') as z:
            z.extractall(DATA_RAW_DIR)
            print("[Dezarhivat] ro_admin_lau_simplified_line.zip")

if __name__ == "__main__":
    descarca_fisiere()
