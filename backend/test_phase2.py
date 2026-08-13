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

def test_phase2_backend():
    print("--- 1. Testing TL Login ---")
    login_res = post(f"{BASE_URL}/api/tl/login", {"username": "admin", "password": "password123"})
    print("TL Login Result:", login_res)
    assert login_res["success"] == True

    print("\n--- 2. Submitting New Employee Update ---")
    new_update = post(f"{BASE_URL}/api/updates", {
        "employee_name": "Phase2 Test Employee",
        "date": "2026-08-13",
        "yesterday_work": "Finished Phase 1 backend and frontend integration.",
        "today_plan": "Testing Phase 2 TL Dashboard review APIs.",
        "blockers": "None"
    })
    print("Submitted Update:", new_update)
    assert new_update["tl_status"] == "Pending"

    update_id = new_update["id"]

    print("\n--- 3. Testing Filters on GET /api/updates ---")
    pending_updates = get(f"{BASE_URL}/api/updates?status=Pending")
    print(f"Pending updates count: {len(pending_updates)}")
    assert any(u["id"] == update_id for u in pending_updates)

    print("\n--- 4. Testing TL Review (Add Comment & Accept Update) ---")
    review_res = patch(f"{BASE_URL}/api/updates/{update_id}/review", {
        "tl_status": "Accepted",
        "tl_comment": "Excellent progress! Phase 2 review approved."
    })
    print("Reviewed Update Result:", review_res)
    assert review_res["tl_status"] == "Accepted"
    assert review_res["tl_comment"] == "Excellent progress! Phase 2 review approved."

    print("\n--- 5. Verifying Filter by Status='Accepted' ---")
    accepted_updates = get(f"{BASE_URL}/api/updates?status=Accepted")
    print(f"Accepted updates count: {len(accepted_updates)}")
    assert any(u["id"] == update_id for u in accepted_updates)

    print("\n--- 6. Direct SQLite Database Verification ---")
    db_path = os.path.join(os.path.dirname(__file__), "daily_update.db")
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    row = cursor.execute("SELECT tl_status, tl_comment, reviewed_at FROM daily_updates WHERE id = ?", (update_id,)).fetchone()
    print("SQLite Row Data:", row)
    assert row[0] == "Accepted"
    assert row[1] == "Excellent progress! Phase 2 review approved."
    assert row[2] is not None
    conn.close()

    print("\n>>> PHASE 2 BACKEND VERIFICATION PASSED SUCCESSFULLY! <<<")

if __name__ == "__main__":
    test_phase2_backend()
