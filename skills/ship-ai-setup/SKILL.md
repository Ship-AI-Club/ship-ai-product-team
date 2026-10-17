---
name: ship-ai-setup
description: Set up a Ship AI product bot with PStack, one saved model choice, a complete skill library and a verified handoff.
---

Use this skill before work in each Ship AI product role.

1. Read the current shared brief. PM asks once for Sonnet 5.5 Medium or Opus 5.5 Medium.
   Sonnet uses tokens conservatively. Opus uses more tokens and can improve output. Quality varies.
   Save setup.buildModel (sonnet-5.5 or opus-5.5) and setup.effort (medium). Other bots reuse it. Do not claim this changes a native bot model without proof.
2. Verify PStack is installed, enabled and usable. Run its actual `setup-pstack` skill.
   Inspect its written model and effort rules. Preserve the owner choice and project scope.
3. Verify this Ship AI plugin's real catalog identity, version and enabled state for this bot.
   A local Cursor folder or a template card is not proof that Grok loaded a plugin.
   If unavailable, report the blocker. Do not claim ready or silently use a small native-card subset.
4. Read `../../role-map.json`. Run `node ../../scripts/verify-plugin.mjs` from this skill folder.
   It verifies the full release file manifest. Save the actual result in project evidence.
5. Read your role skill, `ship-ai-team-workflow`, `workshop-owner-language` and the relevant full skills.
   Follow their references when applicable. Log actual paths read separately from the integrity result.
   All skills remain available; do not load unrelated native-app guidance for an ordinary web task.
6. For a new site, run the plugin's `scripts/prepare-project.mjs --target <new-project-folder>`.
   It copies the starter and all full skills, references, licenses and manifests. It never overwrites a project.
   For an existing project, preserve its source. Add missing files only after a diff; do not overwrite approved work.
7. Engineers use PStack's `create-verification-skill` for the real repo when no suitable project verifier exists.
   Verify actual behavior, not only a successful build. Reuse an existing verifier where appropriate.
   Before any push or deploy trigger, run the repo typecheck where applicable, targeted tests and production build.
   Record exact commands and exit codes. Do not use hosting CI as the first compiler.
8. Frontend starts the approved build in Cursor Cloud with the saved model and Medium effort.
   Verify the actual selector/tool result, run URL, full Cloud file audit and current brief acknowledgment.
   A Cloud agent already in that run implements there. It must not start a nested run.
9. PM records readiness per role: catalog identity, version, installed, enabled, tool-ready, file audit and actual reads.
   Designer reviews the running desktop and phone site and the complete main task before owner review.

Resolve exact catalog and model IDs from real tool results. Never invent them.
If a selected model is unavailable, ask PM for a fallback decision. Do not silently use Auto, Fast or local implementation.
Templates export this getting-started skill, the full profile and the supported PStack and Ship AI integrations.
Recipients use their own logins. Keep secrets, client facts, private chats and unrequested routines out of exports.
