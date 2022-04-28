import { ZDK } from "@zoralabs/zdk-alpha/dist/src";
import { Chain, Network } from "@zoralabs/zdk-alpha/dist/src/queries/queries-sdk";
import { get, isObject, flatMap } from "lodash";

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

export const networksDefault = [{ network: Network.Ethereum, chain: Chain.Mainnet }];

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
