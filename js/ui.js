/**
 * UI module to handle all DOM manipulations for the user interface,
 * except for the Cytoscape canvas itself.
 */

// --- Module State ---
let isEditing = false;

// --- DOM Element References ---
const welcomeScreen = document.getElementById('welcome-screen');
const contentPanel = document.getElementById('content-panel');
const nodeTitle = document.getElementById('node-title');
const nodeContent = document.getElementById('node-content');
const searchContainer = document.getElementById('search-container');
const closePanelButton = document.getElementById('close-panel');
const editNodeBtn = document.getElementById('edit-node-btn');

// --- NEW Workspace Modal References ---
const workspaceModal = document.getElementById('workspace-modal');
const openWorkspaceBtn = document.getElementById('open-workspace-btn');
const closeWorkspaceBtn = document.getElementById('close-workspace-btn');
const graphList = document.getElementById('graph-list');
export const importDropZone = document.getElementById('import-drop-zone');
export const selectFileBtn = document.getElementById('select-file-btn');
export const fileInput = document.getElementById('file-input');


/**
 * Hides the welcome screen overlay.
 */
export function hideWelcomeScreen() {
    welcomeScreen.style.opacity = '0';
    // Use a timeout to set display to none after the transition completes,
    // making underlying elements interactive.
    setTimeout(() => {
        welcomeScreen.style.display = 'none';
    }, 300); // This duration should match the CSS transition time.
}

/**
 * Updates the text on the welcome screen.
 * @param {string} text The message to display.
 */
export function setWelcomeMessage(text) {
    const p = welcomeScreen.querySelector('p');
    if (p) {
        p.textContent = text;
    }
}

/**
 * Populates the side panel with node data and displays it.
 * @param {string} title - The title for the panel header.
 * @param {string} content - The Markdown content for the panel body.
 */
export function openSidePanel(title, content) {
    nodeTitle.textContent = title;
    // Ensure the edit button is visible when the panel opens
    editNodeBtn.style.display = 'block';
    _setDisplayMode(content); // Set initial view to display mode
    contentPanel.classList.remove('d-none');
}

/**
 * Hides the side panel.
 */
export function closeSidePanel() {
    contentPanel.classList.add('d-none');
    editNodeBtn.style.display = 'none'; // Hide edit button when panel is closed
    isEditing = false; // Reset editing state
}

/**
 * Moves the search container to avoid overlapping with the side panel.
 * @param {boolean} isPanelOpen - True if the panel is open, false otherwise.
 */
export function moveSearchContainer(isPanelOpen) {
    if (isPanelOpen) {
        // Moves the search container to the left. The value should account for the panel's width.
        searchContainer.style.transform = 'translateX(-420px)';
    } else {
        // Moves the search container back to its original position.
        searchContainer.style.transform = 'translateX(0)';
    }
}

/**
 * Shows the workspace modal.
 */
export function showWorkspaceModal() {
    workspaceModal.classList.remove('d-none');
}

/**
 * Hides the workspace modal.
 */
export function hideWorkspaceModal() {
    workspaceModal.classList.add('d-none');
}

/**
 * Populates the workspace graph list with data from the API.
 * @param {Array<object>} graphs - Array of graph objects ({graphId, name}).
 * @param {function} onLoadCallback - Function to call when a 'Load' button is clicked.
 * @param {function} onDeleteCallback - Function to call when a 'Delete' button is clicked.
 */
export function populateWorkspace(graphs, onLoadCallback, onDeleteCallback) {
    graphList.innerHTML = ''; // Clear existing list

    if (!graphs || graphs.length === 0) {
        const li = document.createElement('li');
        li.textContent = 'No graphs found. Import one to get started.';
        li.style.padding = '1rem';
        li.style.justifyContent = 'center';
        graphList.appendChild(li);
        return;
    }

    graphs.forEach(graph => {
        const li = document.createElement('li');

        const nameSpan = document.createElement('span');
        nameSpan.className = 'graph-name';
        nameSpan.textContent = graph.name;

        const actionsDiv = document.createElement('div');
        actionsDiv.className = 'graph-actions';

        const loadBtn = document.createElement('button');
        loadBtn.className = 'btn btn-sm btn-success';
        loadBtn.textContent = 'Load';
        loadBtn.onclick = () => onLoadCallback(graph.graphId);

        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'btn btn-sm btn-danger';
        deleteBtn.textContent = 'Delete';
        deleteBtn.onclick = () => onDeleteCallback(graph.graphId);

        actionsDiv.appendChild(loadBtn);
        actionsDiv.appendChild(deleteBtn);

        li.appendChild(nameSpan);
        li.appendChild(actionsDiv);

        graphList.appendChild(li);
    });
}


/**
 * Initializes the editor functionality and its event listeners.
 * @param {object} callbacks - Callbacks for editor events.
 * @param {function} callbacks.getRawContent - Function to get the raw content of the current node.
 * @param {function} callbacks.onSave - Function to call when the user saves changes.
 */
export function initEditor(callbacks) {
    editNodeBtn.addEventListener('click', () => {
        isEditing = !isEditing; // Toggle editing state

        if (isEditing) {
            // Switch to edit mode, fetching the raw content via callback
            const rawContent = callbacks.getRawContent();
            _setEditMode(rawContent);
        } else {
            // Switch to display mode, saving the new content
            const textarea = nodeContent.querySelector('textarea');
            if (textarea) {
                const newContent = textarea.value;
                callbacks.onSave(newContent);
                _setDisplayMode(newContent);
            }
        }
    });
}


/**
 * Sets the side panel to "edit mode".
 * Replaces the content display with a textarea for editing.
 * @param {string} rawContent - The raw Markdown content to populate the textarea with.
 * @private
 */
function _setEditMode(rawContent) {
    // Change button icon to 'save'
    editNodeBtn.innerHTML = '<i class="bi bi-save"></i>';
    // Clear current content and add a textarea
    nodeContent.innerHTML = '';
    const textarea = document.createElement('textarea');
    textarea.value = rawContent;
    nodeContent.appendChild(textarea);
    textarea.focus(); // Focus the textarea for immediate typing
}

/**
 * Sets the side panel to "display mode".
 * Renders Markdown content and shows the 'edit' icon.
 * @param {string} markdownContent - The Markdown content to render.
 * @private
 */
function _setDisplayMode(markdownContent) {
    // Change button icon back to 'edit'
    editNodeBtn.innerHTML = '<i class="bi bi-pencil-square"></i>';
    // Use marked.js to parse the Markdown content into HTML.
    nodeContent.innerHTML = marked.parse(markdownContent);
    isEditing = false; // Ensure editing state is false
}


/**
 * Initializes event listeners for UI elements.
 * @param {object} callbacks - An object containing callback functions for UI events.
 * @param {function} callbacks.onClosePanel - Function to call when the close panel button is clicked.
 */
export function initUI(callbacks) {
    if (closePanelButton && callbacks.onClosePanel) {
        closePanelButton.addEventListener('click', callbacks.onClosePanel);
    }
    // Wire up workspace modal buttons
    openWorkspaceBtn.addEventListener('click', showWorkspaceModal);
    closeWorkspaceBtn.addEventListener('click', hideWorkspaceModal);
}