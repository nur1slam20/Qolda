import httpx
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

API_URL = "http://localhost:8000/api"

def run_tests():
    client = httpx.Client(base_url=API_URL)

    # 1. Register a new user
    logger.info("Testing Registration...")
    reg_data = {
        "name": "Auto Test",
        "email": "autotest1@example.com",
        "password": "password123",
        "is_seller": False
    }
    res = client.post("/auth/register", json=reg_data)
    if res.status_code == 400 and "already registered" in res.text:
        # Login if already exists
        res = client.post("/auth/login", json={"email": reg_data["email"], "password": reg_data["password"]})
    
    assert res.status_code in [200, 201], f"Auth failed: {res.text}"
    token = res.json()["access_token"]
    user_id = res.json()["user"]["id"]
    headers = {"Authorization": f"Bearer {token}"}
    logger.info(f"Auth successful, User ID: {user_id}")

    # 2. Get Products
    logger.info("Testing Get Products...")
    res = client.get("/products")
    assert res.status_code == 200, f"Products failed: {res.text}"
    products = res.json()
    assert len(products) > 0, "No products found"
    product_id = products["items"][0]["id"]
    
    # 3. Create Order
    logger.info("Testing Create Order...")
    order_data = {
        "items": [{"product_id": product_id, "quantity": 1}],
        "delivery_address": "Test Street 123",
        "customer_phone": "123456789"
    }
    res = client.post("/orders", json=order_data, headers=headers)
    assert res.status_code == 200, f"Order failed: {res.text}"
    logger.info(f"Order created: {res.json()['id']} for {res.json()['total_amount']}")

    # 4. Leave a Review
    logger.info("Testing Review...")
    review_data = {
        "product_id": product_id,
        "rating": 5,
        "text": "Amazing product!"
    }
    res = client.post("/reviews", json=review_data, headers=headers)
    assert res.status_code == 200, f"Review failed: {res.text}"
    logger.info("Review posted successfully")

    # 5. Get Recommendations
    logger.info("Testing Recommendations...")
    res = client.get(f"/recommendations/{user_id}", headers=headers)
    assert res.status_code == 200, f"Recs failed: {res.text}"
    recs = res.json()
    logger.info(f"Got {len(recs)} recommendations")
    for r in recs[:2]:
         logger.info(f"Rec: {r}")

    logger.info("ALL TESTS PASSED SUCCESSFULLY!")

if __name__ == "__main__":
    run_tests()
