#postgresql database connection and session management for the product management system
from sqlalchemy.orm import sessionmaker
from sqlalchemy import create_engine
db_url = "postgresql://postgres:12345678@localhost:5432/product-management"
engine = create_engine(db_url)
session = sessionmaker(autocommit=False, autoflush=False, bind=engine)