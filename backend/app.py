# backend/app.py
from flask import Flask
from flask_cors import CORS
from src.skills_api import skills_blueprint

app = Flask(__name__)
CORS(app)

app.register_blueprint(skills_blueprint)

@app.route('/')
def home():
    return "✅ Flask backend is running!"

@app.route('/ping')
def ping():
    return "✅ Flask is alive!"


if __name__ == '__main__':
    app.run(debug=True)
