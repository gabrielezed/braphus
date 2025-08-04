/**
 * Graph module to encapsulate all Cytoscape.js related logic.
 * It handles the creation, destruction, styling, and event management of the graph.
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
    // Destroy any existing instance before creating a new one.
    destroy();

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

    // --- Event Listener: Tap on a Node ---
    cy.on('tap', 'node', function(evt){
        const clickedNode = evt.target;
        // Invoke the callback passed during initialization.
        if (config.onNodeTap) {
            config.onNodeTap(clickedNode.data());
        }
        highlightNode(clickedNode);
    });

    // --- Event Listener: Tap on Graph Background ---
    cy.on('tap', function(event) {
        if (event.target === cy) {
            // Invoke the callback for canvas tap.
            if (config.onCanvasTap) {
                config.onCanvasTap();
            }
            resetHighlights();
        }
    });
}

/**
 * Highlights a node and its neighbors, fading out the rest.
 * @param {cytoscape.NodeObject} node - The node to highlight.
 */
function highlightNode(node) {
    if (!cy) return;
    const neighbors = node.neighborhood();
    resetHighlights(); // Clear previous selections.

    cy.elements().not(node.union(neighbors)).addClass('faded');
    node.addClass('selected');
    neighbors.edges().addClass('neighbor');
}

/**
 * Resets all custom classes from graph elements, clearing highlights and selections.
 */
export function resetHighlights() {
    if (cy) {
        cy.elements().removeClass('selected neighbor faded search-highlight');
    }
}

/**
 * Applies search highlighting to nodes matching the query.
 * @param {string} query - The search term.
 */
export function search(query) {
    if (!cy) return;

    const lowerCaseQuery = query.toLowerCase().trim();

    resetHighlights();

    if (lowerCaseQuery === '') {
        return;
    }

    const matchedNodes = cy.nodes().filter(node =>
        node.data('label').toLowerCase().includes(lowerCaseQuery)
    );

    if (matchedNodes.length > 0) {
        matchedNodes.addClass('search-highlight');
        cy.elements().not(matchedNodes).addClass('faded');
    }
}


/**
 * Destroys the current Cytoscape instance if it exists.
 */
export function destroy() {
    if (cy) {
        cy.destroy();
        cy = null;
    }
}

// --- View Control Functions ---

/**
 * Zooms in on the graph.
 */
export function zoomIn() {
    if (cy) {
        cy.zoom({ level: cy.zoom() * 1.2, renderedPosition: { x: cy.width() / 2, y: cy.height() / 2 } });
    }
}

/**
 * Zooms out of the graph.
 */
export function zoomOut() {
    if (cy) {
        cy.zoom({ level: cy.zoom() * 0.8, renderedPosition: { x: cy.width() / 2, y: cy.height() / 2 } });
    }
}

/**
 * Fits the entire graph into the current view.
 */
export function fit() {
    if (cy) {
        cy.fit();
    }
}