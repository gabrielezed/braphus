# Braphus - A Multi-Graph Knowledge Management Tool

Braphus is a web application for creating, visualizing, and managing multiple knowledge graphs. It uses a client-server architecture powered by Docker, with a Python/Flask backend, a Neo4j graph database, and a vanilla JavaScript frontend.

The application allows users to maintain a personal **Workspace** of distinct knowledge graphs and import new ones from JSON files.

## Current Status: Editor Mostly Functional

This development phase focused on building the Braphus Graph Editor. The backend work is complete, with a full suite of robust, graph-aware API endpoints. The frontend is now largely functional, allowing for the management of nodes.

The client-side logic that connects user actions (like creating, deleting, and editing nodes) to the backend API is now **implemented**. The project is at a milestone where the core editor is usable, but one key feature remains incomplete.

---

### Core Features

* **Workspace Management:** Import, load, and delete multiple, distinct graphs.
* **Graph Editor:**
    * Create, delete, and edit the labels of nodes directly on the graph.
    * View and edit the Markdown content for each node in a side panel.
* **Persistent Storage:** All graph data is stored in a local Neo4j database, managed via Docker.
* **Editor Backend:** A complete set of API endpoints for programmatic manipulation of graph structures.

---

### Known Issues & Next Steps

The immediate priority is to complete the final piece of the editor's functionality.

* **Non-Functional Edge Creation:** While the backend API exists, creating edges by dragging between nodes in the UI does not yet work. This is the last major feature to be implemented for the editor.
* **Missing Node Property Editing:** The application supports editing a node's `label` and `content`, but does not yet support editing other arbitrary node properties from the UI.

The next development phase will focus on implementing the edge creation logic to complete the editor.