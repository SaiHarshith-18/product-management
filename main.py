from fastapi import FastAPI
from models import Product
app = FastAPI()

@app.get("/")
def greet():
    return "welcome"
products = [
    Product(id=1, name="Laptop", price=999.99, description="A high-performance laptop for work and play.", quantity=10),
    Product(id=2, name="Smartphone", price=499.99, description="A sleek smartphone with a stunning display and powerful features.", quantity=25),
    Product(id=3, name="Headphones", price=199.99, description="Noise-cancelling headphones for immersive sound experience.", quantity=15),
    Product(id=4, name="Smartwatch", price=299.99, description="A stylish smartwatch to keep you connected and track your fitness.", quantity=20),
]   

@app.get("/products")
def get_all_products():
    return products

