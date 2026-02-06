
import json
import sqlite3
from typing import List
from fastapi import APIRouter, HTTPException, Depends
from ..database import get_db
from ..schemas import Car, ServiceItem, TyreProduct, Booking

router = APIRouter()

@router.get("/cars", response_model=List[Car])
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

@router.get("/services", response_model=List[ServiceItem])
def get_services():
    try:
        conn = get_db()
        rows = conn.execute('SELECT * FROM services').fetchall()
        conn.close()
        return [dict(r) for r in rows]
    except Exception as e:
        print(f"Error fetching services: {e}")
        return []

@router.get("/tyres", response_model=List[TyreProduct])
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

@router.get("/brands")
def get_brands():
    conn = get_db()
    rows = conn.execute('SELECT * FROM brands').fetchall()
    conn.close()
    return [{"name": r["name"]} for r in rows]

@router.get("/settings/{key}")
def get_setting(key: str):
    conn = get_db()
    row = conn.execute('SELECT value FROM settings WHERE key=?', (key,)).fetchone()
    conn.close()
    if row:
        return json.loads(row['value'])
    return {}

@router.post("/bookings", response_model=Booking)
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
