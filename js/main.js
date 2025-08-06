/**
 * Main application entry point.
 * Orchestrates the UI, Graph, and API Handler modules.
 *
 * DEBUGGING VERSION: This version has enhanced error logging to find the root cause of initialization failures.
 */

// --- Module Imports ---
import * as ui from './ui.js';
import * as graph from './graph.js';
import * as api from './api-handler.js';

// --- Wait for the DOM to be fully loaded ---
document.addEventListener('DOMContentLoaded', () => {

    // --- DOM Element References ---
    const cyContainer = document.getElementById('cy');
    const zoomInBtn = document.getElementById('zoom-in-btn');
    const zoomOutBtn = document.getElementById('zoom-out-btn');
    const resetViewBtn = document.getElementById('reset-view-btn');
    const searchInput = document.getElementById('search-input');
    const exportGraphBtn = document.getElementById('export-graph-btn');
    const loadNewGraphBtn = document.getElementById('load-new-graph-btn');
    const welcomeScreen = document.getElementById('welcome-screen');
    const welcomeMessage = welcomeScreen.querySelector('p');

    // --- Application State ---
    let selectedNode = null;

    // --- Core Application Logic ---

    /**
     * Initializes the application by fetching graph data from the backend.
     */
    async function initializeApp() {
        // CRITICAL: Wrap the entire initialization in a try/catch block
        // to expose the real error to the browser console.
        try {
            let graphData = await api.getGraph();

            if (!graphData.nodes || graphData.nodes.length === 0) {
                welcomeMessage.textContent = 'Database is empty. Seeding...';
                await api.seedDatabase();
                graphData = await api.getGraph();
            }

            welcomeMessage.textContent = 'Rendering graph...';
            graph.render(graphData);
            graph.fit();
            ui.hideWelcomeScreen();

        } catch (error) {
            // THIS IS THE MOST IMPORTANT PART: Log the actual error object.
            console.error("----------- FATAL INITIALIZATION ERROR -----------");
            console.error("The application failed to start. This is the real error:");
            console.error(error);
            console.error("----------------------------------------------------");
            welcomeMessage.textContent = 'Fatal Error. Check the developer console (F12) for details.';
            ui.showWelcomeScreen();
        }
    }

    /**
     * Callback executed when a node in the graph is tapped.
     */
    function onNodeTap(nodeData) {
        selectedNode = nodeData;
        ui.openSidePanel(nodeData.label, nodeData.content);
        ui.moveSearchContainer(true);
    }

    /**
     * Callback executed when the graph background is tapped or the panel is closed.
     */
    function closePanelAndReset() {
        ui.closeSidePanel();
        graph.resetHighlights();
        ui.moveSearchContainer(false);
        selectedNode = null;
    }

    /**
     * Handles exporting the current graph data.
     */
    function exportGraph() {
        const graphData = graph.exportGraphData();
        if (!graphData || !graphData.elements || (!graphData.elements.nodes && !graphData.elements.edges)) {
            alert('There is no graph data to export.');
            return;
        }
        const exportObject = {
            nodes: graphData.elements.nodes.map(n => n),
            edges: graphData.elements.edges.map(e => e)
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
     * Resets the application by reloading the page.
     */
    function loadNewGraph() {
        window.location.reload();
    }

    /**
     * Handles saving updated node content.
     */
    async function handleNodeSave(newContent) {
        if (!selectedNode) return;
        try {
            await api.updateNode(selectedNode.id, newContent);
            graph.updateNodeContent(selectedNode.id, newContent);
            selectedNode.content = newContent;
        } catch (error) {
            console.error("Failed to save node:", error);
            alert("Error: Could not save changes to the server.");
        }
    }

    // --- Module Initializations ---
    ui.initUI({ onClosePanel: closePanelAndReset });
    ui.initEditor({
        getRawContent: () => selectedNode ? graph.getNodeContent(selectedNode.id) : '',
        onSave: handleNodeSave
    });
    graph.init({
        container: cyContainer,
        onNodeTap: onNodeTap,
        onCanvasTap: closePanelAndReset
    });
    
    // --- Start the application ---
    initializeApp();

    // --- Event Listeners for Controls ---
    zoomInBtn.addEventListener('click', graph.zoomIn);
    zoomOutBtn.addEventListener('click', graph.zoomOut);
    resetViewBtn.addEventListener('click', graph.fit);
    exportGraphBtn.addEventListener('click', exportGraph);
    loadNewGraphBtn.addEventListener('click', loadNewGraph);
    searchInput.addEventListener('input', (e) => graph.search(e.target.value));
});