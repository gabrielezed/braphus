# Braphus - [DEVELOPMENT IN PROGRESS]

**⚠️ This software is currently undergoing a major architectural refactor and is not in a usable state. ⚠️**

Braphus is a web application for visualizing and navigating interactive knowledge graphs. The project is being refactored from a simple client-side application into a more robust client-server architecture using Docker, Flask, and Neo4j.

**Current Status:** Non-functional. The client-side application is unable to connect to and render data from the new backend service. This is a known issue and is the primary focus of development.

---

## Target Architecture

The goal is a multi-container application orchestrated by `docker-compose`.

* **Frontend:** A vanilla JavaScript client that handles user interaction and graph visualization.
* **Backend:** A Python/Flask API that serves the frontend and communicates with the database.
* **Database:** A Neo4j instance for persistent graph data storage.

---

## Known Issues

* **Critical Connection Failure:** The frontend fails to load graph data from the backend, preventing the application from initializing. This is the main blocker.
* **Functionality Disabled:** All original features, including drag-and-drop file loading, are currently disabled to isolate the core bug.

This `README.md` will be updated once the application is stable and functional.