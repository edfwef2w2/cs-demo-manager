export type ImportV2BackupOptions = {
  backupFilePath: string;
  importComments: boolean;
  importStatuses: boolean;
};

export type ImportV2BackupResult = {
  demoToImportCount: number;
  demoFoundCount: number;
  updatedDemoPaths: string[];
};

export async function importDataFromV2Backup(): Promise<ImportV2BackupResult> {
  throw new Error('Importing data from CS Demo Manager v2 SQL backups is no longer supported');
}
