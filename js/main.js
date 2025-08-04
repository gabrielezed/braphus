/**
 * Main application entry point.
 * Orchestrates the UI, Graph, and File Handler modules.
 */

// --- Module Imports ---
import * as ui from './ui.js';
import * as graph from './graph.js';
import { initFileHandler } from './file-handler.js';

// --- Wait for the DOM to be fully loaded ---
document.addEventListener('DOMContentLoaded', () => {

    // --- DOM Element References ---
    const dropZone = document.getElementById('drop-zone');
    const fileInput = document.getElementById('file-input');
    const selectFileBtn = document.getElementById('select-file-btn');
    const cyContainer = document.getElementById('cy');
    const zoomInBtn = document.getElementById('zoom-in-btn');
    const zoomOutBtn = document.getElementById('zoom-out-btn');
    const resetViewBtn = document.getElementById('reset-view-btn');
    const searchInput = document.getElementById('search-input');
    const exportGraphBtn = document.getElementById('export-graph-btn');
    const loadNewGraphBtn = document.getElementById('load-new-graph-btn');

    // --- Application State ---
    let selectedNode = null; // Holds the data of the currently selected node

    // --- Core Application Logic ---

    /**
     * The main callback executed when a valid JSON file is loaded.
     * It hides the welcome screen and renders the new graph.
     * @param {object} jsonData - The parsed graph data from the file.
     */
    function onFileLoaded(jsonData) {
        ui.hideWelcomeScreen();
        graph.render(jsonData); // render will also destroy the previous graph if it exists
        graph.fit();
    }

    /**
     * Callback executed when a node in the graph is tapped.
     * It opens the side panel with the node's data.
     * @param {object} nodeData - The data object of the tapped node.
     */
    function onNodeTap(nodeData) {
        selectedNode = nodeData; // Store the selected node's data
        ui.openSidePanel(nodeData.label, nodeData.content);
        ui.moveSearchContainer(true); // Move search bar out of the way
    }

    /**
     * Callback executed when the graph background is tapped or the panel is closed.
     * It closes the side panel and resets graph highlights.
     */
    function closePanelAndReset() {
        ui.closeSidePanel();
        graph.resetHighlights();
        ui.moveSearchContainer(false); // Move search bar back
        selectedNode = null; // Deselect the node
    }

    /**
     * Handles the logic for exporting the current graph data to a .json file.
     */
    function exportGraph() {
        const graphData = graph.exportGraphData();
        if (!graphData || !graphData.elements || (!graphData.elements.nodes && !graphData.elements.edges)) {
            alert('There is no graph data to export.');
            return;
        }

        const exportObject = {
            nodes: graphData.elements.nodes || [],
            edges: graphData.elements.edges || []
        };

        const jsonString = JSON.stringify(exportObject, null, 2);
        const blob = new Blob([jsonString], { type: 'application/json' });

        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = 'braphus_export.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(a.href);
    }

    /**
     * Resets the application to its initial state to load a new graph.
     */
    function loadNewGraph() {
        closePanelAndReset(); // Close panel and clear selection
        graph.destroy();      // Destroy the Cytoscape instance
        ui.showWelcomeScreen(); // Show the file dropzone
    }

    // --- Module Initializations ---

    // 1. Initialize the File Handler
    initFileHandler(dropZone, fileInput, selectFileBtn, onFileLoaded);

    // 2. Initialize the UI Module
    ui.initUI({
        onClosePanel: closePanelAndReset
    });

    // 3. Initialize the Editor
    ui.initEditor({
        getRawContent: () => {
            return selectedNode ? graph.getNodeContent(selectedNode.id) : '';
        },
        onSave: (newContent) => {
            if (selectedNode) {
                graph.updateNodeContent(selectedNode.id, newContent);
                selectedNode.content = newContent;
            }
        }
    });

    // 4. Initialize the Graph Module
    graph.init({
        container: cyContainer,
        onNodeTap: onNodeTap,
        onCanvasTap: closePanelAndReset
    });

    // --- Event Listeners for Controls ---

    zoomInBtn.addEventListener('click', graph.zoomIn);
    zoomOutBtn.addEventListener('click', graph.zoomOut);
    resetViewBtn.addEventListener('click', graph.fit);
    exportGraphBtn.addEventListener('click', exportGraph);
    loadNewGraphBtn.addEventListener('click', loadNewGraph);

    searchInput.addEventListener('input', (e) => {
        graph.search(e.target.value);
    });

});