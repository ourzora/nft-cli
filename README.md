# NFT CLI

Access ZORA indexer information from the comfort of your own customized terminal.

Query for collection data en masse with JSON and CSV output for data analysis, armchair understanding, and gallery creation.

### Example Queries:

 * `mints --csv --fields mints.toAddress,mints.tokenId --no-header --collection 0x51f0c1938b0E67CaFC7a6fC8eB6EdD7FDBe002bC --limit 10000 | sort > james-jean-mints.csv`

 * `tokens --collection 0x51f0c1938b0E67CaFC7a6fC8eB6EdD7FDBe002bC --limit 40`

 * `tokens --owner tyson.eth,isiain.eth --limit 10000`

### What powers this?

The backend for this is powered by `https://api.zora.co/graphql`.

