export type ImportSourceColumn = {
  key: string;
  header: string;
  index: number;
};

export type ImportTargetField = {
  key: string;
  label: string;
  required?: boolean;
  type?: "string" | "date" | "enum" | "number" | "boolean";
};

export type ParsedRow = Record<string, unknown>;

export type ParsedFile = {
  columns: ImportSourceColumn[];
  rows: ParsedRow[];
  fileName: string;
  fileType: "csv" | "xlsx";
  sheetName?: string | null;
};

// targetKey -> sourceColumnKey (of null als niet gemapt)
export type FieldMapping = Record<string, string | null | undefined>;

