import { render, screen } from "@testing-library/react";
import { AgentStateBadge } from "./AgentStateBadge";
import type { AgentState } from "@/lib/api/types/session";

describe("AgentStateBadge", () => {
  const stateLabels: [AgentState, string][] = [
    ["idle", "Ready"],
    ["thinking", "Thinking..."],
    ["analyzing", "Analyzing..."],
    ["researching", "Researching..."],
    ["deep_thinking", "Deep thinking..."],
    ["writing", "Writing..."],
    ["delegating", "Delegating..."],
    ["done", "Done"],
    ["error", "Error"],
  ];

  it.each(stateLabels)("renders '%s' state with label '%s'", (state, label) => {
    render(<AgentStateBadge state={state} />);

    expect(screen.getByText(label)).toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveAttribute("aria-label", `Agent state: ${label}`);
  });

  it("falls back for unknown states", () => {
    render(<AgentStateBadge state={"unknown_state" as AgentState} />);
    expect(screen.getByText("Ready")).toBeInTheDocument();
  });

  it("has correct ARIA role", () => {
    render(<AgentStateBadge state="thinking" />);
    expect(screen.getByRole("status")).toBeInTheDocument();
  });
});
