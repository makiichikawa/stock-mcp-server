# Stock MCP Server

A Model Context Protocol (MCP) server that provides real-time stock price information and profitability analysis using Yahoo Finance API.

## Features

- Get real-time stock prices for individual symbols
- Fetch multiple stock prices at once
- Comprehensive financial data and fundamental analysis
- **Profitability turnaround analysis** - Identify stocks that have turned from loss to profit
- **Profit turnaround screening** - Screen multiple stocks for recent profitability improvements
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

### get_financial_data
Get comprehensive financial data and fundamental analysis metrics for a stock.

**Parameters:**
- `symbol` (string): Stock symbol (e.g., "AAPL", "GOOGL", "TSLA")

### analyze_profitability_turnaround
Analyze whether a stock has turned from loss to profit in recent quarters.

**Parameters:**
- `symbol` (string): Stock symbol (e.g., "TSLA", "UBER")

**Returns:**
- `turnAroundStatus`: "profit_turnaround", "loss_turnaround", "continued_profit", or "continued_loss"
- `currentQuarterNetIncome`: Latest quarter's net income
- `previousQuarterNetIncome`: Previous quarter's net income  
- `quarterlyChange`: Percentage change in net income
- Company and market data

### screen_profit_turnaround_stocks
Screen multiple stocks to find those that have recently turned profitable.

**Parameters:**
- `symbols` (array): Array of stock symbols to analyze
- `minMarketCap` (number, optional): Minimum market capitalization filter
- `maxMarketCap` (number, optional): Maximum market capitalization filter

**Returns:**
Array of stocks with `turnAroundStatus: "profit_turnaround"`, sorted by quarterly improvement percentage.

## Testing

```bash
# Test profitability analysis functionality
node test_profitability.js
```

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