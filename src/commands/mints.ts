import {
  MintSortKey,
  MintSortKeySortInput,
  MintsQueryFilter,
  MintsQueryInput,
  SortDirection,
} from "@zoralabs/zdk/dist/queries/queries-sdk";
import { Command } from "commander";
import {
  argumentAsIntDefault,
  commaSeperatedList,
  parseHumanReadableDate,
} from "../parsers";
import { fetchLoop, getZdk, processResult } from "../utils";

const MINTS_SORT_FIELD_MAP = {
  time: MintSortKey.Time,
  id: MintSortKey.TokenId,
  price: MintSortKey.Price,
  none: MintSortKey.None,
};

export function mintsCommand(program: Command): void {
  program
    .command("mints")
    .description("Gets a list of mints and associated information")
    .option(
      "--address <address>",
      "Mints for a given address",
      commaSeperatedList
    )
    .option(
      "--collection <collection>",
      "Mints for a given collection",
      commaSeperatedList
    )
    .option("--no-header", "No header when using csv export")
    .option(
      "--sort <sort>",
      `Sort field (accepted: ${Object.keys(MINTS_SORT_FIELD_MAP).join(", ")})`
    )
    .option("--desc", "Sort descending (default)")
    .option("--asc", "Sort ascending (cannot be specified with desc)")
    .option("--before <before>", "Before date", parseHumanReadableDate)
    .option("--after <after>", "After date", parseHumanReadableDate)
    .option(
      "-F, --fields <fields>",
      "limit fields to show (useful for csv options)",
      commaSeperatedList
    )
    .option(
      "-l, --limit <limit>",
      "limit number of results",
      argumentAsIntDefault(200)
    )
    .option("--csv", "print results as csv")
    .option("--count", "print results count only")
    .action(async (options) => {
      if (options.desc && options.asc) {
        throw new Error("Cannot use both asc and desc sort options");
      }
      let sort: MintSortKeySortInput = {
        sortDirection: SortDirection.Desc,
        sortKey: MintSortKey.None,
      };
      if (options.sort) {
        // @ts-ignore
        const sortField = MINTS_SORT_FIELD_MAP[options.sort];
        if (!sortField) {
          throw new Error("Sort field is invalid");
        }
        sort.sortKey = sortField;
      }
      if (options.asc) {
        sort.sortDirection = SortDirection.Asc;
      }

      let where: MintsQueryInput = {};
      if (options.collection) {
        where.collectionAddresses = options.collection;
      }
      if (options.address) {
        where.minterAddresses = options.address;
      }

      let filter: MintsQueryFilter = {};
      if (options.before || options.after) {
        filter.timeFilter = {};
        // date only
        if (options.before) {
          filter.timeFilter.endDate = options.before.toISOString().slice(0, 10);
        }
        if (options.after) {
          filter.timeFilter.startDate = options.after
            .toISOString()
            .slice(0, 10);
        }
      }

      const mintsFull = await fetchLoop(async (after, limit) => {
        const result = await getZdk().mints({
          pagination: { limit: limit, after },
          where: where,
          filter: {},
          sort: {
            sortDirection: SortDirection.Desc,
            sortKey: MintSortKey.Time,
          },
          includeFullDetails: false,
        });
        return [
          result.mints.nodes,
          result.mints.pageInfo.endCursor || undefined,
        ];
      }, options.limit);

      if (options.count) {
        console.log(mintsFull.length);
        return;
      }

      processResult(
        options.fields,
        options.header,
        options.csv ? "csv" : "json"
      )(mintsFull);
    });
}
