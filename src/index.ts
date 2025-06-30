import { html, render } from "lit-html";

enum Direction {
  ASC,
  DESC,
}

// Event handler for the textarea's input event
function onInput(e: Event) {
  const textarea = e.currentTarget as HTMLTextAreaElement;
  state.rawText = textarea.value;
  console.log("New content received. Length:", state.rawText.length);
  // In Milestone 2, we will call a render function here
  // to parse the text and display the table.
}
/** Represents a single parsed todo.txt task. */
interface Task {
  raw: string;
  isComplete: boolean;
  priority?: string;
  completionDate?: string;
  creationDate?: string;
  description: string;
  // Advanced properties can be added later
  // projects: string[];
  // contexts: string[];
  // dueDate: string | null;
}

const columns: {
  name: string;
  accessor: (task: Task) => any;
}[] = [
  { name: "Priority", accessor: task => task.priority },
  { name: "Completion Date", accessor: task => task.completionDate },
  { name: "Creation Date", accessor: task => task.creationDate },
  { name: "Description", accessor: task => descriptionHtml(task) },
];

interface Order {
  column?: number;
  direction: Direction;
  permutation(tasks: Task[]): number[];
  reorder(tasks: Task[], colum: number, direction: Direction): Order;
}

function makeCachingOrder(): Order {
  let cache: number[] | null = null;
  const permutation = tasks => {
    if (!cache || cache.length !== tasks.length) {
      cache = Array.from({ length: tasks.length }, (_, i) => i);
    }
    return cache;
  };
  const reorder = (tasks: Task[], column: number, direction: Direction) => {
    if (column < 0 || column >= columns.length) return makeCachingOrder();
    cache = Array.from({ length: tasks.length }, (_, i) => i);
    const accessor =
      column === 3 ? a => a.description : columns[column].accessor;
    const ascCompareFn = (a, b) =>
      (accessor(tasks[a]) || "").localeCompare(accessor(tasks[b]) || "");
    const compareFn =
      direction === Direction.DESC
        ? (a, b) => ascCompareFn(b, a)
        : ascCompareFn;
    console.log("now ordered " + direction);
    cache.sort(compareFn);
    return { column, direction, permutation, reorder };
  };
  return {
    direction: Direction.ASC,
    permutation,
    reorder,
  };
}

// Application state
const state = {
  rawText: "",
  toHighlight: "",
  order: makeCachingOrder(),
};

function descriptionHtml(task: Task) {
  const { description } = task;
  const tagRegex = /([+@][a-zA-Z0-9]+|[a-zA-Z0-9]+:[a-zA-Z0-9]+)/g;
  const parts: any[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = tagRegex.exec(description)) !== null) {
    // Add the text before the match
    if (match.index > lastIndex) {
      parts.push(description.slice(lastIndex, match.index));
    }

    // Add the matched tag inside a span, with highlighting if it matches
    const tagText = match[0];
    parts.push(
      html`<a
        @mouseover=${() => {
          state.toHighlight = tagText;
          renderApp();
        }}
        @mouseout=${() => {
          state.toHighlight = "";
          renderApp();
        }}
        style="cursor: pointer; ${state.toHighlight === tagText
          ? "background-color: #FFFF00;"
          : ""}"
        >${tagText}</a
      >`
    );

    lastIndex = tagRegex.lastIndex;
  }

  // Add any remaining text after the last match
  if (lastIndex < description.length) {
    parts.push(description.slice(lastIndex));
  }

  return parts;
}

function parseLine(line: string): Task {
  const raw = line;
  const done_match = /^(x?)/.exec(line);
  line = line.slice(done_match![0].length);
  const priority_match = /^ *(?:\(([A-Z])\))?/.exec(line);
  line = line.slice(priority_match![0].length);
  const completion_date_match = /^ *(\d{4}-\d{2}-\d{2})?/.exec(line);
  line = line.slice(completion_date_match![0].length);
  const creation_date_match = /^ *(\d{4}-\d{2}-\d{2})?/.exec(line);
  line = line.slice(creation_date_match![0].length);
  const description_match = /^ *(.*)/.exec(line);
  return {
    raw,
    isComplete: done_match![1] === "x",
    priority: priority_match![1] || undefined,
    completionDate: completion_date_match![1] || undefined,
    creationDate: creation_date_match![1] || undefined,
    description: description_match![1],
  };
}

function fileToTable(text: string) {
  const tasks = text.split("\n").map(line => parseLine(line));
  function headerClicked(column: number) {
    state.order = state.order.reorder(
      tasks,
      column,
      state.order.column === column && state.order.direction === Direction.ASC
        ? Direction.DESC
        : Direction.ASC
    );
  }
  return html`<table class="table is-fullwidth is-hoverable is-striped">
    <thead>
      <tr>
        ${columns.map(
          ({ name }, i) =>
            html`<th @click=${() => headerClicked(i)}>${name}</th>`
        )}
      </tr>
    </thead>
    <tbody>
      ${state.order.permutation(tasks).map(
        i =>
          html`<tr
            style=${tasks[i].isComplete ? "text-decoration: line-through" : ""}
          >
            ${columns.map(
              column => html`<td>${column.accessor(tasks[i])}</td>`
            )}
          </tr>`
      )}
    </tbody>
  </table>`;
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
        <div class="field">${fileToTable(state.rawText)}</div>
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
