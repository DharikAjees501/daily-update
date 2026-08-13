from typing import Optional, List
from datetime import datetime, timezone
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func
from . import models, schemas


def get_employee_by_id(db: Session, employee_id: int) -> Optional[models.Employee]:
    return db.query(models.Employee).filter(models.Employee.id == employee_id).first()


def get_employee_by_name(db: Session, name: str) -> Optional[models.Employee]:
    clean_name = name.strip()
    return db.query(models.Employee).filter(models.Employee.name.ilike(clean_name)).first()


def get_employees(db: Session, skip: int = 0, limit: int = 100, active_only: bool = False) -> List[models.Employee]:
    query = db.query(models.Employee)
    if active_only:
        query = query.filter(models.Employee.is_active == True)
    return query.order_by(models.Employee.name.asc()).offset(skip).limit(limit).all()


def create_employee(db: Session, employee: schemas.EmployeeCreate) -> models.Employee:
    clean_name = employee.name.strip()
    db_employee = models.Employee(name=clean_name, is_active=True)
    db.add(db_employee)
    db.commit()
    db.refresh(db_employee)
    return db_employee


def update_employee(db: Session, employee_id: int, employee_update: schemas.EmployeeUpdate) -> Optional[models.Employee]:
    db_emp = get_employee_by_id(db, employee_id)
    if not db_emp:
        return None
    
    if employee_update.name is not None:
        db_emp.name = employee_update.name.strip()
    if employee_update.is_active is not None:
        db_emp.is_active = employee_update.is_active

    db.commit()
    db.refresh(db_emp)
    return db_emp


def get_or_create_employee(db: Session, name: str) -> models.Employee:
    existing = get_employee_by_name(db, name)
    if existing:
        if not existing.is_active:
            existing.is_active = True
            db.commit()
            db.refresh(existing)
        return existing
    return create_employee(db, schemas.EmployeeCreate(name=name))


def create_daily_update(db: Session, update_data: schemas.DailyUpdateCreate) -> models.DailyUpdate:
    employee_id = update_data.employee_id
    if not employee_id:
        if update_data.employee_name:
            emp = get_or_create_employee(db, update_data.employee_name)
            employee_id = emp.id
        else:
            raise ValueError("Either employee_id or employee_name must be provided.")

    db_update = models.DailyUpdate(
        employee_id=employee_id,
        date=update_data.date,
        yesterday_work=update_data.yesterday_work.strip(),
        today_plan=update_data.today_plan.strip(),
        blockers=(update_data.blockers or "").strip(),
        tl_status="Pending"
    )
    db.add(db_update)
    db.commit()
    db.refresh(db_update)
    return db_update


def get_daily_updates(
    db: Session,
    employee_id: Optional[int] = None,
    date: Optional[str] = None,
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    search: Optional[str] = None,
    status: Optional[str] = None,
    limit: int = 200
) -> List[models.DailyUpdate]:
    query = db.query(models.DailyUpdate).join(models.Employee).options(joinedload(models.DailyUpdate.employee))
    
    if employee_id:
        query = query.filter(models.DailyUpdate.employee_id == employee_id)
    
    if date:
        query = query.filter(models.DailyUpdate.date == date)
    else:
        if start_date:
            query = query.filter(models.DailyUpdate.date >= start_date)
        if end_date:
            query = query.filter(models.DailyUpdate.date <= end_date)

    if search and search.strip():
        clean_search = f"%{search.strip()}%"
        query = query.filter(models.Employee.name.ilike(clean_search))

    if status and status.lower() != 'all':
        query = query.filter(models.DailyUpdate.tl_status == status)
    
    return query.order_by(models.DailyUpdate.created_at.desc()).limit(limit).all()


def review_daily_update(
    db: Session,
    update_id: int,
    review_data: schemas.DailyUpdateReview
) -> Optional[models.DailyUpdate]:
    db_update = db.query(models.DailyUpdate).filter(models.DailyUpdate.id == update_id).first()
    if not db_update:
        return None

    db_update.tl_status = review_data.tl_status
    db_update.tl_comment = (review_data.tl_comment or "").strip()
    db_update.reviewed_at = datetime.now(timezone.utc)

    db.commit()
    db.refresh(db_update)
    return db_update


def get_dashboard_stats(db: Session) -> dict:
    today_str = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    
    total_employees = db.query(func.count(models.Employee.id)).scalar() or 0
    active_employees = db.query(func.count(models.Employee.id)).filter(models.Employee.is_active == True).scalar() or 0
    
    submitted_today = db.query(func.count(models.DailyUpdate.id)).filter(models.DailyUpdate.date == today_str).scalar() or 0
    pending_count = db.query(func.count(models.DailyUpdate.id)).filter(models.DailyUpdate.tl_status == "Pending").scalar() or 0
    accepted_count = db.query(func.count(models.DailyUpdate.id)).filter(models.DailyUpdate.tl_status == "Accepted").scalar() or 0

    return {
        "total_employees": total_employees,
        "active_employees": active_employees,
        "submitted_today": submitted_today,
        "pending_count": pending_count,
        "accepted_count": accepted_count
    }
