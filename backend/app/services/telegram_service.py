import logging
import requests
from typing import Optional
from app.core.config import settings

logger = logging.getLogger("abhaya_telegram")

class TelegramNotificationService:
    def __init__(self):
        self.bot_token = getattr(settings, "TELEGRAM_BOT_TOKEN", "8823842607:AAGK11dL9MozT9MQq7gwRBgDmvasth5INpY")
        self.chat_id = getattr(settings, "TELEGRAM_CHAT_ID", "")

    def get_auto_chat_id(self, token: str) -> Optional[str]:
        """Fetch the latest active Telegram Chat ID automatically from getUpdates"""
        try:
            url = f"https://api.telegram.org/bot{token}/getUpdates"
            res = requests.get(url, timeout=5)
            data = res.json()
            if data.get("ok") and data.get("result"):
                # Get latest message sender chat id
                for item in reversed(data["result"]):
                    msg = item.get("message") or item.get("channel_post") or item.get("my_chat_member")
                    if msg and "chat" in msg:
                        return str(msg["chat"]["id"])
        except Exception as e:
            logger.error(f"[TELEGRAM AUTO CHAT ID ERROR] {e}")
        return None

    def send_emergency_alert(
        self,
        event_id: str,
        device_id: str,
        user_name: str,
        user_phone: str,
        latitude: float,
        longitude: float,
        message_body: str,
        bot_token: Optional[str] = None,
        chat_id: Optional[str] = None
    ) -> dict:
        token = bot_token or self.bot_token
        target_chat = chat_id or self.chat_id or getattr(settings, "TELEGRAM_CHAT_ID", "")

        # Auto-discover chat ID if not set
        if not target_chat:
            target_chat = self.get_auto_chat_id(token)

        if not token:
            logger.warning("[TELEGRAM] Missing Bot Token.")
            return {"success": False, "reason": "Missing Bot Token"}

        if not target_chat:
            logger.warning("[TELEGRAM] No chat ID found. Please send a message to @Abhaya_Security_Bot on Telegram!")
            return {"success": False, "reason": "Please start chat with @Abhaya_Security_Bot on Telegram"}

        maps_url = f"https://maps.google.com/?q={latitude:.4f},{longitude:.4f}"

        # Markdown formatted Emergency SOS Message
        alert_text = (
            f"🚨 *ABHAYA EMERGENCY SOS ALERT*\n\n"
            f"👤 *User Name*: `{user_name}`\n"
            f"📱 *Device ID*: `{device_id}`\n"
            f"📞 *User Phone*: `{user_phone}`\n"
            f"🆔 *Alert ID*: `{event_id}`\n\n"
            f"📍 *GPS Location*: `{latitude:.4f}, {longitude:.4f}`\n"
            f"🗺️ *Live Google Maps*: {maps_url}\n\n"
            f"⚠️ *Details*: {message_body}\n"
            f"⚡ *Status*: IMMEDIATE SECURITY DISPATCH REQUIRED!"
        )

        url = f"https://api.telegram.org/bot{token}/sendMessage"
        payload = {
            "chat_id": target_chat,
            "text": alert_text,
            "parse_mode": "Markdown",
            "disable_web_page_preview": False
        }

        try:
            res = requests.post(url, json=payload, timeout=5)
            data = res.json()
            if res.status_code == 200 and data.get("ok"):
                print(f"\n==========================================")
                print(f"[TELEGRAM EMERGENCY ALERT DELIVERED!]")
                print(f"Bot Username: @Abhaya_Security_Bot")
                print(f"Chat ID: {target_chat}")
                print(f"User: {user_name}")
                print(f"Google Maps Link: {maps_url}")
                print(f"==========================================\n")
                return {"success": True, "chat_id": target_chat, "message_id": data.get("result", {}).get("message_id"), "maps_url": maps_url}
            else:
                logger.error(f"[TELEGRAM ERROR] {data}")
                return {"success": False, "error": data.get("description", "Failed to send")}
        except Exception as e:
            logger.error(f"[TELEGRAM EXCEPTION] {e}")
            return {"success": False, "error": str(e)}

telegram_service = TelegramNotificationService()
