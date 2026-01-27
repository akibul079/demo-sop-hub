from app.api.v1.api import api_router
from app.core.config import settings
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from starlette.responses import RedirectResponse


def create_application() -> FastAPI:
    application = FastAPI(
        title=settings.PROJECT_NAME,
        openapi_url=f"{settings.API_V1_STR}/openapi.json",
    )

    application.add_middleware(
        CORSMiddleware,
        allow_origins=settings.BACKEND_CORS_ORIGINS or ["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    @application.get("/", include_in_schema=False)
    def root():
        return RedirectResponse(url="/docs")

    @application.get("/health")
    def health_check():
        return {"status": "ok", "project": settings.PROJECT_NAME}

    application.include_router(api_router, prefix=settings.API_V1_STR)
    return application


app = create_application()


@app.on_event("startup")
async def on_startup():
    from app.core.database import init_db
    await init_db()
