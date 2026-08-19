import os
from sqlalchemy import create_engine, Column, Integer, String, Float, ForeignKey
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./waterpulse.db")

engine = create_engine(
    DATABASE_URL, connect_args={"check_same_thread": False} if "sqlite" in DATABASE_URL else {}
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

class District(Base):
    __tablename__ = "districts"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True)
    latitude = Column(Float)
    longitude = Column(Float)
    
    weather_forecasts = relationship("WeatherData", back_populates="district")
    water_data = relationship("WaterData", back_populates="district", uselist=False)

class WeatherData(Base):
    __tablename__ = "weather_data"
    
    id = Column(Integer, primary_key=True, index=True)
    district_id = Column(Integer, ForeignKey("districts.id"))
    day = Column(Integer)
    forecast_rainfall_mm = Column(Float)
    forecast_temp_c = Column(Float)
    humidity_pct = Column(Float)
    evaporation_mm = Column(Float)
    
    district = relationship("District", back_populates="weather_forecasts")

class WaterData(Base):
    __tablename__ = "water_data"
    
    id = Column(Integer, primary_key=True, index=True)
    district_id = Column(Integer, ForeignKey("districts.id"))
    groundwater_level = Column(Float)
    historical_trend = Column(String)
    annual_recharge_bcm = Column(Float)
    annual_extraction_bcm = Column(Float)
    extraction_percentage = Column(Float)
    
    district = relationship("District", back_populates="water_data")

class Resident(Base):
    __tablename__ = "residents"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    phone = Column(String)
    district_name = Column(String)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)

def init_db():
    Base.metadata.create_all(bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
