---
name: reality-design-lab-maintenance
description: Maintain Reality Design Lab project pages, the Obsidian archive, and complete readable Notion project records, including source-backed publications, exhibitions, media, and mobile video checks.
---

# Reality Design Lab maintenance

## Sources and repositories

The website checkout is `realitydeslab-website`. Its `vault` symlink points to the separate `Reality_Design_Lab` Obsidian repository. Inspect `git status` in both before editing; website and archive changes require separate review and commits. Local paths and credentials are not portable configuration.

Obsidian is the detailed project archive and source for the lab website. Notion also preserves a complete readable project record: body text, images, exhibition options, and published papers, with a link to `https://reality.design/project/<slug>`. This supersedes the earlier brief-introduction-only convention, following the user’s 2026-09-22 instruction. Generated `.cache`, `.contentlayer`, `.next`, and `public/media` content is not the authoring source.

## Update a project

1. Locate `vault/Projects/<project>/<project>.md` and the corresponding Notion Design record. Use the existing slug and identity; do not create a duplicate merely because a project has a new title.
2. Preserve the author’s framing. Expand descriptions with concrete interaction, construction, and research details from the existing project record, paper, or coauthor documentation. Identify whether a text is a proposal, draft, demonstration, or published finding. Do not rewrite proposed methods as completed research.
3. Verify paper titles, author order, venue, year, and DOI against the publication or publisher metadata. For exhibitions, distinguish selection, scheduled presentation, and completed exhibition. A future event tag in Notion is insufficient evidence of acceptance. Related works such as Nocturnal Fugue and EchoVision can share an exhibition without sharing every credit or publication.
4. Archive photographs before using them. `scripts/archive-media.mjs <folder>` accepts a `manifest.json` array with `file`, `url`, `source`, and `credit`. It validates image bytes, records checksums and dimensions, and produces WebP derivatives. Preserve originals and the manifest under the project’s `_archive`; put uniquely named derivatives in `_resources`. Retain known photographer credits and mark unidentified photographers accurately. Inspect images before captioning them.
5. Use a short overview, meaningful project sections, selected photographs with captions, and verified publications/exhibitions where applicable. Do not invent an empty publication history to satisfy a template. A cover is necessary for a useful homepage card; a video preview is optional.

## Project page structure

FeltSight (`vault/Projects/FeltSight/FeltSight.md`) is the reference page. Match it.

- Open the body with the project's film as a bare wikilink, before any heading, so it sits directly under the rendered title and author byline. Give the hero film no caption and no bolded restatement of the description under it; the tagline already appears in the page header.
- Split verified outputs into `## Publications` for full and art papers, then `## Demonstrations` for demos, posters, extended abstracts and adjunct or XR-gallery contributions. Publications come first. Order each list newest first.
- Write one entry per line as `- **YEAR — Title.** *Venue*. Location. Track. 🏆 **Award**. [[→](doi)]`. Each element is its own sentence in that order: place first, then the track or paper type, then any award, then the link. Never bind the track to the place as `Interactivity, Hamburg, Germany`. Drop any element that does not apply rather than inventing one. Omit page numbers. Do not repeat the author list on every entry, and do not add a preamble naming the shared authors.
- Link every paper, DOI or proceedings target as `[[→](url)]`, matching `/publications`. Keep descriptive labels only where the destination is not the paper, for example an exhibition record, a repository, a preprint or a performance video.
- Decide full versus short from registered metadata, not from the title alone: page count, and whether the venue is a main track or an adjunct, companion or extended-abstracts proceedings. When the track is genuinely unclear, place the entry without asserting a type rather than guessing one.
- Do not add sourcing, photographer-credit or "project documentation" paragraphs. Where photo provenance matters, keep it in the archive, not on the public page.
- Populate `citation:` with publisher BibTeX obtained by DOI content negotiation (`curl -LH "Accept: application/x-bibtex" https://doi.org/<doi>`), never hand-assembled. Store it as a YAML block scalar, entry header and closing brace flush left, fields indented two spaces.

## Publication contract

