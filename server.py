from flask import Flask, request, jsonify
from flask_cors import CORS
import time

app = Flask(__name__)
CORS(app)  # Allow frontend to connect
received_data = []

@app.route("/receive", methods=["POST"])
def receive():
    data = request.get_json()
    if data:
        received_data.append(data)
        print(f"Received package: {data}")
        return jsonify({"status": "received"}), 200
    return jsonify({"error": "no data"}), 400

@app.route("/data", methods=["GET"])
def get_data():
    return jsonify(received_data[-50:])  # last 50 for live view

if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0")
