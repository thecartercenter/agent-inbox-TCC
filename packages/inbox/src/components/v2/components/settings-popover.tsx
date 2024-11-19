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
import { STUDIO_URL_LOCAL_STORAGE_KEY } from "../constants";

export function SettingsPopover() {
  const [deploymentUrl, setDeploymentUrl] = React.useState("");
  const [open, setOpen] = React.useState(false);
  const { setItem, getItem } = useLocalStorage();

  React.useEffect(() => {
    if (typeof window === "undefined" || deploymentUrl) return;
    const url = getItem(STUDIO_URL_LOCAL_STORAGE_KEY);
    setDeploymentUrl(url || "");
  }, [open]);

  const handleSubmit = (
    e:
      | React.MouseEvent<HTMLButtonElement, MouseEvent>
      | React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();
    console.log("Before save");
    setItem(STUDIO_URL_LOCAL_STORAGE_KEY, deploymentUrl);
    console.log("after save");
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline">
          <Settings className="w-4 h-4" />
        </Button>
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
