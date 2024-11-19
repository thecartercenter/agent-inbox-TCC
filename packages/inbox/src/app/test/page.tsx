import { ToolCallTable } from "@/components/v2/components/tool-call-table";

export default function Test() {
  return (
    <div className="w-full p-16 mx-auto">
      <ToolCallTable
        toolCall={{
          name: "question_tool",
          id: "123",
          args: {
            key_one: "Value one",
            key_two: 2,
            key_three: {
              key_four: "Value four",
              key_five: "Value five",
            },
            key_five: ["Value six", "Value seven"],
          },
        }}
      />
    </div>
  );
}
