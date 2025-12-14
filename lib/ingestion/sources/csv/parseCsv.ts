// lib/ingestion/sources/csv/parseCsv.ts
// Minimal CSV parser supporting commas, quoted fields with "" escapes, and CRLF/LF newlines.

export type ParseCsvOptions = {
  delimiter?: string;
};

export function parseCsv(input: string, options: ParseCsvOptions = {}): string[][] {
  const delimiter = options.delimiter ?? ",";
  const rows: string[][] = [];
  let current: string[] = [];
  let field = "";
  let inQuotes = false;

  function pushField() {
    current.push(field);
    field = "";
  }

  function pushRow() {
    rows.push(current);
    current = [];
  }

  for (let i = 0; i < input.length; i += 1) {
    const char = input[i];
    const next = input[i + 1];

    if (inQuotes) {
      if (char === '"' && next === '"') {
        field += '"';
        i += 1;
      } else if (char === '"') {
        inQuotes = false;
      } else {
        field += char;
      }
      continue;
    }

    if (char === '"') {
      inQuotes = true;
      continue;
    }

    if (char === delimiter) {
      pushField();
      continue;
    }

    if (char === "\r") {
      if (next === "\n") {
        i += 1;
      }
      pushField();
      pushRow();
      continue;
    }

    if (char === "\n") {
      pushField();
      pushRow();
      continue;
    }

    field += char;
  }

  pushField();
  pushRow();

  if (rows.length && rows[rows.length - 1].length === 1 && rows[rows.length - 1][0] === "") {
    rows.pop();
  }

  return rows;
}
