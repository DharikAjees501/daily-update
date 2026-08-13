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

def run_full_verification():
    print("==========================================================")
    print("      PHASE 3 FULL SYSTEM E2E VERIFICATION TEST SUITE     ")
    print("==========================================================")

    # 1. Employee Submission
    print("\n[Check 1] Employee Submits Daily Update...")
    update_res = post(f"{BASE_URL}/api/updates", {
        "employee_name": "Phase3 Test User",
        "date": "2026-08-13",
        "yesterday_work": "Built Phase 3 summary cards, employee roster, date presets, and search filters.",
        "today_plan": "Running complete E2E test verification suite.",
        "blockers": "None"
    })
    update_id = update_res["id"]
    emp_id = update_res["employee_id"]
    print(f" -> Submitted update ID: {update_id} for Employee '{update_res['employee']['name']}' (ID: {emp_id})")

    # 2. TL Login
    print("\n[Check 2] TL Login Verification...")
    login = post(f"{BASE_URL}/api/tl/login", {"username": "admin", "password": "password123"})
    print(f" -> TL Login: {login['message']} for user '{login['username']}'")

    # 3. Dashboard Counts
    print("\n[Check 3] Dashboard Summary Stats Metrics...")
    stats = get(f"{BASE_URL}/api/stats")
    print(f" -> Total Employees: {stats['total_employees']}")
    print(f" -> Active Employees: {stats['active_employees']}")
    print(f" -> Submitted Today: {stats['submitted_today']}")
    print(f" -> Pending Count: {stats['pending_count']}")
    print(f" -> Accepted Count: {stats['accepted_count']}")
    assert stats["total_employees"] > 0
    assert stats["submitted_today"] > 0

    # 4. Employee Filtering & Search
    print("\n[Check 4] Employee Name Search ('Phase3')...")
    search_results = get(f"{BASE_URL}/api/updates?search=Phase3")
    print(f" -> Found {len(search_results)} search match(es).")
    assert any(u["id"] == update_id for u in search_results)

    # 5. Date Range Filtering
    print("\n[Check 5] Date Range Filtering (August 2026)...")
    date_range_updates = get(f"{BASE_URL}/api/updates?start_date=2026-08-01&end_date=2026-08-31")
    print(f" -> Found {len(date_range_updates)} update(s) in date range.")
    assert len(date_range_updates) > 0

    # 6. Employee Management & Toggle Active/Inactive
    print("\n[Check 6] Employee Management & Status Toggle...")
    emp_deactivated = patch(f"{BASE_URL}/api/employees/{emp_id}", {"is_active": False})
    print(f" -> Deactivated Employee '{emp_deactivated['name']}': is_active = {emp_deactivated['is_active']}")
    assert emp_deactivated["is_active"] == False

    emp_reactivated = patch(f"{BASE_URL}/api/employees/{emp_id}", {"is_active": True})
    print(f" -> Reactivated Employee '{emp_reactivated['name']}': is_active = {emp_reactivated['is_active']}")
    assert emp_reactivated["is_active"] == True

    # 7. Employee History Timeline
    print("\n[Check 7] Employee History Retrieval for Employee ID {emp_id}...")
    history = get(f"{BASE_URL}/api/updates?employee_id={emp_id}")
    print(f" -> Employee ID {emp_id} has {len(history)} historical submission(s).")
    assert len(history) > 0

    # 8. TL Review & Accept Status
    print("\n[Check 8] TL Review, Add Comment, and Accept Update...")
    review = patch(f"{BASE_URL}/api/updates/{update_id}/review", {
        "tl_status": "Accepted",
        "tl_comment": "Phase 3 usability requirements completely verified!"
    })
    print(f" -> Reviewed Update ID {update_id}: Status='{review['tl_status']}', Comment='{review['tl_comment']}'")
    assert review["tl_status"] == "Accepted"
    assert review["tl_comment"] == "Phase 3 usability requirements completely verified!"

    # 9. Direct SQLite Verification
    print("\n[Check 9] SQLite DB Direct Record Inspection...")
    db_path = os.path.join(os.path.dirname(__file__), "daily_update.db")
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    row = cursor.execute("SELECT tl_status, tl_comment, reviewed_at FROM daily_updates WHERE id = ?", (update_id,)).fetchone()
    conn.close()
    print(f" -> SQLite DB Row: status='{row[0]}', comment='{row[1]}', reviewed_at='{row[2]}'")
    assert row[0] == "Accepted"
    assert row[1] == "Phase 3 usability requirements completely verified!"

    print("\n==========================================================")
    print("  >>> ALL PHASE 3 VERIFICATION CHECKS PASSED SUCCESSFULLY! <<<")
    print("==========================================================")

if __name__ == "__main__":
    run_full_verification()
