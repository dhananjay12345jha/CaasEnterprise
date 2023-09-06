import chalk from 'chalk';
import { checkpoint } from '../checkpoint.mjs';
import conventionalChangelog from 'conventional-changelog';
import fs from 'fs';
import { presetLoader } from '../preset-loader.mjs';
import { writeFile } from '../write-file.mjs';
const START_OF_LAST_RELEASE_PATTERN =
  /(^#+ \[?[0-9]+\.[0-9]+\.[0-9]+|<a name=)/m;

Changelog.START_OF_LAST_RELEASE_PATTERN = START_OF_LAST_RELEASE_PATTERN;

export async function Changelog(args, newVersion) {
  if (args.skip.changelog) return;
  return new Promise((resolve, reject) => {
    createIfMissing(args);
    const header = args.header;

    let oldContent = args.dryRun ? '' : fs.readFileSync(args.infile, 'utf-8');
    const oldContentStart = oldContent.search(START_OF_LAST_RELEASE_PATTERN);
    // find the position of the last release and remove header:
    if (oldContentStart !== -1) {
      oldContent = oldContent.substring(oldContentStart);
    }
    let content = '';
    const context = { version: newVersion };
    if (args.verbose)
      console.info('parserOpts=' + JSON.stringify(args.parserOpts));
    const changelogStream = conventionalChangelog(
      {
        debug:
          args.verbose && console.info.bind(console, 'conventional-changelog'),
        preset: presetLoader(args),
        tagPrefix: args.tagPrefix,
      },
      context,
      args.gitRawCommitsOpts,
      args.parserOpts,
      args.writerOpts
    ).on('error', function (err) {
      return reject(err);
    });

    changelogStream.on('data', function (buffer) {
      content += buffer.toString();
    });

    changelogStream.on('end', function () {
      checkpoint(args, 'outputting changes to %s', [args.infile]);
      if (args.dryRun)
        console.info(`\n---\n${chalk.gray(content.trim())}\n---\n`);
      else
        writeFile(
          args,
          args.infile,
          header + '\n' + (content + oldContent).replace(/\n+$/, '\n')
        );
      return resolve();
    });
  });
}

function createIfMissing(args) {
  try {
    fs.accessSync(args.infile, fs.F_OK);
  } catch (err) {
    if (err.code === 'ENOENT') {
      checkpoint(args, 'created %s', [args.infile]);
      args.outputUnreleased = true;
      writeFile(args, args.infile, '\n');
    }
  }
}
