from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routes import sport_routes, schedule_routes, reservation_routes, role_routes, auth_routes, user_routes, email_routes


from app.routes import (
    location_routes,
    level_routes,
    attendance_routes,
    rating_routes,
    history_routes,
    notification_routes,
    student_routes
)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(sport_routes.router)
app.include_router(schedule_routes.router)
app.include_router(reservation_routes.router)
app.include_router(location_routes.router)
app.include_router(level_routes.router)
app.include_router(attendance_routes.router)
app.include_router(rating_routes.router)
app.include_router(history_routes.router)
app.include_router(notification_routes.router)
app.include_router(role_routes.router)
app.include_router(auth_routes.router)
app.include_router(user_routes.router)
app.include_router(email_routes.router)
app.include_router(student_routes.router)

@app.get("/")
def root():
    return {"message": "API funcionando"}