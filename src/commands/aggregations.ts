import { Command } from "commander";
import { commaSeperatedList } from "../parsers";
import { getZdk, networksDefault } from "../utils";

export function aggregationCommands(program: Command) {
  program
    .command("count")
    .argument(
      "<collection>",
      "Gets the count for number of nfts within a collection",
      commaSeperatedList
    )
    .action(async (collection) => {
      const count = await getZdk().nftCount({
        where: { collectionAddresses: collection },
        networks: networksDefault,
      });
      console.log(count.aggregateStat.nftCount);
    });

  program
    .command("floor")
    .description("Gets the floor for a given collection on the ZORA protocol")
    .argument("<collection>")
    .action(async (collection) => {
      const count = await getZdk().floorPrice({
        where: { collectionAddresses: collection },
        networks: networksDefault,
      });
      console.log(count.aggregateStat.floorPrice);
    });
}
