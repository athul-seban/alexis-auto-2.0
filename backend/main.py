import sqlite3
import json
import secrets
from datetime import datetime, timedelta
from typing import List, Optional, Any, Dict
from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException, status, Depends, Request, Response
# CORSMiddleware removed in favor of custom manual middleware
from fastapi.security import OAuth2PasswordBearer
from pydantic import BaseModel
from passlib.context import CryptContext
from jose import JWTError, jwt

# --- Database & Security Helpers ---

DB_NAME = "alexis.db"

def get_db():
    conn = sqlite3.connect(DB_NAME, check_same_thread=False)
    conn.row_factory = sqlite3.Row
    return conn

# Switch to pbkdf2_sha256 to avoid bcrypt version incompatibility issues on some systems
pwd_context = CryptContext(schemes=["pbkdf2_sha256"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/login")

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

# --- Seeding Logic ---

def internal_seed_data(conn):
    """Internal function to populate DB on first run only."""
    c = conn.cursor()
    
    # Check if cars data exists to determine if we need to seed
    try:
        c.execute('SELECT count(*) FROM cars')
        if c.fetchone()[0] > 0:
            return
    except sqlite3.OperationalError:
        return

    print("Seeding database...")

    # Seed Cars
    cars_seed = [
        ("Audi RS6", 2024, "4.0L V8 Twin Turbo", 108000, "https://picsum.photos/seed/audi/800/600", False, 1500, "Automatic", "The ultimate estate car.", json.dumps(["Ceramic Brakes", "Pan Roof"])),
        ("BMW M4", 2023, "3.0L Twin Turbo", 75000, "https://picsum.photos/seed/bmw/800/600", False, 5000, "Automatic", "Track ready performance.", json.dumps(["Carbon Pack", "Head-up Display"]))
    ]
    c.executemany('INSERT INTO cars (model, year, engine, price, image, sold, mileage, transmission, description, features) VALUES (?,?,?,?,?,?,?,?,?,?)', cars_seed)

    # Seed Services
    services_seed = [("Car Tyres", "Premium fitting."), ("Servicing", "Full & Interim.")]
    c.executemany('INSERT INTO services (name, description) VALUES (?,?)', services_seed)

    # Seed Brands
    brands_seed = [("Michelin",), ("Pirelli",), ("Continental",), ("Goodyear",)]
    c.executemany('INSERT INTO brands (name) VALUES (?)', brands_seed)

    # Seed Tyres
    tyres_seed = [
        ("Michelin", "Pilot Sport 5", "225/40 R18", 145.00, 135.00, 12, "Premium", "https://picsum.photos/seed/michelin/300/300", json.dumps({"fuel": "C", "wet": "A", "noise": 72})),
        ("Pirelli", "P Zero", "255/35 R19", 180.00, 165.00, 8, "Premium", "https://picsum.photos/seed/pirelli/300/300", json.dumps({"fuel": "D", "wet": "A", "noise": 71})),
        ("Budget", "RoadKing", "205/55 R16", 55.00, None, 20, "Budget", "https://picsum.photos/seed/budget/300/300", json.dumps({"fuel": "E", "wet": "C", "noise": 74}))
    ]
    c.executemany('INSERT INTO tyres (brand, model, size, price, offerPrice, quantity, category, image, specs) VALUES (?,?,?,?,?,?,?,?,?)', tyres_seed)
    
    print("Database seeded successfully.")

def init_db():
    print("Initializing Database...")
    try:
        conn = get_db()
        c = conn.cursor()
        
        # 1. Create Tables (Schema)
        c.execute('''CREATE TABLE IF NOT EXISTS cars (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            model TEXT, year INTEGER, engine TEXT, price REAL, image TEXT, 
            sold BOOLEAN, mileage INTEGER, transmission TEXT, description TEXT, features TEXT
        )''')
        c.execute('''CREATE TABLE IF NOT EXISTS services (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT, description TEXT
        )''')
        c.execute('''CREATE TABLE IF NOT EXISTS bookings (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            customerName TEXT, contact TEXT, serviceType TEXT, date TEXT, status TEXT, notes TEXT
        )''')
        c.execute('''CREATE TABLE IF NOT EXISTS tyres (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            brand TEXT, model TEXT, size TEXT, price REAL, offerPrice REAL, 
            quantity INTEGER, category TEXT, image TEXT, specs TEXT
        )''')
        c.execute('''CREATE TABLE IF NOT EXISTS brands (name TEXT PRIMARY KEY)''')
        c.execute('''CREATE TABLE IF NOT EXISTS users (
            username TEXT PRIMARY KEY, password TEXT
        )''')
        c.execute('''CREATE TABLE IF NOT EXISTS settings (
            key TEXT PRIMARY KEY, value TEXT
        )''')

        # Commit Schema Creation immediately
        conn.commit()

        # 2. Seed Admin if missing
        c.execute('SELECT count(*) FROM users')
        if c.fetchone()[0] == 0:
            print("Seeding admin user...")
            # Default admin / password
            hashed_pw = get_password_hash("password")
            c.execute('INSERT INTO users (username, password) VALUES (?,?)', ("admin", hashed_pw))

        # 3. Seed Settings if missing
        c.execute('SELECT count(*) FROM settings WHERE key=?', ('companyInfo',))
        if c.fetchone()[0] == 0:
            print("Seeding settings...")
            info_data = json.dumps({
                "contact": {"email": "alexisautosltd@gmail.com", "phone": "+44 7918 479222", "whatsapp": "+44 7450 242180"},
                "address": {"lines": ["Unit C5 Cumberland Trading Estate", "Loughborough", "LE11 5DF"]},
                "openingHours": [{"day": "Mon - Fri", "hours": "09:00 - 18:00"}, {"day": "Sat", "hours": "09:00 - 16:00"}],
                "facilities": ["Wifi", "Waiting Area"]
            })
            c.execute('INSERT INTO settings (key, value) VALUES (?,?)', ('companyInfo', info_data))
            banner_data = json.dumps({"active": False, "reason": ""})
            c.execute('INSERT INTO settings (key, value) VALUES (?,?)', ('banner', banner_data))

        # 4. Seed Data
        internal_seed_data(conn)
        
        conn.commit()
        conn.close()
        print("Database initialization complete.")
    except Exception as e:
        # Print full exception for debugging
        import traceback
        traceback.print_exc()
        print(f"CRITICAL ERROR INITIALIZING DATABASE: {e}")

# --- App Lifecycle ---

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Initialize DB
    init_db()
    yield
    # Shutdown: Clean up if needed

app = FastAPI(title="Alexis Autos API", lifespan=lifespan)

# --- Security Config ---
SECRET_KEY = secrets.token_hex(32) # In production, load from env
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60

# --- CUSTOM CORS MIDDLEWARE ---
# This manually handles all CORS headers to ensure they are set correctly for dev tunnels.
@app.middleware("http")
async def cors_middleware(request: Request, call_next):
    # Intercept OPTIONS requests for preflight
    if request.method == "OPTIONS":
        response = Response(status_code=204)
    else:
        try:
            response = await call_next(request)
        except Exception as e:
            # If application error, we still need CORS headers to see the error in browser
            print(f"Internal Server Error: {e}")
            response = Response(content=str(e), status_code=500)
    
    # 1. Allow Origin
    origin = request.headers.get("origin")
    if origin:
        # Echo back the origin to allow credentials
        response.headers["Access-Control-Allow-Origin"] = origin
    else:
        # Fallback
        response.headers["Access-Control-Allow-Origin"] = "*"
    
    # 2. Allow Credentials
    response.headers["Access-Control-Allow-Credentials"] = "true"
    
    # 3. Allow Methods
    response.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS, PATCH"
    
    # 4. Allow Headers (Including the custom tunnel headers)
    # Browsers often request headers in lowercase, so we allow * and specific ones
    response.headers["Access-Control-Allow-Headers"] = "*, Authorization, Content-Type, ngrok-skip-browser-warning, bypass-tunnel-reminder, x-requested-with"
    
    return response

# --- Data Models ---

class Car(BaseModel):
    id: Optional[int] = None
    model: str
    year: int
    engine: str
    price: float
    image: str
    sold: bool = False
    mileage: int
    transmission: str
    description: str
    features: List[str]

class ServiceItem(BaseModel):
    id: Optional[int] = None
    name: str
    description: str

class Booking(BaseModel):
    id: Optional[int] = None
    customerName: str
    contact: str
    serviceType: str
    date: str
    status: str = "Pending"
    notes: Optional[str] = None

class TyreSpecs(BaseModel):
    fuel: str
    wet: str
    noise: int

class TyreProduct(BaseModel):
    id: Optional[int] = None
    brand: str
    model: str
    size: str
    price: float
    offerPrice: Optional[float] = None
    quantity: int
    category: str
    image: str
    specs: TyreSpecs

class TyreBrand(BaseModel):
    name: str

class UserLogin(BaseModel):
    username: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str
    username: str

class SettingsUpdate(BaseModel):
    key: str
    value: Dict[str, Any]

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

async def get_current_user(token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    
    conn = get_db()
    user = conn.execute('SELECT * FROM users WHERE username=?', (username,)).fetchone()
    conn.close()
    
    if user is None:
        raise credentials_exception
    return user

# --- Public Endpoints (Read Only) ---

@app.get("/")
def read_root():
    return {"message": "Alexis Autos API Secure"}

@app.get("/api/cars", response_model=List[Car])
def get_cars():
    try:
        conn = get_db()
        rows = conn.execute('SELECT * FROM cars').fetchall()
        conn.close()
        res = []
        for r in rows:
            d = dict(r)
            d['features'] = json.loads(d['features'])
            d['sold'] = bool(d['sold'])
            res.append(d)
        return res
    except Exception as e:
        print(f"Error fetching cars: {e}")
        raise HTTPException(status_code=500, detail="Database error")

@app.get("/api/services", response_model=List[ServiceItem])
def get_services():
    try:
        conn = get_db()
        rows = conn.execute('SELECT * FROM services').fetchall()
        conn.close()
        return [dict(r) for r in rows]
    except Exception as e:
        print(f"Error fetching services: {e}")
        return []

@app.get("/api/tyres", response_model=List[TyreProduct])
def get_tyres():
    try:
        conn = get_db()
        rows = conn.execute('SELECT * FROM tyres').fetchall()
        conn.close()
        res = []
        for r in rows:
            d = dict(r)
            d['specs'] = json.loads(d['specs'])
            res.append(d)
        return res
    except sqlite3.OperationalError as e:
        print(f"Database Table Error: {e}")
        raise HTTPException(status_code=500, detail="Database structure error")
    except Exception as e:
        print(f"Error fetching tyres: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/brands")
def get_brands():
    conn = get_db()
    rows = conn.execute('SELECT * FROM brands').fetchall()
    conn.close()
    return [{"name": r["name"]} for r in rows]

@app.get("/api/settings/{key}")
def get_setting(key: str):
    conn = get_db()
    row = conn.execute('SELECT value FROM settings WHERE key=?', (key,)).fetchone()
    conn.close()
    if row:
        return json.loads(row['value'])
    return {}

@app.post("/api/bookings", response_model=Booking)
def create_booking(booking: Booking):
    # Public can create bookings
    conn = get_db()
    cur = conn.execute(
        'INSERT INTO bookings (customerName, contact, serviceType, date, status, notes) VALUES (?,?,?,?,?,?)',
        (booking.customerName, booking.contact, booking.serviceType, booking.date, booking.status, booking.notes)
    )
    conn.commit()
    booking.id = cur.lastrowid
    conn.close()
    return booking

# --- Authentication ---

@app.post("/api/login", response_model=Token)
def login(user: UserLogin):
    conn = get_db()
    row = conn.execute('SELECT * FROM users WHERE username=?', (user.username,)).fetchone()
    conn.close()
    
    if not row or not verify_password(user.password, row['password']):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.username}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer", "username": user.username}

# --- Protected Endpoints (Require Token) ---

@app.get("/api/bookings", response_model=List[Booking])
def get_bookings(current_user: Any = Depends(get_current_user)):
    conn = get_db()
    rows = conn.execute('SELECT * FROM bookings').fetchall()
    conn.close()
    return [dict(r) for r in rows]

@app.put("/api/bookings/{booking_id}/status")
def update_booking_status(booking_id: int, update: dict, current_user: Any = Depends(get_current_user)):
    conn = get_db()
    conn.execute('UPDATE bookings SET status=? WHERE id=?', (update['status'], booking_id))
    conn.commit()
    conn.close()
    return {"status": "success"}

@app.post("/api/users")
def add_user(user: UserLogin, current_user: Any = Depends(get_current_user)):
    conn = get_db()
    hashed_pw = get_password_hash(user.password)
    try:
        conn.execute('INSERT INTO users (username, password) VALUES (?,?)', (user.username, hashed_pw))
        conn.commit()
        return {"status": "success"}
    except sqlite3.IntegrityError:
        raise HTTPException(status_code=400, detail="Username exists")
    finally:
        conn.close()

@app.put("/api/users/{username}/password")
def change_password(username: str, data: dict, current_user: Any = Depends(get_current_user)):
    conn = get_db()
    hashed_pw = get_password_hash(data['password'])
    conn.execute('UPDATE users SET password=? WHERE username=?', (hashed_pw, username))
    conn.commit()
    conn.close()
    return {"status": "success"}

@app.post("/api/cars", response_model=Car)
def add_car(car: Car, current_user: Any = Depends(get_current_user)):
    conn = get_db()
    features_json = json.dumps(car.features)
    cur = conn.execute(
        'INSERT INTO cars (model, year, engine, price, image, sold, mileage, transmission, description, features) VALUES (?,?,?,?,?,?,?,?,?,?)',
        (car.model, car.year, car.engine, car.price, car.image, car.sold, car.mileage, car.transmission, car.description, features_json)
    )
    conn.commit()
    car.id = cur.lastrowid
    conn.close()
    return car

@app.put("/api/cars/{car_id}")
def update_car(car_id: int, car: Car, current_user: Any = Depends(get_current_user)):
    conn = get_db()
    features_json = json.dumps(car.features)
    conn.execute(
        'UPDATE cars SET model=?, year=?, engine=?, price=?, image=?, sold=?, mileage=?, transmission=?, description=?, features=? WHERE id=?',
        (car.model, car.year, car.engine, car.price, car.image, car.sold, car.mileage, car.transmission, car.description, features_json, car_id)
    )
    conn.commit()
    conn.close()
    return car

@app.delete("/api/cars/{car_id}")
def delete_car(car_id: int, current_user: Any = Depends(get_current_user)):
    conn = get_db()
    conn.execute('DELETE FROM cars WHERE id=?', (car_id,))
    conn.commit()
    conn.close()
    return {"status": "success"}

@app.post("/api/services", response_model=ServiceItem)
def add_service(service: ServiceItem, current_user: Any = Depends(get_current_user)):
    conn = get_db()
    cur = conn.execute('INSERT INTO services (name, description) VALUES (?,?)', (service.name, service.description))
    conn.commit()
    service.id = cur.lastrowid
    conn.close()
    return service

@app.put("/api/services/{service_id}")
def update_service(service_id: int, service: ServiceItem, current_user: Any = Depends(get_current_user)):
    conn = get_db()
    conn.execute('UPDATE services SET name=?, description=? WHERE id=?', (service.name, service.description, service_id))
    conn.commit()
    conn.close()
    return service

@app.delete("/api/services/{service_id}")
def delete_service(service_id: int, current_user: Any = Depends(get_current_user)):
    conn = get_db()
    conn.execute('DELETE FROM services WHERE id=?', (service_id,))
    conn.commit()
    conn.close()
    return {"status": "success"}

@app.post("/api/tyres", response_model=TyreProduct)
def add_tyre(tyre: TyreProduct, current_user: Any = Depends(get_current_user)):
    conn = get_db()
    specs_json = json.dumps(tyre.specs.dict())
    cur = conn.execute(
        'INSERT INTO tyres (brand, model, size, price, offerPrice, quantity, category, image, specs) VALUES (?,?,?,?,?,?,?,?,?)',
        (tyre.brand, tyre.model, tyre.size, tyre.price, tyre.offerPrice, tyre.quantity, tyre.category, tyre.image, specs_json)
    )
    conn.commit()
    tyre.id = cur.lastrowid
    conn.close()
    return tyre

@app.put("/api/tyres/{tyre_id}")
def update_tyre(tyre_id: int, tyre: TyreProduct, current_user: Any = Depends(get_current_user)):
    conn = get_db()
    specs_json = json.dumps(tyre.specs.dict())
    conn.execute(
        'UPDATE tyres SET brand=?, model=?, size=?, price=?, offerPrice=?, quantity=?, category=?, image=?, specs=? WHERE id=?',
        (tyre.brand, tyre.model, tyre.size, tyre.price, tyre.offerPrice, tyre.quantity, tyre.category, tyre.image, specs_json, tyre_id)
    )
    conn.commit()
    conn.close()
    return tyre

@app.delete("/api/tyres/{tyre_id}")
def delete_tyre(tyre_id: int, current_user: Any = Depends(get_current_user)):
    conn = get_db()
    conn.execute('DELETE FROM tyres WHERE id=?', (tyre_id,))
    conn.commit()
    conn.close()
    return {"status": "success"}

@app.put("/api/tyres/{tyre_id}/stock")
def update_tyre_stock(tyre_id: int, update: dict, current_user: Any = Depends(get_current_user)):
    conn = get_db()
    delta = update.get('delta', 0)
    conn.execute('UPDATE tyres SET quantity = MAX(0, quantity + ?) WHERE id=?', (delta, tyre_id))
    conn.commit()
    conn.close()
    return {"status": "success"}

@app.post("/api/brands")
def add_brand(brand: TyreBrand, current_user: Any = Depends(get_current_user)):
    conn = get_db()
    try:
        conn.execute('INSERT INTO brands (name) VALUES (?)', (brand.name,))
        conn.commit()
    except sqlite3.IntegrityError:
        pass
    conn.close()
    return brand

@app.delete("/api/brands/{name}")
def delete_brand(name: str, current_user: Any = Depends(get_current_user)):
    conn = get_db()
    conn.execute('DELETE FROM brands WHERE name=?', (name,))
    conn.commit()
    conn.close()
    return {"status": "success"}

@app.post("/api/settings")
def update_setting(update: SettingsUpdate, current_user: Any = Depends(get_current_user)):
    conn = get_db()
    val_json = json.dumps(update.value)
    conn.execute('INSERT OR REPLACE INTO settings (key, value) VALUES (?,?)', (update.key, val_json))
    conn.commit()
    conn.close()
    return {"status": "success"}

if __name__ == "__main__":
    import uvicorn
    # If running directly, init_db first
    init_db()
    uvicorn.run(app, host="0.0.0.0", port=8000)
