import { Command } from "commander";
import { aggregationCommands } from "./commands/aggregations";
import { mintsCommand } from "./commands/mints";
import { salesCommand } from "./commands/sales";
import { tokensCommand } from "./commands/tokens";
import { ownersCommand } from "./commands/owners";

const program = new Command();

aggregationCommands(program);
mintsCommand(program);
tokensCommand(program);
salesCommand(program);
ownersCommand(program);

program
  .name("nft-api")
  .description("CLI to fetch NFT information from ZORA")
  .version("0.0.1");

program.parse();
