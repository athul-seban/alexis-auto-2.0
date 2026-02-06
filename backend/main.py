
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
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
# Allow all origins for dev/codespaces environment to prevent preflight blocks
# In production, you would restrict this regex.
app.add_middleware(
    CORSMiddleware,
    allow_origin_regex=".*", 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*", "Authorization", "Content-Type", "ngrok-skip-browser-warning", "bypass-tunnel-reminder"],
)

# --- Include Routers ---
app.include_router(public.router, prefix="/api", tags=["Public"])
app.include_router(admin.router, prefix="/api", tags=["Admin"])

@app.get("/")
def read_root():
    return {"message": "Alexis Autos API Secure"}

if __name__ == "__main__":
    import uvicorn
    init_db(get_password_hash)
    uvicorn.run(app, host="0.0.0.0", port=8000)
