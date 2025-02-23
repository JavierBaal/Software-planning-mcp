import { promises as fs } from 'fs';
import path from 'path';
import os from 'os';
export class Storage {
    constructor() {
        // Store data in user's home directory under .software-planning-tool
        const dataDir = path.join(os.homedir(), '.software-planning-tool');
        this.storagePath = path.join(dataDir, 'data.json');
        this.data = {
            goals: {},
            plans: {},
        };
    }
    async initialize() {
        try {
            // Create data directory if it doesn't exist
            const dataDir = path.dirname(this.storagePath);
            await fs.mkdir(dataDir, { recursive: true });
            // Try to read existing data
            const data = await fs.readFile(this.storagePath, 'utf-8');
            this.data = JSON.parse(data);
        }
        catch (error) {
            // If file doesn't exist or can't be read, use default empty data
            await this.save();
        }
    }
    async save() {
        await fs.writeFile(this.storagePath, JSON.stringify(this.data, null, 2));
    }
    async createGoal(description) {
        const goal = {
            id: Date.now().toString(),
            description,
            createdAt: new Date().toISOString(),
        };
        this.data.goals[goal.id] = goal;
        await this.save();
        return goal;
    }
    async getGoal(id) {
        return this.data.goals[id] || null;
    }
    async createPlan(goalId) {
        const plan = {
            goalId,
            todos: [],
            updatedAt: new Date().toISOString(),
        };
        this.data.plans[goalId] = plan;
        await this.save();
        return plan;
    }
    async getPlan(goalId) {
        return this.data.plans[goalId] || null;
    }
    async addTodo(goalId, { title, description, complexity, codeExample }) {
        const plan = await this.getPlan(goalId);
        if (!plan) {
            throw new Error(`No plan found for goal ${goalId}`);
        }
        const todo = {
            id: Date.now().toString(),
            title,
            description,
            complexity,
            codeExample,
            isComplete: false,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };
        plan.todos.push(todo);
        plan.updatedAt = new Date().toISOString();
        await this.save();
        return todo;
    }
    async removeTodo(goalId, todoId) {
        const plan = await this.getPlan(goalId);
        if (!plan) {
            throw new Error(`No plan found for goal ${goalId}`);
        }
        plan.todos = plan.todos.filter((todo) => todo.id !== todoId);
        plan.updatedAt = new Date().toISOString();
        await this.save();
    }
    async updateTodoStatus(goalId, todoId, isComplete) {
        const plan = await this.getPlan(goalId);
        if (!plan) {
            throw new Error(`No plan found for goal ${goalId}`);
        }
        const todo = plan.todos.find((t) => t.id === todoId);
        if (!todo) {
            throw new Error(`No todo found with id ${todoId}`);
        }
        todo.isComplete = isComplete;
        todo.updatedAt = new Date().toISOString();
        plan.updatedAt = new Date().toISOString();
        await this.save();
        return todo;
    }
    async getTodos(goalId) {
        const plan = await this.getPlan(goalId);
        return plan?.todos || [];
    }
}
export const storage = new Storage();
