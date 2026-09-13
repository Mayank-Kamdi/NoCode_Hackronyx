import requests
import json

BASE_URL = "http://localhost:8000"

def test_twilio_integration():
    print("\n==================================================")
    print("TESTING ABHAYA TWILIO EMERGENCY ALERT DISPATCH")
    print("==================================================\n")

    payload = {
        "device_id": "CAM-001",
        "location": "Main Gate North",
        "risk_score": 94.0,
        "severity": "CRITICAL",
        "event_type": "HIGH_RISK_THREAT",
        "message": "Critical safety risk detected near main entrance.",
        "recipient_phone": "+919373156804"
    }

    print("[STEP 1] Posting CRITICAL alert to /alert ...")
    res = requests.post(f"{BASE_URL}/alert", json=payload)
    print(" -> Response Status:", res.status_code)
    print(" -> Response Body:", json.dumps(res.json(), indent=2))
    assert res.status_code == 200

    print("\n==================================================")
    print("[SUCCESS] TWILIO ALERT DISPATCH SERVICE VERIFIED!")
    print("==================================================\n")

if __name__ == "__main__":
    test_twilio_integration()
