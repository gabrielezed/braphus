// Wait until the DOM is fully loaded before running the script
document.addEventListener('DOMContentLoaded', function () {

    // --- DOM Element References ---
    // Grabs all necessary elements from the DOM to be used later.
    const contentPanel = document.getElementById('content-panel');
    const nodeTitle = document.getElementById('node-title');
    const nodeContent = document.getElementById('node-content');
    const closePanelButton = document.getElementById('close-panel');
    const zoomInBtn = document.getElementById('zoom-in-btn');
    const zoomOutBtn = document.getElementById('zoom-out-btn');
    const resetViewBtn = document.getElementById('reset-view-btn');
    const searchInput = document.getElementById('search-input');
    const searchContainer = document.getElementById('search-container');

    // This will hold the Cytoscape instance once initialized.
    let cy;

    // --- Data Fetching ---
    // Fetches the graph data from a local JSON file.
    fetch('data/gestalt-therapy.json')
        .then(response => {
            if (!response.ok) {
                // Throws an error if the data file cannot be loaded.
                throw new Error('Network response was not ok ' + response.statusText);
            }
            return response.json();
        })
        .then(graphData => {
            // If data is fetched successfully, initialize the graph.
            initializeGraph(graphData);
        })
        .catch(error => {
            // Logs any fetching errors to the console for debugging.
            console.error('There has been a problem with your fetch operation:', error);
        });

    /**
     * Resets all custom classes from graph elements.
     * This is used to clear highlights and selections.
     */
    function resetStyles() {
        if (cy) {
            cy.elements().removeClass('selected neighbor faded search-highlight');
        }
    }

    /**
     * Initializes the Cytoscape graph, sets up styles, layout, and event listeners.
     * @param {object} data - The graph data (nodes and edges).
     */
    function initializeGraph(data) {
        cy = cytoscape({
            container: document.getElementById('cy'),
            elements: { nodes: data.nodes, edges: data.edges },
            
            // 'dagre' layout is used for hierarchical, top-to-bottom graphs.
            layout: {
                name: 'dagre',
                padding: 30,
                spacingFactor: 1.2,
                rankDir: 'TB'
            },

            // Defines the visual appearance of nodes, edges, and their states.
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
            const neighbors = clickedNode.neighborhood();
            
            resetStyles(); // Clear previous selections.

            // Highlight the selected node and its direct neighbors.
            cy.elements().not(clickedNode.union(neighbors)).addClass('faded');
            clickedNode.addClass('selected');
            neighbors.edges().addClass('neighbor');
            
            // Populate and show the content panel.
            nodeTitle.textContent = clickedNode.data('label');
            nodeContent.innerHTML = marked.parse(clickedNode.data('content'));
            contentPanel.classList.remove('d-none');

            // Slide the search bar out of the way.
            searchContainer.style.transform = 'translateX(-420px)';
        });

        // --- Event Listener: Close Panel Button ---
        closePanelButton.addEventListener('click', function() {
            contentPanel.classList.add('d-none');
            resetStyles();
            // Slide the search bar back to its original position.
            searchContainer.style.transform = 'translateX(0)';
        });

        // --- Event Listener: Tap on Graph Background ---
        cy.on('tap', function(event) {
            if (event.target === cy) {
                contentPanel.classList.add('d-none');
                resetStyles();
                // Slide the search bar back.
                searchContainer.style.transform = 'translateX(0)';
            }
        });

        // --- Event Listeners: View Controls (Zoom/Pan) ---
        zoomInBtn.addEventListener('click', function() {
            cy.zoom({ level: cy.zoom() * 1.2, renderedPosition: { x: cy.width() / 2, y: cy.height() / 2 } });
        });

        zoomOutBtn.addEventListener('click', function() {
            cy.zoom({ level: cy.zoom() * 0.8, renderedPosition: { x: cy.width() / 2, y: cy.height() / 2 } });
        });

        resetViewBtn.addEventListener('click', function() {
            cy.fit(); // Fit the entire graph into the view.
        });

        // --- Event Listener: Search Input ---
        searchInput.addEventListener('input', function(e) {
            const query = e.target.value.toLowerCase().trim();

            // Clear any previous search highlights.
            cy.elements().removeClass('search-highlight faded');

            if (query === '') {
                return; // If query is empty, show all nodes.
            }
            
            const matchedNodes = cy.nodes().filter(node => node.data('label').toLowerCase().includes(query));
            
            // Highlight matched nodes and fade out the rest.
            if (matchedNodes.length > 0) {
                matchedNodes.addClass('search-highlight');
                cy.elements().not(matchedNodes).addClass('faded');
            }
        });
    }
});