var playerInfo = null

var usernameInput = document.getElementById("usernameInput");
var registerButton = document.getElementById("registerButton");
var errorElement = document.getElementById("error");

var overlayDiv = document.getElementById("overlayDiv");
var playerInfoDiv = document.getElementById("playerInfo");
var welcomeTextElement = document.getElementById("welcomeText");
var playerIdTextarea = document.getElementById("playerIdTextarea");
var enterGameButton = document.getElementById("enterGameButton");

async function request(url, options={}) {
    let object = await fetch(url, options);
    let json = await object.json();

    return json;
}

async function getPlayerInfo(username) {
    data = {"username": username};
    
    const options = {
        method: 'POST',
        body: JSON.stringify(data),
        headers: {
                  'Content-Type': 'application/json'
                  }
        };

    let j = await request("/api/register", options);
    return j;
}

function showPlayerInfo(playerInfo) {
    overlayDiv.style.display = "block";
    playerInfoDiv.style.display = "block";

    welcomeTextElement.innerHTML = `Welcome, ${playerInfo["username"]}!`;
    playerIdTextarea.innerHTML = playerInfo["appHttpHeaders"];
}

async function register() {
    username = usernameInput.value;
    registerButton.disabled = true;

    console.log("Checking username: " + username);

    if (!username) {
        registerButton.disabled = false;
        errorElement.innerHTML = "A username is required.";
        return
    }

    if (!username.replace(" ", "").match("^[A-Za-z0-9]+$")) {
        registerButton.disabled = false;
        errorElement.innerHTML = "Only letters, numbers and spaces are allowed.";
        return
    }

    playerInfo = await getPlayerInfo(username);
    playerID = playerInfo["playerID"];

    showPlayerInfo(playerInfo);

    //document.cookie = document.cookie = playerID + "; expires=Fri, 31 Dec 9999 23:59:59 GMT; path=/";
    //self.window.location = "/map";
}

function copyAppHttpHeaders() {
    if (navigator.clipboard) {
        playerIdTextarea.innerHTML = "COPIED TO CLIPBOARD!";
        
        navigator.clipboard.writeText(playerInfo["appHttpHeaders"]);

        setTimeout(function() {
            playerIdTextarea.innerHTML = playerInfo["appHttpHeaders"];
        }, 1000);
    }
    else {
        playerIdTextarea.setSelectionRange(0, 99999);
    }
}

function enterGame() {
    enterGameButton.disabled = true;
    console.log("Writing to cookies");
    document.cookie = document.cookie = playerID + "; expires=Fri, 31 Dec 9999 23:59:59 GMT; path=/";
    self.window.location = "/map";
}