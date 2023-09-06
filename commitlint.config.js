module.exports = {
  extends: ["@commitlint/config-conventional"],
  parserPreset: {
    parserOpts: {
        headerPattern: /^(Merged PR \d+:)?(.*):\s(\w*)(?:\((.*)\))?!?:\s(.*)$/,
        breakingHeaderPattern: /^(Merged PR \d+:)?(.*):\s(\w*)(?:\((.*)\))?!:\s(.*)$/,
        headerCorrespondence: [ 'prefix', 'ticket', 'type', 'scope', 'subject' ],
        noteKeywords: [ 'BREAKING CHANGE', 'BREAKING-CHANGE' ],
        revertPattern: /^(?:Revert|revert:)\s"?([\s\S]+?)"?\s*This reverts commit (\w*)\./i,
        revertCorrespondence: [ 'header', 'hash' ],
        issuePrefixes: [ 'WCAAS-' ],
    }
  },
  'references-empty': [2, 'never'],

  plugins: [
    {
      rules: {
        "header-match-pattern": (parsed) => {
          const { ticket, type, subject } = parsed;
          if (ticket === null && type === null && subject === null) {
            return [
              false,
              "header must be in format 'ticket: type(scope?): subject'",
            ];
          }
          return [true, ""];
        },
        "ticket-empty": (parsed, when = 'always') => {
          const { ticket } = parsed;
          const negated = when === 'never';
          if (!ticket && negated) {
            return [false, `ticket may not be empty`,];
          }
          return [true, ""];
        },
        "ticket-enum": (parsed, when = 'always', expectedValues) => {
          const { ticket } = parsed;
          const negated = when === 'never';
          if (!negated && !expectedValues.some((element) => { return new RegExp(element).test(ticket) })) {
            return [false, `ticket must match one of ${JSON.stringify(expectedValues)}`,];
          }
          return [true, ""];
        },
      },
    },
  ],
  rules: {
    "header-match-pattern": [2, "always"],
    "ticket-empty": [2, "never"],
    "ticket-enum": [2, "always", ['WCAAS-[0-9]{3,}', 'NOSTORY']],
    "footer-max-line-length": [1, "always"],
  },
};
