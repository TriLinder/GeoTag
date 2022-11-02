from flask import Flask, render_template, request
from flask_socketio import SocketIO
import time
import math
import json

from numpy import broadcast

app = Flask(__name__)
socketio = SocketIO(app)

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

    data = {playerID: {"lat": lat, "lon": lon, "name": "PLACEHOLDER", "time": math.ceil(time.time())}}

    socketio.emit("update", data, broadcast=True)

    return "ok"

@app.get("/map")
def mapPage() :
    return render_template("game.html")

if __name__ == "__main__" :
    with open("config.json", "r") as f :
        config = json.loads(f.read())

    socketio.run(app, host="0.0.0.0", port=5000, debug=True)