from fastapi import FastAPI, Depends
from models import Product
from database import session, engine   
import database_models
from sqlalchemy.orm import Session
app = FastAPI()

database_models.Base.metadata.create_all(bind=engine)

@app.get("/")
def greet():
    return "welcome"
products = [
    Product(id=1, name="Laptop", price=999.99, description="A high-performance laptop for work and play.", quantity=10),
    Product(id=2, name="Smartphone", price=499.99, description="A sleek smartphone with a stunning display and powerful features.", quantity=25),
    Product(id=3, name="Headphones", price=199.99, description="Noise-cancelling headphones for immersive sound experience.", quantity=15),
    Product(id=4, name="Smartwatch", price=299.99, description="A stylish smartwatch to keep you connected and track your fitness.", quantity=20),
] 

def get_db():
    db = session()
    try:
        yield db
    finally:
        db.close()



def init_db():
    db = session()
    try:
        # ---> UPDATE 1: Check if the database is already seeded
        existing_count = db.query(database_models.Product).count()
        
        if existing_count == 0:
            for product in products:
                db.add(database_models.Product(id=product.id, name=product.name, price=product.price, description=product.description, quantity=product.quantity))
            db.commit()
            print("Database seeded successfully.")
        else:
            print("Database already has data. Skipping seed.")
            
    finally:
        # ---> UPDATE 2: Always close the session to prevent connection leaks
        db.close()
    
init_db()


@app.get("/products")
def get_all_products(db: Session = Depends(get_db)):
     db_product = db.query(database_models.Product).all()
     return db_product

@app.get("/product/{id}")
def get_product_by_id(id: int, db: Session = Depends(get_db)):
    db_product = db.query(database_models.Product).filter(database_models.Product.id == id).first()
    if db_product:
        return db_product
    else:
        return {"message": "Product not found"}

@app.post("/product")
def add_product(product: Product, db: Session = Depends(get_db)):
    db.add(database_models.Product(id=product.id, name=product.name, price=product.price, description=product.description, quantity=product.quantity))
    db.commit()
    return {"message": "Product added successfully", "product": product}


    return {"message": "Product added successfully", "product": product}

@app.put("/product")
def update_product(id: int, product: Product, db: Session = Depends(get_db)):
    db_product = db.query(database_models.Product).filter(database_models.Product.id == id).first()
    if db_product:
        db_product.name = product.name
        db_product.price = product.price
        db_product.description = product.description
        db_product.quantity = product.quantity
        db.commit()
        return {"message": "Product updated successfully", "product": db_product}
    else:
        return {"message": "Product not found"}

@app.delete("/product")
def delete_product(id: int, db: Session = Depends(get_db)):
    db_product = db.query(database_models.Product).filter(database_models.Product.id == id).first()
    if db_product:
        db.delete(db_product)
        db.commit()
        return {"message": "Product deleted successfully"}
    else:
        return {"message": "Product not found"}