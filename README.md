# Braphus - A Multi-Graph Knowledge Management Tool

Braphus is a web application for creating, visualizing, and managing multiple knowledge graphs. It uses a client-server architecture powered by Docker, with a Python/Flask backend, a Neo4j graph database, and a vanilla JavaScript frontend.

The application allows users to maintain a personal **Workspace** of distinct knowledge graphs, importing new ones from JSON files and switching between them seamlessly.

## Current Status: Functional with Known Issues

The "Phase 4" architectural refactor is complete. The application has been transformed from a simple single-graph viewer into a multi-graph management tool. The core functionality is operational, but new issues have been identified that need to be addressed in the next development phase.

---

### Core Features

* **Workspace Management:** Import, load, and delete multiple, distinct graphs via a dedicated workspace modal.
* **Interactive Visualization:** Graphs are rendered using Cytoscape.js with a directed layout.
* **Node Content Editor:** View and edit rich text content for each node using a side panel with Markdown support.
* **Persistent Storage:** All graph data is stored in a local Neo4j database, managed via Docker.

---

### Target Architecture

The application is a multi-container system orchestrated by `docker-compose`:

* **Frontend:** A vanilla JavaScript client that handles user interaction and graph visualization.
* **Backend:** A Python/Flask API that serves the frontend and communicates with the database.
* **Database:** A Neo4j instance for persistent graph data storage.

---

### Known Issues

* **Data Integrity Bug on Node Edit:** When two different graphs share structurally identical nodes (e.g., imported from the same base file), editing a node in one graph will incorrectly modify the corresponding node in the other. This is because the node update API (`PUT /api/node/<id>`) is not yet graph-aware and identifies nodes solely by their content `id`, which is not guaranteed to be unique across different graphs.

* **Use of Native Browser Dialogs:** The application currently uses `window.prompt()` for naming imported graphs and `window.confirm()` for deletions. These native browser dialogs can be blocked by some browsers or browser extensions, and they offer a poor user experience. This functionality should be migrated to custom, in-page UI modals.