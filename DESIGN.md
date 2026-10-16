---
name: Tag Quest
description: A playable fantasy pixel-art world where writing HTML resolves encounters.
colors:
  page: "#0c1219"
  stage: "#101c29"
  workbench: "#18232f"
  frame: "#344452"
  text: "#e4e9ed"
  muted: "#a1b2bf"
  gold: "#e9c17f"
  light: "#f3ebdb"
  vitality: "#8dbca5"
  execute: "#d0aa6b"
  execute-hover: "#e2bf87"
  execute-text: "#1a2026"
  ability: "#1d2c39"
  ability-selected: "#3b382c"
  editor: "#141d28"
  preview: "#eaece8"
  error: "#ffb7a4"
  success: "#a6dbb8"
  hint: "#f0d39b"
typography:
  display:
    fontFamily: "Cinzel, Georgia, serif"
    fontSize: "24px"
    fontWeight: 600
    lineHeight: 1
  headline:
    fontFamily: "Cinzel, Georgia, serif"
    fontSize: "25px"
    fontWeight: 500
    lineHeight: 1.3
  title:
    fontFamily: "Cinzel, Georgia, serif"
    fontSize: "22px"
    fontWeight: 500
    lineHeight: 1.25
  body:
    fontFamily: "Segoe UI, Arial, sans-serif"
    fontSize: "13px"
    lineHeight: 1.65
  label:
    fontFamily: "Segoe UI, Arial, sans-serif"
    fontSize: "12px"
  code:
    fontFamily: "Consolas, ui-monospace, monospace"
    fontSize: "14px"
rounded:
  control: "3px"
  utility: "4px"
  dialog: "5px"
spacing:
  rule: "4px"
  tight: "8px"
  small: "12px"
  medium: "16px"
  large: "20px"
  section: "24px"
  desktop-gutter: "38px"
components:
  button-execute:
    backgroundColor: "{colors.execute}"
    textColor: "{colors.execute-text}"
    rounded: "{rounded.control}"
    padding: "13px 14px"
    width: "100%"
  button-execute-hover:
    backgroundColor: "{colors.execute-hover}"
  button-interact:
    backgroundColor: "#14222df5"
    textColor: "#f4e4c6"
    rounded: "{rounded.control}"
    padding: "10px 18px"
  button-icon:
    backgroundColor: "transparent"
    textColor: "#b2c1cc"
    rounded: "{rounded.utility}"
    width: "42px"
    height: "42px"
  navigation:
    backgroundColor: "transparent"
    textColor: "#9dacb7"
    padding: "4px 2px 0"
  ability:
    backgroundColor: "{colors.ability}"
    rounded: "{rounded.control}"
    padding: "10px 7px"
  ability-selected:
    backgroundColor: "{colors.ability-selected}"
    textColor: "#f7dbad"
  editor:
    backgroundColor: "{colors.editor}"
    textColor: "{colors.text}"
    typography: "{typography.code}"
    rounded: "{rounded.control}"
  workbench:
    backgroundColor: "{colors.workbench}"
    padding: "0 22px 20px"
  dialog:
    backgroundColor: "#17232e"
    textColor: "#e2e8ed"
    rounded: "{rounded.dialog}"
    padding: "27px"
  map-region:
    backgroundColor: "#101a24"
    rounded: "{rounded.utility}"
    padding: "14px 16px 16px"
---

# Design System: Tag Quest

## Overview

**Creative North Star: "The Fractured Codex"**

The implemented world is a classic fantasy pixel-art game. OpenDuelyst scenery, ground layers, characters, and animation atlases carry the visual identity. The interface is a compact RPG menu around that world: dark forest-night blue surfaces, warm ivory chapter type, antique gold selection, and restrained sage vitality.

