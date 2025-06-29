import { html, render } from "lit-html";

// Application state
const state = {
  rawText: "",
};

// Event handler for the textarea's input event
function onInput(e: Event) {
  const textarea = e.currentTarget as HTMLTextAreaElement;
  state.rawText = textarea.value;
  console.log("New content received. Length:", state.rawText.length);
  // In Milestone 2, we will call a render function here
  // to parse the text and display the table.
}

// Main application template
function appHtml() {
  return html`<section class="section">
    <div class="container">
      <div class="box">
        <h1 class="title">Todo.txt Viewer</h1>
        <p class="subtitle">
          Paste the contents of your <code>todo.txt</code> file below.
        </p>
        <div class="field">
          <div class="control">
            <textarea
              class="textarea is-family-monospace"
              @input=${onInput}
              rows="15"
              placeholder="e.g., (A) Buy milk +groceries @store"
              .value=${state.rawText}
            ></textarea>
          </div>
        </div>
      </div>
    </div>
  </section>`;
}

const appRoot = document.getElementById("app") || document.body;

const renderApp = () => render(appHtml(), appRoot);

// Set up global event handlers to trigger re-renders.
// This leverages event bubbling from components like the textarea.
window.onclick = window.oninput = window.onhashchange = renderApp;

// Initial render of the application.
renderApp();
