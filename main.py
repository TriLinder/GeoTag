from flask import Flask, render_template
import json

app = Flask(__name__)

@app.get("/api/get-config")
def getConfigApi() :
    return json.dumps(config["webConfig"])

@app.get("/map")
def mapPage() :
    return render_template("game.html")

if __name__ == "__main__" :
    with open("config.json", "r") as f :
        config = json.loads(f.read())

    app.run(host="0.0.0.0", port=5000, threaded=True, debug=True)