## 1. Mobile action labels

- [x] 1.1 Add mobile-only short label `Template` next to the icon in `download-template-button.tsx` (`md:hidden`); keep desktop long label; verify below `md` shows icon+Template and at `md+` shows full Spanish label
- [x] 1.2 Same pattern for `Upload` in `sync-button.tsx` (including loading state if needed); verify mobile shows Upload
- [x] 1.3 Same pattern for `New` on the trigger in `nuevo-medicamento-modal.tsx`; verify mobile shows New and the three buttons still fit one row at ~320px width

## 2. CSV upload feedback modal

- [x] 2.1 Replace inline success/error `<p>` in `sync-button.tsx` with dialog state (ok/error) using the existing centered modal pattern; verify no sole feedback remains beside the button
- [x] 2.2 On successful sync, open success modal with inserted count; refresh list only after dismiss; verify message is readable before reload
- [x] 2.3 On upload/sync failure, open error modal with friendly Spanish copy plus expandable technical detail (API error / status); verify known cases (`No autorizado`, parse, network) map to clear friendly text and technical detail reveals the raw error

## 3. Chat TTS opt-in

- [x] 3.1 Remove auto-speak `useEffect` in `chat-sidebar.tsx`; verify a new assistant reply does not start `speechSynthesis` by itself
- [x] 3.2 Add play/stop control on assistant messages (at least latest); hide/disable when `speechSynthesis` unavailable; verify activating play speaks the message and stop cancels utterance

## 4. Smoke check

- [x] 4.1 Manually smoke: mobile labels, upload success modal, forced error modal + detail disclosure, chat reply silent then speak on button; verify no TypeScript/lint errors in touched files
