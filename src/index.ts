#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { StockService } from './services/stockService';
import { StockSymbolSchema } from './types/schema';

const server = new Server(
  {
    name: 'stock-mcp-server',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

const stockService = new StockService();

server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'get_stock_price',
        description: 'Get real-time stock price information for a given stock symbol',
        inputSchema: {
          type: 'object',
          properties: {
            symbol: {
              type: 'string',
              description: 'Stock symbol (e.g., AAPL, GOOGL, TSLA)',
            },
          },
          required: ['symbol'],
        },
      },
      {
        name: 'get_multiple_stock_prices',
        description: 'Get real-time stock price information for multiple stock symbols',
        inputSchema: {
          type: 'object',
          properties: {
            symbols: {
              type: 'array',
              items: {
                type: 'string',
              },
              description: 'Array of stock symbols (e.g., ["AAPL", "GOOGL", "TSLA"])',
            },
          },
          required: ['symbols'],
        },
      },
      {
        name: 'get_financial_data',
        description: 'Get comprehensive financial data and fundamental analysis metrics for a stock',
        inputSchema: {
          type: 'object',
          properties: {
            symbol: {
              type: 'string',
              description: 'Stock symbol (e.g., AAPL, GOOGL, TSLA)',
            },
          },
          required: ['symbol'],
        },
      },
    ],
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    if (name === 'get_stock_price') {
      const validatedArgs = StockSymbolSchema.parse(args);
      const result = await stockService.getStockPrice(validatedArgs);
      
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(result, null, 2),
          },
        ],
      };
    }
    
    if (name === 'get_multiple_stock_prices') {
      const symbols = (args as any).symbols;
      if (!Array.isArray(symbols)) {
        throw new Error('symbols must be an array');
      }
      
      const result = await stockService.getMultipleStockPrices(symbols);
      
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(result, null, 2),
          },
        ],
      };
    }

    if (name === 'get_financial_data') {
      const validatedArgs = StockSymbolSchema.parse(args);
      const result = await stockService.getFinancialData(validatedArgs);
      
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(result, null, 2),
          },
        ],
      };
    }
    
    throw new Error(`Unknown tool: ${name}`);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return {
      content: [
        {
          type: 'text',
          text: `Error: ${errorMessage}`,
        },
      ],
      isError: true,
    };
  }
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Stock MCP Server running on stdio');
}

if (require.main === module) {
  main().catch((error) => {
    console.error('Server error:', error);
    process.exit(1);
  });
}