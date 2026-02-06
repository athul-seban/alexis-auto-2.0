
import json
import sqlite3
from typing import List, Any
from fastapi import APIRouter, HTTPException, Depends, status
from datetime import timedelta
from ..database import get_db
from ..schemas import Booking, UserLogin, Token, Car, ServiceItem, TyreProduct, TyreBrand, SettingsUpdate
from ..auth import verify_password, create_access_token, get_current_user, get_password_hash, ACCESS_TOKEN_EXPIRE_MINUTES

router = APIRouter()

@router.post("/login", response_model=Token)
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

# --- Protected ---

@router.get("/bookings", response_model=List[Booking])
def get_bookings(current_user: Any = Depends(get_current_user)):
    conn = get_db()
    rows = conn.execute('SELECT * FROM bookings').fetchall()
    conn.close()
    return [dict(r) for r in rows]

@router.put("/bookings/{booking_id}/status")
def update_booking_status(booking_id: int, update: dict, current_user: Any = Depends(get_current_user)):
    conn = get_db()
    conn.execute('UPDATE bookings SET status=? WHERE id=?', (update['status'], booking_id))
    conn.commit()
    conn.close()
    return {"status": "success"}

@router.post("/users")
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

@router.put("/users/{username}/password")
def change_password(username: str, data: dict, current_user: Any = Depends(get_current_user)):
    conn = get_db()
    hashed_pw = get_password_hash(data['password'])
    conn.execute('UPDATE users SET password=? WHERE username=?', (hashed_pw, username))
    conn.commit()
    conn.close()
    return {"status": "success"}

@router.post("/cars", response_model=Car)
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

@router.put("/cars/{car_id}")
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

@router.delete("/cars/{car_id}")
def delete_car(car_id: int, current_user: Any = Depends(get_current_user)):
    conn = get_db()
    conn.execute('DELETE FROM cars WHERE id=?', (car_id,))
    conn.commit()
    conn.close()
    return {"status": "success"}

@router.post("/services", response_model=ServiceItem)
def add_service(service: ServiceItem, current_user: Any = Depends(get_current_user)):
    conn = get_db()
    cur = conn.execute('INSERT INTO services (name, description) VALUES (?,?)', (service.name, service.description))
    conn.commit()
    service.id = cur.lastrowid
    conn.close()
    return service

@router.put("/services/{service_id}")
def update_service(service_id: int, service: ServiceItem, current_user: Any = Depends(get_current_user)):
    conn = get_db()
    conn.execute('UPDATE services SET name=?, description=? WHERE id=?', (service.name, service.description, service_id))
    conn.commit()
    conn.close()
    return service

@router.delete("/services/{service_id}")
def delete_service(service_id: int, current_user: Any = Depends(get_current_user)):
    conn = get_db()
    conn.execute('DELETE FROM services WHERE id=?', (service_id,))
    conn.commit()
    conn.close()
    return {"status": "success"}

@router.post("/tyres", response_model=TyreProduct)
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

@router.put("/tyres/{tyre_id}")
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

@router.delete("/tyres/{tyre_id}")
def delete_tyre(tyre_id: int, current_user: Any = Depends(get_current_user)):
    conn = get_db()
    conn.execute('DELETE FROM tyres WHERE id=?', (tyre_id,))
    conn.commit()
    conn.close()
    return {"status": "success"}

@router.put("/tyres/{tyre_id}/stock")
def update_tyre_stock(tyre_id: int, update: dict, current_user: Any = Depends(get_current_user)):
    conn = get_db()
    delta = update.get('delta', 0)
    conn.execute('UPDATE tyres SET quantity = MAX(0, quantity + ?) WHERE id=?', (delta, tyre_id))
    conn.commit()
    conn.close()
    return {"status": "success"}

@router.post("/brands")
def add_brand(brand: TyreBrand, current_user: Any = Depends(get_current_user)):
    conn = get_db()
    try:
        conn.execute('INSERT INTO brands (name) VALUES (?)', (brand.name,))
        conn.commit()
    except sqlite3.IntegrityError:
        pass
    conn.close()
    return brand

@router.delete("/brands/{name}")
def delete_brand(name: str, current_user: Any = Depends(get_current_user)):
    conn = get_db()
    conn.execute('DELETE FROM brands WHERE name=?', (name,))
    conn.commit()
    conn.close()
    return {"status": "success"}

@router.post("/settings")
def update_setting(update: SettingsUpdate, current_user: Any = Depends(get_current_user)):
    conn = get_db()
    val_json = json.dumps(update.value)
    conn.execute('INSERT OR REPLACE INTO settings (key, value) VALUES (?,?)', (update.key, val_json))
    conn.commit()
    conn.close()
    return {"status": "success"}
