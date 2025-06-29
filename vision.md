Add value to files formatted according to [TODO.txt principles](https://github.com/todotxt/todo.txt).

Initial version can copy/paste file text. It will be rendered in HTML with features like:

- contents is formatted as a table
- clicking on table header will sort by that column
- hovering over a context, project, or key/value tag will highlight the other occurrences in the file
- clicking on context, project, key/value tag will display a filtered view
  - Filter is visible as a chip with an x to remove
  - Filter is visible in the URL, where it could be edited
  - Only rows with the filtered value are shown
- clicking on description outside of a tag turns the cell editable
  - Any changes are saved when focus changes or on Enter
  - Ctrl-Z implements undo for edits anf there is also a menu item for undo, which is enabled only when backups are present
