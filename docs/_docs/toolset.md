# Toolset

## git

- Standard toolset
- Remotes in AzureDevOps Repos

### hooks

- See Husky

## yarn

- workspaces in package.json
- PnP/Zero Installs/cache check in
- versioning -tbd
- package resolution

## nx

- build orchestration tool
- workspaces
- affected graph

## sls

- Serverless v3
- variable rendering
- offline

## husky

- commit-msg
- pre-commit
- pre-push

### commitlint

- custom validator for Project Jira number and AzureDevops Merged headers

### lint-staged

- globally installed (along with prettier)
- scoped rc file to workspaces

## AzureDevOps

- build pipeline runner, task execution runner
- should not conflict (or overlap) with nx managed orchestration

### Pipelines

- ci.yml - Push and PR validation auto trigger
- cdel.yml - auto trigger merge to develop/main validation and deployment to dev/integ
- mdep.yml - manual trigger deploy to qa1

### Pull Requests

- Template provided
- COATD (WTC Engineering Charter)
- Speed is not the most important thing here, high-confidence in not breaking the target is

### Releases and Versioning

- prerelease to Dev? final release in main? TBD
- conventional commits
- conventional change log
- sematic release or yarn version TBD

## AWS

- Node Module Artefact store
- AWS sso login to internal developer platform
- AzureDevOps IAM management
