# Getting started with VSCode

## jest-runner

[jest-runner](https://marketplace.visualstudio.com/items?itemName=firsttris.vscode-jest-runner) VSCode extension allows to Run and Debug single or multiple Jest tests from context-menu.

This repo has yarn pnp configured requiring below additional configuration to be able to run tests.

- Open Settings screen via `Command + Shift + P`
- `Preferences: Open User Settings`
- Search for `jestrunner.` or from the left hand side select `Jest-Runner Config`
- Select `User`
- Disable `Jestrunner: Change Directory To Workspace Root` is not selected
- Enable `Jestrunner: Enable Yarn Pnp Support`
- Set `Jestrunner: Yarn Pnp Command` as `yarn-3.2.0.cjs` and update it whenever there is a new version of the file on `.yarn/releases` folder
