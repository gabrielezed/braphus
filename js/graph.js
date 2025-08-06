/**
 * Graph module to encapsulate all Cytoscape.js related logic.
 * It handles the creation, destruction, styling, and event management of the graph.
 *
 * DEBUGGING VERSION: This version assumes libraries are loaded globally via script tags
 * to eliminate module-related conflicts.
 */

// --- Module State ---
let cy; // This will hold the Cytoscape instance.
let config = {}; // This will store the configuration, including callbacks.

/**
 * Initializes the graph module with necessary configuration.
 * @param {object} initialConfig - The configuration object.
 * @param {HTMLElement} initialConfig.container - The DOM element to render the graph in.
 * @param {function} initialConfig.onNodeTap - Callback to run when a node is tapped.
 * @param {function} initialConfig.onCanvasTap - Callback to run when the canvas is tapped.
 */
export function init(initialConfig) {
    config.container = initialConfig.container;
    config.onNodeTap = initialConfig.onNodeTap;
    config.onCanvasTap = initialConfig.onCanvasTap;
}

/**
 * Renders the graph using the provided data.
 * This function creates the main Cytoscape instance.
 * @param {object} graphData - The data for the graph (nodes and edges).
 */
export function render(graphData) {
    destroy();

    // The 'cytoscape', 'cytoscapeDagre', and 'dagre' variables are now
    // available globally from the <script> tags in index.html.
    // We must register the extension before using it.
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
            { selector: 'node', style: { 'background-color': '#667eea', 'border-color': '#5a67d8', 'border-width': 0, 'label': 'data(label)', 'color': '#333', 'font-size': '12px', 'text-valign': 'center', 'text-halign': 'center', 'width': '60px', 'height': '60px', 'text-wrap': 'wrap', 'text-max-width': '80px', 'transition-property': 'background-color, border-width, border-color', 'transition-duration': '0.2s'}},
            { selector: 'edge', style: { 'width': 2, 'line-color': '#a7a7a7', 'target-arrow-color': '#a7a7a7', 'target-arrow-shape': 'triangle', 'curve-style': 'bezier', 'transition-property': 'line-color, opacity', 'transition-duration': '0.2s'}},
            { selector: '.faded', style: { 'opacity': 0.25 }},
            { selector: 'node.selected', style: { 'border-width': 4, 'border-color': '#f56565'}},
            { selector: 'edge.neighbor', style: { 'line-color': '#f56565' }},
            { selector: 'node.search-highlight', style: {'background-color': '#f6e05e', 'border-color': '#d69e2e', 'border-width': 4,'transition-property': 'background-color, border-width, border-color','transition-duration': '0.2s'}}
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
        cy.destroy();
        cy = null;
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