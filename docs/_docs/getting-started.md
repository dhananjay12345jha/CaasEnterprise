# Getting started

## nodejs

Install [nvm](https://github.com/nvm-sh/nvm#installing-and-updating) for your OS.

This repo requires Node v16 for build purposes (you can use webpack or esbuild targets for node14 lambdas etc)

Its's set in the root nvmrc, and the pipelines read this too

ensure you run

```bash
nvm use
```

## yarn

Install [yarn](https://yarnpkg.com/getting-started/install) globally for your OS.

## internal developer platform access

Some package dependencies are hosted in the projects own artefact repository hosted in AWS. The package names match `@everymile-ipd/*`. To access these packages for download by yarn:

Set up your AWS profile by creating a file in `~/.aws/config` with the contents

```bash
[profile everymile]
sso_start_url = https://d-936771f334.awsapps.com/start
sso_region = eu-west-1
sso_account_id = 116517182856
sso_role_name = AWSReadOnlyAccess
region = eu-west-1
output = json
```

Finally, log in to the idp

```bash
aws sso login --profile everymile
```

## test your set up

From the root of this repo. you should see no errors when running

```bash
yarn && yarn affected:lint --all
```

and you should see no change to your git working tree (from a clean checkout) when running

```bash
# note the _ prefix of the workspaces task is intended
yarn _workspaces format:write
```
