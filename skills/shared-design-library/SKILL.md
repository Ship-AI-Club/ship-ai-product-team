---
name: shared-design-library
description: Load and verify the complete shared design library for Product Designer and Frontend before work.
---

# Shared design library

Use the same actual library for Product Designer, Frontend Engineer and the assigned Cursor Cloud agent.
First check the current project. Reuse its complete, verified files. Never overwrite approved source to repeat setup.
Inside an assigned Cloud run, verify the supplied library before downloading anything again.

1. Download `https://www.shipai.club/hackathon-product-team/kit-archives.json`.
2. Download the team kit at its exact listed URL. Match its filename, byte count and SHA256.
3. Extract into the current participant-owned project. Keep hidden files, references and licenses.
4. Read the kit README, the role instructions and starter/AGENTS.md.
5. In the starter or copied site, verify every path and SHA256 in design-skill-library.json.
6. Use `npm run verify:design` if available. Otherwise audit the complete manifest with a local script.
7. Stop on missing, duplicate, reduced or changed library files. Restore the approved source before work.
8. Copy the complete library and manifests into the actual Cloud repository or upload.
9. Repeat the audit inside Cloud. Save its result as evidence/design-skills.json.
10. Read applicable actual skills and guidance. Record read paths in evidence/design-skills-read.md.

The shared library contains 21 design skill entries and 54 files. YC Interface Craft has seven supplied files.
The library includes Intentional UI Design, Illustration Design Grammar, Emil design engineering, frontend-design, product marketing, copy and conversion guidance.
Use design-skill-library.json for the full list. Preserve every reference, source and license.
Read relevant web guidance; do not load unrelated native-app guidance without a reason.
Keep the full YC research index available and read the matching records.

A link, summary or skill card count does not provide the actual Cloud files.
A file audit proves presence and integrity. It does not prove that an agent read or applied the instructions.
Designer must review the running site and its main task before owner review.
