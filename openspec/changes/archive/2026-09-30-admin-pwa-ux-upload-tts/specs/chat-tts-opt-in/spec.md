## Purpose

Lets users hear assistant chat replies with Web Speech Synthesis only when they choose to, instead of auto-playing every response.

## ADDED Requirements

### Requirement: No automatic speech of assistant replies

The chat UI MUST NOT automatically start text-to-speech when a new assistant message finishes. Assistant replies SHALL remain readable as text without audio unless the user opts in.

#### Scenario: New assistant reply stays silent by default

- **WHEN** the assistant finishes a reply and the user has not activated playback
- **THEN** the browser does not speak that reply automatically

### Requirement: Opt-in playback control

The chat UI SHALL provide a control on assistant messages (at least the latest completed reply) that starts speech synthesis of that message’s text when activated. When speech synthesis is unavailable in the browser, the control SHALL be hidden or disabled.

#### Scenario: User plays assistant reply

- **WHEN** an assistant message with content is visible and the user activates the play/speak control
- **THEN** the system speaks that message’s text via speech synthesis

#### Scenario: User can stop playback

- **WHEN** speech is playing and the user activates stop (or equivalent)
- **THEN** speech synthesis stops for that utterance
