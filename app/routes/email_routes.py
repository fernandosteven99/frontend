from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional
from app.services.email_service import (
    notify_user_deleted,
    notify_role_updated,
    notify_report_generated,
    notify_schedule_deleted,
    notify_sport_deleted,
)

router = APIRouter(prefix="/email", tags=["Email"])


class EmailNotification(BaseModel):
    type: str
    # Campos opcionales según el tipo
    admin_email:     Optional[str] = None
    admin_nombre:    Optional[str] = None
    user_nombre:     Optional[str] = None
    user_email:      Optional[str] = None
    rol_anterior:    Optional[str] = None
    rol_nuevo:       Optional[str] = None
    sport_name:      Optional[str] = None
    sport:           Optional[str] = None
    day:             Optional[str] = None
    time:            Optional[str] = None
    location:        Optional[str] = None
    total_registros: Optional[int] = None
    filtros:         Optional[dict] = None


@router.post("/notify")
def send_notification(data: EmailNotification):
    try:
        if data.type == "user_deleted":
            notify_user_deleted(data.admin_email, data.user_nombre, data.user_email)

        elif data.type == "role_updated":
            notify_role_updated(
                data.admin_email, data.user_nombre, data.user_email,
                data.rol_anterior, data.rol_nuevo
            )

        elif data.type == "report_generated":
            notify_report_generated(
                data.admin_email, data.admin_nombre,
                data.filtros or {}, data.total_registros or 0
            )

        elif data.type == "schedule_deleted":
            notify_schedule_deleted(
                data.admin_email, data.sport,
                data.day, data.time, data.location
            )

        elif data.type == "sport_deleted":
            notify_sport_deleted(data.admin_email, data.sport_name)

        return {"ok": True}

    except Exception as e:
        print(f"[EMAIL ROUTE ERROR] {e}")
        return {"ok": False, "error": str(e)}