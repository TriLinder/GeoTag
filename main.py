from flask import Flask, render_template, request, redirect
from flask_socketio import SocketIO
import random
import uuid
import time
import math
import json

app = Flask(__name__)
socketio = SocketIO(app)

class Game :
    def __init__(self) -> None :
        self.runnerID = None
        self.players = {}

        self.jailTime = -1

    def restartJailPeriod(self) :
        self.jailTime = time.time() + config["serverConfig"]["jailPeriod"]
    
    def getRunner(self) :
        try :
            return self.players[self.runnerID]
        except KeyError :
            return None

    def addPlayer(self, name) :
        player = Player(name, self)
        self.players[player.id] = player

        if not self.runnerID :
            player.becomeRunner()
        
        return player

class Player :
    def __init__(self, name, game) -> None :
        self.name = name
        self.game = game
        self.id = uuid.uuid4().hex

        self.lastUpdate = -1
        self.isRunner = False
        self.runnerSince = -1
        self.lat = None
        self.lon = None

    def becomeRunner(self) :
        if self.game.runnerID :
            self.game.getRunner().isRunner = False
        
        self.game.runnerID = self.id
        self.game.restartJailPeriod()
        self.isRunner = True
        self.runnerSince = self.game.jailTime
    
    def getPlayerInfo(self) :
        j = {"name": self.name, "location": {"lat": self.lat, "lon": self.lon}, "runnerSince": self.runnerSince * 1000}
        return j

    def updatePos(self, lat, lon) :
        self.lastUpdate = time.time()
        self.lat, self.lon = lat, lon

def validatePlayerID(playerID) :
    return playerID in game.players

def validateCookies(cookies) :
    cookies = list(cookies)

    try :
        return validatePlayerID(cookies[0])
    except IndexError :
        return False

@socketio.on('clientConnect')
def clientConnectedSocket(data):
    sendUpdateSocket()

@socketio.on('restartJailPeriod')
def restartJailPeriodSocket(data) :
    game.restartJailPeriod()
    sendUpdateSocket()

@socketio.on('logOut')
def logOutSocket(data) :
    playerID = data["playerID"]

    try :
        player = game.players[playerID]
    except KeyError :
        return

    wasRunner = player.isRunner
    del game.players[playerID]

    if wasRunner :
        game.runnerID = None
        game.jailTime = -1

        if len(game.players) > 0 :
            randomPlayer = random.choice(list(game.players.values()))
            randomPlayer.becomeRunner()
    
    sendUpdateSocket()

@socketio.on('becomeRunner')
def becomeRunnerSocket(data) :
    playerID = data["playerID"]

    game.players[playerID].becomeRunner()
    sendUpdateSocket()

def sendUpdateSocket() :
    playerInfo = {}

    for player in game.players.values() :
        playerInfo[player.id] = player.getPlayerInfo()

    runner = game.getRunner()
    if runner :
        runnerID = runner.id
    else :
        runnerID = None #Sends null, but that doesn't matter as the client will log out anyway.

    data = {"runnerID": runnerID, "players": playerInfo, "jailEnd":game.jailTime * 1000, "time": time.time() * 1000}
    socketio.emit("update", data, broadcast=True)

@app.post("/api/register")
def registerApi() :
    j = request.json

    #TODO: Validate username

    username = j["username"]
    player = game.addPlayer(username)

    return json.dumps({"playerID": player.id, "appHttpHeaders": f"playerID: {player.id}", "isRunner": player.isRunner, "username": player.name})

@app.get("/api/get-config")
def getConfigApi() :
    return json.dumps(config["webConfig"])

@app.post("/api/update-location")
def updateLocationApi() :
    global playerLocations
    
    playerID = request.headers["playerID"]
    lat, lon = request.data.decode("utf-8").split(";")

    if not playerID in game.players :
        return "Invalid playerID!", 400

    player = game.players[playerID]
    player.updatePos(lat, lon)

    if player.isRunner :
        sendUpdateSocket()

    return "ok"

@app.get("/")
def indexPage() :
    if validateCookies(request.cookies) :
        return redirect("/map")

    return render_template("register.html")

@app.get("/map")
def mapPage() :
    if not validateCookies(request.cookies) :
        return redirect("/")

    return render_template("game.html")

if __name__ == "__main__" :
    with open("config.json", "r") as f :
        config = json.loads(f.read())

    game = Game()

    socketio.run(app, host="0.0.0.0", port=5000, debug=True)