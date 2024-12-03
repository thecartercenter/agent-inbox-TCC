import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Settings } from "lucide-react";
import { useLocalStorage } from "../hooks/use-local-storage";
import React from "react";
import {
  GRAPH_ID_LOCAL_STORAGE_KEY,
  STUDIO_URL_LOCAL_STORAGE_KEY,
} from "../constants";
import { useToast } from "@/hooks/use-toast";
import { PillButton } from "@/components/ui/pill-button";

export function SettingsPopover() {
  const { toast } = useToast();
  const { setItem, getItem } = useLocalStorage();

  const [deploymentUrl, setDeploymentUrl] = React.useState("");
  const [graphId, setGraphId] = React.useState("");

  const [open, setOpen] = React.useState(false);

  React.useEffect(() => {
    if (typeof window === "undefined") return;

    if (!deploymentUrl) {
      const url = getItem(STUDIO_URL_LOCAL_STORAGE_KEY);
      setDeploymentUrl(url || "");
    }

    if (!graphId) {
      const idLocalStorage = getItem(GRAPH_ID_LOCAL_STORAGE_KEY);
      if (idLocalStorage) {
        setGraphId(idLocalStorage || "");
      } else {
        if (!open) {
          // Open the settings popover if graphId is not set
          setOpen(true);
        }
      }
    }
  }, [open]);

  const handleSubmit = (
    e:
      | React.MouseEvent<HTMLButtonElement, MouseEvent>
      | React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();
    if (!graphId) {
      toast({
        title: "Graph ID is required.",
        description: "Please enter a Graph ID to continue.",
        variant: "destructive",
      });
      return;
    }

    setItem(GRAPH_ID_LOCAL_STORAGE_KEY, graphId);
    setItem(STUDIO_URL_LOCAL_STORAGE_KEY, deploymentUrl);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <PillButton
          variant="outline"
          className="flex gap-2 items-center justify-center text-gray-800"
          size="lg"
        >
          <Settings />
          <span>Settings</span>
        </PillButton>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <div className="grid gap-4">
          <div className="space-y-2">
            <h4 className="font-medium leading-none">Settings</h4>
            <p className="text-sm text-muted-foreground">
              Configuration settings for Agent Inbox
            </p>
          </div>
          <form
            onSubmit={handleSubmit}
            className="flex flex-col items-start gap-4 w-full"
          >
            <div className="flex flex-col gap-4 items-start w-full">
              <div className="flex flex-col gap-2 items-start w-full">
                <Label htmlFor="graph-id" className="px-1">
                  Graph ID <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="graph-id"
                  placeholder="agent"
                  className="w-full"
                  value={graphId}
                  onChange={(e) => setGraphId(e.target.value)}
                />
              </div>
              <div className="flex flex-col gap-2 items-start w-full">
                <Label htmlFor="deployment-url" className="px-1">
                  LangGraph Deployment URL
                </Label>
                <Input
                  id="deployment-url"
                  placeholder="https://my-app.langgraph.app"
                  className="w-full"
                  value={deploymentUrl}
                  onChange={(e) => setDeploymentUrl(e.target.value)}
                />
              </div>
            </div>
            <div className="flex w-full justify-end">
              <Button type="submit" size="sm" onClick={handleSubmit}>
                Save
              </Button>
            </div>
          </form>
        </div>
      </PopoverContent>
    </Popover>
  );
}
