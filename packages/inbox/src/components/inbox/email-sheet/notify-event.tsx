import { NotifyEvent } from "../types";

interface NotifyEventProps {
  event: NotifyEvent;
}

export function NotifyEventComponent({ event }: NotifyEventProps) {
  return <p>{event.message}</p>;
}
