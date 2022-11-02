from flask import Flask, render_template, request
from flask_socketio import SocketIO
import uuid
import time
import math
import json

app = Flask(__name__)
socketio = SocketIO(app)

class Player :
    def __init__(self, name) -> None:
        self.name = name
        self.id = uuid.uuid4()
        self.token = uuid.uuid4().hex

        self.lastUpdate = -1
        self.lat = None
        self.lon = None
    
    def updatePos(self, lat, lon) :
        self.lastUpdate = time.time()
        self.lat, self.lon = lat, lon

@socketio.on('clientConnect')
def clientConnectedSocket(data):
    pass

@app.get("/api/get-config")
def getConfigApi() :
    return json.dumps(config["webConfig"])

@app.post("/api/update-location")
def updateLocationApi() :
    global playerLocations
    
    playerID = request.headers["playerID"]
    lat, lon = request.data.decode("utf-8").split(";")

    data = {"runner": {"id": "tester", "location": {"lat": lat, "lon": lon}}, "time": time.time()}

    socketio.emit("update", data, broadcast=True)

    return "ok"

@app.get("/")
def indexPage() :
    return render_template("register.html")

@app.get("/map")
def mapPage() :
    return render_template("game.html")

if __name__ == "__main__" :
    with open("config.json", "r") as f :
        config = json.loads(f.read())

    socketio.run(app, host="0.0.0.0", port=5000, debug=True)