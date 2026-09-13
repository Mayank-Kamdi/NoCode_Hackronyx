import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "ABHAYA - Real-Time Mobile Emergency SOS Platform"
    API_V1_STR: str = "/api/v1"
    
    # Twilio Live Credentials
    TWILIO_ACCOUNT_SID: str = os.getenv("TWILIO_ACCOUNT_SID", "")
    TWILIO_AUTH_TOKEN: str = os.getenv("TWILIO_AUTH_TOKEN", "")
    TWILIO_PHONE_NUMBER: str = os.getenv("TWILIO_PHONE_NUMBER", "+17372212163")
    TWILIO_WHATSAPP_NUMBER: str = os.getenv("TWILIO_WHATSAPP_NUMBER", "whatsapp:+14155238886")
    
    # Emergency Contact Phone Numbers
    SECURITY_OFFICER_PHONE: str = os.getenv("SECURITY_OFFICER_PHONE", "+917058943223")
    USER_EMERGENCY_PHONE: str = os.getenv("USER_EMERGENCY_PHONE", "+919373156804")

    # 100% Free Telegram Emergency Alerts
    TELEGRAM_BOT_TOKEN: str = os.getenv("TELEGRAM_BOT_TOKEN", "")
    TELEGRAM_CHAT_ID: str = os.getenv("TELEGRAM_CHAT_ID", "")
    
    # Database
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./abhaya.db")

    class Config:
        case_sensitive = True
        env_file = ".env"

settings = Settings()
