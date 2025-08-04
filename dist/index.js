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
                name: 'get_index_contribution',
                description: 'Get individual stock contribution to a market index (Nikkei 225, TOPIX, etc.)',
                inputSchema: {
                    type: 'object',
                    properties: {
                        symbol: {
                            type: 'string',
                            description: 'Stock symbol (e.g., 7203.T for Toyota)',
                        },
                        indexSymbol: {
                            type: 'string',
                            description: 'Index symbol (e.g., N225 for Nikkei 225, TOPX for TOPIX)',
                        },
                    },
                    required: ['symbol', 'indexSymbol'],
                },
            },
            {
                name: 'get_index_analysis',
                description: 'Get comprehensive analysis of index contributors and detractors',
                inputSchema: {
                    type: 'object',
                    properties: {
                        indexSymbol: {
                            type: 'string',
                            description: 'Index symbol (e.g., N225 for Nikkei 225, TOPX for TOPIX)',
                        },
                        topN: {
                            type: 'number',
                            description: 'Number of top contributors/detractors to show (default: 10)',
                        },
                    },
                    required: ['indexSymbol'],
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
        if (name === 'get_index_contribution') {
            const validatedArgs = schema_1.IndexContributionSchema.parse(args);
            const result = await stockService.getIndexContribution(validatedArgs);
            return {
                content: [
                    {
                        type: 'text',
                        text: JSON.stringify(result, null, 2),
                    },
                ],
            };
        }
        if (name === 'get_index_analysis') {
            const { indexSymbol, topN = 10 } = args;
            if (!indexSymbol) {
                throw new Error('indexSymbol is required');
            }
            const result = await stockService.getIndexAnalysis(indexSymbol, topN);
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