## ADDED Requirements

### Requirement: Gemini model id is configurable via environment
The system SHALL resolve the Gemini model identifier used for chat, security classification, and description enrichment from the environment variable `GEMINI_CHAT_MODEL`.

#### Scenario: Env var set to a model id
- **WHEN** `GEMINI_CHAT_MODEL` is set to a non-empty value (after trim)
- **THEN** all Gemini calls that use `GEMINI_CHAT_MODEL` SHALL use that value as the model id

#### Scenario: Env var missing or blank
- **WHEN** `GEMINI_CHAT_MODEL` is unset, empty, or whitespace-only
- **THEN** the system SHALL use the default model id `gemini-flash-lite-latest`

### Requirement: Model env is documented for operators
The project SHALL document `GEMINI_CHAT_MODEL` in `web/.env.example` with the default model id as the example value.

#### Scenario: Operator configures local env
- **WHEN** an operator copies `web/.env.example`
- **THEN** they SHALL see `GEMINI_CHAT_MODEL` listed next to other Google AI settings
