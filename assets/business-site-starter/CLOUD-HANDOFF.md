# Cursor Cloud build handoff

The Frontend Engineer starts Cursor Cloud automatically for approved website implementation.
Select the saved **Sonnet 5.5 Medium** or **Opus 5.5 Medium** choice in the Cloud run. Do not infer the model from a prompt.
Verify the actual selected model and save the run URL and model evidence for the PM.
If the exact model or Cloud tool is unavailable, report the blocker. Ask before using another model or local implementation.
Reuse the same task's recorded run for feedback and fixes. Do not start duplicate runs.

Copy this entire starter into the participant's project, including hidden `.agents/` and `.cursor/` folders.
Include the approved brief, design handoff, copy, source, lockfile, skill manifests, reference files and licenses.
Exclude secrets, personal context, `node_modules`, `.next` and unrelated client files.
Do not rely on skills installed on another machine.

Include these steps in the actual Cloud agent task:

1. Read AGENTS.md, README.md and the current approved shared brief.
2. Run `npm run verify:design` in the site folder. Stop on failure.
3. Read applicable design and copy skills and their referenced guidance. Record the paths actually read.
4. Preserve the approved business facts, copy, prices, design choice and product scope.
5. Build the approved Home, About and useful visitor journey. Use real evidence for claims.
6. Run `npm run check` and `npm run build`. Run any added checks the implementation needs.
7. Inspect desktop and phone pages and the full keyboard, validation, error, result and reset paths.
8. Ask Product Designer to review the running site. Fix material issues and recheck affected paths.
9. Return source, lockfile, screenshots, actual logs, limitations and the design-read record to the PM.
10. Stop for owner review before deployment or any external sends.

Keep previews unindexed. Never claim that a passing file audit proves design quality or skill use.


## Current handoff

Before launch and after each feedback or scope change, get the current PM brief and approved design/copy handoff. Record their versions, approval state and file hashes in a handoff manifest. Send updated files to the same Cloud run and require acknowledgment of the received versions before further implementation. Recover existing approvals from PM; do not ask the owner to repeat them. An initial upload does not carry later decisions. Distinguish an uploaded archive audit from verification of files inside the live Cloud workspace.


## PStack and model setup

Read ENGINEERING-SETUP.md for the native bot setup. PStack is a plugin, separate from the source design skills.
Run its first-use setup in the coordinating bot and verify the resulting model rule. Preserve the saved Sonnet 5.5 Medium or Opus 5.5 Medium choice. Do not change unrelated global settings.
A Cloud agent already assigned this repository implements the handoff here; it must not start another Cloud agent.
Keep the PM brief, generated site contract and current design/copy handoff aligned by version and hash.
