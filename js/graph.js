/**
 * Graph module to encapsulate all Cytoscape.js related logic.
 * It handles the creation, destruction, styling, and event management of the graph.
 * This version includes the logic for the graph editor (Edit Mode).
 */

// --- Module State ---
let cy; // This will hold the Cytoscape instance.
let eh; // This will hold the Edgehandles instance.
let config = {}; // This will store the configuration, including callbacks.

// --- Private Functions ---

/**
 * Event handler for the 'Delete' key press.
 * @param {KeyboardEvent} e - The keyboard event.
 */
function handleDeleteKeyPress(e) {
    if (e.key === 'Delete' || e.key === 'Backspace') {
        const selected = cy.$(':selected');
        if (selected.length > 0 && config.onElementsDeleted) {
            config.onElementsDeleted(selected);
        }
    }
}


/**
 * Initializes the graph module with necessary configuration.
 * @param {object} initialConfig - The configuration object.
 * @param {HTMLElement} initialConfig.container - The DOM element to render the graph in.
 * @param {function} initialConfig.onNodeTap - Callback to run when a node is tapped.
 * @param {function} initialConfig.onCanvasTap - Callback to run when the canvas is tapped.
 * @param {function} [initialConfig.onNodeCreated] - Callback for when a new node should be created.
 * @param {function} [initialConfig.onEdgeCreated] - Callback for when a new edge is drawn.
 * @param {function} [initialConfig.onElementsDeleted] - Callback for when elements should be deleted.
 * @param {function} [initialConfig.onNodeLabelEdit] - Callback for when a node's label should be edited.
 */
export function init(initialConfig) {
    // Store all configuration and callbacks
    Object.assign(config, initialConfig);
}

/**
 * Renders the graph using the provided data.
 * This function creates the main Cytoscape instance.
 * @param {object} graphData - The data for the graph (nodes and edges).
 */
export function render(graphData) {
    destroy();

    cytoscape.use(cytoscapeDagre);

    cy = cytoscape({
        container: config.container,
        elements: { nodes: graphData.nodes, edges: graphData.edges },

        layout: {
            name: 'dagre',
            padding: 30,
            spacingFactor: 1.2,
            rankDir: 'TB'
        },

        style: [
            // General element styles
            { selector: 'node', style: { 'background-color': '#667eea', 'border-color': '#5a67d8', 'border-width': 0, 'label': 'data(label)', 'color': '#333', 'font-size': '12px', 'text-valign': 'center', 'text-halign': 'center', 'width': '60px', 'height': '60px', 'text-wrap': 'wrap', 'text-max-width': '80px', 'transition-property': 'background-color, border-width, border-color', 'transition-duration': '0.2s'}},
            { selector: 'edge', style: { 'width': 2, 'line-color': '#a7a7a7', 'target-arrow-color': '#a7a7a7', 'target-arrow-shape': 'triangle', 'curve-style': 'bezier', 'transition-property': 'line-color, opacity', 'transition-duration': '0.2s'}},
            // Class-based styles
            { selector: '.faded', style: { 'opacity': 0.25 }},
            { selector: 'node:selected', style: { 'border-width': 4, 'border-color': '#f56565'}},
            { selector: 'edge:selected', style: { 'line-color': '#f56565', 'target-arrow-color': '#f56565', 'width': 4 }},
            { selector: 'edge.neighbor', style: { 'line-color': '#f56565' }},
            { selector: 'node.search-highlight', style: {'background-color': '#f6e05e', 'border-color': '#d69e2e', 'border-width': 4,'transition-property': 'background-color, border-width, border-color','transition-duration': '0.2s'}},
            // Edgehandles extension styles
            { selector: '.eh-handle', style: { 'background-color': '#f56565', 'width': 12, 'height': 12, 'shape': 'ellipse', 'overlay-opacity': 0, 'border-width': 12, 'border-opacity': 0 }},
            { selector: '.eh-preview, .eh-ghost-edge', style: { 'line-color': '#f56565', 'target-arrow-color': '#f56565', 'line-style': 'dashed' }}
        ]
    });

    cy.on('tap', 'node', function(evt){
        const clickedNode = evt.target;
        if (config.onNodeTap) {
            config.onNodeTap(clickedNode.data());
        }
        highlightNode(clickedNode);
    });

    cy.on('tap', function(event) {
        if (event.target === cy) {
            if (config.onCanvasTap) {
                config.onCanvasTap();
            }
            resetHighlights();
        }
    });
}

