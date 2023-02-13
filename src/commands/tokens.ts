import {
  SortDirection,
  TokenInput,
  TokenSortInput,
  TokenSortKey,
  TokensQueryInput,
} from "@zoralabs/zdk/dist/queries/queries-sdk";
import { Command } from "commander";
import { commaSeperatedList } from "../parsers";
import { fetchLoop, getZdk, processResult } from "../utils";

const TOKENS_SORT_FIELD_MAP = {
  eth: TokenSortKey.ChainTokenPrice,
  minted: TokenSortKey.Minted,
  price: TokenSortKey.NativePrice,
  none: TokenSortKey.None,
  ending: TokenSortKey.TimedSaleEnding,
  id: TokenSortKey.TokenId,
  transferred: TokenSortKey.Transferred,
};

export function tokensCommand(program: Command) {
  program
    .command("tokens")
    .description("Gets a list of tokens and associated data")
    .option('--api-key <key>', 'API Key for ZDK')
    .option(
      "--owner <owner>",
      "Owned by address (seperate by comma if multiple)",
      commaSeperatedList
    )
    .option(
      "--collection <collection>",
      "Collection address (seperate by comma if multiple)",
      commaSeperatedList
    )
    .option(
      "--token <token>",
      "Token with contract and address seperated by : or -, multiple seperated by comma",
      commaSeperatedList
    )
    .option("--no-header", "No header when using csv export")
    .option("-F, --fields <fields>", "fields to show", commaSeperatedList)
    .option("-l, --limit <limit>", "limit number of results", "100")
    .option("--csv", "print results as csv")
    .option("--count", "Print only result count")
    .option(
      "--sort <sort>",
      `Sort field (accepted: ${Object.keys(TOKENS_SORT_FIELD_MAP).join(", ")})`
    )
    .option("--desc", "Sort descending (default)")
    .option("--asc", "Sort ascending (cannot be specified with desc)")
    .action(async (options) => {
      if (options.desc && options.asc) {
        throw new Error("Cannot use both asc and desc sort options");
      }
      let sort: TokenSortInput = {
        sortDirection: SortDirection.Desc,
        sortKey: TokenSortKey.None,
      };
      if (options.sort) {
        // @ts-ignore
        const sortField = TOKENS_SORT_FIELD_MAP[options.sort];
        if (!sortField) {
          throw new Error("Sort field is invalid");
        }
        sort.sortKey = sortField;
      }
      if (options.asc) {
        sort.sortDirection = SortDirection.Asc;
      }

      let where: TokensQueryInput = {};
      if (options.collection) {
        where.collectionAddresses = options.collection;
      }
      if (options.owner) {
        where.ownerAddresses = options.owner;
      }
      if (options.token) {
        const tokensQuery = options.token.map((token: string) =>
          token.split(/,-/)
        );
        where.tokens = tokensQuery.map(
          (query: string) =>
            ({
              address: query[0],
              tokenId: query[1],
            } as TokenInput)
        );
      }

      const tokensFull = await fetchLoop(async (after, limit) => {
        const result = await getZdk(options.apiKey).tokens({
          pagination: { limit, after },
          where: where,
          filter: {},
          sort: {
            sortDirection: SortDirection.Desc,
            sortKey: TokenSortKey.None,
          },
          includeFullDetails: false,
        });

        return [
          result.tokens.nodes,
          result.tokens.pageInfo.endCursor || undefined,
        ];
      }, options.limit);

      if (options.count) {
        console.log(tokensFull.length);
        return;
      }
      processResult(
        options.fields,
        options.header,
        options.csv ? "csv" : "json"
      )(tokensFull);
    });
}
