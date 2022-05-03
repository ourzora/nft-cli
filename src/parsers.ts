import { InvalidArgumentError } from "commander";
import { parseDate } from "chrono-node";

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

export function parseHumanReadableDate(dateString: string, _previous: any): Date {
  const date = parseDate(dateString);
  return date;
}
