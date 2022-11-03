let config = {};
let gameData = null;
let players = null;
let runnerID = null;
let serverTime = -1;

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
                                    socket.emit('clientConnect', {connected: true}); 
                                    console.log("Socket connected!");
                                });

    socket.on("update", updateSocket);
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
    runnerLat = players[runnerID]["location"]["lat"]
    runnerLon = players[runnerID]["location"]["lon"]
    map.getSource("runner").setData(getGeojson(runnerLat, runnerLon));

    myLat = players[playerID]["location"]["lat"]
    myLon = players[playerID]["location"]["lon"]
    map.getSource("me").setData(getGeojson(myLat, myLon));
}

function updateSocket(data) {
    gameData = data;
    runnerID = data["runnerID"];
    players = data["players"];
    serverTime = data["time"]*1000;

    updateMapMarkers();
}

window.onload = pageLoad;