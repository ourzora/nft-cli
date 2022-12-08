# NFT CLI

Access ZORA indexer information from the comfort of your own customized terminal.

Query for collection data en masse with JSON and CSV output for data analysis, armchair understanding, and gallery creation.

### Getting started:

`npx @zoralabs/nft-cli tokens --owner tyson.eth --limit 100`

`npm install --global @zoralabs/nft-cli`

### Example Queries:

 * `@zoralabs/nft-cli mints --csv --fields mints.toAddress,mints.tokenId --no-header --collection 0x51f0c1938b0E67CaFC7a6fC8eB6EdD7FDBe002bC --limit 10000 | sort > james-jean-mints.csv`

 * `@zoralabs/nft-cli nft tokens --collection 0x51f0c1938b0E67CaFC7a6fC8eB6EdD7FDBe002bC --limit 40`

 * `nft tokens --owner tyson.eth,isiain.eth --limit 10000`

 * `nft sales --seller isiain.eth --limit 100`

### What powers this?

The backend for this is powered by `https://api.zora.co/graphql`.
