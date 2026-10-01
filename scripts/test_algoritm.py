import json
import os
import sys

if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8')

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
uat_arges_path = os.path.join(BASE_DIR, "public", "data", "uat_arges.json")
adj_arges_path = os.path.join(BASE_DIR, "public", "data", "adiacenta_arges.json")

def test_arges_data():
    with open(uat_arges_path, 'r', encoding='utf-8') as f:
        geo = json.load(f)
    with open(adj_arges_path, 'r', encoding='utf-8') as f:
        adj = json.load(f)

    uats = [feat['properties'] for feat in geo['features']]
    print(f"Test 1: Număr UAT-uri în Argeș: {len(uats)} (așteptat: 102)")
    assert len(uats) == 102, f"Așteptat 102, primit {len(uats)}"

    print(f"Test 2: Număr noduri adiacență: {len(adj)} (așteptat: 102)")
    assert len(adj) == 102, f"Așteptat 102, primit {len(adj)}"

    # Verificare simetrie adiacenta
    asimetrii = 0
    for uat_a, vecini in adj.items():
        for uat_b in vecini:
            uat_b_str = str(uat_b)
            if uat_b_str in adj and int(uat_a) not in adj[uat_b_str]:
                asimetrii += 1
    print(f"Test 3: Simetrie adiacență - asimetrii găsite: {asimetrii}")
    assert asimetrii == 0, f"Graful de adiacenta nu este simetric: {asimetrii} asimetrii"

    # Verificare cifre nenegative
    erori_buget = 0
    for u in uats:
        if u['populatie'] < 0 or u['cheltuieli_functionare'] < 0:
            erori_buget += 1
    print(f"Test 4: Date financiare nenegative - anomalii: {erori_buget}")
    assert erori_buget == 0, f"Găsite {erori_buget} valori negative"

    print("\nToate testele de integritate ale datelor pentru județul Argeș au trecut cu succes!")

if __name__ == "__main__":
    test_arges_data()
