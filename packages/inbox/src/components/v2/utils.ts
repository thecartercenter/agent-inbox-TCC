import { startCase } from "lodash";

export function prettifyText(action: string) {
  return startCase(action.replace(/_/g, " "));
}
