import { Bump } from '../lifecycles/bump.mjs';
import chalk from 'chalk';
import { checkpoint } from '../checkpoint.mjs';
import figures from 'figures';
import { formatCommitMessage } from '../format-commit-message.mjs';
import { runExecFile } from '../run-execFile.mjs';

export async function Tag(newVersion, pkgPrivate, args) {
  if (args.skip.tag) return;
  let tagOption;
  if (args.sign) {
    tagOption = '-s';
  } else {
    tagOption = '-a';
  }
  checkpoint(args, 'tagging release %s%s', [args.tagPrefix, newVersion]);
  await runExecFile(args, 'git', [
    'tag',
    tagOption,
    args.tagPrefix + newVersion,
    '-m',
    `${formatCommitMessage(args.releaseCommitMessageFormat, newVersion)}`,
  ]);
  const currentBranch = await runExecFile('', 'git', [
    'rev-parse',
    '--abbrev-ref',
    'HEAD',
  ]);
  let message = 'git push --follow-tags origin ' + currentBranch.trim();
  if (pkgPrivate !== true && Bump.getUpdatedConfigs(args)['package.json']) {
    message += ' && npm publish';
    if (args.prerelease !== undefined) {
      if (args.prerelease === '') {
        message += ' --tag prerelease';
      } else {
        message += ' --tag ' + args.prerelease;
      }
    }
  }

  checkpoint(args, 'Run `%s` to publish', [message], chalk.blue(figures.info));
}
