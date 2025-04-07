import time
import requests
import pandas as pd

SERVER_URL = "http://backend:5000/receive"

def send_packages(csv_file):
    df = pd.read_csv(csv_file)

    for i in range(len(df)):
        package = df.iloc[i]

        data = {
            "ip": package["ip address"],
            "latitude": float(package["Latitude"]),
            "longitude": float(package["Longitude"]),
            "timestamp": int(package["Timestamp"] * 1000),
            "suspicious": int(package["suspicious"])
        }

        try:
            response = requests.post(SERVER_URL, json=data)
            print(f"[{response.status_code}] Sent: {data}")
        except Exception as e:
            print("Failed to send:", e)

if __name__ == "__main__":
    send_packages("ip_addresses.csv")
