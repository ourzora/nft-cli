import {
  SaleSortKey,
  SaleSortKeySortInput,
  SalesQueryFilter,
  SalesQueryInput,
  SortDirection,
  TokenInput,
} from "@zoralabs/zdk-alpha/dist/src/queries/queries-sdk";
import { Command } from "commander";
import { commaSeperatedList, parseHumanReadableDate } from "../parsers";
import { fetchLoop, getZdk, processResult } from "../utils";

const SALES_SORT_FIELD_MAP = {
  eth: SaleSortKey.EthPrice,
  price: SaleSortKey.NativePrice,
  time: SaleSortKey.Time,
  none: SaleSortKey.None,
};

export function salesCommand(program: Command) {
  program
    .command("sales")
    .description("Gets a list of sales for given tokens")
    .option(
      "--seller <seller>",
      "Seller address (seperate by comma if multiple)",
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
    .option("--before <before>", "Before date", parseHumanReadableDate)
    .option("--after <after>", "After date", parseHumanReadableDate)
    .option(
      "--sort <sort>",
      `Sort field (accepted: ${Object.keys(SALES_SORT_FIELD_MAP).join(", ")})`
    )
    .option("--desc", "Sort descending (default)")
    .option("--asc", "Sort ascending (cannot be specified with desc)")
    .action(async (options) => {
      if (options.desc && options.asc) {
        throw new Error("Cannot use both asc and desc sort options");
      }
      let sort: SaleSortKeySortInput = {
        sortDirection: SortDirection.Desc,
        sortKey: SaleSortKey.None,
      };
      if (options.sort) {
        // @ts-ignore
        const sortField = SALES_SORT_FIELD_MAP[options.sort];
        if (!sortField) {
          throw new Error("Sort field is invalid");
        }
        sort.sortKey = sortField;
      }
      if (options.asc) {
        sort.sortDirection = SortDirection.Asc;
      }

<<<<<<< HEAD
      const where: SalesQueryInput = {};
=======
      let where: SalesQueryInput = {};
      let filter: SalesQueryFilter = {};
>>>>>>> origin/main
      if (options.collection) {
        where.collectionAddresses = options.collection;
      }
      if (options.seller) {
        where.sellerAddresses = options.seller;
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

      const filter: SalesQueryFilter = {};
      if (options.before || options.after) {
        filter.timeFilter = {};
        // date only
        if (options.before) {
          filter.timeFilter.endDate = options.before.toISOString().slice(0, 10); 
        }
        if (options.after) {
          filter.timeFilter.startDate = options.after.toISOString().slice(0, 10);
        }
      }

      const salesFull = await fetchLoop(async (offset, limit) => {
        const result = await getZdk().sales({
          pagination: { limit: Math.min(limit, 200), offset },
          where: where,
          filter: filter,
          sort: {
            sortDirection: SortDirection.Desc,
            sortKey: SaleSortKey.None,
          },
          includeFullDetails: false,
        });
        return result.sales.nodes;
      }, options.limit);

      if (options.count) {
        console.log(salesFull.length);
        return;
      }
      processResult(
        options.fields,
        options.header,
        options.csv ? "csv" : "json"
      )(salesFull);
    });
}
