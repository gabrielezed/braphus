/**
 * Handles file loading, parsing, and validation.
 * @param {HTMLElement} dropZone - The area where files can be dropped.
 * @param {HTMLInputElement} fileInput - The hidden file input element.
 * @param {HTMLElement} fileSelectBtn - The button that triggers the file input.
 * @param {function} onFileLoaded - Callback function to execute when a valid JSON file is loaded. It receives the parsed JSON data as an argument.
 */
export function initFileHandler(dropZone, fileInput, fileSelectBtn, onFileLoaded) {

    // --- Event Listener: Trigger file input when the select button is clicked ---
    fileSelectBtn.addEventListener('click', () => {
        fileInput.click();
    });

    // --- Event Listener: Handle file selection from the input dialog ---
    fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            handleFile(file);
        }
    });

    // --- Drag and Drop Event Listeners ---

    // Prevent default browser behavior for drag events
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, preventDefaults, false);
    });

    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    // Add a visual indicator when a file is dragged over the drop zone
    ['dragenter', 'dragover'].forEach(eventName => {
        dropZone.addEventListener(eventName, () => dropZone.classList.add('dragover'), false);
    });

    // Remove the visual indicator when the file leaves the drop zone
    ['dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, () => dropZone.classList.remove('dragover'), false);
    });

    // Handle the actual file drop
    dropZone.addEventListener('drop', (e) => {
        const dt = e.dataTransfer;
        const file = dt.files[0];
        if (file) {
            handleFile(file);
        }
    }, false);


    /**
     * Processes the selected or dropped file.
     * Reads the file, parses it as JSON, and invokes the callback.
     * @param {File} file - The file to process.
     */
    function handleFile(file) {
        // Check if the file is a JSON file
        if (!file.type.match('application/json')) {
            alert('Invalid file type. Please select a .json file.');
            return;
        }

        const reader = new FileReader();

        // Define what happens once the file is read
        reader.onload = function(e) {
            try {
                const jsonData = JSON.parse(e.target.result);
                // If parsing is successful, call the main callback
                onFileLoaded(jsonData);
            } catch (error) {
                // Handle JSON parsing errors
                console.error('Error parsing JSON:', error);
                alert('The selected file is not a valid JSON file.');
            }
        };

        // Define what happens in case of a read error
        reader.onerror = function() {
            console.error('There was an error reading the file.');
            alert('Could not read the selected file.');
        };

        // Read the file as text
        reader.readAsText(file);
    }
}