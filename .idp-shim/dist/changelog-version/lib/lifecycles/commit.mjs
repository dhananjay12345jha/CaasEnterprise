import { Bump } from '../lifecycles/bump.mjs';
import { checkpoint } from '../checkpoint.mjs';
import { formatCommitMessage } from '../format-commit-message.mjs';
import path from 'path';
import { runExecFile } from '../run-execFile.mjs';

export async function Commit(args, newVersion) {
  if (args.skip.commit) return;
  let msg = 'committing %s';
  let paths = [];
  const verify = args.verify === false || args.n ? ['--no-verify'] : [];
  const sign = args.sign ? ['-S'] : [];
  const toAdd = [];

  // only start with a pre-populated paths list when CHANGELOG processing is not skipped
  paths = [args.infile];
  toAdd.push(args.infile);

  // commit any of the config files that we've updated
  // the version # for.
  Object.keys(Bump.getUpdatedConfigs(args)).forEach(function (p) {
    paths.unshift(p);
    toAdd.push(path.relative(process.cwd(), p));

    // account for multiple files in the output message
    if (paths.length > 1) {
      msg += ' and %s';
    }
  });

  if (args.commitAll) {
    msg += ' and %s';
    paths.push('all staged files');
  }

  checkpoint(args, msg, paths);

  // nothing to do, exit without commit anything
  if (toAdd.length === 0) {
    return;
  }

  await runExecFile(args, 'git', ['add'].concat(toAdd));
  await runExecFile(
    args,
    'git',
    ['commit'].concat(verify, sign, args.commitAll ? [] : toAdd, [
      '-m',
      `${formatCommitMessage(args.releaseCommitMessageFormat, newVersion)}`,
    ])
  );
}
