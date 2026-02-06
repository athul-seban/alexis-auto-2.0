
import sqlite3
import json
from .schemas import TyreSpecs

DB_NAME = "alexis.db"

def get_db():
    conn = sqlite3.connect(DB_NAME, check_same_thread=False)
    conn.row_factory = sqlite3.Row
    return conn

def internal_seed_data(conn):
    """Internal function to populate DB on first run only."""
    c = conn.cursor()
    
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

def init_db(get_password_hash_func):
    print("Initializing Database...")
    try:
        conn = get_db()
        c = conn.cursor()
        
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

        conn.commit()

        # Seed Admin if missing
        c.execute('SELECT count(*) FROM users')
        if c.fetchone()[0] == 0:
            print("Seeding admin user...")
            hashed_pw = get_password_hash_func("password")
            c.execute('INSERT INTO users (username, password) VALUES (?,?)', ("admin", hashed_pw))

        # Seed Settings if missing
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

        internal_seed_data(conn)
        
        conn.commit()
        conn.close()
        print("Database initialization complete.")
    except Exception as e:
        import traceback
        traceback.print_exc()
        print(f"CRITICAL ERROR INITIALIZING DATABASE: {e}")
