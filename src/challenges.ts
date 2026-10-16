import { parseFragment } from 'parse5';
import type { Challenge } from './types';
import { createQuestionVariant } from './questionVariants';

interface HtmlNode {
  nodeName: string;
  tagName?: string;
  value?: string;
  attrs?: { name: string; value: string }[];
  childNodes?: HtmlNode[];
  sourceCodeLocation?: { startTag?: unknown; endTag?: unknown } | null;
}

type Rule = (root: HtmlNode) => boolean;
const text = (node: HtmlNode): string => node.nodeName === '#text'
  ? node.value ?? ''
  : (node.childNodes ?? []).map(text).join('');
const words = (node: HtmlNode): string => text(node).replace(/\s+/g, ' ').trim();
const attr = (node: HtmlNode, name: string): string | undefined => node.attrs?.find(a => a.name === name)?.value;
const children = (node: HtmlNode, tag?: string): HtmlNode[] => (node.childNodes ?? [])
  .filter(n => !!n.tagName && (!tag || n.tagName === tag));
const all = (node: HtmlNode, tag: string): HtmlNode[] => (node.childNodes ?? [])
  .flatMap(n => [...(n.tagName === tag ? [n] : []), ...all(n, tag)]);
const has = (node: HtmlNode, tag: string, predicate: (node: HtmlNode) => boolean = () => true): boolean => all(node, tag).some(predicate);
const says = (node: HtmlNode, expected: string): boolean => words(node) === expected;
const closes = (node: HtmlNode): boolean => !!node.sourceCodeLocation?.endTag;
const tagNames = new Set(('a abbr address area article aside audio b bdi bdo blockquote br button canvas caption cite code col colgroup data datalist dd del details dfn dialog div dl dt em embed fieldset figcaption figure footer form h1 h2 h3 h4 h5 h6 header hgroup hr i iframe img input ins kbd label legend li link main map mark menu meta meter nav noscript object ol optgroup option output p picture pre progress q rp rt ruby s samp section select small source span strong sub summary sup table tbody td template textarea tfoot th thead time title tr track u ul var video wbr').split(' '));

function inspect(html: string): { root: HtmlNode; error?: string } {
  let parseError = false;
  const root = parseFragment(html, { sourceCodeLocationInfo: true, onParseError: () => { parseError = true; } }) as unknown as HtmlNode;
  const invalid = (node: HtmlNode): boolean => !!node.tagName && !tagNames.has(node.tagName)
    || (node.childNodes ?? []).some(invalid);
  if (!html.trim()) return { root, error: 'Add some HTML before casting your move.' };
  if (parseError) return { root, error: 'Check the markup for a broken tag, quote, or repeated attribute.' };
  if (invalid(root)) return { root, error: 'Use standard HTML elements. Check your tag names for a typo.' };
  return { root };
}

interface QuestSpec extends Omit<Challenge, 'validate' | 'source'> {
  chapter: string;
  rule: Rule;
}

function quest({ chapter, rule, ...details }: QuestSpec): Challenge {
  return {
    ...details,
    source: `https://www.w3schools.com/html/${chapter}.asp`,
    validate(html) {
      const { root, error } = inspect(html);
      if (error) return { ok: false, message: error };
      if (!rule(root)) return { ok: false, message: details.hint };
      return { ok: true, message: 'HTML complete. Your move is ready.' };
    },
  };
}

