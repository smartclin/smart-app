// src/mcp/mcp-todos.ts
import fs from "node:fs";
import path from "node:path";

// Use a persistent storage path
const TODOS_DIR = path.join(process.cwd(), ".mcp-data");
const TODOS_PATH = path.join(TODOS_DIR, "todos.json");

// Ensure directory exists
if (!fs.existsSync(TODOS_DIR)) {
	fs.mkdirSync(TODOS_DIR, { recursive: true });
}

export type Todo = {
	id: number;
	title: string;
	createdAt: string;
	completed: boolean;
	priority: "low" | "medium" | "high";
};

// Load todos from file
const loadTodos = (): Todo[] => {
	if (!fs.existsSync(TODOS_PATH)) {
		return [
			{
				id: 1,
				title: "Buy groceries",
				createdAt: new Date().toISOString(),
				completed: false,
				priority: "medium"
			},
			{
				id: 2,
				title: "Review patient records",
				createdAt: new Date().toISOString(),
				completed: false,
				priority: "high"
			}
		];
	}
	try {
		return JSON.parse(fs.readFileSync(TODOS_PATH, "utf8"));
	} catch {
		return [];
	}
};

// Save todos to file
const saveTodos = (todos: Todo[]) => {
	fs.writeFileSync(TODOS_PATH, JSON.stringify(todos, null, 2));
};

// In-memory storage
const todos: Todo[] = loadTodos();
let subscribers: ((todos: Todo[]) => void)[] = [];

// Get all todos
export function getTodos(): Todo[] {
	return todos;
}

// Get todo by id
export function getTodoById(id: number): Todo | undefined {
	return todos.find(t => t.id === id);
}

// Add a todo
export function addTodo(title: string, priority: Todo["priority"] = "medium"): Todo {
	const newTodo: Todo = {
		id: todos.length + 1,
		title,
		createdAt: new Date().toISOString(),
		completed: false,
		priority
	};
	todos.push(newTodo);
	saveTodos(todos);
	notifySubscribers();
	return newTodo;
}

// Update todo status
export function updateTodoStatus(id: number, completed: boolean): Todo | undefined {
	const todo = todos.find(t => t.id === id);
	if (todo) {
		todo.completed = completed;
		saveTodos(todos);
		notifySubscribers();
	}
	return todo;
}

// Delete todo
export function deleteTodo(id: number): boolean {
	const index = todos.findIndex(t => t.id === id);
	if (index !== -1) {
		todos.splice(index, 1);
		saveTodos(todos);
		notifySubscribers();
		return true;
	}
	return false;
}

// Subscribe to changes
export function subscribeToTodos(callback: (todos: Todo[]) => void) {
	subscribers.push(callback);
	callback(todos);
	return () => {
		subscribers = subscribers.filter(cb => cb !== callback);
	};
}

// Notify subscribers
function notifySubscribers() {
	for (const cb of subscribers) {
		try {
			cb(todos);
		} catch {}
	}
}
