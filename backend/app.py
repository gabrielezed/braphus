import os
import time
import json
import logging
from flask import Flask, jsonify, request, send_from_directory, abort
from flask_cors import CORS
from neo4j import GraphDatabase, exceptions

# --- Logging Setup ---
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

# --- Flask App Initialization ---
app = Flask(__name__)
CORS(app)

# --- Neo4j Connection ---
NEO4J_URI = "bolt://database:7687"
NEO4J_USER = "neo4j"
NEO4J_PASSWORD = "password"
driver = GraphDatabase.driver(NEO4J_URI, auth=(NEO4J_USER, NEO4J_PASSWORD))

# --- API Endpoints ---

@app.route('/api/graph', methods=['GET'])
def get_graph():
    nodes = []
    edges = []
    with driver.session() as session:
        # Get all nodes
        node_results = session.run("MATCH (n:Node) RETURN n")
        for record in node_results:
            nodes.append({"data": dict(record["n"])})
        
        # --- CORRECTED QUERY ---
        # Explicitly ask for the 'id' of the source and target nodes for each relationship.
        # This guarantees that the source and target fields will never be null.
        edge_results = session.run("MATCH (source_node:Node)-[r]->(target_node:Node) RETURN source_node.id AS source, target_node.id AS target")
        for record in edge_results:
            # The record is already a dict with {"source": "...", "target": "..."}
            edges.append({"data": dict(record)})
            
    return jsonify({"nodes": nodes, "edges": edges})

@app.route('/api/node/<string:node_id>', methods=['PUT'])
def update_node(node_id):
    data = request.get_json()
    if not data or 'content' not in data:
        abort(400, description="Missing 'content' in request body.")
    query = "MATCH (n:Node {id: $id}) SET n.content = $content RETURN n"
    with driver.session() as session:
        result = session.run(query, id=node_id, content=data['content'])
        updated_node = result.single()
        if not updated_node:
            abort(404, description=f"Node with id '{node_id}' not found.")
        return jsonify(dict(updated_node['n']))

@app.route('/api/seed', methods=['POST'])
def seed_database():
    with driver.session() as session:
        result = session.run("MATCH (n:Node) RETURN count(n) > 0 as hasNodes")
        if result.single()['hasNodes']:
            return jsonify({"message": "Database already contains data. Seeding skipped."}), 200
    try:
        seed_file_path = os.path.join(app.root_path, '..', 'data', 'gestalt-therapy.json')
        with open(seed_file_path, 'r') as f:
            data = json.load(f)
    except FileNotFoundError:
        abort(500, "Seed data file not found.")
    with driver.session() as session:
        with session.begin_transaction() as tx:
            for node_data in data.get('nodes', []):
                node = node_data.get('data', {})
                tx.run("CREATE (n:Node {id: $id, label: $label, content: $content})", **node)
            for edge_data in data.get('edges', []):
                edge = edge_data.get('data', {})
                tx.run("MATCH (a:Node {id: $source}) MATCH (b:Node {id: $target}) CREATE (a)-[:RELATES_TO]->(b)", **edge)
    return jsonify({"message": "Database successfully seeded."}), 201

# --- Static File Serving ---
@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve(path):
    if path != "" and os.path.exists(os.path.join(app.root_path, '..', path)):
        return send_from_directory(os.path.join(app.root_path, '..'), path)
    else:
        return send_from_directory(os.path.join(app.root_path, '..'), 'index.html')

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)