import {
  MintSortKey,
  MintSortKeySortInput,
  SortDirection,
} from "@zoralabs/zdk-alpha/dist/src/queries/queries-sdk";
import { Command } from "commander";
import { argumentAsIntDefault, commaSeperatedList, fetchLoop, getZdk, processResult } from "../utils";

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
    .option(
      "-F, --fields <fields>",
      "limit fields to show (useful for csv options)",
      commaSeperatedList
    )
    .option("-l, --limit <limit>", "limit number of results", argumentAsIntDefault(100))
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

      let where: any = {};
      if (options.collection) {
        where.collectionAddresses = options.collection;
      }
      if (options.address) {
        where.minterAddresses = options.address;
      }

      const mintsFull = await fetchLoop(
        async (offset, limit) => {
          const result = await getZdk().mints({
            pagination: { limit: limit, offset },
            where: where,
            filter: {},
            sort: {
              sortDirection: SortDirection.Desc,
              sortKey: MintSortKey.Time,
            },
            includeFullDetails: false,
          });
          return result.mints.nodes;
        },
        options.limit
      );

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
