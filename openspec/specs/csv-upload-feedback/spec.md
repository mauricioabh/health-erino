# csv-upload-feedback Specification

## Purpose

Presents CSV upload and sync outcomes in a clear modal so users understand success or failure without relying on a tiny inline message next to the button.

## Requirements

### Requirement: Success feedback in a modal

After a successful CSV upload and sync, the system SHALL show a modal (or equivalent dialog) with a clear success message that includes how many medications were inserted. The message SHALL NOT appear only as inline text beside the upload button.

#### Scenario: Successful upload shows modal with insert count

- **WHEN** the user uploads a valid CSV and sync completes successfully
- **THEN** a modal displays a success message including the inserted count
- **AND** the inline-only success text beside the upload button is not the sole feedback

#### Scenario: Success modal dismiss then refresh

- **WHEN** the user dismisses the success modal after a successful sync
- **THEN** the medicamentos list reflects the synced data (e.g. page refresh or equivalent update)

### Requirement: Error feedback in a modal with technical detail

When CSV upload or sync fails, the system SHALL show a modal with a user-friendly Spanish explanation of the failure. The modal SHALL provide a control (disclosure, button, or equivalent) to reveal the technical error detail (e.g. API error string and/or status). The message SHALL NOT appear only as inline text beside the upload button.

#### Scenario: Failed upload or sync shows friendly modal

- **WHEN** upload or sync returns an error (including auth or parse failures)
- **THEN** a modal shows a friendly explanation suitable for an end user

#### Scenario: User reveals technical error detail

- **WHEN** an error modal is visible and the user activates the technical-detail control
- **THEN** the modal shows the technical error text from the failure response (or equivalent detail)
