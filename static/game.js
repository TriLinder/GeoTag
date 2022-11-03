let config = {};
let gameData = null;
let players = null;
let runnerID = null;
let runnerSince = -1;
let jailEnd = -1;
let serverTime = -1;
let serverTimeOffset = -1;

var playerID = document.cookie;

async function request(url, options = {}) {
    let object = await fetch(url, options);
    let json = await object.json();

    return json;
}

async function getConfig() {
    let j = await request("/api/get-config");
    
    config = j;
    return j;
}

async function pageLoad() {
    console.log("Page loaded!");
    await getConfig();

    socket = io();
    
    mapboxgl.accessToken = config["mapboxApiKey"];

    map = new mapboxgl.Map({
        container: "map",
        style: "mapbox://styles/mapbox/streets-v11",
        center: config["mapCenter"],
        zoom: config["mapZoomLevel"],
        projection: config["mapProjection"]
    });

    map.on("style.load", function() {map.setFog()});
    map.on("load", async function() {
                                    runnerIcon = map.addImage("runner", document.getElementById("runnerIcon"));
                                    meIcon = map.addImage("me", document.getElementById("meIcon"));

                                    map.addSource("runner", {type: "geojson", data: getGeojson(0, 0)});

                                    map.addLayer({
                                        "id": "runner",
                                        "type": "symbol",
                                        "source": "runner",
                                        "layout": {
                                            "icon-image": "runner",
                                            "icon-size": 1
                                        }    
                                    });

                                    map.addSource("me", {type: "geojson", data: getGeojson(0, 0)});

                                    map.addLayer({
                                        "id": "me",
                                        "type": "symbol",
                                        "source": "me",
                                        "layout": {
                                            "icon-image": "me",
                                            "icon-size": 1
                                        }    
                                    });
    });

    socket.on("connect", function() {
                                    socket.emit('clientConnect', {connected: true, playerID: playerID}); 
                                    console.log("Socket connected!");
                                });

    socket.on("update", updateSocket);

    setInterval(tick, 50);
}

function secondsToReadableTime(totalSeconds) {
    minutes = Math.floor(totalSeconds / 60);
    seconds = totalSeconds % 60;

    return `${minutes}min ${seconds}s`
}

function updateHUD() {
    if (!players) {
        return;
    }

    inJail = jailEnd > getServerTime()

    if (!inJail) {
        runner = players[runnerID];
        totalSeconds = Math.floor((getServerTime() - runner["runnerSince"]) / 1000);
        
        text = `Runner: ${runner["name"]} (${secondsToReadableTime(totalSeconds)})`;
    }
    else {
        secondsLeft = Math.ceil((jailEnd - getServerTime()) / 1000);
        text = `JAIL: ${secondsToReadableTime(secondsLeft)}`;
    }

    document.getElementById("runnerInfo").innerHTML = text

    //Hide request runner button when a runner
    if (playerID == runnerID) {
        document.getElementById("becomeRunnerButton").style.display = "none";
    }
    else {
        document.getElementById("becomeRunnerButton").style.display = "inline";
    }
}

function tick() {
    updateHUD();
}

function getServerTime() {
    return (new Date().getTime()) - serverTimeOffset
}

function getGeojson(lat, lon) {
    return {
        "type": "FeatureCollection",
        "features": [
            {
                "type": "Feature",
                "geometry": {
                    "type": "Point",
                    "coordinates": [lon, lat]
                }
            }
        ]
    };
}

function updateMapMarkers() {
    runnerLat = players[runnerID]["location"]["lat"];
    runnerLon = players[runnerID]["location"]["lon"];
    map.getSource("runner").setData(getGeojson(runnerLat, runnerLon));

    myLat = players[playerID]["location"]["lat"];
    myLon = players[playerID]["location"]["lon"];
    map.getSource("me").setData(getGeojson(myLat, myLon));
}

function flyToRunner() {
    runnerLat = players[runnerID]["location"]["lat"];
    runnerLon = players[runnerID]["location"]["lon"];

    map.flyTo({center: [runnerLon, runnerLat]});
}

function closeUI() {
    document.getElementById("overlayDiv").style.display = "none";
    document.getElementById("confirmRunnerPopup").style.display = "none";
}

function becomeRunnerButton() {
    document.getElementById("overlayDiv").style.display = "inline";
    document.getElementById("confirmRunnerPopup").style.display = "inline";
}

function becomeRunner() {
    console.log("Requesting becoming a runner.");

    closeUI();
    document.getElementById("becomeRunnerButton").style.display = "none";
    socket.emit('becomeRunner', {playerID: playerID});
}

function updateSocket(data) {
    gameData = data;
    runnerID = data["runnerID"];
    players = data["players"];
    jailEnd = data["jailEnd"];
    serverTime = data["time"];

    serverTimeOffset = (new Date().getTime()) - serverTime;

    updateMapMarkers();
}

window.onload = pageLoad;