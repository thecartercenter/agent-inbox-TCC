import { v4 as uuidv4, validate } from "uuid";
import { useToast } from "@/hooks/use-toast";
import { useQueryParams } from "./use-query-params";
import {
  AGENT_INBOX_PARAM,
  AGENT_INBOXES_LOCAL_STORAGE_KEY,
  NO_INBOXES_FOUND_PARAM,
} from "../constants";
import { useLocalStorage } from "./use-local-storage";
import { useState, useCallback, useEffect } from "react";
import { AgentInbox } from "../types";

/**
 * Hook for managing agent inboxes
 *
 * Provides functionality to:
 * - Load agent inboxes from local storage
 * - Add new agent inboxes
 * - Delete agent inboxes
 * - Change the selected agent inbox
 * - Update an existing agent inbox
 *
 * @returns {Object} Object containing agent inboxes and methods to manage them
 */
export function useInboxes() {
  const { getSearchParam, searchParams, updateQueryParams } = useQueryParams();
  const { getItem, setItem } = useLocalStorage();
  const { toast } = useToast();
  const [agentInboxes, setAgentInboxes] = useState<AgentInbox[]>([]);

  const agentInboxParam = searchParams.get(AGENT_INBOX_PARAM);

  /**
   * Load agent inboxes from local storage when component mounts
   * or when the agent inbox parameter changes
   */
  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    try {
      getAgentInboxes();
    } catch (e) {
      console.error("Error occurred while fetching agent inboxes", e);
    }
  }, [agentInboxParam]);

  /**
   * Load agent inboxes from local storage and set up proper selection state
   */
  const getAgentInboxes = useCallback(async () => {
    const agentInboxSearchParam = getSearchParam(AGENT_INBOX_PARAM);
    const agentInboxes = getItem(AGENT_INBOXES_LOCAL_STORAGE_KEY);
    if (!agentInboxes || !agentInboxes.length) {
      updateQueryParams(NO_INBOXES_FOUND_PARAM, "true");
      return;
    }
    let parsedAgentInboxes: AgentInbox[] = [];
    try {
      parsedAgentInboxes = JSON.parse(agentInboxes);
    } catch (error) {
      console.error("Error parsing agent inboxes", error);
      toast({
        title: "Error",
        description: "Agent inbox not found. Please add an inbox in settings.",
        variant: "destructive",
        duration: 3000,
      });
      return;
    }

    if (!parsedAgentInboxes.length) {
      const noInboxesFoundParam = searchParams.get(NO_INBOXES_FOUND_PARAM);
      if (noInboxesFoundParam !== "true") {
        updateQueryParams(NO_INBOXES_FOUND_PARAM, "true");
      }
      return;
    }

    // Ensure each agent inbox has an ID, and if not, add one
    parsedAgentInboxes = parsedAgentInboxes.map((i) => {
      return {
        ...i,
        id: i.id || uuidv4(),
      };
    });

    // If there is no agent inbox search param, or the search param is not
    // a valid UUID, update search param and local storage
    if (!agentInboxSearchParam || !validate(agentInboxSearchParam)) {
      const selectedInbox = parsedAgentInboxes.find((i) => i.selected);
      if (!selectedInbox) {
        parsedAgentInboxes[0].selected = true;
        updateQueryParams(AGENT_INBOX_PARAM, parsedAgentInboxes[0].id);
        setAgentInboxes(parsedAgentInboxes);
        setItem(
          AGENT_INBOXES_LOCAL_STORAGE_KEY,
          JSON.stringify(parsedAgentInboxes)
        );
      } else {
        updateQueryParams(AGENT_INBOX_PARAM, selectedInbox.id);
        setAgentInboxes(parsedAgentInboxes);
        setItem(
          AGENT_INBOXES_LOCAL_STORAGE_KEY,
          JSON.stringify(parsedAgentInboxes)
        );
      }
      return;
    }

    const selectedInbox = parsedAgentInboxes.find(
      (i) =>
        i.id === agentInboxSearchParam || i.graphId === agentInboxSearchParam
    );
    if (!selectedInbox) {
      toast({
        title: "Error",
        description: "Agent inbox not found. Please add an inbox in settings.",
        variant: "destructive",
        duration: 3000,
      });
      return;
    }

    parsedAgentInboxes = parsedAgentInboxes.map((i) => {
      return {
        ...i,
        selected:
          i.id === agentInboxSearchParam || i.graphId === agentInboxSearchParam,
      };
    });
    setAgentInboxes(parsedAgentInboxes);
    setItem(
      AGENT_INBOXES_LOCAL_STORAGE_KEY,
      JSON.stringify(parsedAgentInboxes)
    );
  }, [
    getSearchParam,
    searchParams,
    getItem,
    setItem,
    toast,
    updateQueryParams,
  ]);

  /**
   * Add a new agent inbox
   * @param {AgentInbox} agentInbox - The agent inbox to add
   */
  const addAgentInbox = useCallback(
    (agentInbox: AgentInbox) => {
      const newInbox = {
        ...agentInbox,
        id: agentInbox.id || uuidv4(),
      };

      const agentInboxes = getItem(AGENT_INBOXES_LOCAL_STORAGE_KEY);
      if (!agentInboxes || !agentInboxes.length) {
        setAgentInboxes([newInbox]);
        setItem(AGENT_INBOXES_LOCAL_STORAGE_KEY, JSON.stringify([newInbox]));
        updateQueryParams(AGENT_INBOX_PARAM, newInbox.id);
        return;
      }
      const parsedAgentInboxes = JSON.parse(agentInboxes);
      parsedAgentInboxes.push(newInbox);
      setAgentInboxes(parsedAgentInboxes);
      setItem(
        AGENT_INBOXES_LOCAL_STORAGE_KEY,
        JSON.stringify(parsedAgentInboxes)
      );
      updateQueryParams(AGENT_INBOX_PARAM, newInbox.id);
    },
    [getItem, setItem, updateQueryParams]
  );

  /**
   * Delete an agent inbox by ID
   * @param {string} id - The ID of the agent inbox to delete
   */
  const deleteAgentInbox = useCallback(
    (id: string) => {
      const agentInboxes = getItem(AGENT_INBOXES_LOCAL_STORAGE_KEY);
      if (!agentInboxes || !agentInboxes.length) {
        return;
      }
      const parsedAgentInboxes: AgentInbox[] = JSON.parse(agentInboxes);
      const updatedAgentInboxes = parsedAgentInboxes.filter((i) => i.id !== id);

      if (!updatedAgentInboxes.length) {
        updateQueryParams(NO_INBOXES_FOUND_PARAM, "true");
        setAgentInboxes([]);
        setItem(AGENT_INBOXES_LOCAL_STORAGE_KEY, JSON.stringify([]));
        // Clear all query params
        const url = new URL(window.location.href);
        window.location.href = url.pathname;
        return;
      }

      setAgentInboxes(updatedAgentInboxes);
      setItem(
        AGENT_INBOXES_LOCAL_STORAGE_KEY,
        JSON.stringify(updatedAgentInboxes)
      );
      changeAgentInbox(updatedAgentInboxes[0].id, true);
    },
    [getItem, setItem, updateQueryParams]
  );

  /**
   * Change the selected agent inbox
   * @param {string} id - The ID of the agent inbox to select
   * @param {boolean} replaceAll - Whether to replace all query parameters
   */
  const changeAgentInbox = useCallback(
    (id: string, replaceAll?: boolean) => {
      setAgentInboxes((prev) =>
        prev.map((i) => ({
          ...i,
          selected: i.id === id,
        }))
      );

      const agentInboxes = getItem(AGENT_INBOXES_LOCAL_STORAGE_KEY);
      if (agentInboxes && agentInboxes.length) {
        const parsedAgentInboxes: AgentInbox[] = JSON.parse(agentInboxes);
        const updatedAgentInboxes = parsedAgentInboxes.map((i) => ({
          ...i,
          selected: i.id === id,
        }));
        setItem(
          AGENT_INBOXES_LOCAL_STORAGE_KEY,
          JSON.stringify(updatedAgentInboxes)
        );
      }

      if (!replaceAll) {
        updateQueryParams(AGENT_INBOX_PARAM, id);
      } else {
        const url = new URL(window.location.href);
        const newParams = new URLSearchParams({
          [AGENT_INBOX_PARAM]: id,
        });
        const newUrl = url.pathname + "?" + newParams.toString();
        window.location.href = newUrl;
      }
    },
    [getItem, setItem, updateQueryParams]
  );

  /**
   * Update an existing agent inbox
   * @param {AgentInbox} updatedInbox - The updated agent inbox
   */
  const updateAgentInbox = useCallback(
    (updatedInbox: AgentInbox) => {
      const agentInboxes = getItem(AGENT_INBOXES_LOCAL_STORAGE_KEY);
      if (!agentInboxes || !agentInboxes.length) {
        return;
      }

      const parsedAgentInboxes: AgentInbox[] = JSON.parse(agentInboxes);
      const updatedAgentInboxes = parsedAgentInboxes.map((inbox) =>
        inbox.id === updatedInbox.id
          ? { ...updatedInbox, selected: inbox.selected }
          : inbox
      );

      setAgentInboxes(updatedAgentInboxes);
      setItem(
        AGENT_INBOXES_LOCAL_STORAGE_KEY,
        JSON.stringify(updatedAgentInboxes)
      );
    },
    [getItem, setItem]
  );

  return {
    agentInboxes,
    getAgentInboxes,
    addAgentInbox,
    deleteAgentInbox,
    changeAgentInbox,
    updateAgentInbox,
  };
}