The playable stage leads the screen. Exploration uses the full play frame; an HTML workbench appears only for an encounter and remains visible during its action. This makes writing part of the fight while preserving the art as the focal point. Implementation follows the requested code-first route with sourced art rather than an image-generated visual concept. The design dials remain Energy 3 / Rhythm 2 / Motion 3.

**Key Characteristics:**
- Lit source artwork inside quiet dark frames.
- Cinzel chapter lettering paired with readable sans-serif instructions.
- Thin borders, nearly square shapes, and compact game controls.
- A workbench that enters with combat and stacks beneath the world on smaller screens.

This is an extraction of `src/styles.css` and `src/main.ts`, checked against the exploration, encounter, mobile, and world-map captures in `.impeccable/review`. It refreshes the earlier directional brief without replacing its fantasy pixel-art commitment.

## Colors

The fixed dark forest palette supports bright environment art across all four regions. The frontmatter records the implemented colors; it is the normative token layer.

### Primary
- **Antique Gold** (`gold`): the current region underline, links, focus outlines, and selected ability icon.
- **Action Brass** (`execute`, `execute-hover`, `execute-text`): the filled encounter action and its hover state, with dark text for legibility.

### Secondary
- **Sage Vitality** (`vitality`): the health fill, visually separate from action selection.
- **Feedback tones** (`error`, `success`, `hint`): validation and learning assistance. Status meaning is also written in text.

### Neutral
- **Forest Night** (`page`): the page and navigation surround; the theme stays dark while the environment art changes.
- **Blue-black Stage** (`stage`): the canvas surround and uncovered area around the source art.
- **Slate Workbench** (`workbench`): the encounter editor panel.
- **Steel Divider** (`frame`): the play frame and status-strip boundary.
- **Cool Text / Muted Text / Warm Ivory** (`text`, `muted`, `light`): body, supporting information, and fantasy display roles.
- **Ability Slate / Selected Bronze** (`ability`, `ability-selected`): compact move choices.
- **Editor Ink / Preview Paper** (`editor`, `preview`): a dark authoring area beside a light rendered result. Preview paper belongs to learner output, not a second app theme.

**The Artwork Leads Rule.** Keep interface surfaces in the fixed dark palette; let the sourced landscapes provide the major shifts of color.

## Typography

Cinzel is locally served from `/fonts/cinzel.ttf` with Georgia/serif fallbacks. It gives the brand, chapter, encounter, dialog, and map-region names their fantasy character. Segoe UI with Arial/sans-serif fallbacks carries instructions and status. Consolas with monospace fallbacks is reserved for HTML, keycaps, and small editor labels.

### Hierarchy
- **Display:** the brand uses the `display` token. Its subtitle is smaller sans-serif text (11px) with modest tracking (0.08em).
- **Headline:** chapter and dialog headings use `headline`; the world quest heading uses a tighter line-height (1.2).
- **Title:** encounter headings use `title`; map names are smaller Cinzel (18px).
- **Body:** encounter instructions use `body`. The surrounding menu text mostly ranges from 11px to 13px; this is a dense game interface.
- **Code:** the editor uses `code`, increasing its content to 16px on narrow phones. Keycaps use compact Consolas (11px).

Responsive type is explicit: chapter headings step down at 1100px and again at 850px; the quest overlay reaches 19px on phones. Keep long instructions in the sans-serif role. On the stacked encounter layout, lesson text has a readable maximum width (65ch).

## Layout

The navigation is a compact top header in normal document flow, with a fixed dark visual theme. It is not sticky or fixed-positioned. The desktop header is 94px high with 38px side padding and a maximum width of 1700px. The main shell has a maximum width of 1560px and matching desktop gutters. A chapter/progress row sits above the stage; a status strip and brief campaign/help row sit below it.

Exploration is a single-column play frame. At desktop widths, an encounter adds a right-hand workbench (350px); it becomes 375px from 1500px, or 330px at 1100px and below. The normal stage height is `clamp(460px,65vh,690px)`, increasing to `clamp(530px,68vh,790px)` on wide screens. The fixed game canvas uses FIT scaling and can leave dark letterboxing inside that frame, especially on phones; do not stretch it to fill the HTML container.

