import { html, render } from "lit-html";

enum View {
  RAW,
  TABLE,
}

enum Direction {
  ASC,
  DESC,
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
  rawText: localStorage.getItem("todo.txt") || "",
  toHighlight: "",
  currentView: View.RAW,
  tags: [] as string[],
  order: makeCachingOrder(),
  isMobileView: window.matchMedia("(max-width: 768px)").matches,
};

// Event handler for the textarea's input event
function onInput(e: Event) {
  const textarea = e.currentTarget as HTMLTextAreaElement;
  const wasEmpty = state.rawText === "";
  state.rawText = textarea.value;
  if (wasEmpty && state.rawText !== "") {
    localStorage.setItem("todo.txt", state.rawText);
    if (state.currentView === View.RAW) {
      state.currentView = View.TABLE;
    }
  }
}

function descriptionHtml(task: Task) {
  const { description } = task;
  const tagRegex = /([+@][a-zA-Z0-9-]+|[a-zA-Z0-9-]+:[a-zA-Z0-9-]+)/g;
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
        @click=${() => {
          state.tags.push(tagText);
          state.toHighlight = "";
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

function taskToCard(task: Task) {
  const { isComplete, priority, completionDate, creationDate } = task;
  return html`<div
    class="card mb-3"
    style=${isComplete ? "text-decoration: line-through; opacity: 0.6;" : ""}
  >
    <div class="card-content py-3 px-4">
      <div class="content">
        <p class="mb-2">${descriptionHtml(task)}</p>
        <div class="tags">
          ${priority
            ? html`<span class="tag is-warning is-light">P: ${priority}</span>`
            : ""}
          ${creationDate
            ? html`<span class="tag is-info is-light"
                >Created: ${creationDate}</span
              >`
            : ""}
          ${completionDate
            ? html`<span class="tag is-success is-light"
                >Completed: ${completionDate}</span
              >`
            : ""}
        </div>
      </div>
    </div>
  </div>`;
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
            html`<th @click=${() => headerClicked(i)} style="cursor: pointer;">
              ${name}
            </th>`
        )}
      </tr>
    </thead>
    <tbody>
      ${state.order
        .permutation(tasks)
        .filter(i =>
          state.tags.reduce(
            (acc, tag) => acc && tasks[i].description.includes(tag),
            true
          )
        )
        .map(
          i =>
            html`<tr
              style=${tasks[i].isComplete
                ? "text-decoration: line-through"
                : ""}
            >
              ${columns.map(
                column => html`<td>${column.accessor(tasks[i])}</td>`
              )}
            </tr>`
        )}
    </tbody>
  </table>`;
}

function fileToCards(text: string) {
  const tasks = text.split("\n").map(line => parseLine(line));
  function sortChanged(e: Event) {
    const select = e.currentTarget as HTMLSelectElement;
    const column = parseInt(select.value, 10);
    state.order = state.order.reorder(tasks, column, state.order.direction);
  }

  function directionChanged() {
    const newDirection =
      state.order.direction === Direction.ASC ? Direction.DESC : Direction.ASC;
    state.order = state.order.reorder(
      tasks,
      state.order.column ?? 0,
      newDirection
    );
  }

  return html` <div class="field has-addons">
      <div class="control">
        <div class="select">
          <select
            @change=${sortChanged}
            .value=${(state.order.column ?? -1).toString()}
          >
            <option value="-1" disabled>Sort by</option>
            ${columns.map(
              (c, i) => html`<option value=${i}>${c.name}</option>`
            )}
          </select>
        </div>
      </div>
      <div class="control">
        <button class="button" @click=${directionChanged}>
          ${state.order.direction === Direction.ASC ? "⬆" : "⬇"}
        </button>
      </div>
    </div>
    ${state.order
      .permutation(tasks)
      .filter(i =>
        state.tags.reduce(
          (acc, tag) => acc && tasks[i].description.includes(tag),
          true
        )
      )
      .map(i => taskToCard(tasks[i]))}`;
}

// Main application template
function appHtml() {
  return html`<section class="section">
    <div class="container">
      <div class="box">
        <h1 class="title">Todo.txt Viewer</h1>
        <div class="tags">
          ${state.tags.map(
            tag =>
              html`<span class="tag is-rounded">
                ${tag}
                <button
                  class="delete"
                  @click=${() =>
                    (state.tags = state.tags.filter(t => t !== tag))}
                ></button>
              </span>`
          )}
        </div>
        ${state.rawText === ""
          ? html`<p class="subtitle">
              Paste the contents of your <code>todo.txt</code> file into the
              area of the Raw Text tab.
            </p>`
          : ""}
        <div class="tabs">
          <ul>
            <li class=${state.currentView === View.RAW ? "is-active" : ""}>
              <a @click=${() => (state.currentView = View.RAW)}>Raw Text</a>
            </li>
            <li class=${state.currentView === View.TABLE ? "is-active" : ""}>
              <a @click=${() => (state.currentView = View.TABLE)}>Table</a>
            </li>
          </ul>
        </div>
        ${state.currentView === View.RAW
          ? html`<div class="field">
              <div class="control">
                <textarea
                  class="textarea is-family-monospace"
                  @input=${onInput}
                  rows="15"
                  placeholder="e.g., (A) Buy milk +groceries @store"
                  .value=${state.rawText}
                ></textarea>
              </div>
            </div>`
          : state.isMobileView
            ? html`<div class="field">${fileToCards(state.rawText)}</div>`
            : html`<div class="field">${fileToTable(state.rawText)}</div>`}
      </div>
    </div>
  </section>`;
}

const appRoot = document.getElementById("app") || document.body;

const renderApp = () => render(appHtml(), appRoot);

// Set up global event handlers to trigger re-renders.
// This leverages event bubbling from components like the textarea.
window.onclick = window.oninput = window.onhashchange = renderApp;

window.onresize = () => {
  state.isMobileView = window.matchMedia("(max-width: 768px)").matches;
  renderApp();
};

// Initial render of the application.
renderApp();
