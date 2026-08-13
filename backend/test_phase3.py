import urllib.request
import json
import sqlite3
import os

BASE_URL = "http://127.0.0.1:8000"

def get(url):
    req = urllib.request.Request(url)
    with urllib.request.urlopen(req) as resp:
        return json.loads(resp.read().decode("utf-8"))

def patch(url, payload):
    data = json.dumps(payload).encode("utf-8")
    req = urllib.request.Request(url, data=data, headers={"Content-Type": "application/json"}, method="PATCH")
    with urllib.request.urlopen(req) as resp:
        return json.loads(resp.read().decode("utf-8"))

def test_phase3_backend():
    print("--- 1. Testing GET /api/stats ---")
    stats = get(f"{BASE_URL}/api/stats")
    print("Dashboard Stats:", stats)
    assert "total_employees" in stats
    assert "active_employees" in stats
    assert "submitted_today" in stats
    assert "pending_count" in stats
    assert "accepted_count" in stats

    print("\n--- 2. Testing Employee List & Toggle Active/Inactive ---")
    employees = get(f"{BASE_URL}/api/employees")
    print(f"Total employees: {len(employees)}")
    emp = employees[0]
    emp_id = emp["id"]
    print(f"Deactivating employee ID {emp_id} ({emp['name']})...")
    deactivated = patch(f"{BASE_URL}/api/employees/{emp_id}", {"is_active": False})
    print("Deactivated response:", deactivated)
    assert deactivated["is_active"] == False

    print("Reactivating employee...")
    reactivated = patch(f"{BASE_URL}/api/employees/{emp_id}", {"is_active": True})
    print("Reactivated response:", reactivated)
    assert reactivated["is_active"] == True

    print("\n--- 3. Testing Employee Name Search in GET /api/updates ---")
    search_res = get(f"{BASE_URL}/api/updates?search=Sarah")
    print(f"Search 'Sarah' results count: {len(search_res)}")
    assert all("Sarah" in u["employee"]["name"] for u in search_res)

    print("\n--- 4. Testing Date Range Filter ---")
    range_res = get(f"{BASE_URL}/api/updates?start_date=2026-08-01&end_date=2026-08-31")
    print(f"Date range August 2026 updates count: {len(range_res)}")

    print("\n>>> PHASE 3 BACKEND API TESTS PASSED! <<<")

if __name__ == "__main__":
    test_phase3_backend()
