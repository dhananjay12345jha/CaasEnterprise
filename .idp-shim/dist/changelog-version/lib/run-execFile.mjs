import { promisify } from 'util';
import { printError } from './print-error.mjs';
import { execFile } from 'child_process';

const execFilePromise = promisify(execFile);

export async function runExecFile(args, cmd, cmdArgs) {
  if (args.verbose) console.info('exec ' + cmd + ' ' + cmdArgs);
  if (args.dryRun) return;
  try {
    const { stderr, stdout } = await execFilePromise(cmd, cmdArgs);
    // If execFile returns content in stderr, but no error, print it as a warning
    if (stderr) printError(args, stderr, { level: 'warn', color: 'yellow' });
    return stdout;
  } catch (error) {
    // If execFile returns an error, print it and exit with return code 1
    printError(args, error.stderr || error.message);
    throw error;
  }
}
