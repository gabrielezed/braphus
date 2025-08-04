# Braphus

Braphus è un'applicazione web minimalista per visualizzare e navigare roadmap di apprendimento sotto forma di grafi di conoscenza interattivi. Ispirato alla necessità di un apprendimento non lineare, permette agli utenti di esplorare argomenti complessi partendo da qualsiasi punto e seguendo le connessioni tra le idee.

---

## Funzionalità

* **Visualizzazione a Grafo:** Renderizza nodi (argomenti) e archi (connessioni) in un layout gerarchico.
* **Navigazione Interattiva:** Clicca su un nodo per visualizzarne il contenuto e le relazioni.
* **Contenuto Rich Text:** I nodi supportano contenuti scritti in **Markdown**.
* **Barra di Ricerca:** Trova rapidamente i nodi nel grafo digitandone il nome.
* **Controlli di Vista:** Funzioni di Zoom In, Zoom Out e Reset della vista per una facile navigazione.
* **Design Responsivo:** L'interfaccia si adatta per una buona usabilità su diversi schermi.

---

## Come Eseguirlo

Poiché l'applicazione utilizza l'API `fetch` per caricare file locali (`.json`), non può essere eseguita semplicemente aprendo `index.html` nel browser a causa delle policy di sicurezza (CORS).

È necessario servirla tramite un **server web locale**. Il modo più semplice è usare l'estensione **Live Server** di Visual Studio Code, oppure eseguire un server Python:

1.  Apri un terminale nella cartella radice `braphus/`.
2.  Esegui il comando (richiede Python 3):
    ```bash
    python -m http.server
    ```
3.  Apri il tuo browser e vai all'indirizzo `http://localhost:8000`.

---

## Struttura del Progetto


/braphus
|-- index.html              \# Struttura principale della pagina
|-- /css
|   |-- style.css           \# Fogli di stile personalizzati
|-- /js
|   |-- main.js             \# Logica dell'applicazione (Cytoscape, eventi, etc.)
|-- /data
|   |-- gestalt-therapy.json \# File di dati di esempio per il grafo
|-- README.md               \# Questo file

```

---

## Dati del Grafo

Per creare il tuo grafo, modifica o crea un nuovo file `.json` nella cartella `/data` seguendo questo formato:

* **`nodes`**: Un array di oggetti, dove ogni oggetto rappresenta un nodo.
    * `data.id`: Un identificatore univoco (stringa).
    * `data.label`: L'etichetta che apparirà sul nodo.
    * `data.content`: Il testo in formato Markdown che apparirà nel pannello laterale.
* **`edges`**: Un array di oggetti che definisce le connessioni.
    * `data.source`: L'`id` del nodo di partenza.
    * `data.target`: L'`id` del nodo di arrivo.

---

## Tecnologie Utilizzate

* **Vanilla JavaScript (ES6+)**
* **HTML5** & **CSS3**
* **[Cytoscape.js](https://js.cytoscape.org/)**: Per la renderizzazione e l'interazione con il grafo.
* **[Dagre.js](https://github.com/dagrejs/dagre)**: Per il layout gerarchico del grafo.
* **[Marked.js](https://marked.js.org/)**: Per l'interpretazione del Markdown.
* **[Bootstrap 5](https://getbootstrap.com/)**: Per alcuni componenti base dell'UI e per le icone.
