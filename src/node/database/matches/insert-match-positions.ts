import fs from 'fs-extra';
import path from 'node:path';
import { getCsvFilePath } from './match-insertion';
import { positionCsvFiles } from 'csdm/node/store/match-document';

type InsertMatchPositionsParameters = {
  demoName: string;
  outputFolderPath: string;
  destinationFolderPath: string;
};

async function copyIfExists(sourceFilePath: string, destinationFilePath: string) {
  if (!(await fs.pathExists(sourceFilePath))) {
    return;
  }

  await fs.copy(sourceFilePath, destinationFilePath);
}

export async function insertMatchPositions({
  demoName,
  outputFolderPath,
  destinationFolderPath,
}: InsertMatchPositionsParameters) {
  await fs.ensureDir(destinationFolderPath);

  await Promise.all([
    copyIfExists(
      getCsvFilePath(outputFolderPath, demoName, '_positions.csv'),
      path.join(destinationFolderPath, positionCsvFiles.players),
    ),
    copyIfExists(
      getCsvFilePath(outputFolderPath, demoName, '_grenade_positions.csv'),
      path.join(destinationFolderPath, positionCsvFiles.grenades),
    ),
    copyIfExists(
      getCsvFilePath(outputFolderPath, demoName, '_inferno_positions.csv'),
      path.join(destinationFolderPath, positionCsvFiles.infernos),
    ),
    copyIfExists(
      getCsvFilePath(outputFolderPath, demoName, '_hostage_positions.csv'),
      path.join(destinationFolderPath, positionCsvFiles.hostages),
    ),
    copyIfExists(
      getCsvFilePath(outputFolderPath, demoName, '_chicken_positions.csv'),
      path.join(destinationFolderPath, positionCsvFiles.chickens),
    ),
  ]);
}
