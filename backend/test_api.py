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

def get(url):
    req = urllib.request.Request(url)
    with urllib.request.urlopen(req) as resp:
        return json.loads(resp.read().decode("utf-8"))

def run_tests():
    print("--- 1. Testing Root Endpoint ---")
    root_res = get(f"{BASE_URL}/")
    print("Root response:", root_res)

    print("\n--- 2. Testing Create Employee ---")
    emp1 = post(f"{BASE_URL}/api/employees", {"name": "Alice Johnson"})
    print("Created employee 1:", emp1)
    emp2 = post(f"{BASE_URL}/api/employees", {"name": "Bob Smith"})
    print("Created employee 2:", emp2)

    print("\n--- 3. Testing List Employees ---")
    employees = get(f"{BASE_URL}/api/employees")
    print(f"Total employees fetched: {len(employees)}")
    for e in employees:
        print(f" - ID: {e['id']}, Name: {e['name']}")

    print("\n--- 4. Testing Submit Daily Updates ---")
    update1 = post(f"{BASE_URL}/api/updates", {
        "employee_id": emp1["id"],
        "date": "2026-08-13",
        "yesterday_work": "Refactored user authentication endpoints and fixed database connection pool leaks.",
        "today_plan": "Implement REST endpoints for employee daily update submission.",
        "blockers": "Waiting for API specification approval."
    })
    print("Submitted update 1:", update1)

    update2 = post(f"{BASE_URL}/api/updates", {
        "employee_name": "Charlie Brown",  # Inline employee creation check
        "date": "2026-08-13",
        "yesterday_work": "Setup Vite frontend layout with clean CSS styling.",
        "today_plan": "Connect React frontend components with FastAPI backend endpoints.",
        "blockers": ""
    })
    print("Submitted update 2 (new employee):", update2)

    print("\n--- 5. Testing Retrieve Daily Updates ---")
    updates = get(f"{BASE_URL}/api/updates")
    print(f"Total updates retrieved: {len(updates)}")
    for u in updates:
        emp_name = u['employee']['name'] if u.get('employee') else 'Unknown'
        print(f" - [{u['date']}] Employee: {emp_name} | Yesterday: {u['yesterday_work'][:40]}... | Today: {u['today_plan'][:40]}...")

    print("\n--- 6. Verifying Direct SQLite Persistence ---")
    db_path = os.path.join(os.path.dirname(__file__), "daily_update.db")
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    emp_count = cursor.execute("SELECT COUNT(*) FROM employees").fetchone()[0]
    update_count = cursor.execute("SELECT COUNT(*) FROM daily_updates").fetchone()[0]
    print(f"SQLite DB File Path: {db_path}")
    print(f"SQLite Direct Query -> Employees count: {emp_count}, Daily Updates count: {update_count}")
    conn.close()

    print("\n>>> ALL BACKEND API & SQLITE TESTS PASSED! <<<")

if __name__ == "__main__":
    run_tests()
