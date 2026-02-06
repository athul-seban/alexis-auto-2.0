
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from .database import init_db
from .auth import get_password_hash
from .routers import public, admin

# --- App Lifecycle ---
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Initialize DB
    init_db(get_password_hash)
    yield
    # Shutdown: Clean up if needed

app = FastAPI(title="Alexis Autos API", lifespan=lifespan)

# --- CORS MIDDLEWARE ---
# We use allow_origin_regex to match any localhost or github.dev/gitpod.io URL
# This is critical for the Codespaces environment where the origin changes.
app.add_middleware(
    CORSMiddleware,
    allow_origin_regex=r"https?://.*", 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"], 
    expose_headers=["*"]
)

# --- Global Exception Handler for debugging ---
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    print(f"Global Error: {exc}")
    return JSONResponse(
        status_code=500,
        content={"message": "Internal Server Error", "detail": str(exc)},
    )

# --- Include Routers ---
app.include_router(public.router, prefix="/api", tags=["Public"])
app.include_router(admin.router, prefix="/api", tags=["Admin"])

@app.get("/")
def read_root():
    return {"message": "Alexis Autos API Secure"}

if __name__ == "__main__":
    import uvicorn
    # Initialize DB on main run as well just in case
    init_db(get_password_hash)
    uvicorn.run(app, host="0.0.0.0", port=8000)
