# Data-Analyst

## Current State
- Power BI Panel: loads iframe with user-provided URL, no error handling, no guidance on embed URL format
- SQL Editor: runs mock/simulated queries only, returns hardcoded fake data
- Python Console: simulates output with hardcoded strings, no real execution

## Requested Changes (Diff)

### Add
- SQL.js (SQLite WebAssembly) for real, client-side SQL execution in the browser
- Pyodide (Python WebAssembly) for real Python execution in the browser with pandas, numpy, matplotlib support
- Power BI: better loading states, error detection, clearer URL format guidance, and iframe sandbox attributes
- SQL: pre-loaded sample tables (employees, departments, sales) so users can run real queries immediately
- Python: show real stdout output from Pyodide execution
- Loading indicator while Pyodide/SQL.js initializes

### Modify
- SQLEditor.tsx: replace mock execution with sql.js WASM real execution
- PythonConsole.tsx: replace simulated output with Pyodide real execution
- PowerBIPanel.tsx: add error state handling, iframe onError/onLoad events, clearer instructions

### Remove
- MOCK_RESULTS constant from SQLEditor
- SIMULATED_OUTPUT constant from PythonConsole
- "Simulation Mode" badge from Python console

## Implementation Plan
1. Install sql.js and @types/sql.js npm packages
2. Install pyodide npm package
3. Rewrite SQLEditor to load sql.js, create in-memory SQLite DB with sample tables, execute real queries
4. Rewrite PythonConsole to load Pyodide, run real Python with stdout capture
5. Improve PowerBIPanel with iframe load/error events and better UX guidance
6. Show initialization spinner while WASM engines load
