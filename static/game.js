let config = {};
let runnerInfo = null;

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

                                    map.addSource("runner", {type: "geojson", data: getGeojson()});

                                    map.addLayer({
                                        "id": "runner",
                                        "type": "symbol",
                                        "source": "runner",
                                        "layout": {
                                            "icon-image": "runner",
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

function getGeojson() {
    lat = 0;
    lon = 0
    
    if (runnerInfo) {
        lat = runnerInfo["location"]["lat"];
        lon = runnerInfo["location"]["lon"];
    }

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

function updateSocket(data) {
    runnerInfo = data["runner"];

    //Update runner's position on the map
    map.getSource("runner").setData(getGeojson());
}

window.onload = pageLoad;