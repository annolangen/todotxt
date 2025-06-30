# Project Milestones

This document breaks down the work outlined in `vision.md` into smaller, manageable milestones.

## Milestone 1: Basic UI with Text Area

- **Goal:** Create the basic application shell.
- **Features:**
  - An HTML page with a large `<textarea>`.
  - A user can copy and paste the content of their `todo.txt` file into this text area.
- **Rationale:** This is the foundational step, providing the input mechanism for all subsequent features. No parsing or formatting will be done at this stage.

## Milestone 2: Static Table Rendering

- **Goal:** Parse the input text and display it in a structured format.
- **Features:**
  - Parse the text from the `<textarea>` according to the `todo.txt` format.
  - Render the parsed tasks into a static HTML `<table>`.
  - Each row represents a task, and columns represent parts of the task (e.g., priority, creation date, description).
- **`vision.md` coverage:** "contents is formatted as a table"

## Milestone 3: Interactive Table Sorting

- **Goal:** Allow the user to sort the tasks.
- **Features:**
  - Add click handlers to the table headers.
  - Clicking a header sorts the entire table based on the data in that column.
  - The sort should handle different data types (e.g., alphabetical for text, chronological for dates).
- **`vision.md` coverage:** "clicking on table header will sort by that column"

## Milestone 4: Tag Highlighting on Hover

- **Goal:** Provide visual feedback for related tasks.
- **Features:**
  - When a user hovers their mouse over a project (`+project`), context (`@context`), or key:value tag:
  - All other instances of that same tag in the table are visually highlighted.
- **`vision.md` coverage:** "hovering over a context, project, or key/value tag will highlight the other occurrences in the file"

#### testing

```
x 2024-05-20 2024-05-19 Mow the lawn @home
(A) 2024-05-23 Prepare for meeting +work @office
(B) 2024-05-25 Plan weekend trip +family due:2024-05-26
(C) 2024-05-21 Schedule dentist appointment +health
2024-05-22 Water the plants @home
(A) 2024-05-20 Call mom +family @home
(B) 2024-05-19 Buy groceries +shopping @store due:2024-05-20
x 2024-05-18 2024-05-17 Finish project report +work @computer
(C) 2024-05-24 Email team about project update +work @computer
Read a book +leisure
```

## Milestone 5: Filtering by Tags

- **Goal:** Allow users to focus on specific subsets of their tasks.
- **Features:**
  - Clicking on a tag (project, context, or key:value) filters the table to show only tasks containing that tag.
  - The active filter is displayed as a "chip" UI element, which can be clicked to remove the filter.
  - The current filter state is reflected in the page URL, allowing for bookmarking and sharing of filtered views.
- **`vision.md` coverage:** "clicking on context, project, key/value tag will display a filtered view" and its sub-points.

## Milestone 6: In-place Editing

- **Goal:** Allow users to edit their tasks directly in the browser.
- **Features:**
  - Clicking on a task's description text turns it into an editable input field.
  - Changes are saved when the user clicks away or presses the "Enter" key.
  - The underlying data model is updated, and the table reflects the change.
- **`vision.md` coverage:** "clicking on description outside of a tag turns the cell editable" and its sub-points.

## Milestone 7: Undo Functionality

- **Goal:** Provide a safety net for edits.
- **Features:**
  - Implement an undo history for edits made to tasks.
  - A user can press `Ctrl-Z` to revert the last change.
  - An "Undo" button or menu item is available, enabled only when there are changes to undo.
- **`vision.md` coverage:** "Ctrl-Z implements undo for edits anf there is also a menu item for undo, which is enabled only when backups are present"
