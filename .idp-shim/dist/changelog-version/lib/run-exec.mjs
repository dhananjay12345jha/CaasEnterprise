import { promisify } from 'util';
import { printError } from './print-error.mjs';
import { exec } from 'child_process';

const execPromise = promisify(exec);

export async function runExec(args, cmd) {
  if (args.verbose) console.info('exec ' + cmd);
  if (args.dryRun) return;
  try {
    const { stderr, stdout } = await execPromise(cmd);
    // If exec returns content in stderr, but no error, print it as a warning
    if (stderr) printError(args, stderr, { level: 'warn', color: 'yellow' });
    return stdout;
  } catch (error) {
    // If exec returns an error, print it and exit with return code 1
    printError(args, error.stderr || error.message);
    throw error;
  }
}
