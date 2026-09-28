# Open the local browser for Flowboard testing

Use the **Playwright MCP**, not the separate Computer Use / CUA browser controller.

1. Check whether a Playwright browser tab already exists with `mcp__playwright__browser_tabs` using `action: "list"`.
2. If there is an appropriate Flowboard tab, select it. Otherwise create a new tab with `mcp__playwright__browser_tabs` using `action: "new"` and `url: "http://localhost:5173/"`.
3. Verify the page URL, title, snapshot, and console output before interacting with the application.

The Playwright MCP tools can be registered as **deferred tools**: they may not appear in the initially visible tool list even though they are installed. If they are not directly listed, inspect the available-tool catalog (for example, filter `ALL_TOOLS` for `mcp__playwright__`) and then call the Playwright tools directly. Do not treat an unavailable CUA `chrome` browser or an empty CUA browser inventory as evidence that Playwright is unavailable; the two browser-control surfaces are independent.

The Playwright MCP session opens a browser page directly. Use its snapshot and browser-console tools to validate the page after navigation and after each important interaction.
