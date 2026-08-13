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

def run_e2e_test():
    print("==================================================")
    print("    STARTING END-TO-END FLOW VERIFICATION         ")
    print("==================================================")

    # 1. Employee submits update
    print("\n[Step 1] Employee 'Sarah Jenkins' submits daily work update...")
    update_res = post(f"{BASE_URL}/api/updates", {
        "employee_name": "Sarah Jenkins",
        "date": "2026-08-13",
        "yesterday_work": "Completed frontend Phase 2 design integration.",
        "today_plan": "Running E2E tests and verifying TL acceptance workflow.",
        "blockers": "None"
    })
    update_id = update_res["id"]
    print(f" -> Update created with ID: {update_id}, Initial Status: {update_res['tl_status']}")
    assert update_res["tl_status"] == "Pending"

    # 2. TL Login
    print("\n[Step 2] Team Lead logs into TL Portal...")
    login_res = post(f"{BASE_URL}/api/tl/login", {
        "username": "admin",
        "password": "password123"
    })
    print(f" -> TL Login response: {login_res['message']} for user '{login_res['username']}'")
    assert login_res["success"] == True

    # 3. TL sees update and filters by employee & date
    print("\n[Step 3] TL fetches updates filtered by Date='2026-08-13' and Status='Pending'...")
    pending_updates = get(f"{BASE_URL}/api/updates?date=2026-08-13&status=Pending")
    print(f" -> Found {len(pending_updates)} pending update(s) for 2026-08-13.")
    target_update = next(u for u in pending_updates if u["id"] == update_id)
    print(f" -> Located update for employee: {target_update['employee']['name']}")

    # 4. TL opens update, adds comment, and marks as Accepted
    print("\n[Step 4] TL adds review comment and accepts update...")
    review_res = patch(f"{BASE_URL}/api/updates/{update_id}/review", {
        "tl_status": "Accepted",
        "tl_comment": "Great work on Phase 2 implementation, Sarah!"
    })
    print(f" -> Review saved! Status: {review_res['tl_status']}, Comment: '{review_res['tl_comment']}'")
    assert review_res["tl_status"] == "Accepted"
    assert review_res["tl_comment"] == "Great work on Phase 2 implementation, Sarah!"

    # 5. Direct SQLite verification
    print("\n[Step 5] Direct SQLite Database persistence check...")
    db_path = os.path.join(os.path.dirname(__file__), "daily_update.db")
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    row = cursor.execute("SELECT tl_status, tl_comment, reviewed_at FROM daily_updates WHERE id = ?", (update_id,)).fetchone()
    conn.close()

    print(f" -> SQLite record: status='{row[0]}', comment='{row[1]}', reviewed_at='{row[2]}'")
    assert row[0] == "Accepted"
    assert row[1] == "Great work on Phase 2 implementation, Sarah!"
    assert row[2] is not None

    print("\n==================================================")
    print("  >>> ALL END-TO-END FLOW TESTS PASSED! <<<      ")
    print("==================================================")

if __name__ == "__main__":
    run_e2e_test()
