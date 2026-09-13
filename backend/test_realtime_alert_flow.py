import requests
import asyncio
import websockets
import json

BASE_URL = "http://localhost:8000"
WS_URL = "ws://localhost:8000/ws/security"

async def test_end_to_end_realtime_sos_flow():
    print("\n==================================================")
    print("STARTING ABHAYA REAL-TIME MOBILE SOS PROTOCOL TEST")
    print("==================================================\n")

    # Step 1: Connect Phone B (Receiver) via persistent WebSocket
    print("[STEP 1] Phone B (Receiver) connecting to WebSocket at ws://localhost:8000/ws/security ...")
    async with websockets.connect(WS_URL) as ws:
        print(" -> [SUCCESS] Phone B connected to WS /ws/security")

        # Step 2: Phone A (Sender) triggers real HTTP POST /alert request with GPS coordinates
        print("\n[STEP 2] Phone A (Sender) making HTTP POST /alert request with real GPS coordinates ...")
        payload = {
            "device_id": "PHONE-001",
            "alert_id": "ABH-SOS-999",
            "alert_type": "SOS",
            "latitude": 21.1458,
            "longitude": 79.0882,
            "accuracy": 12.5,
            "timestamp": "2026-08-14T07:48:00Z",
            "message": "Emergency SOS alert"
        }
        
        response = requests.post(f"{BASE_URL}/alert", json=payload)
        assert response.status_code == 200, f"HTTP POST /alert failed: {response.status_code}"
        res_data = response.json()
        print(f" -> [HTTP RESPONSE FROM FASTAPI] {res_data}")
        assert res_data["success"] == True
        alert_id = res_data["alert_id"]
        print(f" -> Verified Alert ID: {alert_id}")

        # Step 3: Phone B receives WebSocket broadcast payload instantly
        print(f"\n[STEP 3] Phone B awaiting WebSocket broadcast for {alert_id} ...")
        ws_msg_raw = await asyncio.wait_for(ws.recv(), timeout=5.0)
        ws_msg = json.loads(ws_msg_raw)
        
        # Handle telemetry frames if received
        while ws_msg.get("type") == "REALTIME_TELEMETRY" or ws_msg.get("type") == "pong":
            ws_msg_raw = await asyncio.wait_for(ws.recv(), timeout=5.0)
            ws_msg = json.loads(ws_msg_raw)

        print(f" -> [WEBSOCKET RECEIVED ON PHONE B] {json.dumps(ws_msg, indent=2)}")
        assert ws_msg["alert_id"] == alert_id
        assert ws_msg["device_id"] == "PHONE-001"
        assert ws_msg["latitude"] == 21.1458
        assert ws_msg["longitude"] == 79.0882

        # Step 4: Phone B sends Acknowledgement HTTP POST /alert/{alert_id}/acknowledge
        print(f"\n[STEP 4] Phone B sending POST /alert/{alert_id}/acknowledge ...")
        ack_res = requests.post(f"{BASE_URL}/alert/{alert_id}/acknowledge")
        assert ack_res.status_code == 200, f"ACK failed: {ack_res.status_code}"
        ack_data = ack_res.json()
        print(f" -> [HTTP RESPONSE] {ack_data}")

        # Step 5: Phone A and Phone B check status update via WebSocket
        print(f"\n[STEP 5] Checking status update ACKNOWLEDGED via WebSocket ...")
        ws_ack_raw = await asyncio.wait_for(ws.recv(), timeout=5.0)
        ws_ack = json.loads(ws_ack_raw)
        while ws_ack.get("type") == "REALTIME_TELEMETRY" or ws_ack.get("type") == "pong":
            ws_ack_raw = await asyncio.wait_for(ws.recv(), timeout=5.0)
            ws_ack = json.loads(ws_ack_raw)

        print(f" -> [WEBSOCKET STATUS BROADCAST] {json.dumps(ws_ack, indent=2)}")
        assert ws_ack["alert_id"] == alert_id
        assert ws_ack["status"] == "ACKNOWLEDGED"

        print("\n==================================================")
        print("[SUCCESS] MOBILE-TO-MOBILE REAL-TIME SOS PROTOCOL PASSED WITH 100% SUCCESS!")
        print("==================================================\n")

if __name__ == "__main__":
    asyncio.run(test_end_to_end_realtime_sos_flow())
