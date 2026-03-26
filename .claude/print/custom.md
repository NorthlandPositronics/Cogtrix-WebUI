Please thoroughly study Cogtrix project documentation as this project constantly evolves.
The Cogtrix project documentation can be found at: $(git -C .. rev-parse --show-toplevel)/Cogtrix/docs.

Key areas to examine:
- docs/api/openapi.yaml — REST endpoint definitions, request/response schemas
- docs/api/websocket-protocol.md — WebSocket message types and payloads
- $(git -C .. rev-parse --show-toplevel)/Cogtrix/src/api/schemas/ — Pydantic source-of-truth schemas
- $(git -C .. rev-parse --show-toplevel)/Cogtrix/src/api/routes/ — Route handlers (reveal intent beyond schemas)

To detect recent changes, run:
  git -C $(git -C .. rev-parse --show-toplevel)/Cogtrix log --oneline -20
  git -C $(git -C .. rev-parse --show-toplevel)/Cogtrix diff HEAD~5 -- docs/api/ src/api/schemas/ src/api/routes/

Pay extra attention to the API as it's also subject to change even when the OpenAPI version number remains the same.
Treat any field rename, nullability change, new required field, or new endpoint as a potential breaking change.

Based on the detected changes, design and create a plan to support the new API functionality in the Cogtrix WebUI frontend.
Work on this thoroughly — invite all relevant agents (architect, web_coder, web_designer, tester, docs_writer) to review the plan before implementation starts.
As soon as the plan is reviewed and confirmed, begin implementation.
