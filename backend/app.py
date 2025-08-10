import os
import uuid
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
# The connection details are for connecting from one Docker container (backend) to another (database).
NEO4J_URI = "bolt://database:7687"
NEO4J_USER = "neo4j"
NEO4J_PASSWORD = "password"
driver = GraphDatabase.driver(NEO4J_URI, auth=(NEO4J_USER, NEO4J_PASSWORD))

# --- API Endpoints for Graph Workspace ---

@app.route('/api/graphs', methods=['GET'])
def list_graphs():
    """
    Lists all available graphs in the database.
    Each graph is represented by a :Graph node.
    """
    query = "MATCH (g:Graph) RETURN g.graphId AS graphId, g.name AS name ORDER BY g.name"
    with driver.session() as session:
        results = session.run(query)
        graphs = [dict(record) for record in results]
    return jsonify(graphs)


@app.route('/api/graphs', methods=['POST'])
def import_graph():
    """
    Imports a new graph from a JSON payload.
    It creates a new :Graph node and all the :Node entities associated with it.
    """
    data = request.get_json()
    if not data or 'name' not in data or 'data' not in data:
        abort(400, description="Request must include 'name' and 'data' fields.")

    graph_name = data['name']
    graph_data = data['data']
    nodes_to_create = graph_data.get('nodes', [])
    edges_to_create = graph_data.get('edges', [])
    graph_id = str(uuid.uuid4())

    with driver.session() as session:
        with session.begin_transaction() as tx:
            # 1. Create the main :Graph node
            tx.run("CREATE (g:Graph {graphId: $id, name: $name})", id=graph_id, name=graph_name)

            # 2. Create all :Node entities and link them to the :Graph
            for node_data in nodes_to_create:
                node_props = node_data.get('data', {})
                tx.run("""
                    MATCH (g:Graph {graphId: $graphId})
                    CREATE (n:Node $props)-[:BELONGS_TO]->(g)
                """, graphId=graph_id, props=node_props)

            # 3. Create all :RELATES_TO relationships between the newly created nodes
            for edge_data in edges_to_create:
                edge_props = edge_data.get('data', {})
                source_id = edge_props.get('source')
                target_id = edge_props.get('target')
                if not source_id or not target_id:
                    continue # Skip edges with missing source or target
                
                # Add a unique ID to the edge relationship for future manipulation
                edge_id = str(uuid.uuid4())
                tx.run("""
                    MATCH (g:Graph {graphId: $graphId})
                    MATCH (source:Node {id: $source_id})-[:BELONGS_TO]->(g)
                    MATCH (target:Node {id: $target_id})-[:BELONGS_TO]->(g)
                    CREATE (source)-[:RELATES_TO {id: $edge_id}]->(target)
                """, graphId=graph_id, source_id=source_id, target_id=target_id, edge_id=edge_id)

    return jsonify({"message": "Graph imported successfully", "graphId": graph_id}), 201


@app.route('/api/graphs/<string:graph_id>', methods=['GET'])
def get_graph_by_id(graph_id):
    """
    Fetches the full data for a single graph in Cytoscape-compatible format.
    """
    nodes = []
    edges = []
    with driver.session() as session:
        # Get all nodes belonging to the specified graph
        node_query = "MATCH (n:Node)-[:BELONGS_TO]->(:Graph {graphId: $graphId}) RETURN n"
        node_results = session.run(node_query, graphId=graph_id)
        for record in node_results:
            nodes.append({"data": dict(record["n"])})

        # If no nodes were found, the graph doesn't exist.
        if not nodes:
            abort(404, description=f"Graph with id '{graph_id}' not found.")

        # Get all edges where both source and target nodes belong to the specified graph
        edge_query = """
            MATCH (source:Node)-[:BELONGS_TO]->(g:Graph {graphId: $graphId})
            MATCH (target:Node)-[:BELONGS_TO]->(g)
            MATCH (source)-[r:RELATES_TO]->(target)
            RETURN r.id AS id, source.id AS source, target.id AS target
        """
        edge_results = session.run(edge_query, graphId=graph_id)
        for record in edge_results:
            edges.append({"data": dict(record)})

    return jsonify({"nodes": nodes, "edges": edges})


@app.route('/api/graphs/<string:graph_id>', methods=['DELETE'])
def delete_graph(graph_id):
    """
    Deletes a graph and all of its associated nodes and relationships.
    """
    with driver.session() as session:
        query = """
            MATCH (g:Graph {graphId: $graphId})
            OPTIONAL MATCH (n:Node)-[:BELONGS_TO]->(g)
            DETACH DELETE n, g
        """
        result = session.run(query, graphId=graph_id)
        summary = result.consume()
        if summary.counters.nodes_deleted == 0:
            abort(404, description=f"Graph with id '{graph_id}' not found.")

    return jsonify({"message": f"Graph '{graph_id}' deleted successfully."}), 200


# --- Node and Edge CRUD Endpoints ---

