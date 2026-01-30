import os
from flask import Flask
from flask_cors import CORS
from dotenv import load_dotenv

from models import db
from routes.session_routes import bp as session_bp
from routes.analytics_routes import bp as analytics_bp

load_dotenv()


def create_app():
    app = Flask(__name__)
    app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv(
        'DATABASE_URL', 'sqlite:///flowsense.db')
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

    CORS(app, origins=['*'])

    db.init_app(app)

    app.register_blueprint(session_bp)
    app.register_blueprint(analytics_bp)

    with app.app_context():
        db.create_all()

    @app.route('/api/health')
    def health():
        return {'status': 'ok'}

    return app


if __name__ == '__main__':
    app = create_app()
    app.run(debug=True, port=5000)
