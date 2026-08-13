import urllib.request
import json
import sqlite3
import os

BASE_URL = "http://127.0.0.1:8000"

def post(url, payload):
    data = json.dumps(payload).encode("utf-8")
    req = urllib.request.Request(url, data=data, headers={"Content-Type": "application/json"})
    with urllib.request.urlopen(req) as resp:
        return json.loads(resp.read().decode("utf-8"))

def patch(url, payload):
    data = json.dumps(payload).encode("utf-8")
    req = urllib.request.Request(url, data=data, headers={"Content-Type": "application/json"}, method="PATCH")
    with urllib.request.urlopen(req) as resp:
        return json.loads(resp.read().decode("utf-8"))

def get(url):
    req = urllib.request.Request(url)
    with urllib.request.urlopen(req) as resp:
        return json.loads(resp.read().decode("utf-8"))

def run_fresh_db_test():
    print("--- 1. Checking Fresh Stats ---")
    stats = get(f"{BASE_URL}/api/stats")
    print("Fresh stats:", stats)
    assert stats["total_employees"] == 0, "Database should start with 0 employees!"
    assert stats["submitted_today"] == 0, "Database should start with 0 updates!"

    print("\n--- 2. TL Adds First Employee 'David Miller' ---")
    emp = post(f"{BASE_URL}/api/employees", {"name": "David Miller"})
    print("Created Employee:", emp)
    assert emp["id"] == 1

    print("\n--- 3. Employee 'David Miller' Submits Update ---")
    update = post(f"{BASE_URL}/api/updates", {
        "employee_id": emp["id"],
        "date": "2026-08-13",
        "yesterday_work": "Setup fresh database and light green & white dashboard theme.",
        "today_plan": "Verifying production readiness.",
        "blockers": "None"
    })
    print("Submitted Update:", update)
    assert update["id"] == 1

    print("\n--- 4. TL Reviews & Accepts Update ---")
    review = patch(f"{BASE_URL}/api/updates/{update['id']}/review", {
        "tl_status": "Accepted",
        "tl_comment": "Approved! Clean theme and fresh database initialized."
    })
    print("Reviewed Update:", review)
    assert review["tl_status"] == "Accepted"

    print("\n>>> FRESH DATABASE & SYSTEM E2E VERIFICATION PASSED! <<<")

if __name__ == "__main__":
    run_fresh_db_test()
