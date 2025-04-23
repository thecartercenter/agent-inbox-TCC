import { ThreadData } from "../types";

// InterruptDetailsView component
export function InterruptDetailsView({
  threadData,
}: {
  threadData: ThreadData<any>;
}) {
  return (
    <div className="flex flex-col h-full w-full">
      <h3 className="text-sm font-medium mb-4">Interrupt Details</h3>
      <div className="p-4 border rounded bg-gray-50 overflow-x-auto flex-grow">
        {threadData.thread.interrupts &&
        Object.entries(threadData.thread.interrupts).length > 0 ? (
          Object.entries(threadData.thread.interrupts).map(
            ([interruptId, values]) => (
              <div key={interruptId} className="flex flex-col gap-4 mb-4">
                <div className="flex flex-col space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-700 whitespace-nowrap">
                      Interrupt ID:
                    </span>
                    <code className="px-2 py-1 bg-gray-100 rounded text-xs font-mono overflow-x-auto max-w-full">
                      {interruptId}
                    </code>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="font-medium text-gray-700 whitespace-nowrap">
                      Value:
                    </span>
                    <code className="px-2 py-1 bg-gray-100 rounded text-xs font-mono overflow-x-auto break-all">
                      {values[0]?.value === undefined ||
                      values[0]?.value === null
                        ? "null"
                        : typeof values[0]?.value === "boolean"
                          ? String(values[0]?.value)
                          : JSON.stringify(values[0]?.value)}
                    </code>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-700 whitespace-nowrap">
                      Created At:
                    </span>
                    <span className="text-xs">
                      {new Date(threadData.thread.created_at).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            )
          )
        ) : (
          <div className="text-gray-500 text-sm">
            No interrupt data available
          </div>
        )}
      </div>
    </div>
  );
}
