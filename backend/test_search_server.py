from flask import Flask, jsonify, request
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # Allow cross-origin requests

@app.route('/')
def home():
    return "Search backend is running!"

@app.route('/search', methods=['GET', 'POST'])
def search():
    print("✨✨✨ Search endpoint called! ✨✨✨")
    
    # Log the request
    query = ""
    if request.method == 'POST':
        data = request.get_json()
        query = data.get('query', '')
    else:  # GET request
        query = request.args.get('query', '')
    
    print(f"📢 Received search query: '{query}' via {request.method}")
    
    # Always return mock results regardless of query
    mock_results = [1140, 1141, 1142]
    
    # If the query contains "burger", include more specific IDs
    if "burger" in query.lower():
        print("🍔 Burger query detected, adding burger-related results")
        mock_results = [1140, 1141, 1142, 1143, 1144, 1145]
    
    print(f"📋 Returning results: {mock_results}")
    
    return jsonify({"result": mock_results})

if __name__ == '__main__':
    print("🚀 Starting search backend server on http://localhost:8000")
    print("📝 Routes available:")
    print("   - GET / : Check if server is running")
    print("   - GET/POST /search : Search endpoint that returns mock results")
    app.run(host='0.0.0.0', port=8000, debug=True) 