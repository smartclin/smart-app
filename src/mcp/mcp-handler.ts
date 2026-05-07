import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { JSONRPCMessage } from "@modelcontextprotocol/sdk/types.js";
import * as Sentry from "@sentry/node"; // 1. Import Sentry

export async function handleMcpRequest(request: Request, server: McpServer): Promise<Response> {
	let jsonRpcRequest: JSONRPCMessage | undefined;

	try {
		jsonRpcRequest = (await request.json()) as JSONRPCMessage;

		const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();

		let responseData: JSONRPCMessage | null = null;

		clientTransport.onmessage = (message: JSONRPCMessage) => {
			responseData = message;
		};

		await server.connect(serverTransport);

		await clientTransport.start();
		await serverTransport.start();

		await clientTransport.send(jsonRpcRequest);

		await new Promise(resolve => setTimeout(resolve, 10));

		await clientTransport.close();
		await serverTransport.close();

		return Response.json(responseData, {
			headers: {
				"Content-Type": "application/json"
			}
		});
	} catch (error) {
		// 3. Capture the exception with extra context
		Sentry.captureException(error, {
			extra: {
				jsonRpcRequest: jsonRpcRequest, // Now you can see the method name/id in Sentry
				context: "MCP Handler",
				url: request.url
			}
		});

		console.error("MCP handler error:", error);

		// Return a JSON-RPC error response
		return Response.json(
			{
				jsonrpc: "2.0",
				error: {
					code: -32603,
					message: "Internal server error",
					data: error instanceof Error ? error.message : String(error)
				},
				id: (jsonRpcRequest as { id?: string | number | null })?.id || null
			},
			{
				status: 500,
				headers: {
					"Content-Type": "application/json"
				}
			}
		);
	}
}
