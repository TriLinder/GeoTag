var usernameInput = document.getElementById("usernameInput");
var registerButton = document.getElementById("registerButton");
var errorElement = document.getElementById("error");

var overlayDiv = document.getElementById("overlayDiv");
var playerInfoDiv = document.getElementById("playerInfo");
var playerInfoDivSlide1 = document.getElementById("playerInfoSlide1");
var playerInfoDivSlide2 = document.getElementById("playerInfoSlide2");
var welcomeTextElement = document.getElementById("welcomeText");

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
    
    setTimeout(function() {
        playerInfoDivSlide1.classList.add("slideUpAnim");
        playerInfoDivSlide2.classList.add("slideFromBottomAnim");
        playerInfoDivSlide2.style.display = "inherit";
    }, 1000);
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

    info = await getPlayerInfo(username);
    playerID = info["playerID"];

    showPlayerInfo(info);

    //document.cookie = document.cookie = playerID + "; expires=Fri, 31 Dec 9999 23:59:59 GMT; path=/";
    //self.window.location = "/map";
}