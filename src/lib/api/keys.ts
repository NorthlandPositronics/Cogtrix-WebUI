export const keys = {
  sessions: {
    all: ["sessions"] as const,
    list: (includeArchived = false) => [...keys.sessions.all, "list", { includeArchived }] as const,
    detail: (id: string) => [...keys.sessions.all, id] as const,
  },
  messages: {
    all: ["messages"] as const,
    list: (sessionId: string) => [...keys.messages.all, sessionId] as const,
  },
  memory: (sessionId: string) => ["memory", sessionId] as const,
  tools: {
    all: ["tools"] as const,
    catalog: () => [...keys.tools.all, "catalog"] as const,
    detail: (name: string) => [...keys.tools.all, name] as const,
    session: (sessionId: string) => [...keys.tools.all, "session", sessionId] as const,
  },
  config: () => ["config"] as const,
  providers: () => ["providers"] as const,
  models: () => ["models"] as const,
  mcpServers: () => ["mcp-servers"] as const,
  apiKeys: () => ["api-keys"] as const,
  documents: {
    all: ["documents"] as const,
    list: () => [...keys.documents.all, "list"] as const,
    detail: (id: string) => [...keys.documents.all, id] as const,
  },
  systemInfo: () => ["system-info"] as const,
  workflows: {
    all: ["workflows"] as const,
    list: () => [...keys.workflows.all, "list"] as const,
    detail: (id: string) => [...keys.workflows.all, id] as const,
    documents: (id: string) => [...keys.workflows.all, id, "documents"] as const,
    bindings: () => [...keys.workflows.all, "bindings"] as const,
  },
  users: {
    all: ["users"] as const,
    list: () => [...keys.users.all, "list"] as const,
    detail: (id: string) => [...keys.users.all, id] as const,
  },
  assistant: {
    status: () => ["assistant", "status"] as const,
    chats: (channel?: string) =>
      channel ? (["assistant", "chats", { channel }] as const) : (["assistant", "chats"] as const),
    chatMessages: (key: string) => ["assistant", "chats", key, "messages"] as const,
    scheduled: (filters?: { channel?: string; chat_id?: string }) =>
      filters && (filters.channel || filters.chat_id)
        ? (["assistant", "scheduled", filters] as const)
        : (["assistant", "scheduled"] as const),
    deferred: (channel?: string) =>
      channel
        ? (["assistant", "deferred", { channel }] as const)
        : (["assistant", "deferred"] as const),
    contacts: () => ["assistant", "contacts"] as const,
    knowledge: (source_chat?: string) =>
      source_chat
        ? (["assistant", "knowledge", { source_chat }] as const)
        : (["assistant", "knowledge"] as const),
    guardrails: () => ["assistant", "guardrails"] as const,
    campaigns: {
      all: ["assistant", "campaigns"] as const,
      list: (status?: string) =>
        status
          ? (["assistant", "campaigns", "list", { status }] as const)
          : (["assistant", "campaigns", "list"] as const),
      detail: (id: string) => ["assistant", "campaigns", id] as const,
    },
  },
} as const;