At 1100px and below, gutters and navigation spacing contract. At 850px and below, the header wraps so region navigation occupies its own row, the encounter becomes one column, and the workbench follows the canvas with a top border. Desktop keybinding help is hidden. Stage height becomes `clamp(320px,55vw,490px)` in exploration and `clamp(300px,50vw,450px)` in combat. The workbench loses its desktop maximum height so the page can scroll normally.

At 480px and below, main side padding is 12px, campaign progress fills its own row, and the stage has explicit heights (360px exploration; 310px encounter). The world map changes from two columns to one. Touch movement controls are shown on phones or coarse pointers; the interaction action moves to the lower right on phones. Controls are hidden during an encounter. Coarse-pointer movement targets are at least 44px square.

The spacing scale records repeated values rather than every isolated CSS measurement. Use tight spacing for related control contents, medium spacing for adjacent groups, and section spacing for the header/stage rhythm.

## Elevation & Depth

Depth comes primarily from painted scenery and sprites. Interface layers use opaque or nearly opaque tonal surfaces with thin steel borders. Shadows have specific jobs: a broad shadow anchors the whole play frame (`0 18px 45px #0004`), the interaction action lifts over artwork (`0 5px 18px #0005`), and dialogs separate from the world (`0 25px 100px #0009`). Dialog backdrops darken and blur the game (`#060b13c9`, 5px blur). Toasts have a smaller elevated treatment (`0 8px 30px #0007`).

The quest overlay uses a text shadow (`0 2px 7px #000`) so lettering remains readable over the landscape. Do not spread those effects across ordinary menu controls.

## Shapes

The main play frame, workbench boundaries, and progress bars are square. Small controls, ability choices, the editor, and preview have softly eased corners (`control`); icon actions, map choices, and toasts use `utility`; dialogs use `dialog`. The current source does not implement decorative corner cuts. Thin one-pixel borders, a short gold quest rule, keycaps, and a narrow active-region underline provide the menu geometry. Avoid turning these into pill-shaped cards.

## Components

### Navigation
Four region buttons share one compact row. The current region uses gold text and a two-pixel gold bottom rule; the default is muted blue-gray and hover is warm ivory. The header's map and sound controls are icon buttons with accessible names. Locked-region navigation opens the map for context; map choices explain the guardian requirement. The header wraps at the documented breakpoint while keeping all four region names visible.

### Encounter workbench
The panel contains the challenge title and instruction, a source lesson link, three move choices, the HTML editor, hint/example controls, written feedback, the execution action, and a light rendered preview. It appears only for challenge and animation phases, with the quest overlay and field interaction action hidden. This is a combat teaching tool, not a persistent dashboard sidebar.

### Buttons and move choices
The brass execution button is the encounter's strongest control. It has a one-pixel gold border, a minimum height (46px), a move icon, descriptive action text, and a compact Ctrl+Enter reminder. Its hover uses the lighter brass token. The field interaction button is a nearly opaque dark overlay with a gold-gray border and keycap. It is visibly disabled until a sentry is near. Icon actions remain quiet until hover. Move choices show icon, name, meaning, and a number key; selection changes the fill and border and updates `aria-pressed`.

All buttons and links share a visible gold keyboard outline (2px with a 5px offset). Disabled buttons use reduced opacity; the field interaction control retains greater opacity so its instruction stays readable. Hover never replaces the written action or selected-state information.

### Editor and feedback
CodeMirror uses an ink background, dark gutters, monospace content, and a restrained active-line treatment. The enclosing field gains a warm border and faint ring on focus. HTML preview is a separate light area rather than a simulated terminal. Hint, error, and success messages retain their written explanation and live-region behavior. Wrong answers preserve the learner's draft.

