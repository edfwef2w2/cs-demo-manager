import path from 'node:path';
import fs from 'fs-extra';

export async function writeJsonAtomic(filePath: string, data: unknown) {
  await fs.ensureDir(path.dirname(filePath));
  const tempFilePath = `${filePath}.${process.pid}.tmp`;
  const json = JSON.stringify(data);
  await fs.writeFile(tempFilePath, json, 'utf8');
  await fs.move(tempFilePath, filePath, { overwrite: true });
}

export async function readJsonFile<T>(filePath: string): Promise<T | undefined> {
  if (!(await fs.pathExists(filePath))) {
    return undefined;
  }

  const content = await fs.readFile(filePath, 'utf8');
  return JSON.parse(content) as T;
}
