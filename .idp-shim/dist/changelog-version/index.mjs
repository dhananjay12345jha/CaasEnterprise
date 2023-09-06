import { Bump } from './lib/lifecycles/bump.mjs';
import { Changelog } from './lib/lifecycles/changelog.mjs';
import { Commit } from './lib/lifecycles/commit.mjs';
import { Tag } from './lib/lifecycles/tag.mjs';
import { resolveUpdaterObjectFromArgument } from './lib/updaters/index.mjs';
import path from 'path';
import fs from 'fs';
import { latestSemverTag } from './lib/latest-semver-tag.mjs';
import { printError } from './lib/print-error.mjs';

export async function changelogVersion(options) {
  if (options.verbose)
    console.info('changeVersion argc=' + JSON.stringify(options));

  let pkg;
  for (const packageFile of options.packageFiles) {
    const updater = resolveUpdaterObjectFromArgument(packageFile);
    if (!updater) continue;
    const pkgPath = path.resolve(process.cwd(), updater.filename);
    try {
      const contents = fs.readFileSync(pkgPath, 'utf8');
      pkg = {
        version: updater.updater.readVersion(contents),
        private:
          typeof updater.updater.isPrivate === 'function'
            ? updater.updater.isPrivate(contents)
            : false,
      };
      break;
    } catch (err) {
      if (!options.silent && options.verbose) console.log(err);
    }
  }

  try {
    let version;
    if (pkg) {
      version = pkg.version;
    } else if (options.gitTagFallback) {
      version = latestSemverTag(options.tagPrefix);
    } else {
      throw new Error('no package file found');
    }

    const newVersion = await Bump(options, version);
    await Changelog(options, newVersion);
    await Commit(options, newVersion);
    await Tag(newVersion, pkg ? pkg.private : false, options);
  } catch (err) {
    printError(options, err.message);
    throw err;
  }
}
