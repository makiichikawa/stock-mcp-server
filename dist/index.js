#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_js_1 = require("@modelcontextprotocol/sdk/server/index.js");
const stdio_js_1 = require("@modelcontextprotocol/sdk/server/stdio.js");
const types_js_1 = require("@modelcontextprotocol/sdk/types.js");
const stockService_1 = require("./services/stockService");
const schema_1 = require("./types/schema");
const server = new index_js_1.Server({
    name: 'stock-mcp-server',
    version: '1.0.0',
}, {
    capabilities: {
        tools: {},
    },
});
const stockService = new stockService_1.StockService();
server.setRequestHandler(types_js_1.ListToolsRequestSchema, async () => {
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
            {
                name: 'analyze_profitability_turnaround',
                description: 'Analyze whether a stock has turned from loss to profit in recent quarters',
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
                name: 'screen_profit_turnaround_stocks',
                description: 'Screen multiple stocks to find those that have turned from loss to profit',
                inputSchema: {
                    type: 'object',
                    properties: {
                        symbols: {
                            type: 'array',
                            items: {
                                type: 'string',
                            },
                            description: 'Array of stock symbols to screen (e.g., ["AAPL", "GOOGL", "TSLA"])',
                        },
                        minMarketCap: {
                            type: 'number',
                            description: 'Minimum market capitalization filter (optional)',
                        },
                        maxMarketCap: {
                            type: 'number',
                            description: 'Maximum market capitalization filter (optional)',
                        },
                    },
                    required: ['symbols'],
                },
            },
        ],
    };
});
server.setRequestHandler(types_js_1.CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;
    try {
        if (name === 'get_stock_price') {
            const validatedArgs = schema_1.StockSymbolSchema.parse(args);
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
            const symbols = args.symbols;
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
            const validatedArgs = schema_1.StockSymbolSchema.parse(args);
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
        if (name === 'analyze_profitability_turnaround') {
            const validatedArgs = schema_1.StockSymbolSchema.parse(args);
            const result = await stockService.analyzeProfitabilityTurnAround(validatedArgs);
            return {
                content: [
                    {
                        type: 'text',
                        text: JSON.stringify(result, null, 2),
                    },
                ],
            };
        }
        if (name === 'screen_profit_turnaround_stocks') {
            const validatedArgs = schema_1.StockScreenerSchema.parse(args);
            const result = await stockService.screenProfitTurnAroundStocks(validatedArgs);
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
    }
    catch (error) {
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
    const transport = new stdio_js_1.StdioServerTransport();
    await server.connect(transport);
    console.error('Stock MCP Server running on stdio');
}
if (require.main === module) {
    main().catch((error) => {
        console.error('Server error:', error);
        process.exit(1);
    });
}
//# sourceMappingURL=index.js.map