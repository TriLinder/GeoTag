let config = {};

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

    const map = new mapboxgl.Map({
        container: "map",
        style: "mapbox://styles/mapbox/streets-v11",
        center: config["mapCenter"],
        zoom: config["mapZoomLevel"],
        projection: config["mapProjection"]
    });

    map.on("style.load", () => {map.setFog()});

    socket.on("connect", function() {
                                    socket.emit('clientConnect', {connected: true}); 
                                    console.log("Socket connected!");
                                });

    socket.on("update", function(data) {console.log(data)});
}

window.onload = pageLoad;