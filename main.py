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

@app.get("/product/{id}")
def get_product_by_id(id: int):
    for product in products:
        if product.id == id:
            return product
    return {"Product not found"}


@app.post("/product")
def add_product(product: Product):
    products.append(product)
    return {"message": "Product added successfully", "product": product}

@app.put("/product")
def update_product(id: int, product: Product):
    for i in range(len(products)):
        if products[i].id == id:
            products[i] = product
            return "Product updated successfully"
    return "Product not found"

@app.delete("/product")
def delete_product(id: int):
    for i in range(len(products)):
        if products[i].id == id:
            del products[i]
            return "Product deleted successfully"
    return "Product not found"  