import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { Game } from 'csdm/common/types/counter-strike';
import { isWindows } from 'csdm/node/os/is-windows';

const execFileAsync = promisify(execFile);

function getProcessImageName(game: Game) {
  return game === Game.CSGO ? 'csgo' : 'cs2';
}

/**
 * Raises the CS process priority on Windows so the OS is less likely to treat a
 * minimized/unfocused recording window as a low-priority background task.
 */
export async function boostCounterStrikeProcessPriority(game: Game, signal?: AbortSignal) {
  if (!isWindows || signal?.aborted) {
    return;
  }

  const imageName = getProcessImageName(game);
  const script = [
    `$name = '${imageName}';`,
    'for ($i = 0; $i -lt 45; $i++) {',
    '  $proc = Get-Process -Name $name -ErrorAction SilentlyContinue | Select-Object -First 1;',
    '  if ($null -ne $proc) {',
    "    $proc.PriorityClass = 'High';",
    "    Write-Output ('boosted ' + $proc.Id);",
    '    exit 0;',
    '  }',
    '  Start-Sleep -Seconds 1;',
    '}',
    'exit 1',
  ].join(' ');

  try {
    const { stdout } = await execFileAsync('powershell.exe', ['-NoProfile', '-NonInteractive', '-Command', script], {
      windowsHide: true,
      timeout: 60_000,
    });
    logger.debug(`Counter-Strike process priority: ${stdout.trim()}`);
  } catch (error) {
    logger.error('Unable to boost Counter-Strike process priority');
    logger.error(error);
  }
}
