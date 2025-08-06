# Braphus - A Multi-Graph Knowledge Management Tool

Braphus is a web application for creating, visualizing, and managing multiple knowledge graphs. It uses a client-server architecture powered by Docker, with a Python/Flask backend, a Neo4j graph database, and a vanilla JavaScript frontend.

The application allows users to maintain a personal **Workspace** of distinct knowledge graphs, importing new ones from JSON files and switching between them seamlessly.

## Current Status: Stable & Ready for Editor Implementation

The project is now on a stable foundation, and the next major goal is the implementation of a full-featured graph editor.

---

### Core Features

* **Workspace Management:** Import, load, and delete multiple, distinct graphs via a dedicated workspace modal.
* **Interactive Visualization:** Graphs are rendered using Cytoscape.js with a directed layout.
* **Node Content Editor:** View and edit rich text content for each node using a side panel with Markdown support. All edits are now correctly scoped to the specific graph being viewed.
* **Persistent Storage:** All graph data is stored in a local Neo4j database, managed via Docker.

---

### Target Architecture

The application is a multi-container system orchestrated by `docker-compose`:

* **Frontend:** A vanilla JavaScript client that handles user interaction and graph visualization.
* **Backend:** A Python/Flask API that serves the frontend and communicates with the database.
* **Database:** A Neo4j instance for persistent graph data storage.

---

### Next Steps: The Graph Editor

With the core infrastructure stabilized, the next development phase will focus on transforming Braphus from a graph viewer into a graph creation tool. The planned features include:

* **Dedicated Edit Mode:** A toggleable mode that enables creation and manipulation tools on the canvas.
* **Node Creation:** The ability to add new nodes directly to the graph from the UI.
* **Edge Creation:** An intuitive way to draw connections between nodes to establish relationships.
* **Element Deletion:** Functionality to delete selected nodes and edges from the graph.