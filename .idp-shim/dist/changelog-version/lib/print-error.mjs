import chalk from 'chalk';

export function printError(args, msg, opts) {
  console.info(
    'printError ' +
      JSON.stringify(args) +
      ' ' +
      JSON.stringify(msg) +
      ' ' +
      JSON.stringify(opts)
  );
  if (!args.silent) {
    opts = Object.assign(
      {
        level: 'error',
        color: 'red',
      },
      opts
    );

    console[opts.level](chalk[opts.color](msg));
  }
}
