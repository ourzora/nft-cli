import { ZDK } from "@zoralabs/zdk";
import {
  Chain,
  Network,
} from "@zoralabs/zdk/dist/queries/queries-sdk";
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

export const networksDefault = [
  { network: Network.Ethereum, chain: Chain.Mainnet },
];

export async function fetchLoop<T>(
  fetchFn: (after: string | undefined, limit: number) => Promise<[T[], string | undefined]>,
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
  let last: string | undefined;
  do {
    // @ts-ignore
    const [mintsPage, endCursor] = await fetchFn(last, Math.min(fullLimit, PAGE_LIMIT));
    pageCount += 1;
    mintsFull = mintsFull.concat(mintsPage);
    last = endCursor;
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
        console.log(
          fields
            .map((field) => {
              const fieldResult = get(result, field);
              if (typeof fieldResult === "string") {
                return `"${fieldResult}"`;
              }
              return fieldResult;
            })
            .join(",")
        );
      });
    } else {
      console.log(JSON.stringify(newResults, null, 2));
    }
  };
}
