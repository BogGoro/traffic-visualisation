import time
import requests
import pandas as pd

SERVER_URL = "http://localhost:5000/receive"

def send_packages(csv_file):
    df = pd.read_csv(csv_file)
    df['timestamp'] = pd.to_datetime(df['timestamp'])
    df = df.sort_values(by='timestamp')

    for i in range(len(df)):
        package = df.iloc[i]
        if i > 0:
            # Wait based on the time diff from previous package
            prev_time = df.iloc[i - 1]['timestamp']
            delay = (package['timestamp'] - prev_time).total_seconds()
            time.sleep(max(0, delay))

        data = {
            "ip": package["ip"],
            "latitude": float(package["latitude"]),
            "longitude": float(package["longitude"]),
            "timestamp": package["timestamp"].strftime("%Y-%m-%d %H:%M:%S"),
            "suspicious": int(package["suspicious"])
        }

        try:
            response = requests.post(SERVER_URL, json=data)
            print(f"[{response.status_code}] Sent: {data}")
        except Exception as e:
            print("Failed to send:", e)

if __name__ == "__main__":
    send_packages("ip_addresses.csv")