/**
 * Enables editing features on the graph.
 */
export function enableEditing() {
    if (!cy) return;

    // 1. Initialize edgehandles
    eh = cy.edgehandles({
        snap: true,
        handleNodes: 'node', // Show handles on all nodes
        loopAllowed: () => false, // Disallow self-loops
        // When an edge is completed, call our callback
        complete: (sourceNode, targetNode, addedEles) => {
            if (config.onEdgeCreated) {
                config.onEdgeCreated(sourceNode.id(), targetNode.id(), addedEles);
            }
        }
    });

    // 2. Add listener for creating nodes on background double-click
    cy.on('dblclick', (event) => {
        // Only trigger if the background is clicked
        if (event.target === cy && config.onNodeCreated) {
            config.onNodeCreated(event.renderedPosition);
        }
    });

    // 3. Add listener for editing a node's label on double-click
    cy.on('dblclick', 'node', (event) => {
        const node = event.target;
        if (config.onNodeLabelEdit) {
            config.onNodeLabelEdit(node);
        }
    });

    // 4. Add key press listener for deleting elements
    window.addEventListener('keyup', handleDeleteKeyPress);

    // Make nodes selectable, but not draggable (dagre layout manages positions)
    cy.nodes().selectable(true);
    cy.nodes().grabbable(false);
}

/**
 * Disables all editing features on the graph.
 */
export function disableEditing() {
    if (!cy) return;

    // 1. Destroy edgehandles instance
    if (eh) {
        eh.destroy();
        eh = null;
    }

    // 2. Remove node creation listener
    cy.off('dblclick');

    // 3. Remove key press listener
    window.removeEventListener('keyup', handleDeleteKeyPress);

    // Unselect any selected elements
    cy.$(':selected').unselect();
}


function highlightNode(node) {
    if (!cy) return;
    const neighbors = node.neighborhood();
    resetHighlights();
    cy.elements().not(node.union(neighbors)).addClass('faded');
    node.addClass('selected');
    neighbors.edges().addClass('neighbor');
}

export function resetHighlights() {
    if (cy) {
        cy.elements().removeClass('selected neighbor faded search-highlight');
    }
}

export function search(query) {
    if (!cy) return;
    const lowerCaseQuery = query.toLowerCase().trim();
    resetHighlights();
    if (lowerCaseQuery === '') return;
    const matchedNodes = cy.nodes().filter(node =>
        node.data('label').toLowerCase().includes(lowerCaseQuery)
    );
    if (matchedNodes.length > 0) {
        matchedNodes.addClass('search-highlight');
        cy.elements().not(matchedNodes).addClass('faded');
    }
}

export function updateNodeContent(nodeId, newContent) {
    if (!cy) return;
    const node = cy.getElementById(nodeId);
    if (node) {
        node.data('content', newContent);
    }
}

export function getNodeContent(nodeId) {
    if (!cy) return null;
    const node = cy.getElementById(nodeId);
    return node ? node.data('content') : null;
}

export function exportGraphData() {
    if (!cy) return null;
    return cy.json();
}

export function destroy() {
    if (cy) {
        disableEditing(); // Ensure listeners are cleaned up
        cy.destroy();
        cy = null;
    }
}

export function addNode(nodeData) {
    if(cy) {
        cy.add({ group: 'nodes', data: nodeData });
    }
}

export function zoomIn() {
    if (cy) {
        cy.zoom({ level: cy.zoom() * 1.2, renderedPosition: { x: cy.width() / 2, y: cy.height() / 2 } });
    }
}

export function zoomOut() {
    if (cy) {
        cy.zoom({ level: cy.zoom() * 0.8, renderedPosition: { x: cy.width() / 2, y: cy.height() / 2 } });
    }
}

export function fit() {
    if (cy) {
        cy.fit();
    }
}