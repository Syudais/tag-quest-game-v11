# HTML learning path

Researched against W3Schools on 15 October 2026. Tag Quest contains original explanations, examples, and practice tasks with chapter links for further reading. It does not mirror or download the W3Schools course or exercise collection.

## Teaching flow

Read first, then practice. The tutorial is a safe reading space: the combat timer pauses while it is open. Each encounter has one short explanation, three points to remember, a worked example using different content, and the encounter objective. Closing a lesson returns to the learner's existing code.

Three foundations establish the prerequisites before the first encounter:

1. [Introduction](https://www.w3schools.com/html/html_intro.asp) and [basic examples](https://www.w3schools.com/html/html_basic.asp): document structure, head, body, and the difference between a complete page and a fragment.
2. [Elements](https://www.w3schools.com/html/html_elements.asp): opening and closing tags, content, nesting, and void elements.
3. [Attributes](https://www.w3schools.com/html/html_attributes.asp): names, quoted values, and placement in the opening tag.

The campaign then moves from text to links and images, collections, and forms. This is a compact prerequisite-based route through selected W3Schools chapters, rather than an exact copy of its sidebar order. Existing challenge IDs and encounter order remain stable for saved progress. There are six encounters per region, including its boss. The four bosses are encounters 6, 12, 18, and 24.

The lesson library exposes a separate `learningPath` in reading order: document structure, elements, attributes and title, headings, paragraphs, nesting, formatting, links, images, bookmarks, tables, lists, containers, classes, semantic regions, and forms. Related capstones follow their prerequisites. Read this path straight through or use the encounter lesson as a refresher. The separate order lets an existing saved campaign retain its challenge numbers.

## Encounter reference map

| Encounter | Original task | Reference |
|---|---|---|
| 1 | Name your quest: h1 | [Headings](https://www.w3schools.com/html/html_headings.asp) |
| 2 | Leave a message: p | [Paragraphs](https://www.w3schools.com/html/html_paragraphs.asp) |
| 3 | Mark the danger: strong | [Formatting](https://www.w3schools.com/html/html_formatting.asp) |
| 4 | Whisper a spell: em | [Formatting](https://www.w3schools.com/html/html_formatting.asp) |
| 5 | Mend the rune: nested closing tags | [Elements](https://www.w3schools.com/html/html_elements.asp) |
| 6 | Root Warden: heading, paragraph, importance | [Basic examples](https://www.w3schools.com/html/html_basic.asp) |
| 7 | Find the passage: anchor and href | [Links](https://www.w3schools.com/html/html_links.asp) |
| 8 | Reveal the relic: src and meaningful alt | [Images](https://www.w3schools.com/html/html_images.asp) |
| 9 | Set a waypoint: fragment link and id | [Bookmarks](https://www.w3schools.com/html/html_links_bookmarks.asp) |
| 10 | Read the inscription: title | [Attributes](https://www.w3schools.com/html/html_attributes.asp) |
| 11 | Mark your equipment: class | [Classes](https://www.w3schools.com/html/html_classes.asp) |
| 12 | Crystal Sentinel: image inside a link | [Links](https://www.w3schools.com/html/html_links.asp) |
| 13 | Pack your bag: ul and li | [Unordered lists](https://www.w3schools.com/html/html_lists_unordered.asp) |
| 14 | Follow the trail: ol and li | [Ordered lists](https://www.w3schools.com/html/html_lists_ordered.asp) |
| 15 | Read the ledger: tr, th, and td | [Table headers](https://www.w3schools.com/html/html_table_headers.asp) |
| 16 | Name the ledger: caption | [Caption reference](https://www.w3schools.com/tags/tag_caption.asp) |
| 17 | Group the supplies: div | [Div containers](https://www.w3schools.com/html/html_div.asp) |
| 18 | Ash Colossus: headed section and list | [Semantic elements](https://www.w3schools.com/html/html5_semantic_elements.asp) |
| 19 | Sign the register: label, input, for, id, name | [Label reference](https://www.w3schools.com/tags/tag_label.asp) |
| 20 | Ready the signal: a regular button | [Button reference](https://www.w3schools.com/tags/tag_button.asp) |
| 21 | Choose a potion: select and option | [Select reference](https://www.w3schools.com/tags/tag_select.asp) |
| 22 | Write a field note: textarea | [Textarea reference](https://www.w3schools.com/tags/tag_textarea.asp) |
| 23 | Restore the hall: main and article | [Semantic elements](https://www.w3schools.com/html/html5_semantic_elements.asp) |
| 24 | The Null King: labeled required field and submit button | [Forms](https://www.w3schools.com/html/html_forms.asp), [input attributes](https://www.w3schools.com/html/html_form_attributes.asp) |

## Learning and combat

The HTML task defines what must appear in the preview. The selected technique defines the game's response. Writing a button does not make HTML itself cast a spell: the game validates the markup and plays the appropriate action.

Timed practice creates pressure after reading. Finishing quickly gives a critical chance; a wrong submission can give the enemy a critical counterattack. A timeout also gives the enemy a turn. Defense takes place during the displayed enemy wind-up, using the visible Dodge or Parry controls. A failed attempt should preserve the code and explain the HTML mistake so the learner can correct it.

This route teaches selected HTML foundations. It does not claim to cover every W3Schools chapter, all accessibility requirements, CSS, JavaScript, or server-side form processing.

## Code contract

`src/lessons.ts` exports `Lesson`, `TutorialStep`, `tutorialSteps`, `htmlFoundations`, `lessons`, `learningPath`, and `getLessonForChallenge(index)`. `learningPath` is the chronological reading library; `lessons` uses the same index as `src/challenges.ts`. `practice` comes from its challenge objective; teaching examples use different wording so learners still have work to do.
