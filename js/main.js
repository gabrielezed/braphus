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
    }

    // --- Module Initializations ---

    // 1. Initialize the File Handler
    initFileHandler(dropZone, fileInput, selectFileBtn, onFileLoaded);

    // 2. Initialize the UI Module
    // Pass a callback for when the user clicks the 'close' button on the side panel.
    ui.initUI({
        onClosePanel: closePanelAndReset
    });

    // 3. Initialize the Graph Module
    // Pass the container and callbacks for node and canvas taps.
    graph.init({
        container: cyContainer,
        onNodeTap: onNodeTap,
        onCanvasTap: closePanelAndReset
    });


    // --- Event Listeners for Controls ---

    zoomInBtn.addEventListener('click', graph.zoomIn);
    zoomOutBtn.addEventListener('click', graph.zoomOut);
    resetViewBtn.addEventListener('click', graph.fit);

    searchInput.addEventListener('input', (e) => {
        graph.search(e.target.value);
    });

});