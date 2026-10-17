---
name: brief-to-site
description: Turn one approved intake/research/product handoff into a tailored Next.js site and marketing context.
---
# One brief through the whole project

Product Manager owns brief/project.json and three initial questions. Preserve the customer's answers. Research fills unknowns with dated sources, options and confidence; PM records explicit approvals. Designer and PM choose the experience and copy. Frontend implements with Designer throughout; Backend only when needed. Do not repeat intake or force a business into a B2B demo/B2C quote stereotype.

Read AGENTS.md, README.md and lib/brief.mjs for the exact contract. Record the business, buying context, offer/pricing approval state, source IDs, positioning, product scope/journey, primaryAction, brand tokens, About, articles and solutions. Keep isDemo true for examples. Use npm run configure -- --brief brief/project.json to map reviewed inputs to content/site.json and .agents/product-marketing.md. Save existing edits before regenerating. Do not hand-edit flags to manufacture approval.

Apply actual design/copy/SEO skills from .agents/skills/. Customize the site; it is a structural foundation, not a mandatory look. Run checks and build, then test the actual browser journey. Draft content stays gated; assess value before scaling programmatic pages. Owner review precedes deployment/indexing, real integration activation and sends. Pass the approved brief/site/brand to Social Media Manager for the optional final marketing team.
