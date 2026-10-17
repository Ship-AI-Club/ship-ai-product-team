# A useful business site, built from one shared brief

A Next.js starter for the Ship AI workshop. Product Manager asks the questions, researches unknowns with the team and connects the whole build. Works for B2B, B2C, mixed audiences, products and services. No outside accounts or AI keys are needed for the first local run.

Requires Node 20.9+ and npm. Run npm ci, npm run check, npm run configure, then npm run dev. Open the URL printed by Next.js. Run npm run build for production checks.

Attach this source to Product Manager and ask: “Help me turn my business or idea into a useful website. Ask what you need, research the gaps and guide the team for me.” It reads AGENTS.md and the bundled skills.

The bot fills brief/project.json with questionnaire answers, dated research, approved positioning, PM scope, customer/buying context, offer, pricing status, brand, copy and content. Participants do not need to edit JSON. npm run configure -- --brief path/to/project.json validates and maps it to content/site.json and .agents/product-marketing.md.

Includes home/About, SEO article and data-driven solution templates, metadata, source links, review gates, robots, sitemap and basic WebPage structured data. The local assessment sends/saves nothing. Draft articles, solutions and About are unavailable until approved. Preview is unindexed. The bot must customize the real design and implement any production account/booking/payment/lead action.

Two explicitly fictional fixtures in examples/ test B2B assessment and B2C quote journeys. Use a fresh copy; applying one overwrites the working brief/config. Never present fixtures as a real business. Publishing requires owner review, a real HTTPS siteUrl, isDemo:false and publicationApproved:true. Flags do not deploy or prove quality.

After the site is approved, PM passes the same brief to Social Media Manager, coordinating Performance Marketer and static/video creators. Start with one useful article or creative. Review it before publication. The parent kit has a disabled webhook/Gmail guide; this starter contains no active relay.

Product Designer uses the bundled YC Interface Craft skill for five-direction exploration, owner selection and real interface verification. Small fixes preserve the approved direction.

Read AGENTS.md and .agents/skills/README.md. Actual upstream skills and licenses are bundled with exact hashes. No fixed client, personal presenter persona, live account IDs or credentials are included.


## Frontend Cloud build

Start approved website implementation in Cursor Cloud automatically. Select the saved Sonnet 5.5 Medium or Opus 5.5 Medium choice with the actual Cloud tool selector. Do not wait for an extra owner prompt. Verify the returned run URL and actual model before reporting success. Do not silently use Fast, Auto, another model or a local bot build. If the exact model or Cloud capability is unavailable, report the specific blocker to PM and ask for a fallback decision. The saved owner choice controls the coding handoff. Keep the business, audience and brand agnostic. Reuse the recorded run for the same task and feedback; do not start duplicate runs.

Before launch, load the full Next.js starter and verify every path and SHA256 in design-skill-library.json. Use npm run verify:design where supplied; otherwise perform the same full file audit. Stop on missing or changed files. Include hidden .agents/skills/ and .cursor/ folders, AGENTS.md, README.md, the approved shared brief, design handoff, copy, lockfile, manifests, reference files and licenses in the actual Cloud repository or upload. Local skill cards, links and summaries do not supply Cloud context. Exclude secrets, private chats, node_modules, .next and unrelated files. Require the Cloud agent to repeat the file audit inside its workspace, read the applicable actual design/copy files and references, and record what it read. A hash check proves integrity, not that skills were read or applied.

Frontend coordinates the PM, Designer and Cloud agent. The Cloud agent implements the approved site, runs the real checks/build and browser journeys, and returns source, logs and screenshots. Designer reviews the running desktop and phone site and the useful visitor result. Fix material issues before PM asks the owner to review. Save the run URL, actual model, brief version, file audit and skill-read record with the handoff. Stop before deployment and external sends.

Read starter/CLOUD-HANDOFF.md (CLOUD-HANDOFF.md inside the starter). The starter runs the design file audit before check and build. Keep evidence/design-skills.json and evidence/design-skills-read.md separate.


## Current handoff

Before launch and after each feedback or scope change, get the current PM brief and approved design/copy handoff. Record their versions, approval state and file hashes in a handoff manifest. Send updated files to the same Cloud run and require acknowledgment of the received versions before further implementation. Recover existing approvals from PM; do not ask the owner to repeat them. An initial upload does not carry later decisions. Distinguish an uploaded archive audit from verification of files inside the live Cloud workspace.
