from typing import List, Optional
from fastapi import FastAPI, Depends, HTTPException, status, Query
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import inspect, text

from . import models, schemas, crud
from .database import engine, get_db

# Create database tables automatically
models.Base.metadata.create_all(bind=engine)

# Helper function to migrate existing SQLite tables if new columns are missing
def migrate_db_columns():
    with engine.connect() as conn:
        inspector = inspect(engine)
        
        # Migrations for daily_updates
        du_columns = [c['name'] for c in inspector.get_columns('daily_updates')]
        if 'tl_status' not in du_columns:
            conn.execute(text("ALTER TABLE daily_updates ADD COLUMN tl_status VARCHAR(20) DEFAULT 'Pending' NOT NULL"))
        if 'tl_comment' not in du_columns:
            conn.execute(text("ALTER TABLE daily_updates ADD COLUMN tl_comment TEXT DEFAULT ''"))
        if 'reviewed_at' not in du_columns:
            conn.execute(text("ALTER TABLE daily_updates ADD COLUMN reviewed_at DATETIME"))
        
        # Migrations for employees
        emp_columns = [c['name'] for c in inspector.get_columns('employees')]
        if 'is_active' not in emp_columns:
            conn.execute(text("ALTER TABLE employees ADD COLUMN is_active BOOLEAN DEFAULT 1 NOT NULL"))
        
        conn.commit()

migrate_db_columns()

app = FastAPI(
    title="Daily Employee Update API",
    description="Internal API for employee updates, TL dashboard review, and employee roster management",
    version="3.0.0"
)

# Enable CORS for local React development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def read_root():
    return {
        "status": "online",
        "service": "Daily Employee Update API",
        "version": "3.0.0"
    }


# Stats Endpoint
@app.get("/api/stats", response_model=schemas.DashboardStatsResponse)
def get_stats(db: Session = Depends(get_db)):
    return crud.get_dashboard_stats(db=db)


# TL Authentication Endpoint
@app.post("/api/tl/login", response_model=schemas.TLLoginResponse)
def tl_login(login: schemas.TLLoginRequest):
    if login.username.strip() == "admin" and login.password == "prasanthaiteam":
        return schemas.TLLoginResponse(
            success=True,
            message="Login successful",
            username=login.username.strip()
        )
    else:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid TL username or password."
        )


# Employee Endpoints
@app.post("/api/employees", response_model=schemas.EmployeeResponse, status_code=status.HTTP_201_CREATED)
def create_employee(employee: schemas.EmployeeCreate, db: Session = Depends(get_db)):
    db_emp = crud.get_employee_by_name(db, name=employee.name)
    if db_emp:
        # If employee already exists but is inactive, reactivate
        if not db_emp.is_active:
            return crud.update_employee(db=db, employee_id=db_emp.id, employee_update=schemas.EmployeeUpdate(is_active=True))
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Employee with name '{employee.name}' already exists."
        )
    return crud.create_employee(db=db, employee=employee)


@app.get("/api/employees", response_model=List[schemas.EmployeeResponse])
def list_employees(
    active_only: bool = Query(False, description="Filter only active employees"),
    db: Session = Depends(get_db)
):
    return crud.get_employees(db=db, active_only=active_only)


@app.patch("/api/employees/{employee_id}", response_model=schemas.EmployeeResponse)
def update_employee(
    employee_id: int,
    employee_update: schemas.EmployeeUpdate,
    db: Session = Depends(get_db)
):
    updated = crud.update_employee(db=db, employee_id=employee_id, employee_update=employee_update)
    if not updated:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Employee with ID {employee_id} not found."
        )
    return updated


# Daily Update Endpoints
@app.post("/api/updates", response_model=schemas.DailyUpdateResponse, status_code=status.HTTP_201_CREATED)
def submit_daily_update(update: schemas.DailyUpdateCreate, db: Session = Depends(get_db)):
    if not update.employee_id and not update.employee_name:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Must provide either employee_id or employee_name."
        )
    
    if update.employee_id:
        emp = crud.get_employee_by_id(db, employee_id=update.employee_id)
        if not emp:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Employee with ID {update.employee_id} not found."
            )
        if not emp.is_active:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Employee '{emp.name}' is currently deactivated."
            )

    try:
        new_update = crud.create_daily_update(db=db, update_data=update)
        return new_update
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Failed to save update: {str(e)}")


@app.get("/api/updates", response_model=List[schemas.DailyUpdateResponse])
def get_daily_updates(
    employee_id: Optional[int] = Query(None, description="Filter updates by employee ID"),
    date: Optional[str] = Query(None, description="Filter updates by specific date (YYYY-MM-DD)"),
    start_date: Optional[str] = Query(None, description="Filter start date (YYYY-MM-DD)"),
    end_date: Optional[str] = Query(None, description="Filter end date (YYYY-MM-DD)"),
    search: Optional[str] = Query(None, description="Search employee name"),
    status: Optional[str] = Query(None, description="Filter updates by status (Pending or Accepted)"),
    limit: int = Query(200, ge=1, le=500),
    db: Session = Depends(get_db)
):
    return crud.get_daily_updates(
        db=db,
        employee_id=employee_id,
        date=date,
        start_date=start_date,
        end_date=end_date,
        search=search,
        status=status,
        limit=limit
    )


@app.patch("/api/updates/{update_id}/review", response_model=schemas.DailyUpdateResponse)
def review_daily_update(
    update_id: int,
    review: schemas.DailyUpdateReview,
    db: Session = Depends(get_db)
):
    updated = crud.review_daily_update(db=db, update_id=update_id, review_data=review)
    if not updated:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Daily update with ID {update_id} not found."
        )
    return updated
