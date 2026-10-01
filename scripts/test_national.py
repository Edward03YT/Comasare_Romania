import json
import os
import sys

if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8')

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
uat_national_path = os.path.join(BASE_DIR, "public", "data", "uat_national.json")
adj_national_path = os.path.join(BASE_DIR, "public", "data", "adiacenta_national.json")

def test_national_data():
    with open(uat_national_path, 'r', encoding='utf-8') as f:
        geo = json.load(f)
    with open(adj_national_path, 'r', encoding='utf-8') as f:
        adj = json.load(f)

    uats = [feat['properties'] for feat in geo['features']]
    print(f"Test 1: Număr UAT-uri național: {len(uats)} (așteptat: 3186)")
    assert len(uats) == 3186, f"Așteptat 3186, primit {len(uats)}"

    print(f"Test 2: Număr noduri adiacență național: {len(adj)} (așteptat: 3186)")
    assert len(adj) == 3186, f"Așteptat 3186, primit {len(adj)}"

    # Verificare simetrie adiacenta
    asimetrii = 0
    for uat_a, vecini in adj.items():
        for uat_b in vecini:
            uat_b_str = str(uat_b)
            if uat_b_str in adj and int(uat_a) not in adj[uat_b_str]:
                asimetrii += 1
    print(f"Test 3: Simetrie adiacență național - asimetrii găsite: {asimetrii}")
    assert asimetrii == 0, f"Graful de adiacență conține {asimetrii} asimetrii"

    print("\nToate testele pentru setul complet de date naționale (3.186 UAT-uri) au trecut cu succes!")

if __name__ == "__main__":
    test_national_data()
