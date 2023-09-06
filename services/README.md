# Mocks

This is a "mocks of", not a "mocks for" structure, i.e. if brand-config requires a dynamodb mock:

We have a mock of dynamodb, with a brand-config flavour (path: services/dynamodb/brand-config) and not a mock for brand-config (e.g. /services/brand-config/dynamodb)

This is important, as this allows for us to mock in both senses. If something else in the repo (e.g. region-controller) actually does require a mock of brand-config then ./services/brand-config is legitimate, and if we need a flavour of brand-config for regions-controller, then ./services/brand-config/region-controller is the right way to go.
