import { ZDK } from "@zoralabs/zdk-alpha/dist/src";
import {
  Chain,
  Network,
} from "@zoralabs/zdk-alpha/dist/src/queries/queries-sdk";
import { InvalidArgumentError } from "commander";
import { get, isObject, flatMap } from "lodash";
// @ts-ignore
import Gauge from "gauge";
import { PAGE_LIMIT } from "./constants";

// from stackoverflow
const getSchema: any = (val: any, keys = []) =>
  isObject(val) // if it's an object or array
    ? flatMap(val, (v, k) => getSchema(v, [...keys, k])) // iterate it and call fn with the value and the collected keys
    : keys.join("."); // return the joined keys

export function getZdk() {
  return new ZDK();
}

export function commaSeperatedList(value: string, _previous: any) {
  return value.split(",");
}

export function argumentAsIntDefault(defaultInt: number) {
  return (value: string, _previous: any) => {
    if (!value) {
      return defaultInt;
    }
    // parseInt takes a string and a radix
    const parsedValue = parseInt(value, 10);
    if (isNaN(parsedValue)) {
      throw new InvalidArgumentError("Not a number.");
    }
    return parsedValue;
  };
}

export const networksDefault = [
  { network: Network.Ethereum, chain: Chain.Mainnet },
];

export async function fetchLoop<T>(
  fetchFn: (offset: number, limit: number) => Promise<T[]>,
  userLimit: number,
  maxLimit = 10000
) {
  let mintsFull: T[] = [];
  let mintsPage: T[] = [];

  const gauge = new Gauge();

  gauge.setTemplate([
    {
      type: "activityIndicator",
      kerning: 1,
      length: 1,
    },
    {
      type: "section",
      kerning: 1,
      default: "",
    },
    {
      type: "subsection",
      kerning: 1,
      default: "",
    },
  ]);

  let pageCount = 1;

  const pulseInterval = setInterval(() => {
    gauge.pulse(`Fetched ${mintsFull.length} records...`);
    gauge.show(`Downloading page #${pageCount}.`);
  }, 200);

  gauge.show("Fetching...");

  const fullLimit = Math.min(userLimit, maxLimit);
  let offset = 0;
  do {
    mintsPage = await fetchFn(offset, Math.min(fullLimit, PAGE_LIMIT));
    pageCount += 1;
    mintsFull = mintsFull.concat(mintsPage);
    offset = mintsFull.length;
  } while (mintsPage.length > 0 && mintsFull.length <= fullLimit);

  clearInterval(pulseInterval);
  gauge.hide();

  return mintsFull;
}

export function processResult(
  fields: string[] = [],
  header: boolean,
  type: "csv" | "json"
) {
  return <R>(results: R[]) => {
    const newResults = results.map((result) => {
      if (fields.length === 0) {
        return result;
      }
      let resultItem: any = {};
      fields.forEach((field) => {
        const fieldItem = get(result, field);
        resultItem[field] = fieldItem;
      });
      return resultItem;
    });
    if (type == "csv") {
      if (header) {
        if (!fields.length && newResults.length > 0) {
          fields = getSchema(newResults[0]);
        }
        if (fields) {
          console.log(fields.join(","));
        }
      }
      newResults.forEach((result: any) => {
        console.log(fields.map((field) => get(result, field)).join(","));
      });
    } else {
      console.log(JSON.stringify(newResults, null, 2));
    }
  };
}
