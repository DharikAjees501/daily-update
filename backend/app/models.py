from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Date, Boolean
from sqlalchemy.orm import relationship
from .database import Base


class Employee(Base):
    __tablename__ = "employees"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False, unique=True, index=True)
    is_active = Column(Boolean, nullable=False, default=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    daily_updates = relationship("DailyUpdate", back_populates="employee", cascade="all, delete-orphan")


class DailyUpdate(Base):
    __tablename__ = "daily_updates"

    id = Column(Integer, primary_key=True, index=True)
    employee_id = Column(Integer, ForeignKey("employees.id"), nullable=False, index=True)
    date = Column(String(10), nullable=False, index=True)  # YYYY-MM-DD
    yesterday_work = Column(Text, nullable=False)
    today_plan = Column(Text, nullable=False)
    blockers = Column(Text, nullable=True, default="")
    tl_status = Column(String(20), nullable=False, default="Pending", index=True)
    tl_comment = Column(Text, nullable=True, default="")
    reviewed_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    employee = relationship("Employee", back_populates="daily_updates")
