import { Client } from "@langchain/langgraph-sdk";

export const createClient = ({
  deploymentUrl,
  langchainApiKey,
}: {
  deploymentUrl: string;
  langchainApiKey: string;
}) => {
  // const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000/api";
  return new Client({
    apiUrl: deploymentUrl,
    defaultHeaders: {
      "x-api-key": langchainApiKey,
      // "DEPLOYMENT-URL": deploymentUrl,
      // "LANGCHAIN-API-KEY": langchainApiKey,
    },
  });
};
