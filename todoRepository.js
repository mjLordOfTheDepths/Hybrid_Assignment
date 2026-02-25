// todoRepository.js
// In-memory data store for the teaching edition of this project.
// There is no database — tasks are stored in a plain JavaScript array.
// This makes it possible to run all tests with only Node.js and npm (no Docker required).

// The in-memory list of tasks.
let tasks = [];

// Auto-incrementing numeric ID, mimics a database serial/sequence column.
let nextId = 1;

/**
 * Returns a copy of all current tasks, ordered by id ascending.
 * @returns {Array} Array of task objects { id, description }.
 */
export const getAll = () => [...tasks];

/**
 * Creates a new task and stores it in memory.
 * @param {string} description - The text of the new task.
 * @returns {object} The newly created task object { id, description }.
 */
export const create = (description) => {
  const task = { id: nextId++, description };
  tasks.push(task);
  return task;
};

/**
 * Resets the in-memory store to an empty state.
 * Call this in beforeEach() to ensure test isolation —
 * each test starts with a clean, empty list of tasks.
 */
export const reset = () => {
  tasks = [];
  nextId = 1;
};

/**
 * Deletes a task by id.
 * @param {number} id - The id of the task to delete.
 * @returns {boolean} True if a task was deleted, false if the id was not found.
 */
export const remove = (id) => {
  const index = tasks.findIndex((task) => task.id === id);
  if (index === -1) {
    return false;
  }
  tasks.splice(index, 1);
  return true;
};
