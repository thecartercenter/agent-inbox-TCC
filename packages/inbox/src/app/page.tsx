import { columns } from "@/components/inbox/columns";
import { DataTable } from "@/components/inbox/data-table";
import { Email } from "@/components/inbox/types";
import { TighterText } from "@/components/ui/header";
import { getDummyEmails } from "@/lib/dummy";

async function getData(): Promise<Email[]> {
  // Fetch data from your API here.
  return getDummyEmails();
}

export default async function DemoPage() {
  const data = await getData();

  return (
    <div className="container mx-auto py-10 max-h-screen overflow-hidden">
      <div className="my-5 p-1">
        <TighterText className="text-3xl font-medium">Agent Inbox</TighterText>
      </div>
      <DataTable columns={columns} data={data} />
    </div>
  );
}
