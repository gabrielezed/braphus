/**
 * A module to handle all API communications with the backend server.
 * This version is updated to work with the multi-graph workspace API.
 */

const API_BASE_URL = 'http://localhost:5000/api';

/**
 * Fetches the list of all available graphs.
 * @returns {Promise<Array<object>>} A promise that resolves to an array of graph objects, e.g., [{graphId, name}, ...].
 */
export async function getGraphs() {
    const url = `${API_BASE_URL}/graphs`;
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Failed to fetch graph list. Status: ${response.status}`);
        }
        return response.json();
    } catch (networkError) {
        console.error(`[API] A network error occurred while trying to fetch ${url}.`, networkError);
        throw new Error(`Network error or server is unreachable. Check backend logs. Error: ${networkError.message}`);
    }
}

/**
 * Fetches the complete data for a single graph by its ID.
 * @param {string} graphId The ID of the graph to fetch.
 * @returns {Promise<object>} A promise that resolves to the Cytoscape-compatible graph JSON data.
 */
export async function getGraphById(graphId) {
    const url = `${API_BASE_URL}/graphs/${graphId}`;
    try {
        const response = await fetch(url);
        if (!response.ok) {
            const errorText = await response.text();
            console.error(`[API] Response was not OK. Raw error response body:`, errorText);
            throw new Error(`Failed to fetch graph data for ID ${graphId}. Status: ${response.status}.`);
        }
        return response.json();
    } catch (networkError) {
        console.error(`[API] A network error occurred while trying to fetch ${url}.`, networkError);
        throw new Error(`Network error or server is unreachable. Check backend logs. Error: ${networkError.message}`);
    }
}

/**
 * Creates a new graph in the database from a file payload.
 * @param {string} name The user-defined name for the new graph.
 * @param {object} data The graph data object, containing 'nodes' and 'edges' arrays.
 * @returns {Promise<object>} A promise that resolves to the server's response message.
 */
export async function createGraph(name, data) {
    const url = `${API_BASE_URL}/graphs`;
    const payload = {
        name: name,
        data: data,
    };
    const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
    });
    if (!response.ok) {
        throw new Error(`Failed to create graph. Status: ${response.status}`);
    }
    return response.json();
}

/**
 * Deletes a graph from the database.
 * @param {string} graphId The ID of the graph to delete.
 * @returns {Promise<object>} A promise that resolves to the server's confirmation message.
 */
export async function deleteGraph(graphId) {
    const url = `${API_BASE_URL}/graphs/${graphId}`;
    const response = await fetch(url, {
        method: 'DELETE',
    });
    if (!response.ok) {
        throw new Error(`Failed to delete graph. Status: ${response.status}`);
    }
    return response.json();
}

/**
 * Sends updated properties for a specific node to the backend, within a given graph.
 * @param {string} graphId The ID of the graph containing the node.
 * @param {string} nodeId The ID of the node to update.
 * @param {object} data An object containing the properties to update (e.g., { content: "new content" }).
 * @returns {Promise<object>} A promise that resolves to the updated node data.
 */
export async function updateNodeInGraph(graphId, nodeId, data) {
    const url = `${API_BASE_URL}/graphs/${graphId}/nodes/${nodeId}`;
    const response = await fetch(url, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });
    if (!response.ok) {
        throw new Error(`Failed to update node. Status: ${response.status}`);
    }
    return response.json();
}