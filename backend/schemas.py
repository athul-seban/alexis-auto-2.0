
from typing import List, Optional, Any, Dict
from pydantic import BaseModel

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
