/**
 * Main application entry point.
 * Orchestrates the UI, Graph, and API Handler modules.
 * This version implements the new "Workspace" paradigm.
 */

// --- Module Imports ---
import * as ui from './ui.js';
import * as graph from './graph.js';
import * as api from './api-handler.js';
import { initFileHandler } from './file-handler.js';

// --- Wait for the DOM to be fully loaded ---
document.addEventListener('DOMContentLoaded', () => {

    // --- DOM Element References ---
    const cyContainer = document.getElementById('cy');
    const zoomInBtn = document.getElementById('zoom-in-btn');
    const zoomOutBtn = document.getElementById('zoom-out-btn');
    const resetViewBtn = document.getElementById('reset-view-btn');
    const searchInput = document.getElementById('search-input');
    const exportGraphBtn = document.getElementById('export-graph-btn');

    // --- Application State ---
    let selectedNode = null;
    let currentGraphId = null;
    let availableGraphs = [];

    // --- Core Application Logic ---

    /**
     * Initializes the application by fetching the list of graphs and showing the workspace.
     */
    async function initializeApp() {
        try {
            ui.setWelcomeMessage('Loading Workspace...');
            await refreshWorkspace();
            ui.hideWelcomeScreen();
            ui.showWorkspaceModal();
        } catch (error) {
            console.error("----------- FATAL INITIALIZATION ERROR -----------");
            console.error(error);
            ui.setWelcomeMessage('Fatal Error. Could not connect to the backend. Check console (F12).');
        }
    }

    /**
     * Fetches the list of graphs and repopulates the workspace modal.
     */
    async function refreshWorkspace() {
        availableGraphs = await api.getGraphs();
        ui.populateWorkspace(availableGraphs, handleLoadGraph, handleDeleteGraph);
    }

    /**
     * Handles loading a specific graph into the main view.
     * @param {string} graphId - The ID of the graph to load.
     */
    async function handleLoadGraph(graphId) {
        try {
            ui.hideWorkspaceModal();
            const graphData = await api.getGraphById(graphId);
            graph.render(graphData);
            graph.fit();
            currentGraphId = graphId;
        } catch (error) {
            console.error(`Failed to load graph ${graphId}:`, error);
            alert(`Error: Could not load the selected graph.`);
        }
    }

    /**
     * Handles the deletion of a graph.
     * @param {string} graphId - The ID of the graph to delete.
     */
    async function handleDeleteGraph(graphId) {
        const graphToDelete = availableGraphs.find(g => g.graphId === graphId);
        const confirmation = confirm(`Are you sure you want to delete the graph "${graphToDelete.name}"?\nThis action cannot be undone.`);

        if (!confirmation) return;

        try {
            await api.deleteGraph(graphId);
            // If the deleted graph is the one currently loaded, clear the view.
            if (currentGraphId === graphId) {
                graph.destroy();
                currentGraphId = null;
            }
            // Refresh the list in the workspace to reflect the deletion.
            await refreshWorkspace();
        } catch (error) {
            console.error(`Failed to delete graph ${graphId}:`, error);
            alert(`Error: Could not delete the selected graph.`);
        }
    }
    
    /**
     * Callback for when a file is successfully loaded by the file-handler.
     * @param {object} jsonData The parsed JSON data from the file.
     */
    async function handleFileImport(jsonData) {
        const name = prompt("Please enter a name for the new graph:", "New Graph");
        if (!name) {
            alert("Import cancelled. A name is required.");
            return;
        }
        try {
            await api.createGraph(name, jsonData);
            alert(`Graph "${name}" imported successfully!`);
            await refreshWorkspace(); // Refresh the list to show the new graph
        } catch (error) {
            console.error("Failed to import graph:", error);
            alert("Error: Could not import the graph. Please check the file format and console for details.");
        }
    }

    /**
     * Handles exporting the current graph data as a JSON file.
     */
    function exportGraph() {
        if (!currentGraphId) {
            alert('Please load a graph before exporting.');
            return;
        }
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

        const graphName = availableGraphs.find(g => g.graphId === currentGraphId)?.name || 'braphus_export';
        a.download = `${graphName.replace(/\s+/g, '_')}.json`;
        a.href = URL.createObjectURL(blob);
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(a.href);
    }

    /**
     * Handles saving updated node content using the new graph-aware API.
     */
    async function handleNodeSave(newContent) {
        if (!selectedNode || !currentGraphId) return;
        try {
            // Use the new graph-aware API endpoint
            await api.updateNodeInGraph(currentGraphId, selectedNode.id, { content: newContent });
            graph.updateNodeContent(selectedNode.id, newContent);
            selectedNode.content = newContent; // Update local state
        } catch (error) {
            console.error("Failed to save node:", error);
            alert("Error: Could not save changes to the server.");
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
    initFileHandler(
        ui.importDropZone,
        ui.fileInput,
        ui.selectFileBtn,
        handleFileImport
    );
    
    // --- Start the application ---
    initializeApp();

    // --- Event Listeners for Controls ---
    zoomInBtn.addEventListener('click', graph.zoomIn);
    zoomOutBtn.addEventListener('click', graph.zoomOut);
    resetViewBtn.addEventListener('click', graph.fit);
    exportGraphBtn.addEventListener('click', exportGraph);
    searchInput.addEventListener('input', (e) => graph.search(e.target.value));
});