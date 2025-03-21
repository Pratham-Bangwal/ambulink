from flask import Flask, request, jsonify
from flask_cors import CORS
import datetime
import math
from threading import Lock

app = Flask(__name__)
CORS(app)

# Simulated ambulance data with coordinates and status
ambulance_data = {
    "ambulance_1": {"lat": 37.7749, "lon": -122.4194, "status": "Available"},
    "ambulance_2": {"lat": 37.7755, "lon": -122.4180, "status": "Available"},
}

# Tracking logs for ambulance requests
tracking_logs = []
ambulance_data_lock = Lock()

# Haversine formula to calculate distance between two points (in km)
def haversine_distance(lat1, lon1, lat2, lon2):
    R = 6371  # Earth radius in km
    phi1 = math.radians(lat1)
    phi2 = math.radians(lat2)
    delta_phi = math.radians(lat2 - lat1)
    delta_lambda = math.radians(lon2 - lon1)
    a = math.sin(delta_phi / 2) ** 2 + math.cos(phi1) * math.cos(phi2) * math.sin(delta_lambda / 2) ** 2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return R * c

@app.route("/")
def home():
    return "🚑 Ambulink Backend is Running!"

@app.route("/get_ambulance_locations", methods=["GET"])
def get_ambulance_locations():
    with ambulance_data_lock:
        data_copy = ambulance_data.copy()
    return jsonify(data_copy)

@app.route("/request_ambulance", methods=["POST"])
def request_ambulance():
    data = request.get_json()
    if not data or "lat" not in data or "lon" not in data:
        return jsonify({"error": "Invalid request: Missing latitude or longitude"}), 400

    try:
        user_lat = float(data["lat"])
        user_lon = float(data["lon"])
    except (ValueError, TypeError):
        return jsonify({"error": "Invalid latitude or longitude format"}), 400

    selected_ambulance = None
    min_distance = float('inf')
    with ambulance_data_lock:
        for key, value in ambulance_data.items():
            if value["status"] == "Available":
                distance = haversine_distance(user_lat, user_lon, value["lat"], value["lon"])
                if distance < min_distance:
                    min_distance = distance
                    selected_ambulance = key
        if selected_ambulance:
            # Update the ambulance status and location
            ambulance_data[selected_ambulance]["status"] = "Dispatched"
            ambulance_data[selected_ambulance]["lat"] = user_lat
            ambulance_data[selected_ambulance]["lon"] = user_lon
            # Log the request with timestamp
            tracking_logs.append({
                "ambulance": selected_ambulance,
                "requested_at": datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
                "user_location": {"lat": user_lat, "lon": user_lon}
            })
            # Simulate estimated arrival time (assuming average speed)
            eta = round(min_distance / 0.5, 1)  # using an arbitrary speed factor
            return jsonify({
                "message": f"🚑 {selected_ambulance} is on the way! Estimated arrival in {eta} minutes.",
                "ambulance": selected_ambulance
            })
    return jsonify({"error": "No ambulances available!"}), 503

@app.route("/status", methods=["GET"])
def server_status():
    return jsonify({
        "status": "Running",
        "time": datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    })

@app.route("/get_hospitals", methods=["GET"])
def get_hospitals():
    hospitals = [
        {"name": "AIIMS", "lat": 28.5672, "lon": 77.2100, "address": "Delhi, India"},
        {"name": "Apollo Hospital", "lat": 28.5244, "lon": 77.1855, "address": "New Delhi, India"},
    ]
    return jsonify({"hospitals": hospitals})

@app.route("/tracking_logs", methods=["GET"])
def get_tracking_logs():
    return jsonify({"logs": tracking_logs})

@app.route("/analytics", methods=["GET"])
def analytics():
    data = {
        "total_requests": len(tracking_logs),
        "ambulance_usage": {amb: sum(1 for log in tracking_logs if log["ambulance"] == amb) for amb in ambulance_data.keys()},
        "server_time": datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    }
    return jsonify(data)

if __name__ == "__main__":
    app.run(debug=True)
