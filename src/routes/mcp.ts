// src/routes/mcp.ts
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

import { handleMcpRequest } from "#/mcp/mcp-handler";
import { pediatricMcpServer } from "#/mcp/mcp-med";
import { addTodo, deleteTodo, getTodos, updateTodoStatus } from "#/mcp/mcp-todos";

// Types for tool structure
interface ToolDefinition {
	config: {
		title: string;
		description: string;
		inputSchema: z.ZodTypeAny | Record<string, z.ZodTypeAny>;
	};
	handler: (args: Record<string, unknown>) => Promise<{
		content: Array<{ type: "text"; text: string }>;
	}>;
}

interface McpServerWithTools extends McpServer {
	_tools?: Map<string, ToolDefinition>;
}

// Create unified MCP server for pediatric clinic
const server = new McpServer({
	name: "pediatric-clinic-mcp",
	version: "1.0.0"
}) as McpServerWithTools;

// ================ TODO MANAGEMENT TOOLS ================

server.registerTool(
	"addTodo",
	{
		title: "Add Todo",
		description: "Add a todo to the task list",
		inputSchema: {
			title: z.string().describe("The title of the todo"),
			priority: z.enum(["low", "medium", "high"]).default("medium").describe("Task priority")
		}
	},
	({ title, priority }: { title: string; priority: "low" | "medium" | "high" }) => ({
		content: [{ type: "text" as const, text: JSON.stringify(addTodo(title, priority), null, 2) }]
	})
);

server.registerTool(
	"listTodos",
	{
		title: "List Todos",
		description: "Get all todos",
		inputSchema: {}
	},
	() => ({
		content: [{ type: "text" as const, text: JSON.stringify(getTodos(), null, 2) }]
	})
);

server.registerTool(
	"completeTodo",
	{
		title: "Complete Todo",
		description: "Mark a todo as completed",
		inputSchema: {
			id: z.number().describe("Todo ID"),
			completed: z.boolean().default(true).describe("Completion status")
		}
	},
	({ id, completed }: { id: number; completed: boolean }) => {
		const result = updateTodoStatus(id, completed);
		return {
			content: [
				{
					type: "text" as const,
					text: result
						? JSON.stringify(
								{
									message: `Todo "${result.title}" marked as ${completed ? "completed" : "pending"}`,
									todo: result
								},
								null,
								2
							)
						: JSON.stringify({ error: "Todo not found", id }, null, 2)
				}
			]
		};
	}
);

server.registerTool(
	"deleteTodo",
	{
		title: "Delete Todo",
		description: "Delete a todo from the list",
		inputSchema: {
			id: z.number().describe("Todo ID")
		}
	},
	({ id }: { id: number }) => {
		const success = deleteTodo(id);
		return {
			content: [
				{
					type: "text" as const,
					text: success
						? JSON.stringify({ message: "Todo deleted successfully", id }, null, 2)
						: JSON.stringify({ error: "Todo not found", id }, null, 2)
				}
			]
		};
	}
);

// ================ HELPER TO REGISTER PEDIATRIC TOOLS ================

// Helper function to safely get tools from pediatricMcpServer
function getPediatricToolNames(): string[] {
	return [
		"listPediatricians",
		"getDoctorById",
		"listPediatricPatients",
		"getPatientWithGrowthData",
		"listPediatricAppointments",
		"scheduleWellChildVisit",
		"createPediatricEncounter",
		"getVaccinationSchedule"
	];
}

// Helper to get a tool from pediatricMcpServer
function getPediatricTool(toolName: string): ToolDefinition | undefined {
	const toolsMap = (pediatricMcpServer as McpServerWithTools)._tools;
	if (toolsMap?.has(toolName)) {
		return toolsMap.get(toolName);
	}

	// Try alternative access pattern
	const serverAny = pediatricMcpServer as unknown as { tools?: Map<string, ToolDefinition> };
	if (serverAny.tools?.has(toolName)) {
		return serverAny.tools.get(toolName);
	}

	return undefined;
}

// Register all pediatric tools
const pediatricToolNames = getPediatricToolNames();

for (const toolName of pediatricToolNames) {
	const tool = getPediatricTool(toolName);
	if (tool) {
		server.registerTool(toolName, tool.config, async (args: Record<string, unknown>) => {
			const startTime = Date.now();
			console.log(`[MCP] Pediatric tool called: ${toolName}`);
			try {
				const result = await tool.handler(args);
				const duration = Date.now() - startTime;
				console.log(`[MCP] Pediatric tool ${toolName} completed in ${duration}ms`);
				return result;
			} catch (error) {
				console.error(`[MCP] Pediatric tool ${toolName} failed:`, error);
				return {
					content: [
						{
							type: "text" as const,
							text: JSON.stringify(
								{
									error: "Tool execution failed",
									details: error instanceof Error ? error.message : String(error)
								},
								null,
								2
							)
						}
					]
				};
			}
		});
		console.log(`[MCP] Registered pediatric tool: ${toolName}`);
	} else {
		console.warn(`[MCP] Pediatric tool not found: ${toolName}`);
	}
}

// ================ ROUTE HANDLER WITH PROPER TYPES ================

// Define the request type
interface JsonRpcRequest {
	jsonrpc: "2.0";
	method: string;
	params?: Record<string, unknown>;
	id?: string | number | null;
}

// Custom request handler with logging
async function handleRequest(request: JsonRpcRequest): Promise<unknown> {
	const method = request.method || "unknown";
	console.log(`[MCP] Request received: ${method}`);
	const startTime = Date.now();

	try {
		// This is simplified - the actual server.handleRequest handles the routing
		const response = await (
			server as unknown as {
				handleRequest?: (req: JsonRpcRequest) => Promise<unknown>;
			}
		).handleRequest?.(request);

		console.log(`[MCP] Request completed in ${Date.now() - startTime}ms`);
		return response;
	} catch (error) {
		console.error("[MCP] Request failed:", error);
		throw error;
	}
}

// Store reference to original request handling if needed
const serverWithHandler = server as unknown as {
	_requestHandler?: (req: JsonRpcRequest) => Promise<unknown>;
};

if (!serverWithHandler._requestHandler) {
	serverWithHandler._requestHandler = async (req: JsonRpcRequest) => {
		return handleRequest(req);
	};
}

// ================ ROUTE EXPORT ================

export const Route = createFileRoute("/mcp")({
	server: {
		handlers: {
			POST: async ({ request }: { request: Request }) => handleMcpRequest(request, server),
			GET: async () => {
				const toolNames = ["addTodo", "listTodos", "completeTodo", "deleteTodo", ...pediatricToolNames];

				return Response.json({
					name: "Pediatric Clinic MCP Server",
					version: "1.0.0",
					status: "healthy",
					availableTools: toolNames,
					description: "MCP server for pediatric clinic management with todo and medical operations",
					timestamp: new Date().toISOString()
				});
			}
		}
	}
});
