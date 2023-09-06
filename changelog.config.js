const parserOpts = {
  headerPattern: /^(Merged PR \d+:)?(.*):\s(\w*)(?:\((.*)\))?!?:\s(.*)$/,
  breakingHeaderPattern: /^(Merged PR \d+:)?(.*):\s(\w*)(?:\((.*)\))?!:\s(.*)$/,
  headerCorrespondence: ['prefix', 'ticket', 'type', 'scope', 'subject'],
  noteKeywords: ['BREAKING CHANGE', 'BREAKING-CHANGE'],
  revertPattern:
    /^(?:Revert|revert:)\s"?([\s\S]+?)"?\s*This reverts commit (\w*)\./i,
  revertCorrespondence: ['header', 'hash'],
  issuePrefixes: ['WCAAS-'],
};

module.exports = {
  header:
    '# Changelog\n\nAll notable changes to this project will be documented in this file. See [conventional-changelog](https://github.com/conventional-changelog) for commit guidelines.\n',
  parserOpts: parserOpts,
  recommendedBumpOpts: {
    whatBump: (commits) => {
      return whatBump(commits);
    },
  },
  releaseCommitMessageFormat:
    'NOSTORY: chore(release): {{currentTag}} [skip ci]',
  writerOpts: {
    groupBy: 'type',
    commitsSort: ['scope', 'subject'],
    noteGroupsSort: 'title',
    mainTemplate:
      '{{> header}}\n\n{{#if noteGroups}}\n{{#each noteGroups}}\n\n### ⚠ {{title}}\n\n{{#each notes}}\n* {{#if commit.scope}}**{{commit.scope}}:** {{/if}}{{text}}\n{{/each}}\n{{/each}}\n{{/if}}\n{{#each commitGroups}}\n\n{{#if title}}\n### {{title}}\n\n{{/if}}\n{{#each commits}}\n{{> commit root=@root}}\n{{/each}}\n\n{{/each}}\n',
    headerPartial:
      '{{#if isPatch~}}\n  ###\n{{~else~}}\n  ##\n{{~/if}} {{#if @root.linkCompare~}}\n  [{{version}}]({{~@root.host}}/{{#if this.owner}}{{~this.owner}}{{else}}{{~@root.owner}}{{/if}}/{{#if this.repository}}{{~this.repository}}{{else}}{{~@root.repository}}{{/if}}/branchCompare?baseVersion=GT{{previousTag}}&targetVersion=GT{{currentTag}})\n{{~else}}\n  {{~version}}\n{{~/if}}\n{{~#if title}} "{{title}}"\n{{~/if}}\n{{~#if date}} ({{date}})\n{{/if}}\n',
    commitPartial:
      '*{{#if scope}} **{{scope}}:**\n{{~/if}} {{#if subject}}\n  {{~subject}}\n{{~else}}\n  {{~header}}\n{{~/if}}\n\n{{~!-- commit link --}}{{~#if hash}} {{#if @root.linkReferences~}}\n  ([{{shortHash}}]({{~@root.host}}/{{#if this.owner}}{{~this.owner}}{{else}}{{~@root.owner}}{{/if}}/{{#if this.repository}}{{~this.repository}}{{else}}{{~@root.repository}}{{/if}}/commit/{{raw.hash}}))\n{{~else}}\n  {{~shortHash}}\n{{~/if}}{{~/if}}\n\n{{~!-- commit references --}}\n{{~#if references~}}\n  , closes\n  {{~#each references}} {{#if @root.linkReferences~}}\n    [\n    {{~#if this.owner}}\n      {{~this.owner}}/\n    {{~/if}}\n    {{~this.repository}}{{this.prefix}}{{this.issue}}](https://jira.salmon.com/browse/{{this.prefix}}{{this.issue}})\n  {{~else}}\n    {{~#if this.owner}}\n      {{~this.owner}}/\n    {{~/if}}\n    {{~this.repository}}{{this.prefix}}{{this.issue}}\n  {{~/if}}{{/each}}\n{{~/if}}\n\n',
    footerPartial: '',
    reverse: false,
    doFlush: true,
  },
};

function whatBump(commits) {
  let level = 2;
  let breakings = 0;
  let features = 0;

  commits.forEach((commit) => {
    // adds additional breaking change notes
    // for the special case, test(system)!: hello world, where there is
    // a '!' but no 'BREAKING CHANGE' in body:
    addBangNotes(commit);
    if (commit.notes.length > 0) {
      breakings += commit.notes.length;
      level = 0;
    } else if (commit.type === 'feat' || commit.type === 'feature') {
      features += 1;
      if (level === 2) {
        level = 1;
      }
    }
  });

  return {
    level: level,
    reason:
      breakings === 1
        ? `There is ${breakings} BREAKING CHANGE and ${features} features`
        : `There are ${breakings} BREAKING CHANGES and ${features} features`,
  };
}
function addBangNotes(commit) {
  const match = commit.header.match(parserOpts.breakingHeaderPattern);
  if (match && commit.notes.length === 0) {
    const noteText = match[3]; // the description of the change.
    commit.notes.push({
      text: noteText,
    });
  }
}
