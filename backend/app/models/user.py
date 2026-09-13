from sqlalchemy import Column, Integer, String, Boolean, DateTime
import datetime
from app.core.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    role = Column(String, nullable=False, default="SECURITY") # ADMIN, SECURITY, AI_EDGE_DEVICE
    full_name = Column(String, nullable=True)
    badge_id = Column(String, nullable=True)
    assigned_zone = Column(String, nullable=True, default="Sector 4 - Central Tech Park")
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
