export function EmailRenderer({ values }: { values: Record<string, any> }) {
  if (!values) {
    return null;
  }

  return (
    <div className="flex flex-col gap-1 items-start text-sm text-gray-500 border-t-[1px] pt-3">
      <p className="text-gray-700">
        <strong className="text-gray-500">Subject: </strong>
        {values.subject}
      </p>
      <p className="w-full text-pretty text-gray-700">
        <strong className="text-gray-500">From: </strong>
        {values.from_email}
      </p>
      <p className="w-full text-pretty text-gray-700">{values.page_content}</p>
    </div>
  );
}
