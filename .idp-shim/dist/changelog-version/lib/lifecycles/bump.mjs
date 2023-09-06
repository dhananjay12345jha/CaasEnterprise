import chalk from 'chalk';
import { checkpoint } from '../checkpoint.mjs';
import conventionalRecommendedBump from 'conventional-recommended-bump';
import figures from 'figures';
import fs from 'fs';
import DotGitignore from 'dotgitignore';
import path from 'path';
import semver from 'semver';
import { writeFile } from '../write-file.mjs';
import { resolveUpdaterObjectFromArgument } from '../updaters/index.mjs';
let configsToUpdate = {};

export async function Bump(args, version) {
  // reset the cache of updated config files each
  // time we perform the version bump step.
  configsToUpdate = {};

  if (args.skip.bump) return version;
  let newVersion = version;
  const release = await bumpVersion(args.releaseAs, version, args);
  if (args.verbose && release.reason) console.log(`Reason: ${release.reason}`);

  if (!args.firstRelease) {
    const releaseType = getReleaseType(
      args.prerelease,
      release.releaseType,
      version
    );
    if (args.verbose) console.log(`releaseType: ${releaseType}`);
    newVersion =
      semver.valid(releaseType) ||
      semver.inc(version, releaseType, args.prerelease);
    if (args.verbose) console.log(`newVersion: ${newVersion}`);
    updateConfigs(args, newVersion);
  } else {
    checkpoint(
      args,
      'skip version bump on first release',
      [],
      chalk.red(figures.cross)
    );
  }
  return newVersion;
}

Bump.getUpdatedConfigs = function (args) {
  for (const packageFile of args.packageFiles) {
    const updater = resolveUpdaterObjectFromArgument(packageFile);
    if (!updater) return;
    const pkgPath = path.resolve(process.cwd(), updater.filename);
    try {
      const contents = fs.readFileSync(pkgPath, 'utf8');
      configsToUpdate[updater.filename] = true;
      break;
    } catch (err) {
      if (!args.silent && args.verbose) console.log(err);
    }
  }
  return configsToUpdate;
};

function getReleaseType(prerelease, expectedReleaseType, currentVersion) {
  if (isString(prerelease)) {
    if (isInPrerelease(currentVersion)) {
      if (
        shouldContinuePrerelease(currentVersion, expectedReleaseType) ||
        getTypePriority(getCurrentActiveType(currentVersion)) >
          getTypePriority(expectedReleaseType)
      ) {
        return 'prerelease';
      }
    }

    return 'pre' + expectedReleaseType;
  } else {
    return expectedReleaseType;
  }
}

function isString(val) {
  return typeof val === 'string';
}

/**
 * if a version is currently in pre-release state,
 * and if it current in-pre-release type is same as expect type,
 * it should continue the pre-release with the same type
 *
 * @param version
 * @param expectType
 * @return {boolean}
 */
function shouldContinuePrerelease(version, expectType) {
  return getCurrentActiveType(version) === expectType;
}

function isInPrerelease(version) {
  return Array.isArray(semver.prerelease(version));
}

const TypeList = ['major', 'minor', 'patch'].reverse();

/**
 * extract the in-pre-release type in target version
 *
 * @param version
 * @return {string}
 */
function getCurrentActiveType(version) {
  const typelist = TypeList;
  for (let i = 0; i < typelist.length; i++) {
    if (semver[typelist[i]](version)) {
      return typelist[i];
    }
  }
}

/**
 * calculate the priority of release type,
 * major - 2, minor - 1, patch - 0
 *
 * @param type
 * @return {number}
 */
function getTypePriority(type) {
  return TypeList.indexOf(type);
}

function bumpVersion(releaseAs, currentVersion, args) {
  return new Promise((resolve, reject) => {
    if (releaseAs) {
      return resolve({
        releaseType: releaseAs,
      });
    } else {
      if (typeof presetOptions === 'object') {
        if (semver.lt(currentVersion, '1.0.0')) presetOptions.preMajor = true;
      }
      conventionalRecommendedBump(
        {
          config: args,
        },
        {
          debug:
            args.verbose &&
            console.info.bind(console, 'conventional-recommended-bump'),
          path: args.path,
          tagPrefix: args.tagPrefix,
          lernaPackage: args.lernaPackage,
        },
        function (err, release) {
          if (err) return reject(err);
          else return resolve(release);
        }
      );
    }
  });
}

/**
 * attempt to update the version number in provided `bumpFiles`
 * @param args config object
 * @param newVersion version number to update to.
 * @return void
 */
function updateConfigs(args, newVersion) {
  const dotgit = DotGitignore();
  args.bumpFiles.forEach(function (bumpFile) {
    const updater = resolveUpdaterObjectFromArgument(bumpFile);
    if (!updater) {
      return;
    }
    const configPath = path.resolve(process.cwd(), updater.filename);
    try {
      if (dotgit.ignore(configPath)) return;
      const stat = fs.lstatSync(configPath);

      if (!stat.isFile()) return;
      const contents = fs.readFileSync(configPath, 'utf8');
      checkpoint(
        args,
        'bumping version in ' + updater.filename + ' from %s to %s',
        [updater.updater.readVersion(contents), newVersion]
      );
      writeFile(
        args,
        configPath,
        updater.updater.writeVersion(contents, newVersion)
      );
      // flag any config files that we modify the version # for
      // as having been updated.
      configsToUpdate[updater.filename] = true;
    } catch (err) {
      if (err.code !== 'ENOENT') console.warn(err.message);
    }
  });
}
