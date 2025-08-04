# Braphus

Braphus is a minimalist web application for visualizing and navigating interactive knowledge graphs. It allows users to dynamically load their own graph data from a `.json` file, explore complex topics through an intuitive, node-based interface, edit the content in real-time, and export their changes.

The core principle is to support non-linear exploration and dynamic content creation, allowing users to understand and shape the relationships between concepts at their own pace.

-----

## Features

  * **Dynamic File Loading:** Load your own `.json` graph files using a simple **drag-and-drop** interface or a file selector.
  * **Interactive Graph Visualization:** Renders nodes (topics) and edges (connections) in a clean, hierarchical layout.
  * **Rich Content Display:** Nodes support content written in **Markdown**, which is rendered in a side panel upon clicking a node.
  * **In-App Node Editing:** Click the "edit" button on any node's content panel to modify its Markdown content directly within the application.
  * **Graph Exporting:** Save your modified graph, including all content changes, as a new `.json` file using the "export" button.
  * **Quick Search:** Instantly find nodes within the graph by typing in the search bar.
  * **View Controls:** Easily navigate the graph with Zoom In, Zoom Out, Reset View, and Load New Graph functions.
  * **Modular & Scalable:** Built with a modern, modular JavaScript architecture for easy maintenance and extension.

-----

## How to Use

Because the application uses modern JavaScript features (ES Modules) to load local files, it must be run through a **local web server** due to browser security policies (CORS).

The easiest way is to use the **Live Server** extension in Visual Studio Code. Alternatively, you can use Python's built-in server:

1.  Open a terminal in the `braphus/` root folder.
2.  Run the command (Python 3 is required):
    ```bash
    python -m http.server
    ```
3.  Open your browser and navigate to `http://localhost:8000`.

Once the application is running, you will be greeted with a welcome screen. Simply **drag and drop your `.json` file** onto the page or use the button to select it from your computer. Once a graph is loaded, you can use the control buttons at the bottom-left to navigate, export your work, or return to the welcome screen to load a different graph.

-----

## Project Structure

The project has been refactored for maintainability and separation of concerns.

```
/braphus
|-- index.html              # Main HTML structure
|-- /css
|   |-- style.css           # Custom stylesheets
|-- /js
|   |-- main.js             # Orchestrator/Entry point
|   |-- ui.js               # UI module (panels, welcome screen)
|   |-- graph.js            # Cytoscape and graph logic module
|   |-- file-handler.js     # File loading and parsing module
|-- /data
|   |-- gestalt-therapy.json # Example graph data file
|-- README.md               # This file
```

-----

## Graph Data Format

To create your own graph, structure a `.json` file as follows. You can use `/data/gestalt-therapy.json` as a template.

  * **`nodes`**: An array of objects, where each object represents a node.
      * `data.id`: A unique identifier (string).
      * `data.label`: The label that will appear on the node.
      * `data.content`: The Markdown-formatted text that will appear in the side panel.
  * **`edges`**: An array of objects defining the connections.
      * `data.source`: The `id` of the starting node.
      * `data.target`: The `id` of the destination node.

-----

## Technologies Used

  * **Vanilla JavaScript (ES6 Modules)**
  * **HTML5** & **CSS3**
  * **[Cytoscape.js](https://js.cytoscape.org/)**: For graph rendering and interaction.
  * **[Dagre.js](https://github.com/dagrejs/dagre)**: For the hierarchical graph layout.
  * **[Marked.js](https://marked.js.org/)**: For parsing Markdown content.
  * **[Bootstrap 5](https://getbootstrap.com/)**: For base UI components and icons.