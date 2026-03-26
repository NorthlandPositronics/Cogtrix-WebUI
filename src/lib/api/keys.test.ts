import { keys } from "./keys";

describe("query key factory", () => {
  it("sessions.list returns deterministic key", () => {
    expect(keys.sessions.list()).toEqual(["sessions", "list", { includeArchived: false }]);
    expect(keys.sessions.list(true)).toEqual(["sessions", "list", { includeArchived: true }]);
  });

  it("sessions.detail includes the session id", () => {
    expect(keys.sessions.detail("abc")).toEqual(["sessions", "abc"]);
  });

  it("messages.list scopes by session id", () => {
    expect(keys.messages.list("s1")).toEqual(["messages", "s1"]);
  });

  it("tools keys are hierarchical", () => {
    expect(keys.tools.catalog()).toEqual(["tools", "catalog"]);
    expect(keys.tools.detail("search")).toEqual(["tools", "search"]);
    expect(keys.tools.session("s1")).toEqual(["tools", "session", "s1"]);
  });

  it("memory key includes session id", () => {
    expect(keys.memory("sess-1")).toEqual(["memory", "sess-1"]);
  });

  it("config/providers/models return stable keys", () => {
    expect(keys.config()).toEqual(["config"]);
    expect(keys.providers()).toEqual(["providers"]);
    expect(keys.models()).toEqual(["models"]);
  });

  it("documents keys are hierarchical", () => {
    expect(keys.documents.list()).toEqual(["documents", "list"]);
    expect(keys.documents.detail("d1")).toEqual(["documents", "d1"]);
  });

  it("assistant keys are hierarchical", () => {
    expect(keys.assistant.status()).toEqual(["assistant", "status"]);
    expect(keys.assistant.chats()).toEqual(["assistant", "chats"]);
    expect(keys.assistant.chatMessages("k1")).toEqual(["assistant", "chats", "k1", "messages"]);
  });
});
