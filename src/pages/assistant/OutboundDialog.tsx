import { useState, type FormEvent } from "react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { Send, Loader2 } from "lucide-react";
import { api } from "@/lib/api/client";
import type { OutboundRequest, OutboundResponse } from "@/lib/api/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const CHANNEL_AUTO = "__auto__";

export function OutboundDialog() {
  const [open, setOpen] = useState(false);
  const [contactName, setContactName] = useState("");
  const [instructions, setInstructions] = useState("");
  const [channel, setChannel] = useState(CHANNEL_AUTO);

  // Fire-and-forget: the outbound endpoint triggers delivery, not a queryable resource.
  const sendMutation = useMutation({
    mutationFn: (body: OutboundRequest) => api.post<OutboundResponse>("/assistant/outbound", body),
    onSuccess: (data) => {
      toast.success(`Message sent to ${data.contact_name}`);
      toast.info(data.response_text, { duration: 6000 });
      handleClose(false);
    },
    onError: () => {
      toast.error("Failed to send outbound message");
    },
  });

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const body: OutboundRequest = {
      contact_name: contactName.trim(),
      instructions: instructions.trim(),
      channel: channel === CHANNEL_AUTO ? null : (channel as "whatsapp" | "telegram"),
    };
    sendMutation.mutate(body);
  }

  function handleClose(next: boolean) {
    if (!next) {
      setOpen(false);
      setContactName("");
      setInstructions("");
      setChannel(CHANNEL_AUTO);
      sendMutation.reset();
    } else {
      setOpen(true);
    }
  }

  const isSubmitDisabled = sendMutation.isPending || !contactName.trim() || !instructions.trim();

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogTrigger asChild>
        <Button size="sm" className="gap-1.5" data-cy="outbound-trigger">
          <Send className="h-4 w-4" />
          Send message
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Send outbound message</DialogTitle>
          <DialogDescription>
            Instruct the assistant to initiate a conversation with a contact.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="outbound-contact">Contact name</Label>
            <Input
              id="outbound-contact"
              value={contactName}
              onChange={(e) => setContactName(e.target.value)}
              placeholder="e.g. John Doe"
              required
              disabled={sendMutation.isPending}
              autoComplete="off"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="outbound-instructions">Instructions</Label>
            <Textarea
              id="outbound-instructions"
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              placeholder="Describe what the assistant should say or accomplish…"
              required
              disabled={sendMutation.isPending}
              rows={4}
              className="resize-none"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="outbound-channel">Channel</Label>
            <Select value={channel} onValueChange={setChannel} disabled={sendMutation.isPending}>
              <SelectTrigger id="outbound-channel" className="min-h-11">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={CHANNEL_AUTO}>Auto (default)</SelectItem>
                <SelectItem value="whatsapp">WhatsApp</SelectItem>
                <SelectItem value="telegram">Telegram</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleClose(false)}
              disabled={sendMutation.isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitDisabled} data-cy="outbound-submit">
              {sendMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Send"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default OutboundDialog;
