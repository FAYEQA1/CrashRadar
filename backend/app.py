from flask import Flask , render_template,request,url_for,jsonify
import os 

app = Flask(__name__)

@app.route("/")
def home():
    return jsonify({
        "message": "Crash Radar Backend Running"
    })

@app.route('/detection',methods = ["POST"])
def detect():
    return jsonify({
        "status": "success",
        "result": "Crash detected"
    })

if __name__ =='__main__':
    app.run(debug=True)