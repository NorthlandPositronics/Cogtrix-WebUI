import React from "react";
import { mount } from "cypress/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router-dom";
import { TooltipProvider } from "../../src/components/ui/tooltip";

export function mountWithProviders(component: React.ReactElement) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return mount(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <TooltipProvider>{component}</TooltipProvider>
      </MemoryRouter>
    </QueryClientProvider>,
  );
}