@app.route('/api/graphs/<string:graph_id>/nodes', methods=['POST'])
def create_node_in_graph(graph_id):
    """Creates a new node and attaches it to the specified graph."""
    data = request.get_json()
    if not data or 'id' not in data or 'label' not in data or 'content' not in data:
        abort(400, description="Request must include 'id', 'label', and 'content' for the new node.")

    query = """
        MATCH (g:Graph {graphId: $graphId})
        CREATE (n:Node {id: $id, label: $label, content: $content})
        CREATE (n)-[:BELONGS_TO]->(g)
        RETURN n
    """
    with driver.session() as session:
        result = session.run(query, graphId=graph_id, id=data['id'], label=data['label'], content=data['content'])
        new_node = result.single()
        if not new_node:
            abort(404, description=f"Graph with id '{graph_id}' not found.")
        return jsonify(dict(new_node['n'])), 201

@app.route('/api/graphs/<string:graph_id>/nodes/<string:node_id>', methods=['PUT'])
def update_node_in_graph(graph_id, node_id):
    """Updates a node's properties within a specific graph."""
    data = request.get_json()
    if not data:
        abort(400, description="Request body cannot be empty.")

    # Dynamically build the SET part of the query
    set_clauses = [f"n.{key} = ${key}" for key in data.keys()]
    if not set_clauses:
        abort(400, description="Request must include properties to update (e.g., 'content', 'label').")
    
    set_string = ", ".join(set_clauses)
    
    query = f"""
        MATCH (n:Node {{id: $nodeId}})-[:BELONGS_TO]->(g:Graph {{graphId: $graphId}})
        SET {set_string}
        RETURN n
    """
    
    params = {**data, 'nodeId': node_id, 'graphId': graph_id}
    
    with driver.session() as session:
        result = session.run(query, **params)
        updated_node = result.single()
        if not updated_node:
            abort(404, description=f"Node with id '{node_id}' not found in graph '{graph_id}'.")
        return jsonify(dict(updated_node['n']))

@app.route('/api/graphs/<string:graph_id>/nodes/<string:node_id>', methods=['DELETE'])
def delete_node_in_graph(graph_id, node_id):
    """Deletes a node and its relationships from a specific graph."""
    query = """
        MATCH (g:Graph {graphId: $graphId})
        MATCH (n:Node {id: $nodeId})-[:BELONGS_TO]->(g)
        DETACH DELETE n
    """
    with driver.session() as session:
        result = session.run(query, graphId=graph_id, nodeId=node_id)
        summary = result.consume()
        if summary.counters.nodes_deleted == 0:
            abort(404, description=f"Node with id '{node_id}' not found in graph '{graph_id}'.")
    return jsonify({"message": f"Node '{node_id}' deleted successfully."}), 200

@app.route('/api/graphs/<string:graph_id>/edges', methods=['POST'])
def create_edge_in_graph(graph_id):
    """Creates a new edge between two nodes in a specific graph."""
    data = request.get_json()
    if not data or 'source' not in data or 'target' not in data:
        abort(400, description="Request must include 'source' and 'target' node IDs.")

    edge_id = str(uuid.uuid4())
    query = """
        MATCH (g:Graph {graphId: $graphId})
        MATCH (source:Node {id: $sourceId})-[:BELONGS_TO]->(g)
        MATCH (target:Node {id: $targetId})-[:BELONGS_TO]->(g)
        CREATE (source)-[r:RELATES_TO {id: $edgeId}]->(target)
        RETURN r.id AS id
    """
    with driver.session() as session:
        result = session.run(query, graphId=graph_id, sourceId=data['source'], targetId=data['target'], edgeId=edge_id)
        if not result.single():
            abort(404, description="Source or target node not found in the specified graph.")
    
    return jsonify({
        "message": "Edge created successfully", 
        "data": {"id": edge_id, "source": data['source'], "target": data['target']}
    }), 201

@app.route('/api/graphs/<string:graph_id>/edges/<string:edge_id>', methods=['DELETE'])
def delete_edge_in_graph(graph_id, edge_id):
    """Deletes an edge from a specific graph by its ID."""
    query = """
        MATCH (g:Graph {graphId: $graphId})
        MATCH (n1:Node)-[:BELONGS_TO]->(g)
        MATCH (n2:Node)-[:BELONGS_TO]->(g)
        MATCH (n1)-[r:RELATES_TO {id: $edgeId}]->(n2)
        DELETE r
    """
    with driver.session() as session:
        result = session.run(query, graphId=graph_id, edgeId=edge_id)
        summary = result.consume()
        if summary.counters.relationships_deleted == 0:
            abort(404, description=f"Edge with id '{edge_id}' not found in graph '{graph_id}'.")
    return jsonify({"message": f"Edge '{edge_id}' deleted successfully."}), 200


# --- Static File Serving ---
@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve(path):
    """
    Serves the static frontend files (HTML, CSS, JS).
    It defaults to serving index.html for any path that doesn't match a file.
    """
    frontend_dir = os.path.join(app.root_path, '..')
    if path != "" and os.path.exists(os.path.join(frontend_dir, path)):
        return send_from_directory(frontend_dir, path)
    else:
        return send_from_directory(frontend_dir, 'index.html')

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)