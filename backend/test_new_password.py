import urllib.request
import urllib.error
import json

BASE_URL = "http://127.0.0.1:8000"

def post(url, payload):
    data = json.dumps(payload).encode("utf-8")
    req = urllib.request.Request(url, data=data, headers={"Content-Type": "application/json"})
    with urllib.request.urlopen(req) as resp:
        return json.loads(resp.read().decode("utf-8"))

def test_login():
    print("--- 1. Testing TL Login with new password 'prasanthaiteam' ---")
    res = post(f"{BASE_URL}/api/tl/login", {"username": "admin", "password": "prasanthaiteam"})
    print("Success response:", res)
    assert res["success"] == True

    print("\n--- 2. Testing Incorrect Password & Clean Error Message ---")
    try:
        post(f"{BASE_URL}/api/tl/login", {"username": "admin", "password": "wrongpassword"})
        assert False, "Should fail with HTTP 401"
    except urllib.error.HTTPError as e:
        err_data = json.loads(e.read().decode("utf-8"))
        print("Error response:", err_data)
        assert err_data["detail"] == "Invalid TL username or password."
        assert "(Hint:" not in err_data["detail"]

    print("\n>>> TL LOGIN PASSWORD UPDATE & CLEAN ERROR MESSAGE VERIFIED! <<<")

if __name__ == "__main__":
    test_login()
