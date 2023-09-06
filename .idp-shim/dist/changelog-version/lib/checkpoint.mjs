import chalk from 'chalk';
import figures from 'figures';
import util from 'util';

export function checkpoint(argv, msg, args, figure) {
  if (argv.verbose) console.info('checkpoint msg=' + msg);
  const defaultFigure = argv.dryRun
    ? chalk.yellow(figures.tick)
    : chalk.green(figures.tick);
  if (!argv.silent) {
    console.info(
      (figure || defaultFigure) +
        ' ' +
        util.format.apply(
          util,
          [msg].concat(
            args.map(function (arg) {
              return chalk.bold(arg);
            })
          )
        )
    );
  }
}
