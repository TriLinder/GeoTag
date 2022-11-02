var usernameInput = document.getElementById("usernameInput");
var registerButton = document.getElementById("registerButton");
var errorElement = document.getElementById("error");

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

async function register() {
    username = usernameInput.value;
    registerButton.disabled = true;

    console.log("Checking username: " + username);

    if (!username) {
        registerButton.disabled = false;
        errorElement.innerHTML = "You must enter a username";
        return
    }

    if (!username.replace(" ", "").match("^[A-Za-z0-9]+$")) {
        registerButton.disabled = false;
        errorElement.innerHTML = "Only letters, numbers and spaces are allowed.";
        return
    }

    info = await getPlayerInfo(username);
    playerID = info["playerID"];

    document.cookie = document.cookie = playerID + "; expires=Fri, 31 Dec 9999 23:59:59 GMT; path=/";
    
    self.window.location = "/map";
}