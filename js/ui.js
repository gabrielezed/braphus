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
 * Shows the welcome screen overlay.
 * (Currently not used after initial load, but good for future features like "load another graph").
 */
export function showWelcomeScreen() {
    welcomeScreen.style.display = 'flex';
    setTimeout(() => {
        welcomeScreen.style.opacity = '1';
    }, 10); // A small delay ensures the transition is applied correctly.
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
}