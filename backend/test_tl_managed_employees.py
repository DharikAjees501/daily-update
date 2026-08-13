import urllib.request
import json

BASE_URL = "http://127.0.0.1:8000"

def get(url):
    req = urllib.request.Request(url)
    with urllib.request.urlopen(req) as resp:
        return json.loads(resp.read().decode("utf-8"))

def post(url, payload):
    data = json.dumps(payload).encode("utf-8")
    req = urllib.request.Request(url, data=data, headers={"Content-Type": "application/json"})
    with urllib.request.urlopen(req) as resp:
        return json.loads(resp.read().decode("utf-8"))

def run_tests():
    print("--- 1. Testing Employee Dropdown List (Active Employees Only) ---")
    active_employees = get(f"{BASE_URL}/api/employees?active_only=true")
    print(f"Active employees count: {len(active_employees)}")
    assert len(active_employees) > 0, "Should have active employees configured by TL."
    
    first_emp = active_employees[0]
    print(f" -> Selected Employee: ID {first_emp['id']} ({first_emp['name']})")

    print("\n--- 2. Submitting Update for Selected Employee ID ---")
    update_res = post(f"{BASE_URL}/api/updates", {
        "employee_id": first_emp["id"],
        "date": "2026-08-13",
        "yesterday_work": "Completed TL employee roster verification.",
        "today_plan": "Verifying employee portal dropdown isolation.",
        "blockers": ""
    })
    print(f" -> Submitted update ID {update_res['id']} for Employee ID {update_res['employee_id']}")
    assert update_res["employee_id"] == first_emp["id"]

    print("\n--- 3. Verifying Selected Employee History Isolation ---")
    history = get(f"{BASE_URL}/api/updates?employee_id={first_emp['id']}")
    print(f" -> Employee ID {first_emp['id']} update history count: {len(history)}")
    assert all(u["employee_id"] == first_emp["id"] for u in history)
    
    print("\n>>> TL-MANAGED EMPLOYEE & DROPDOWN ISOLATION TEST PASSED! <<<")

if __name__ == "__main__":
    run_tests()
