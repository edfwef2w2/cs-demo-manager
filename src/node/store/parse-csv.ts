import fs from 'fs-extra';
import { parseFile } from '@fast-csv/parse';

export type CsvValueType = 'string' | 'number' | 'boolean' | 'nullable-string';

export type CsvColumn<T> = {
  name: keyof T & string;
  type: CsvValueType;
};

function parseCsvValue(raw: string | undefined, type: CsvValueType) {
  const value = raw ?? '';

  switch (type) {
    case 'string':
      return value;
    case 'nullable-string':
      return value === '' ? null : value;
    case 'number': {
      if (value === '') {
        return 0;
      }
      const parsed = Number(value);
      return Number.isNaN(parsed) ? 0 : parsed;
    }
    case 'boolean':
      return value === 't' || value === 'true' || value === '1';
    default:
      return value;
  }
}

export function csvColumns<T extends object>(spec: Array<[string, CsvValueType]>): Array<CsvColumn<T>> {
  return spec.map(([name, type]) => {
    return { name: name as keyof T & string, type };
  });
}

export async function parseCsvFile<T extends object>(filePath: string, columns: Array<CsvColumn<T>>): Promise<T[]> {
  if (!(await fs.pathExists(filePath))) {
    return [];
  }

  return new Promise<T[]>((resolve, reject) => {
    const rows: T[] = [];

    parseFile(filePath, { headers: false })
      .on('error', reject)
      .on('data', (record: string[]) => {
        if (record.length === 1 && record[0] === '') {
          return;
        }

        const row = {} as T;
        for (const [index, column] of columns.entries()) {
          (row as Record<string, unknown>)[column.name] = parseCsvValue(record[index], column.type);
        }
        rows.push(row);
      })
      .on('end', () => {
        resolve(rows);
      });
  });
}

export async function parseCsvFirstRow<T extends object>(
  filePath: string,
  columns: Array<CsvColumn<T>>,
): Promise<T | undefined> {
  const rows = await parseCsvFile(filePath, columns);
  return rows[0];
}
