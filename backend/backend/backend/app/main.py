
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings

def create_application() -> FastAPI:
    application = FastAPI(
        title=settings.PROJECT_NAME,
        openapi_url=f"{settings.API_V1_STR}/openapi.json",
    )

    # Set all CORS enabled origins
    if settings.BACKEND_CORS_ORIGINS:
        application.add_middleware(
            CORSMiddleware,
            allow_origins=[str(origin) for origin in settings.BACKEND_CORS_ORIGINS],
            allow_credentials=True,
            allow_methods=["*"],
            allow_headers=["*"],
        )
    
    # Or just allow all for dev
    application.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    @application.get("/health")
    def health_check():
        return {"status": "ok", "project": settings.PROJECT_NAME}

    @application.get("/")
    def root():
        from starlette.responses import RedirectResponse
        return RedirectResponse(url="/docs")

    from app.api.v1.api import api_router
    application.include_router(api_router, prefix=settings.API_V1_STR)

    return application

app = create_application()

@app.on_event("startup")
async def on_startup():
    from app.core.database import init_db
    await init_db()