- `published: true` is the publication switch. The legacy `draft` flag does not override it. Do not publish additional draft projects without authorization from the task.
- `scripts/inc/published-content.mjs` stages published documents and removes `<hide>` sections before compilation. Underscore folders hold resources or private archive material, not public pages.
- Reference media with Obsidian wikilinks. Use sufficiently qualified paths to avoid ambiguous basenames. Do not reference original archive photos from public documents when a derivative exists.
- After successful content compilation, `scripts/prune-published-assets.mjs --apply` verifies media referenced by the exported collections and quarantines stale media, generated documents, and the legacy public vault outside deployable trees. Inspect its report plus routes/search/sitemap output. Stop the dev watcher before a release build to avoid concurrent writes to generated content.
- Missing media fails the build. Unresolved or unpublished wiki targets render as text; use a qualified vault path when short names collide. Never manufacture a homepage link as a fallback.

## Notion synchronization

The portfolio Design data source is `collection://2755c619-2b7e-8084-9b36-000b3c3b2bf8`; fetch its current schema rather than assuming old properties. Search and fetch the exact project first. Sync the complete public project text, images with captions, verified publications and exhibition records, and project credits. Preserve existing exhibition options, covers, attachments, children, and unrelated properties. Add verified missing options without turning unverified or future tags into acceptance claims. Prefer native Notion image uploads for durable copies; retain originals in Obsidian. Read the upload tool’s limits and workspace limits, and preserve its returned attachment source. Archive the previous page before structural edits. Keep a link to the lab project URL. If the user asks to hide a project, set its Obsidian `published` flag to false and its Notion `Hidden` property to true; retain all source content. Do not republish hidden work during later synchronization. Read back structural edits and verify the external portfolio separately; a successful Notion write does not prove that the personal site refreshed.

## Homepage and video behavior

Use the project’s existing Notion `Provocation` question as the short homepage description, stripping Markdown emphasis without rewriting the question. Keep detailed prose in the project body. If no question exists, use one brief factual sentence rather than claiming an invented question came from Notion. The homepage centers the project title in white over its cover. Hovering fades out the title and starts an unobtrusive, silent preview on devices with a mouse; leaving restores the title and poster. Do not add Watch preview, Close preview, Full screen, or provider buttons to cards, or repeat the title below the image. Keep cards clickable and avoid loading every video at page load. On touch devices, keep the title visible and let a tap open the project. Respect reduced-motion preferences.

Provider embeds default to 16:9. A project whose master is another shape declares it in `videoAspect:`, a list index-matched to `videos:` (Cell Space is `2/1`, native 2160×1080). Confirm the real ratio from the provider before setting it — `https://vimeo.com/api/oembed.json?maxwidth=1920&url=<url>` reports the master's dimensions — rather than eyeballing the bars. An unparseable value falls back to 16:9 instead of reaching the style attribute. Local `<video>` files are fixed at 16:9 by `components/Video.tsx`; every current file matches.

Project pages use the native/provider player controls. Detail videos prefer native iPhone fullscreen when the viewer presses play: Vimeo/YouTube use `playsinline=0`, and native detail videos omit `playsinline`. Homepage previews keep `playsInline` so hovering never opens fullscreen. Do not add separate Full screen, Open video, or Open on provider buttons below videos. Preserve Vimeo unlisted URL tokens. Test actual playback and controls, not only iframe attributes. WebKit with an iPhone viewport is useful evidence, but is not a physical iPhone test. Respect explicit requests to stop playback during maintenance. Provider fullscreen controls can themselves start playback; after a stop-playing request, do not click those controls merely to test fullscreen. Use read-only checks and report the remaining device/playback verification gap.

## Verification and delivery

Use the package manager declared in `package.json` (currently npm). Run `npm run lint`, `npm run typecheck`, `npm test`, and `npm run build` as appropriate to the change. `npm run audit:content` inventories all project records; its missing-section flags are editorial review prompts. `npm audit --json` distinguishes remaining dependency advisories from fixed issues; do not force incompatible major upgrades just to reduce the count.

Use the production build for final browser checks. Check homepage idle network behavior, hover enter/leave, click-through, mobile portrait/landscape overflow, image loading, provider playback, and full-screen entry/exit. Capture evidence under ignored `output/`. Report the routes/devices actually tested and any limits.

Before deployment, inspect the configured project and target environment. `deploy.sh` creates a preview; `promote.sh` requires the exact verified preview URL. User authorization already given in the task remains valid—do not add a new approval ritual. Verify the live site after an authorized deployment and report source edits, Notion writes, and live publication as distinct states.
