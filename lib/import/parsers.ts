import Papa from "papaparse";
import type { ParsedFile, ParsedRow, ImportSourceColumn } from "./types";

function buildColumns(headers: string[]): ImportSourceColumn[] {
  return headers.map((header, index) => ({
    key: header,
    header,
    index,
  }));
}

export async function parseCsv(buffer: Buffer, fileName: string): Promise<ParsedFile> {
  const content = buffer.toString("utf-8");

  const result = Papa.parse<ParsedRow>(content, {
    header: true,
    skipEmptyLines: "greedy",
    transformHeader: (h) => h.trim(),
  });

  if (result.errors && result.errors.length > 0 && !result.data.length) {
    throw new Error("CSV kon niet worden gelezen. Controleer het formaat en probeer opnieuw.");
  }

  const rows = (result.data || []).filter((row) => Object.keys(row).some((k) => row[k] !== null && row[k] !== ""));
  const headers = (result.meta.fields || []).map((h) => h || "").filter(Boolean);

  const columns = buildColumns(headers);

  return {
    columns,
    rows,
    fileName,
    fileType: "csv",
  };
}

export async function parseXlsx(buffer: Buffer, fileName: string): Promise<ParsedFile> {
  const xlsx = await import("xlsx");
  const workbook = xlsx.read(buffer, { type: "buffer" });

  const sheetName = workbook.SheetNames[0];
  if (!sheetName) {
    throw new Error("Excelbestand bevat geen werkbladen.");
  }

  const sheet = workbook.Sheets[sheetName];
  const json = xlsx.utils.sheet_to_json<ParsedRow>(sheet, {
    defval: "",
    raw: false,
  });

  if (!json.length) {
    throw new Error("Excelblad bevat geen rijen.");
  }

  const headers = Object.keys(json[0] || {});
  const columns = buildColumns(headers);

  return {
    columns,
    rows: json,
    fileName,
    fileType: "xlsx",
    sheetName,
  };
}

