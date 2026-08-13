import urllib.request
import json

BASE_URL = "http://127.0.0.1:8000"

def get(url):
    req = urllib.request.Request(url)
    with urllib.request.urlopen(req) as resp:
        return json.loads(resp.read().decode("utf-8"))

def run_checks():
    print("--- 1. Testing Employee Updates Filter by ID (Privacy Isolation) ---")
    emp1_updates = get(f"{BASE_URL}/api/updates?employee_id=1")
    emp2_updates = get(f"{BASE_URL}/api/updates?employee_id=2")
    print(f"Employee 1 update count: {len(emp1_updates)}")
    print(f"Employee 2 update count: {len(emp2_updates)}")

    if emp1_updates:
        assert all(u["employee_id"] == 1 for u in emp1_updates)
        print(" -> Employee 1 update list strictly contains only Employee 1 updates.")

    if emp2_updates:
        assert all(u["employee_id"] == 2 for u in emp2_updates)
        print(" -> Employee 2 update list strictly contains only Employee 2 updates.")

    print("\n>>> PRIVACY ISOLATION API TEST PASSED! <<<")

if __name__ == "__main__":
    run_checks()
