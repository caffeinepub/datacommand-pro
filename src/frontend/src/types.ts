export interface SqlQuery {
  id: string;
  name: string;
  code: string;
  description: string;
  createdAt: string;
}

export interface PythonSnippet {
  id: string;
  name: string;
  code: string;
  description: string;
  createdAt: string;
}

export interface PowerBIReport {
  id: string;
  name: string;
  embedUrl: string;
  description: string;
  createdAt: string;
}

const KEYS = {
  SQL: "dcp_sql_queries",
  PYTHON: "dcp_python_snippets",
  POWERBI: "dcp_powerbi_reports",
};

export function loadSqlQueries(): SqlQuery[] {
  try {
    return JSON.parse(localStorage.getItem(KEYS.SQL) || "[]");
  } catch {
    return [];
  }
}

export function saveSqlQueries(queries: SqlQuery[]): void {
  localStorage.setItem(KEYS.SQL, JSON.stringify(queries));
}

export function loadPythonSnippets(): PythonSnippet[] {
  try {
    return JSON.parse(localStorage.getItem(KEYS.PYTHON) || "[]");
  } catch {
    return [];
  }
}

export function savePythonSnippets(snippets: PythonSnippet[]): void {
  localStorage.setItem(KEYS.PYTHON, JSON.stringify(snippets));
}

export function loadPowerBIReports(): PowerBIReport[] {
  try {
    return JSON.parse(localStorage.getItem(KEYS.POWERBI) || "[]");
  } catch {
    return [];
  }
}

export function savePowerBIReports(reports: PowerBIReport[]): void {
  localStorage.setItem(KEYS.POWERBI, JSON.stringify(reports));
}

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}
