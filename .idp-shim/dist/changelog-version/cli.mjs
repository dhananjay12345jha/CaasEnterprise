#!/usr/bin/env node

import { changelogVersion } from './index.mjs';
import { defaults } from './defaults.mjs';
import meow from 'meow';
import path from 'path';
import _ from 'lodash';

const cli = meow(
  `
    Usage
        changelogRelease --config changelog.config.js

    Example
        changelogRelease 

    Options
        -i  --infile            Read the CHANGELOG from this file

            --packageFiles      User-defined files where versions can be read from _and_ be "bumped".
                                Examples: package.json, manifest.json

            --bumpFiles         User-defined files where versions should be "bumped", but not explicitly read from.
                                Examples: package-lock.json, npm-shrinkwrap.json

        -s, --sign              Should the git commit and tag be signed?

        -n, --no-verify         Bypass pre-commit or commit-msg git hooks during the commit phase

        -a, --commit-all        Commit all staged changes, not just files affected by this cli

        -p, --prerelease        make a pre-release with optional option value to specify a tag id
      
        -r, --release-as        Specify the release type manually (like npm version <major|minor|patch>)

        -v, --verbose           Verbose output. Use this for debugging
                                Default: false

            --slient            Don't print logs and errors

        -c, --config            A filepath of your config script
                                Example of a config script: https://github.com/conventional-changelog/conventional-changelog/blob/master/packages/conventional-changelog-cli/test/fixtures/config.js

            --dry-run           See the commands that running standard-version would run
            
            --skip              Map of steps in the release process that should be skipped

            --git-tag-fallback  fallback to git tags for version, if no meta-information file is found (e.g., package.json)
`,
  {
    importMeta: import.meta,
    booleanDefault: undefined,
    flags: {
      config: {
        alias: 'c',
        type: 'string',
      },
      infile: {
        alias: 'i',
        type: 'string',
      },
      prerelease: {
        alias: 'p',
        type: 'string',
      },
      'release-as': {
        alias: 'r',
        type: 'string',
      },
      sign: {
        alias: 's',
        type: 'boolean',
      },
      'no-verify': {
        alias: 'n',
        type: 'boolean',
      },
      'commit-all': {
        alias: 'a',
        type: 'boolean',
      },
      verbose: {
        alias: 'v',
        type: 'boolean',
      },
    },
  }
);

const flags = cli.flags;
let options = Object.assign({}, defaults, flags);

if (flags.verbose) {
  options.debug = console.info.bind(console);
  options.warn = console.warn.bind(console);
}

let configPath;
try {
  if (flags.config) {
    configPath = path.resolve(process.cwd(), flags.config);
    const config = await import(configPath);
    options = _.merge(options, config.default);
  }
} catch (err) {
  console.error('Failed to get config file. ' + configPath + ' ' + err);
  process.exit(1);
}

changelogVersion(options).catch(() => {
  process.exit(1);
});
