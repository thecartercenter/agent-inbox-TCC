import { ToolCall } from "@langchain/core/messages/tool";

export function mapToolCallToString(toolCall: ToolCall): string {
  switch (toolCall.name) {
    case "NewEmailDraft":
      const recipientsString =
        toolCall.args.recipients.length &&
        `Recipients: ${toolCall.args.recipients.join(", ")}\n\n`;
      return `${recipientsString}${toolCall.args.content}`;
    case "ResponseEmailDraft":
      const newRecipientsString =
        toolCall.args.new_recipients.length &&
        `Recipients: ${toolCall.args.new_recipients.join(", ")}\n\n`;
      return `${newRecipientsString}${toolCall.args.content}`;
    case "Question":
      return toolCall.args.content;
    default:
      return `Unknown tool call: ${toolCall.name}`;
  }
}

export function mapToolCallNameToString(toolCall: ToolCall): string {
  switch (toolCall.name) {
    case "NewEmailDraft":
      return "New Email Draft";
    case "ResponseEmailDraft":
      return "Response Email Draft";
    case "Question":
      return "Question";
    default:
      return `Unknown`;
  }
}
