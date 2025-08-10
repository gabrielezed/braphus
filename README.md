# Braphus - A Multi-Graph Knowledge Management Tool

Braphus is a web application for creating, visualizing, and managing multiple knowledge graphs. It uses a client-server architecture powered by Docker, with a Python/Flask backend, a Neo4j graph database, and a vanilla JavaScript frontend.

The application allows users to maintain a personal **Workspace** of distinct knowledge graphs, importing new ones from JSON files and switching between them seamlessly.

## Current Status: Editor UI Implemented

The application is stable, with all critical bugs from the initial multi-graph refactor now resolved.

The UI foundation for the **Graph Editor** is now complete. When a graph is loaded, a dedicated "Edit Graph" button becomes available. Activating this "Edit Mode" reveals a new toolbar and prepares the canvas for direct manipulation, paving the way for the implementation of full CRUD (Create, Read, Update, Delete) functionality for nodes and edges in the next phase.

---

### Core Features

* **Workspace Management:** Import, load, and delete multiple, distinct graphs via a dedicated, non-intrusive workspace modal.
* **Interactive Visualization:** Graphs are rendered using Cytoscape.js with a directed layout.
* **Node Content Editor:** View and edit rich text content for each node using a side panel with Markdown support. All edits are correctly scoped to their specific graph.
* **Persistent Storage:** All graph data is stored in a local Neo4j database, managed via Docker.
* **Editor Foundation:** A toggleable "Edit Mode" with a dedicated UI toolbar has been added, creating the user-facing entry point for graph creation tools.

---

### Target Architecture

The application is a multi-container system orchestrated by `docker-compose`:

* **Frontend:** A vanilla JavaScript client that handles user interaction and graph visualization.
* **Backend:** A Python/Flask API that serves the frontend and communicates with the database.
* **Database:** A Neo4j instance for persistent graph data storage.

---

### Next Steps: Graph Structure Manipulation

The next development phase will focus on implementing the logic behind the editor UI. This involves:

* **Integrating an Edge Drawing Library:** Using a Cytoscape.js extension to provide an intuitive experience for creating edges between nodes.
* **Backend API Expansion:** Building the full suite of CRUD endpoints for creating and deleting nodes and edges within a specific graph.
* **Frontend Logic:** Writing the client-side code to handle user actions in Edit Mode (e.g., double-clicking to create a node, dragging to create an edge, pressing 'Delete' to remove elements) and communicating those changes to the backend.