# Braphus

Braphus is a minimalist web application for visualizing and navigating learning roadmaps as interactive knowledge graphs. Inspired by the need for non-linear learning, it allows users to explore complex topics by starting at any point and following the connections between ideas.

---

## Features

* **Graph Visualization:** Renders nodes (topics) and edges (connections) in a hierarchical layout.
* **Interactive Navigation:** Click a node to view its content and relationships.
* **Rich Text Content:** Nodes support content written in **Markdown**.
* **Search Bar:** Quickly find nodes in the graph by typing their name.
* **View Controls:** Zoom In, Zoom Out, and Reset view functions for easy navigation.
* **Responsive Design:** The interface adapts for good usability on various screen sizes.

---

## How to Run It

Since the application uses the `fetch` API to load local files (`.json`), it cannot be run by simply opening `index.html` in your browser due to security policies (CORS).

You must serve it using a **local web server**. The easiest way is to use the **Live Server** extension for Visual Studio Code, or you can run a Python server:

1. Open a terminal in the `braphus/` root folder.
2. Run the command (requires Python 3):
    ```bash
    python -m http.server
    ```
3. Open your browser and go to `http://localhost:8000`.

---

## Project Structure

````

/braphus
|-- index.html              \# Main page structure
|-- /css
|   |-- style.css           \# Custom stylesheets
|-- /js
|   |-- main.js             \# Application logic (Cytoscape, events, etc.)
|-- /data
|   |-- gestalt-therapy.json \# Example data file for the graph
|-- README.md               \# This file

````

---

## Graph Data

To create your own graph, edit or create a new `.json` file in the `/data` folder following this format:

* **`nodes`**: An array of objects, where each object represents a node.
    * `data.id`: A unique identifier (string).
    * `data.label`: The label that will appear on the node.
    * `data.content`: The Markdown-formatted text that will appear in the sidebar.
* **`edges`**: An array of objects that defines the connections.
    * `data.source`: The `id` of the starting node.
    * `data.target`: The `id` of the destination node.

---

## Technologies Used

* **Vanilla JavaScript (ES6+)**
* **HTML5** & **CSS3**
* **[Cytoscape.js](https://js.cytoscape.org/)**: For rendering and interacting with the graph.
* **[Dagre.js](https://github.com/dagrejs/dagre)**: For the hierarchical graph layout.
* **[Marked.js](https://marked.js.org/)**: For interpreting Markdown.
* **[Bootstrap 5](https://getbootstrap.com/)**: For some basic UI components and icons.
