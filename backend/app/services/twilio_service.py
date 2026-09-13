import logging
from twilio.rest import Client
from app.core.config import settings

logger = logging.getLogger("abhaya_twilio")

class TwilioNotificationService:
    def __init__(self):
        self.account_sid = settings.TWILIO_ACCOUNT_SID
        self.auth_token = settings.TWILIO_AUTH_TOKEN
        self.from_phone = settings.TWILIO_PHONE_NUMBER
        self.from_whatsapp = settings.TWILIO_WHATSAPP_NUMBER
        self.officer_phone = settings.SECURITY_OFFICER_PHONE
        self.user_phone = settings.USER_EMERGENCY_PHONE
        
        self.client = None
        if self.account_sid and self.auth_token and self.auth_token != "your_twilio_auth_token_here":
            try:
                self.client = Client(self.account_sid, self.auth_token)
                logger.info("[TWILIO] Client initialized successfully.")
            except Exception as e:
                logger.error(f"[TWILIO] Error initializing client: {e}")

    def send_emergency_sms(
        self,
        event_id: str,
        device_id: str,
        location: str,
        risk_score: float,
        severity: str,
        message_body: str,
        user_number: str = None,
        officer_number: str = None,
        latitude: float = 0.0,
        longitude: float = 0.0
    ) -> dict:
        target_officer = officer_number or self.officer_phone
        target_user = user_number or self.user_phone
        recipients = [r for r in [target_user, target_officer] if r]

        maps_url = f"https://maps.google.com/?q={latitude},{longitude}" if (latitude and longitude) else f"https://maps.google.com/?q={location}"

        # Real Custom Emergency SOS Message containing live GPS link
        custom_sms_text = (
            f"[ABHAYA EMERGENCY SOS ALERT]\n"
            f"Alert ID: {event_id}\n"
            f"Device: {device_id}\n"
            f"User Phone: {target_user}\n"
            f"GPS Coordinates: {latitude:.4f}, {longitude:.4f}\n"
            f"Live Map Link: {maps_url}\n"
            f"Details: {message_body}\n"
            f"Immediate security responder dispatch required!"
        )

        results = []
        for phone in recipients:
            if self.client and self.from_phone:
                try:
                    # Send real custom emergency SOS message
                    message = self.client.messages.create(
                        body=custom_sms_text,
                        from_=self.from_phone,
                        to=phone
                    )
                    results.append({"phone": phone, "success": True, "sid": message.sid, "status": message.status, "message_sent": custom_sms_text})
                except Exception as e:
                    logger.warning(f"[TWILIO SMS ERROR] Custom body failed for {phone}: {e}. Retrying concise format...")
                    try:
                        # Fallback for trial restrictions
                        concise_text = f"[ABHAYA SOS ALERT] ID:{event_id} User:{target_user} Map:{maps_url}"
                        message = self.client.messages.create(
                            body=concise_text,
                            from_=self.from_phone,
                            to=phone
                        )
                        results.append({"phone": phone, "success": True, "sid": message.sid, "status": message.status, "message_sent": concise_text})
                    except Exception as e2:
                        logger.error(f"[TWILIO SMS ERROR] Failed to send to {phone}: {e2}")
                        results.append({"phone": phone, "success": False, "error": str(e2)})
            else:
                results.append({"phone": phone, "success": False, "simulated": True, "reason": "Missing TWILIO_AUTH_TOKEN"})

        print(f"\n==========================================")
        print(f"[TWILIO SMS DISPATCH ACTIVE]")
        print(f"User Phone: {target_user}")
        print(f"Officer Phone: {target_officer}")
        print(f"SMS Content:\n{custom_sms_text}")
        print(f"Status: {results}")
        print(f"==========================================\n")

        return {"dispatches": results, "user_phone": target_user, "officer_phone": target_officer, "custom_sms_text": custom_sms_text}

    def send_emergency_whatsapp(
        self,
        event_id: str,
        device_id: str,
        location: str,
        risk_score: float,
        severity: str,
        message_body: str,
        user_number: str = None,
        officer_number: str = None,
        latitude: float = 0.0,
        longitude: float = 0.0
    ) -> dict:
        target_officer = officer_number or self.officer_phone
        target_user = user_number or self.user_phone
        recipients = [r for r in [target_user, target_officer] if r]

        maps_url = f"https://maps.google.com/?q={latitude},{longitude}" if (latitude and longitude) else f"https://maps.google.com/?q={location}"

        whatsapp_text = (
            f"🚨 *ABHAYA EMERGENCY SOS ALERT*\n\n"
            f"*Alert ID*: `{event_id}`\n"
            f"*Device*: {device_id}\n"
            f"*User Phone*: {target_user}\n"
            f"*GPS Coordinates*: {latitude:.4f}, {longitude:.4f}\n"
            f"*Live Map Link*: {maps_url}\n"
            f"*Details*: {message_body}\n\n"
            f"Immediate security dispatch required!"
        )

        results = []
        for phone in recipients:
            wa_num = phone if phone.startswith("whatsapp:") else f"whatsapp:{phone}"
            if self.client and self.from_whatsapp:
                try:
                    message = self.client.messages.create(
                        body=whatsapp_text,
                        from_=self.from_whatsapp,
                        to=wa_num
                    )
                    results.append({"phone": wa_num, "success": True, "sid": message.sid, "status": message.status})
                except Exception as e:
                    logger.error(f"[TWILIO WHATSAPP ERROR] Failed to send to {wa_num}: {e}")
                    results.append({"phone": wa_num, "success": False, "error": str(e)})
            else:
                results.append({"phone": wa_num, "success": False, "simulated": True, "reason": "Missing TWILIO_AUTH_TOKEN"})

        print(f"\n==========================================")
        print(f"[TWILIO WHATSAPP DISPATCH READY]")
        print(f"User Phone: {target_user}")
        print(f"Officer Phone: {target_officer}")
        print(f"Status: {results}")
        print(f"==========================================\n")

        return {"dispatches": results, "user_phone": target_user, "officer_phone": target_officer}

twilio_service = TwilioNotificationService()
