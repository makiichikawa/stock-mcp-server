# Stock MCP Server

A Model Context Protocol (MCP) server that provides real-time stock price information using Yahoo Finance API.

## Features

- Get real-time stock prices for individual symbols
- Fetch multiple stock prices at once
- Returns comprehensive stock data including price, change, volume, and market cap
- Built with TypeScript and Zod for type safety

## Installation

```bash
npm install
npm run build
```

## Usage

### Development
```bash
npm run dev
```

### Production
```bash
npm start
```

## Tools Available

### get_stock_price
Get real-time stock price information for a single stock symbol.

**Parameters:**
- `symbol` (string): Stock symbol (e.g., "AAPL", "GOOGL", "TSLA")

### get_multiple_stock_prices
Get real-time stock price information for multiple stock symbols.

**Parameters:**
- `symbols` (array): Array of stock symbols (e.g., ["AAPL", "GOOGL", "TSLA"])

## Configuration for Claude Desktop

Add the following to your Claude Desktop configuration file:

```json
{
  "mcpServers": {
    "stock-server": {
      "command": "node",
      "args": ["/path/to/stock-mcp-server/dist/index.js"]
    }
  }
}
```

## Project Structure

```
stock-mcp-server/
├── src/
│   ├── services/
│   │   └── stockService.ts    # Stock price service
│   ├── types/
│   │   └── schema.ts          # Zod schemas and types
│   └── index.ts               # MCP server entry point
├── dist/                      # Compiled JavaScript output
├── package.json
├── tsconfig.json
└── README.md
```

## Dependencies

- `@modelcontextprotocol/sdk`: MCP SDK for server implementation
- `yahoo-finance2`: Yahoo Finance API client
- `zod`: Runtime type validation and schema definition