**The Typing Owns Focus Rule.** Editor focus suppresses game movement and menu shortcuts. Preserve normal typing and Tab navigation; the editor's explicit submission shortcut is Ctrl+Enter (Command+Enter on platforms using the modifier mapping). Dialogs also suspend game input. Do not style or wire a focusable editor as a game canvas.

### Status and world overlays
The health panel is a small translucent dark rectangle near the upper-right of the world, with a sage bar and numeric vitality. A persistent strip below the play frame carries the current instruction and, on desktop, keycaps. Progress is compact text plus a thin gold track; it is not a set of metric cards. Toasts appear above the bottom viewport edge for short state changes.

### Dialogs and world map
Native dialogs contain help, credits, the map, and completion. They use the same dark menu language, Cinzel headings, close controls, and a dimmed backdrop. The map's sourced landscape thumbnails make regions recognizable. Current-region borders are gold; locked images are dimmed and desaturated with a written locked status. The two-column map becomes one column on phones.

### Motion
Source atlas frames provide the character's movement, attack, magic, impact, and death information. The implemented camera effect is impact shake, not a follow camera. Interface motion in the current stylesheet is limited to health and campaign fill transitions (0.4s); it does not animate every panel entry. Reduced-motion CSS disables transitions and decorative animation. Retain essential game action-state information when reducing motion; do not replace the actual game with static poses.

## Do's and Don'ts

### Do:
- **Do** let sourced OpenDuelyst environments and animated characters establish the fantasy world.
- **Do** keep the fixed dark forest menu palette across region changes.
- **Do** give exploration the full play frame and show the workbench for combat.
- **Do** preserve the stacked encounter layout and touch controls at smaller widths.
- **Do** keep gold keyboard focus visible and suspend game input while the editor or a dialog owns focus.
- **Do** use written feedback alongside color and retain learner drafts after validation errors.

### Don't:
- **Don't** replace playable exploration and frame animation with a static-pose showcase or marketing hero.
- **Don't** stretch source scenery to eliminate intentional letterboxing.
- **Don't** turn the compact RPG menu into a pill-card dashboard or parchment marketing layout.
- **Don't** add a theme switch or describe the current header as sticky without implementing that behavior.
- **Don't** invent decorative corner cuts or panel-entry animations that the current source does not contain.

## Combat update: October 2026

This section supersedes the earlier three-move and status descriptions. The encounter workbench now uses reusable skill, combat and lesson components. Six action buttons pair Lucide SVG icons with written names, costs, cooldowns and locked states. The HUD adds level, XP, chakra and stamina; incoming attacks expose visible Dodge and Parry controls with a short timing indicator. Avoid emoji or text characters as action artwork.

Tutorial and lesson views pause the combat clock. Begin challenge explicitly starts timed play. Number keys select skills only outside text inputs; Alt+Q and Alt+F are deliberate defense shortcuts that remain usable while coding. Keep the editor's normal typing, selection and arrow-key behavior.

Build and local launch are the delivery checks for this update. The older review captures above document the previous release, not a fresh visual QA of these changes.

## In-game interface revision

The latest user direction supersedes earlier bounded frames, reserved lower docks and split canvas layouts. The world fills the viewport in every phase. Follow the provided Ninja Saga reference in composition: compact status areas, an open central battlefield and a narrow lower strip of skill icons. Use icon-only gameplay controls with tooltips; keep narrative and task text readable. The collapsible right overlay places the HTML editor above Expected result and Your output. Give both previews the same rendering rules and readable labels with short comparison guidance. Keep every overlay inside viewport bounds and move combat actors clear of the coding panel.

The engine adapts the camera and scenery to the full viewport, preserving actors and world-coordinate movement. On narrow screens, use collapsible or compact overlays rather than placing the game above a webpage of controls. Mr. Rifky presents tutorials, lessons and training as a large-portrait conversation over the dimmed world. See docs/UX_GUIDELINE.md for the current layout contract and research sources.
