"use client";

import { useParams } from "next/navigation";

export default function ThreadViewPage() {
  const params = useParams();
  const threadId = params.threadId as string;

  return <div>Thread ID: {threadId}</div>;
}
