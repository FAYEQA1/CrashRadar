from flask import Flask , render_template,request,url_for
import os 

app = Flask(__name__)

@app.route("/")
def home():
    return render_template('')

if __name__ =='__main__':
    app.run(debug=True)