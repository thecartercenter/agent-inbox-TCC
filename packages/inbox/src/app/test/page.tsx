"use client";

import { Button } from "@/components/ui/button";
import { StateView } from "@/components/v2/state-view";
import { useState } from "react";

export default function Test() {
  const testObject = {
    stringValue: "Hello World",
    numberValue: 42,
    booleanValue: true,
    nullValue: null,
    dateValue: new Date("2024-03-20T15:30:00"),
    simpleArray: ["item1", 2, true],
    nestedArray: [
      ["nested", "array"],
      [1, 2, 3],
      [true, false],
    ],
    complexObject: {
      name: "Test User",
      age: 25,
      isActive: false,
      metadata: {
        lastLogin: new Date("2024-03-19T10:00:00"),
        preferences: {
          theme: "dark",
          notifications: true,
        },
      },
    },
    // Edge cases
    emptyArray: [],
    emptyObject: {},
    specialCharacters: "!@#$%^&*()",
    veryLongString:
      "This is a very long string that might need special handling".repeat(10),
    invalidDate: new Date("invalid"),
    mixedArray: [
      1,
      "string",
      { key: "value" },
      new Date("2024-03-20"),
      null,
      undefined,
    ],
  };

  const [expandAll, setExpandAll] = useState(true);

  return (
    <div className="flex flex-col gap-1 mx-auto p-16 max-w-[500px]">
      <Button onClick={() => setExpandAll((prev) => !prev)}>
        {expandAll ? "Collapse" : "Expand"} all
      </Button>
      {Object.entries(testObject).map(([key, value], idx) => (
        <StateView
          expanded={expandAll}
          key={`state-view-${idx}`}
          keyName={key}
          value={value}
        />
      ))}
    </div>
  );
}
