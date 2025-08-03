import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import z from "zod";
import fs from "node:fs/promises";

const server = new McpServer({
  name: "eating",
  version: "1.0.0",
  capabilities: {
    resources: {},
    tools: {},
    prompts: {},
  },
});

server.tool(
  "create-food",
  "Create a new food what you ate in the database",
  {
    food: z.string(),
    kcal: z.number(),
    review: z.string(),
    rate: z.number(),
    price: z.number(),
  },
  {
    // annotations
    title: "Create Food",
    readOnlyHint: false,
    destructiveHint: false,
    idempotentHint: false,
    openWorldHint: true,
  },
  async (params) => {
    try {
      const id = await createFood(params);
      return {
        content: [{ type: "text", text: `Food ${id} created successfully` }],
      };
    } catch (error) {
      console.error(error);
      return {
        content: [{ type: "text", text: "Failed to save food" }],
      };
    }
  }
);

async function createFood(food: {
  food: string;
  kcal: number;
  review: string;
  rate: number;
  price: number;
}) {
  const foods = await import("./data/foods.json", {
    assert: { type: "json" },
  }).then((m) => m.default);

  const id = foods.length + 1;
  const date = new Date();
  const time = date.toISOString().split("T")[0];

  foods.push({ id, time, ...food });

  await fs.writeFile("./src/data/foods.json", JSON.stringify(foods, null, 2));

  return id;
}

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main();
