# Braphus - A Multi-Graph Knowledge Management Tool

Braphus is a web application for creating, visualizing, and managing multiple knowledge graphs. It uses a client-server architecture powered by Docker, with a Python/Flask backend, a Neo4j graph database, and a vanilla JavaScript frontend.

The application allows users to maintain a personal **Workspace** of distinct knowledge graphs and import new ones from JSON files.

## Current Status: Editor Backend Complete, Frontend In-Progress

This development phase focused on building the Braphus Graph Editor. The backend work is complete, with a full suite of robust, graph-aware API endpoints for creating, updating, and deleting nodes and edges.

The frontend foundation has been laid, including UI elements for an "Edit Mode" and the integration of required libraries. However, the client-side logic that connects user actions (like creating or deleting nodes) to the backend API is **incomplete and non-functional**. The project is at a milestone where the backend is ready, but the frontend requires significant implementation and bug fixing.

---

### Core Features

* **Workspace Management:** Import, load, and delete multiple, distinct graphs.
* **Node Content Editor:** View and edit the Markdown content for each node.
* **Persistent Storage:** All graph data is stored in a local Neo4j database, managed via Docker.
* **Editor Backend:** A complete set of API endpoints for programmatic manipulation of graph structures.

---

### Known Issues & Next Steps

The immediate priority is to complete the frontend implementation of the editor and address known bugs.

* **Non-Functional Editor:** The primary issue is that the editor UI is not yet connected to the backend.
    * **Node/Edge Creation:** Creating nodes (via double-click or button) and edges (via dragging) does not work.
    * **Element Deletion:** Deleting selected elements using the keyboard does not work.
* **Missing Node Property Editing:** The application only supports editing a node's `content`. A crucial missing feature is the ability to edit a node's `label` or other properties directly from the UI.
* **UI State Bug:** When a node's content is displayed in the side panel, and the user loads a different graph, the panel does not close or reset. It continues to show the content from the previous graph, creating a confusing user experience.

The next development phase will involve a dedicated frontend effort to implement the editor logic and fix these outstanding issues.