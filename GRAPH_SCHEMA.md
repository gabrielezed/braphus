# Braphus Graph JSON Schema

This document defines the standard JSON format for creating and importing knowledge graphs into Braphus.

## Root Object

The root of the JSON file must be an object containing two keys: `nodes` and `edges`.

```json
{
  "nodes": [ ... ],
  "edges": [ ... ]
}
````

## The `nodes` Array

An array of objects, where each object represents a node. Each node object must have a `data` key containing the node's properties.

  * `data.id` (String, Required): A unique identifier for the node. This is used by edges to reference the node.
  * `data.label` (String, Required): The short text that will be displayed *on* the node in the graph visualization.
  * `data.content` (String, Required): The full content for the side panel, written in Markdown. This is displayed when a user clicks on the node.

### Example Node

```json
{
  "data": {
    "id": "gestalt_basics",
    "label": "Gestalt Fundamentals",
    "content": "## Gestalt Therapy\n\nFounded by **Fritz Perls**, Gestalt Therapy focuses on the present experience and awareness."
  }
}
```

## The `edges` Array

An array of objects, where each object represents a directed edge connecting two nodes. Each edge object must have a `data` key.

  * `data.source` (String, Required): The `id` of the source node (where the edge starts).
  * `data.target` (String, Required): The `id` of the target node (where the edge ends).

### Example Edge

```json
{
  "data": {
    "source": "freud_model",
    "target": "gestalt_basics"
  }
}
```
