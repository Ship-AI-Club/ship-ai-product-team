# Ship AI Product Team

Practical AI, Built Together.

Install PStack first. Then install this plugin through a supported Grok Bot marketplace or dashboard.
Use the same release for Product Manager, Product Researcher, Product Designer, Frontend Engineer and Backend Engineer.
Start with Product Manager. It asks once which model builds the website: Sonnet 5.5 Medium for conservative token use, or Opus 5.5 Medium for higher token use and potentially better output. The answer is saved as `setup.siteBuildModel` / `setup.siteBuildEffort` (Fast off). Marketing creative work uses the separate `setup.creativeBuildModel` / `setup.creativeBuildEffort` slot (default `claude-sonnet-5-5`, medium).
Answer the three business questions. PM owns the one brief and the one project and coordinates the team. The owner never runs commands or passes messages between bots, and first sees a polished draft.
First-time owners get that draft in brief `mode: "review"`: their answers plus recommendations marked `proposed` with a source and rationale, never an invented approval and never a real business disguised as `isDemo`. Review drafts are noindex and cannot be deployed or published. Production and publication still require the owner's final approvals (`npm run verify:production`, `npm run verify:publish`).

The plugin includes full skill files and references. It does not claim that a prompt alone installs a plugin.
Skills are available on demand. `role-map.json` gives required and conditional reading and the design precedence: YC Interface Craft leads direction (SKILL.md plus 3-5 matching records), Intentional UI Design sets the quality floor, frontend-design guides composition and type; illustration, motion and component skills load only when the design needs them.
The starter is a neutral technical shell with a placeholder page. `ship-ai-design-gate` turns the brief into a one-page design contract, then blocks expansion until separate design and marketing reviewers pass real desktop and phone renders of the hero and first proof section, and again for the full site. A real (non-demo) `npm run build` fails without the contract and a Gate 1 PASS.
Workshop language rules cover owner messages and interface help only. Site and marketing copy follow the approved business voice.
Designer and Frontend share the same complete design files. Frontend starts the approved build in Cursor Cloud.
The selected model, current brief, hidden source skills and actual Cloud file audit must be verified.

`npm run test:browser` prepares the starter and submits every visitor form in headless Chrome with JavaScript disabled; answers must never reach a URL or request, and review drafts send nothing.
Run `node scripts/verify-plugin.mjs` to check this release. It fails on any changed file or broken internal skill or file link.
Maintainers run `node scripts/build-release-manifest.mjs` after editing files.
Only the PM runs `node scripts/prepare-project.mjs --target /absolute/path/to/new-project`, once, to prepare the Next.js source.
The target must be empty or absent. No source is overwritten.
Then run the project's checks and build. The design gate, not the file checks, decides visual quality.
Integrity checks prove bytes, not skill use or visual quality. Save read logs and browser review separately.

## Distribution

This is an Agent Plugins package with root `plugin.json`. Grok Bot needs catalog/dashboard installation.
Copying it into a local Cursor plugin folder does not prove Grok installation.
Official public marketplace listing requires vendor review. Do not insert a made-up catalog ID into templates.
PStack, native plugin installation, authentication and the Cloud workspace are separate checks.

## Sources and licenses

`sources.json` records pinned upstream sources. `licenses/` preserves supplied notices.
The supplied YC Interface Craft files and user-provided design instructions are preserved with their metadata.
Existing source snapshots and approvals take priority over generic advice. Do not copy another business identity or fabricate proof.
No model run, deployment, external send, signup, new account or recurring routine is created by installing this package.

Dr Eggbot preferences retained: one job per bot, concise replies, a full live profile export, PStack setup, project verification, Cloud delegation, and a real typecheck, targeted tests and a production build before any push.
One Dr Eggbot rule is replaced: instead of never asking the owner about models, the PM asks once whether Sonnet 5.5 Medium or Opus 5.5 Medium builds the website, and every bot reuses that answer.
Workshop-specific choices take priority: PM coordinates instead of a private loops bot; no recurring routines are copied.
