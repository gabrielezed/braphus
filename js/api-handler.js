/**
 * A module to handle all API communications with the local backend server.
 * THIS IS A DEBUGGING VERSION WITH HEAVY LOGGING.
 */

const API_BASE_URL = 'http://localhost:5000/api';

/**
 * Fetches the complete graph data from the backend.
 * @returns {Promise<object>} A promise that resolves to the Cytoscape-compatible graph JSON data.
 * @throws {Error} If the network response is not ok or a network error occurs.
 */
export async function getGraph() {
    const url = `${API_BASE_URL}/graph`;
    console.log(`[DEBUG] Initiating GET request to: ${url}`);

    try {
        const response = await fetch(url);

        console.log(`[DEBUG] Received response from: ${url}`);
        console.log(`[DEBUG] Status: ${response.status} - ${response.statusText}`);
        console.log('[DEBUG] Response Headers:', Object.fromEntries(response.headers.entries()));

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`[DEBUG] Response was not OK. Raw error response body:`, errorText);
            throw new Error(`Failed to fetch graph data. Status: ${response.status}. Body: ${errorText}`);
        }

        const responseText = await response.text();
        console.log('[DEBUG] Raw successful response body:', responseText);

        try {
            const jsonData = JSON.parse(responseText);
            console.log('[DEBUG] Successfully parsed JSON data.');
            return jsonData;
        } catch (jsonError) {
            console.error('[DEBUG] Failed to parse response text as JSON.', jsonError);
            throw new Error('Failed to parse JSON response from server.');
        }

    } catch (networkError) {
        console.error(`[DEBUG] A network error occurred while trying to fetch ${url}.`, networkError);
        throw new Error(`Network error or server is unreachable. Check backend logs. Error: ${networkError.message}`);
    }
}


/**
 * Sends updated content for a specific node to the backend.
 * @param {string} nodeId - The ID of the node to update.
 * @param {string} newContent - The new Markdown content for the node.
 * @returns {Promise<object>} A promise that resolves to the updated node data.
 * @throws {Error} If the network response is not ok.
 */
export async function updateNode(nodeId, newContent) {
    const response = await fetch(`${API_BASE_URL}/node/${nodeId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: newContent }),
    });
    if (!response.ok) {
        throw new Error(`Failed to update node. Status: ${response.status}`);
    }
    return response.json();
}

/**
 * Sends a request to the backend to seed the database with initial data.
 * This is typically used for the first-time setup.
 * @returns {Promise<object>} A promise that resolves to the server's response message.
 * @throws {Error} If the network response is not ok.
 */
export async function seedDatabase() {
    const response = await fetch(`${API_BASE_URL}/seed`, {
        method: 'POST',
    });
    if (!response.ok) {
        throw new Error(`Failed to seed database. Status: ${response.status}`);
    }
    return response.json();
}