import type { ReactNode } from "react";
import { AlertTriangle, MessageCircle, Users } from "lucide-react";
import { useContactsQuery } from "@/hooks/assistant/useContactsQuery";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface ChannelConfig {
  label: string;
  icon: ReactNode;
}

const CHANNEL_CONFIG: Record<string, ChannelConfig> = {
  whatsapp: {
    label: "WhatsApp",
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true" fill="#25D366">
        <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.867-2.031-.967-.272-.099-.47-.148-.669.15-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.605.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
      </svg>
    ),
  },
  telegram: {
    label: "Telegram",
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true" fill="#2AABEE">
        <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
      </svg>
    ),
  },
};

function ChannelIcon({ channel }: { channel: string }) {
  const key = channel.toLowerCase();
  const config = CHANNEL_CONFIG[key];
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span className="inline-flex cursor-default">
          {config ? (
            config.icon
          ) : (
            <MessageCircle className="h-5 w-5 text-zinc-400" aria-hidden="true" />
          )}
        </span>
      </TooltipTrigger>
      <TooltipContent>{config?.label ?? channel}</TooltipContent>
    </Tooltip>
  );
}

export function ContactList() {
  const { data: contacts, isLoading, isError, refetch } = useContactsQuery();

  return isError ? (
    <div className="flex flex-col items-center gap-3 py-16 text-center">
      <AlertTriangle className="h-12 w-12 text-red-600" strokeWidth={1.5} />
      <p className="text-sm text-red-600">Failed to load contacts.</p>
      <Button variant="outline" size="sm" onClick={() => void refetch()}>
        Retry
      </Button>
    </div>
  ) : isLoading ? (
    <div className="space-y-2">
      {Array.from({ length: 5 }).map((_, i) => (
        <Skeleton key={i} className="h-10 w-full" />
      ))}
    </div>
  ) : contacts && contacts.length > 0 ? (
    <div className="overflow-x-auto rounded-xl border border-zinc-200">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="text-xs font-medium tracking-wide text-zinc-500 uppercase">
              Name
            </TableHead>
            <TableHead className="text-xs font-medium tracking-wide text-zinc-500 uppercase">
              Identifiers
            </TableHead>
            <TableHead className="text-xs font-medium tracking-wide text-zinc-500 uppercase">
              Channels
            </TableHead>
            <TableHead className="text-xs font-medium tracking-wide text-zinc-500 uppercase">
              Filter
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {contacts.map((contact) => {
            const channels = contact.channels ?? [];
            return (
              <TableRow key={contact.name} className="hover:bg-zinc-50">
                <TableCell className="font-medium text-zinc-900">{contact.name}</TableCell>
                <TableCell className="font-mono text-sm text-zinc-600">
                  <TooltipProvider>
                    {contact.identifiers.length <= 2 ? (
                      contact.identifiers.join(", ")
                    ) : (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span className="cursor-default">
                            {contact.identifiers.slice(0, 2).join(", ")}
                            <span className="ml-1 text-xs text-zinc-500">
                              +{contact.identifiers.length - 2} more
                            </span>
                          </span>
                        </TooltipTrigger>
                        <TooltipContent>
                          <div className="space-y-0.5 text-xs">
                            {contact.identifiers.map((id) => (
                              <p key={id} className="font-mono">
                                {id}
                              </p>
                            ))}
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    )}
                  </TooltipProvider>
                </TableCell>
                <TableCell>
                  <TooltipProvider>
                    <div className="flex items-center gap-2">
                      {channels.length > 0 ? (
                        channels.map((ch) => <ChannelIcon key={ch} channel={ch} />)
                      ) : (
                        <span className="text-sm text-zinc-500">—</span>
                      )}
                    </div>
                  </TooltipProvider>
                </TableCell>
                <TableCell className="text-sm text-zinc-600">
                  {contact.filter_mode ?? "none"}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  ) : (
    <div className="flex flex-col items-center gap-3 py-16 text-center">
      <Users className="h-12 w-12 text-zinc-400" strokeWidth={1.5} />
      <p className="text-sm text-zinc-500">No contacts found.</p>
    </div>
  );
}

export default ContactList;
