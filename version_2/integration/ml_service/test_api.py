import requests
import json
import time

API_URL = "http://localhost:8000/api/ml/analyze-ingredient"

test_ingredients = [
    "WATER", 
    "GLYCERIN", 
    "ZINC PYRITHIONE", # Common anti-dandruff
    "FRAGRANCE",
    "RETINOL"
]

print("Waiting for API to be ready...")
for i in range(5):
    try:
        if requests.get("http://localhost:8000/health").status_code == 200:
            break
    except:
        pass
    time.sleep(2)

print("\nTesting ML API Inference...")
for ing in test_ingredients:
    try:
        res = requests.post(API_URL, json={"inci_name": ing, "description": ""})
        if res.status_code == 200:
            data = res.json()
            print(f"\n✅ {ing}:")
            print(f"  Functions: {data['predicted_functions']}")
            print(f"  Confidence: {data['confidence_score']:.2f}")
            if data['is_prohibited']:
                print(f"  ❌ PROHIBITED: {data['prohibited_details']}")
            if data['is_restricted']:
                print(f"  ⚠️ RESTRICTED: {data['restriction_details']}")
        else:
            print(f"\n❌ {ing}: Failed with status {res.status_code}")
    except Exception as e:
         print(f"Error calling API for {ing}: {e}")