// Exercises are original. Source links point to the corresponding reference chapters.
export const challenges: Challenge[] = [
  quest({
    id: 'grove-heading', biome: 0, title: 'Name your quest', concept: 'Headings', chapter: 'html_headings',
    instruction: 'Write an h1 heading that says Forest Gate. Include its closing tag.',
    starter: '<h1>Forest Gate', solution: '<h1>Forest Gate</h1>',
    hint: 'A heading needs an opening <h1>, the words Forest Gate, and a closing </h1>.',
    rule: r => has(r, 'h1', n => says(n, 'Forest Gate') && closes(n)),
  }),
  quest({
    id: 'grove-paragraph', biome: 0, title: 'Leave a message', concept: 'Paragraphs', chapter: 'html_paragraphs',
    instruction: 'Put The path is clear. inside a paragraph element.',
    starter: 'The path is clear.', solution: '<p>The path is clear.</p>',
    hint: 'Wrap the whole sentence in <p> and </p>. Keep the full stop.',
    rule: r => has(r, 'p', n => says(n, 'The path is clear.')),
  }),
  quest({
    id: 'grove-strong', biome: 0, title: 'Mark the danger', concept: 'Strong importance', chapter: 'html_formatting',
    instruction: 'Create a paragraph saying Beware the roots. Give only Beware strong importance using strong.',
    starter: '<p>Beware the roots.</p>', solution: '<p><strong>Beware</strong> the roots.</p>',
    hint: 'Keep the paragraph. Surround only Beware with <strong> and </strong>.',
    rule: r => has(r, 'p', n => says(n, 'Beware the roots.') && has(n, 'strong', s => says(s, 'Beware'))),
  }),
  quest({
    id: 'grove-emphasis', biome: 0, title: 'Whisper a spell', concept: 'Emphasis', chapter: 'html_formatting',
    instruction: 'Create a paragraph saying Walk softly. Emphasize only softly with em.',
    starter: '<p>Walk softly.</p>', solution: '<p>Walk <em>softly</em>.</p>',
    hint: 'Use <em>softly</em> inside the paragraph. Leave Walk and the full stop outside em.',
    rule: r => has(r, 'p', n => says(n, 'Walk softly.') && has(n, 'em', s => says(s, 'softly'))),
  }),
  quest({
    id: 'grove-nesting', biome: 0, title: 'Mend the rune', concept: 'Nested elements', chapter: 'html_elements',
    instruction: 'Repair this paragraph. Both words Stay ready must be inside strong, and both elements need explicit closing tags in the right order.',
    starter: '<p><strong>Stay ready</p>', solution: '<p><strong>Stay ready</strong></p>',
    hint: 'Close the inner strong first, then the outer paragraph: </strong></p>.',
    rule: r => has(r, 'p', n => says(n, 'Stay ready') && closes(n) && children(n, 'strong').some(s => says(s, 'Stay ready') && closes(s))),
  }),
  quest({
    id: 'grove-capstone', biome: 0, title: 'Root Warden', concept: 'Boss: elements and nesting', chapter: 'html_elements',
    instruction: 'Build an h1 saying Grove restored, followed by a paragraph saying The gate is open. Give open strong importance.',
    starter: '<h1></h1>\n<p>The gate is open.</p>', solution: '<h1>Grove restored</h1>\n<p>The gate is <strong>open</strong>.</p>',
    hint: 'Use two sibling elements: h1, then p. Put <strong>open</strong> inside the paragraph.',
    rule: r => { const nodes = children(r); return nodes[0]?.tagName === 'h1' && says(nodes[0], 'Grove restored') && nodes[1]?.tagName === 'p' && says(nodes[1], 'The gate is open.') && has(nodes[1], 'strong', n => says(n, 'open')); },
  }),
  quest({
    id: 'ruins-link', biome: 1, title: 'Find the passage', concept: 'Links', chapter: 'html_links',
    instruction: 'Make a link labeled Enter ruins that points to /ruins.',
    starter: '<a>Enter ruins</a>', solution: '<a href="/ruins">Enter ruins</a>',
    hint: 'Add href="/ruins" to the opening a tag. Keep Enter ruins as the link text.',
    rule: r => has(r, 'a', n => says(n, 'Enter ruins') && attr(n, 'href') === '/ruins'),
  }),
  quest({
    id: 'ruins-image', biome: 1, title: 'Reveal the relic', concept: 'Images and alternative text', chapter: 'html_images',
    instruction: 'Add an image with src="/relic.png" and alt="A blue crystal". Images are void elements; they have no closing tag.',
    starter: '<img src="/relic.png">', solution: '<img src="/relic.png" alt="A blue crystal">',
    hint: 'Add alt="A blue crystal" to img. The source must remain /relic.png.',
    rule: r => has(r, 'img', n => attr(n, 'src') === '/relic.png' && attr(n, 'alt') === 'A blue crystal'),
  }),
  quest({
    id: 'ruins-anchor', biome: 1, title: 'Set a waypoint', concept: 'IDs and fragment links', chapter: 'html_links_bookmarks',
    instruction: 'Create a link labeled Camp with href="#camp" and an h2 saying Safe camp with id="camp".',
    starter: '<a href="#camp">Camp</a>\n<h2>Safe camp</h2>', solution: '<a href="#camp">Camp</a>\n<h2 id="camp">Safe camp</h2>',
    hint: 'The link uses #camp. The destination heading uses id="camp", without the #.',
    rule: r => has(r, 'a', n => says(n, 'Camp') && attr(n, 'href') === '#camp') && has(r, 'h2', n => says(n, 'Safe camp') && attr(n, 'id') === 'camp'),
  }),
  quest({
    id: 'ruins-title', biome: 1, title: 'Read the inscription', concept: 'Title attribute', chapter: 'html_attributes',
    instruction: 'Give a paragraph saying Ancient door the title attribute Opens at dawn.',
    starter: '<p>Ancient door</p>', solution: '<p title="Opens at dawn">Ancient door</p>',
    hint: 'Put title="Opens at dawn" in the opening p tag.',
    rule: r => has(r, 'p', n => says(n, 'Ancient door') && attr(n, 'title') === 'Opens at dawn'),
  }),
  quest({
    id: 'ruins-class', biome: 1, title: 'Mark your equipment', concept: 'Classes', chapter: 'html_classes',
    instruction: 'Add the class relic to a paragraph saying Crystal staff. Other classes may stay.',
    starter: '<p>Crystal staff</p>', solution: '<p class="relic">Crystal staff</p>',
    hint: 'Add class="relic" to the paragraph. Class names can be a space-separated list.',
    rule: r => has(r, 'p', n => says(n, 'Crystal staff') && (attr(n, 'class') ?? '').split(/\s+/).includes('relic')),
  }),
  quest({
    id: 'ruins-capstone', biome: 1, title: 'Crystal Sentinel', concept: 'Boss: linked image', chapter: 'html_links',
    instruction: 'Make an image into a link. The a element points to /sanctum and contains an img with src="/relic.png" and alt="Crystal key".',
    starter: '<a href="/sanctum">\n  <img src="/relic.png">\n</a>', solution: '<a href="/sanctum"><img src="/relic.png" alt="Crystal key"></a>',
    hint: 'Nest img inside a. Set href on a, and src plus alt on img.',
    rule: r => has(r, 'a', n => attr(n, 'href') === '/sanctum' && has(n, 'img', i => attr(i, 'src') === '/relic.png' && attr(i, 'alt') === 'Crystal key')),
  }),
  quest({
    id: 'marsh-list', biome: 2, title: 'Pack your bag', concept: 'Unordered lists', chapter: 'html_lists_unordered',
    instruction: 'Build an unordered list with exactly three items in this order: Map, Rope, Potion.',
    starter: '<ul>\n  Map\n  Rope\n  Potion\n</ul>', solution: '<ul><li>Map</li><li>Rope</li><li>Potion</li></ul>',
    hint: 'Each item needs its own li inside ul. Keep the order Map, Rope, Potion.',
    rule: r => has(r, 'ul', n => children(n).length === 3 && children(n).every((item, i) => item.tagName === 'li' && says(item, ['Map', 'Rope', 'Potion'][i]))),
  }),
  quest({
    id: 'marsh-order', biome: 2, title: 'Follow the trail', concept: 'Ordered lists', chapter: 'html_lists_ordered',
    instruction: 'Build an ordered list with exactly two steps: Cross bridge, then Light beacon.',
    starter: '<ol>\n</ol>', solution: '<ol><li>Cross bridge</li><li>Light beacon</li></ol>',
    hint: 'Use ol for numbered steps and a separate li for each step.',
    rule: r => has(r, 'ol', n => children(n).length === 2 && children(n).every((item, i) => item.tagName === 'li' && says(item, ['Cross bridge', 'Light beacon'][i]))),
  }),
  quest({
    id: 'marsh-table', biome: 2, title: 'Read the ledger', concept: 'Table headers', chapter: 'html_table_headers',
    instruction: 'Create a table with a header row containing Item and Cost in th cells, followed by one row with Potion and 5 in td cells.',
    starter: '<table>\n  <tr><td>Item</td><td>Cost</td></tr>\n  <tr><td>Potion</td><td>5</td></tr>\n</table>',
    solution: '<table><tr><th>Item</th><th>Cost</th></tr><tr><td>Potion</td><td>5</td></tr></table>',
    hint: 'Change the first row cells to th. The Potion row uses td cells.',
    rule: r => has(r, 'table', n => { const rows = all(n, 'tr'); return rows.length === 2 && children(rows[0]).length === 2 && children(rows[0]).every((cell, i) => cell.tagName === 'th' && says(cell, ['Item', 'Cost'][i])) && children(rows[1]).length === 2 && children(rows[1]).every((cell, i) => cell.tagName === 'td' && says(cell, ['Potion', '5'][i])); }),
  }),
  quest({
    id: 'marsh-caption', biome: 2, title: 'Name the ledger', concept: 'Table captions', chapter: 'html_tables',
    instruction: 'Add a caption saying Supply ledger inside the table, before its first row. Keep the Potion cell.',
    starter: '<table>\n  <tr><td>Potion</td></tr>\n</table>', solution: '<table><caption>Supply ledger</caption><tr><td>Potion</td></tr></table>',
    hint: 'Make caption the first element inside table, followed by the row.',
    rule: r => has(r, 'table', n => children(n)[0]?.tagName === 'caption' && says(children(n)[0], 'Supply ledger') && has(n, 'td', c => says(c, 'Potion'))),
  }),
  quest({
    id: 'marsh-group', biome: 2, title: 'Group the supplies', concept: 'Div containers', chapter: 'html_div',
    instruction: 'Put an h2 saying Supplies and a paragraph saying Ready to travel. inside one div with class="inventory".',
    starter: '<div class="inventory">\n</div>', solution: '<div class="inventory"><h2>Supplies</h2><p>Ready to travel.</p></div>',
    hint: 'The inventory div must contain both the heading and paragraph.',
    rule: r => has(r, 'div', n => (attr(n, 'class') ?? '').split(/\s+/).includes('inventory') && has(n, 'h2', h => says(h, 'Supplies')) && has(n, 'p', p => says(p, 'Ready to travel.'))),
  }),
  quest({
    id: 'marsh-capstone', biome: 2, title: 'Ash Colossus', concept: 'Boss: structured supplies', chapter: 'html_lists',
    instruction: 'Build a section with an h2 saying Expedition and a ul containing exactly two li items: Map and Potion.',
    starter: '<section>\n  <h2></h2>\n  <ul></ul>\n</section>', solution: '<section><h2>Expedition</h2><ul><li>Map</li><li>Potion</li></ul></section>',
    hint: 'Nest the heading and list inside section. The list contains two li elements, Map then Potion.',
    rule: r => has(r, 'section', n => has(n, 'h2', h => says(h, 'Expedition')) && has(n, 'ul', list => children(list).length === 2 && children(list).every((item, i) => item.tagName === 'li' && says(item, ['Map', 'Potion'][i])))),
  }),
  quest({
    id: 'citadel-label', biome: 3, title: 'Sign the register', concept: 'Labels and inputs', chapter: 'html_form_elements',
    instruction: 'Create a label saying Hero name with for="hero", and a text input with id="hero" and name="hero".',
    starter: '<label>Hero name</label>\n<input type="text">', solution: '<label for="hero">Hero name</label><input type="text" id="hero" name="hero">',
    hint: 'Match label for="hero" with input id="hero". Give the input name="hero" and type="text".',
    rule: r => has(r, 'label', n => says(n, 'Hero name') && attr(n, 'for') === 'hero') && has(r, 'input', n => attr(n, 'id') === 'hero' && attr(n, 'name') === 'hero' && (attr(n, 'type') ?? 'text').toLowerCase() === 'text'),
  }),
  quest({
    id: 'citadel-button', biome: 3, title: 'Ready the signal', concept: 'Buttons', chapter: 'html_form_elements',
    instruction: 'Create a button labeled Cast with type="button". It must not submit a form.',
    starter: '<button>Cast</button>', solution: '<button type="button">Cast</button>',
    hint: 'Set type="button" on the opening button tag. Keep Cast as its text.',
    rule: r => has(r, 'button', n => says(n, 'Cast') && attr(n, 'type')?.toLowerCase() === 'button'),
  }),
  quest({
    id: 'citadel-select', biome: 3, title: 'Choose a potion', concept: 'Select controls', chapter: 'html_form_elements',
    instruction: 'Build a select with name="potion" and two options: Heal with value="heal", then Mana with value="mana".',
    starter: '<select name="potion">\n</select>', solution: '<select name="potion"><option value="heal">Heal</option><option value="mana">Mana</option></select>',
    hint: 'Each option needs a value attribute and its visible name. Heal comes first, Mana second.',
    rule: r => has(r, 'select', n => attr(n, 'name') === 'potion' && children(n).length === 2 && children(n).every((o, i) => o.tagName === 'option' && attr(o, 'value') === ['heal', 'mana'][i] && says(o, ['Heal', 'Mana'][i]))),
  }),
  quest({
    id: 'citadel-notes', biome: 3, title: 'Write a field note', concept: 'Textarea', chapter: 'html_form_elements',
    instruction: 'Create a textarea named notes, with rows="3", containing The gate is sealed.',
    starter: '<textarea></textarea>', solution: '<textarea name="notes" rows="3">The gate is sealed.</textarea>',
    hint: 'Textarea text goes between its tags. Add name="notes" and rows="3" to the opening tag.',
    rule: r => has(r, 'textarea', n => attr(n, 'name') === 'notes' && Number(attr(n, 'rows')) === 3 && says(n, 'The gate is sealed.')),
  }),
  quest({
    id: 'citadel-semantic', biome: 3, title: 'Restore the hall', concept: 'Semantic structure', chapter: 'html5_semantic_elements',
    instruction: 'Create a main containing an article. Put an h1 saying Citadel journal and a paragraph saying The final gate awaits. inside that article.',
    starter: '<main>\n  <article>\n  </article>\n</main>', solution: '<main><article><h1>Citadel journal</h1><p>The final gate awaits.</p></article></main>',
    hint: 'Nest article inside main. Place both h1 and p inside article.',
    rule: r => has(r, 'main', n => has(n, 'article', a => has(a, 'h1', h => says(h, 'Citadel journal')) && has(a, 'p', p => says(p, 'The final gate awaits.')))),
  }),
  quest({
    id: 'citadel-capstone', biome: 3, title: 'The Null King', concept: 'Final boss: an accessible form', chapter: 'html_forms',
    instruction: 'Build a main with an h1 saying Quest complete and a form. Inside the form, add a label saying Hero with for="hero", an input with id="hero", name="hero", and required, plus a submit button labeled Save quest.',
    starter: '<main>\n  <h1></h1>\n  <form>\n  </form>\n</main>',
    solution: '<main><h1>Quest complete</h1><form><label for="hero">Hero</label><input id="hero" name="hero" required><button type="submit">Save quest</button></form></main>',
    hint: 'The form belongs inside main. Match label for with input id, add the boolean required attribute, and use a submit button.',
    rule: r => has(r, 'main', n => has(n, 'h1', h => says(h, 'Quest complete')) && has(n, 'form', f => has(f, 'label', l => says(l, 'Hero') && attr(l, 'for') === 'hero') && has(f, 'input', i => attr(i, 'id') === 'hero' && attr(i, 'name') === 'hero' && attr(i, 'required') !== undefined && (attr(i, 'type') ?? 'text').toLowerCase() === 'text') && has(f, 'button', b => says(b, 'Save quest') && (attr(b, 'type') ?? 'submit').toLowerCase() === 'submit'))),
  }),
];

export function getChallenge(index: number): Challenge {
  const challenge = challenges[index];
  if (!challenge) throw new RangeError(`Challenge index ${index} is outside the campaign.`);
  return challenge;
}

export function getChallengeVariant(index: number, previousId?: string): Challenge {
  return createQuestionVariant(getChallenge(index), index, previousId);
}
