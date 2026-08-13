from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, ConfigDict, Field


class EmployeeBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=255, description="Employee full name")


class EmployeeCreate(EmployeeBase):
    pass


class EmployeeResponse(EmployeeBase):
    id: int
    is_active: bool = True
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class EmployeeUpdate(BaseModel):
    name: Optional[str] = Field(default=None, min_length=1, max_length=255)
    is_active: Optional[bool] = Field(default=None)


class DashboardStatsResponse(BaseModel):
    total_employees: int
    active_employees: int
    submitted_today: int
    pending_count: int
    accepted_count: int



class DailyUpdateBase(BaseModel):
    date: str = Field(..., description="Date of update in YYYY-MM-DD format")
    yesterday_work: str = Field(..., description="Tasks completed yesterday")
    today_plan: str = Field(..., description="Planned tasks for today")
    blockers: Optional[str] = Field(default="", description="Any blockers or issues")


class DailyUpdateCreate(DailyUpdateBase):
    employee_id: Optional[int] = Field(default=None, description="Existing employee ID")
    employee_name: Optional[str] = Field(default=None, description="Employee name if creating new or specifying by name")


class DailyUpdateResponse(DailyUpdateBase):
    id: int
    employee_id: int
    created_at: datetime
    tl_status: str = "Pending"
    tl_comment: Optional[str] = ""
    reviewed_at: Optional[datetime] = None
    employee: Optional[EmployeeResponse] = None

    model_config = ConfigDict(from_attributes=True)


class DailyUpdateReview(BaseModel):
    tl_status: str = Field(default="Accepted", description="Status: Pending or Accepted")
    tl_comment: Optional[str] = Field(default="", description="TL review comments")


class TLLoginRequest(BaseModel):
    username: str = Field(..., description="TL Username")
    password: str = Field(..., description="TL Password")


class TLLoginResponse(BaseModel):
    success: bool
    message: str
    username: Optional[str] = None

