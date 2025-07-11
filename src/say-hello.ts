#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { ListToolsRequestSchema, CallToolRequestSchema, CallToolResult } from "@modelcontextprotocol/sdk/types.js";

const server = new Server(
  {
    name: "sample-mcp-server-987",
    version: "0.0.1",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "hi",
        description: "Say hi to the user.",
        inputSchema: {
          type: "object",
          properties: {
            username: { type: "string", description: "The name of the user to say hi to." },
          },
          required: ["username"],
        },
      },
    ],
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request): Promise<CallToolResult> => {
  console.log("[TOOL REQUEST]", request);
  const toolName = request.params.name;
  const username = request.params.arguments?.username as string;
  const stdioArgs = process.argv.slice(2);

  console.log("[TOOL LOG]", toolName);
  console.log("[TOOL PARAMS]", request.params);
  console.log("[TOOL ARGS]", request.params.arguments);
  console.trace("[TOOL TRACE]", "This is trace");
  console.debug("[TOOL DEBUG]", "This is debug");
  console.info("[TOOL INFO]", "This is info");
  console.warn("[TOOL WARN]", "This is warn");
  console.error("[TOOL ERROR]", "This is error");

  if (username === "error-throw") {
    throw new Error("This is error throw");
  }

  if (username === "error-mcp") {
    return {
      isError: true,
      content: [
        {
          type: "text",
          mimeType: "text/plain",
          text: `This is error mcp`,
        },
      ],
    };
  }

  switch (toolName) {
    case "hi":
      return {
        isError: false,
        content: [
          {
            type: "text",
            mimeType: "text/plain",
            text: `Hi 987, ${username}! [${stdioArgs.join(", ")}]`,
          },
        ],
      };
    default:
      return {
        isError: true,
        content: [
          {
            type: "text",
            mimeType: "text/plain",
            text: `Unknown tool: ${toolName}`,
          },
        ],
      };
  }
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch(console.error);
