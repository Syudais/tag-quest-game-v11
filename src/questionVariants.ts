import { parseFragment } from 'parse5';
import type { Challenge } from './types';

interface Node {
  nodeName: string; tagName?: string; value?: string;
  attrs?: { name: string; value: string }[]; childNodes?: Node[];
  sourceCodeLocation?: { endTag?: unknown } | null;
}
interface Question { instruction: string; starter: string; solution: string; hint: string }
const bags = new Map<number, number[]>();
const voidTags = new Set(['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'param', 'source', 'track', 'wbr']);
const normalize = (value = '') => value.replace(/\s+/g, ' ').trim();
const nodes = (node: Node) => (node.childNodes ?? []).filter(child => child.tagName || child.nodeName === '#text' && normalize(child.value));
const attribute = (node: Node, name: string) => node.attrs?.find(attr => attr.name === name)?.value;

function matches(actual: Node, expected: Node): boolean {
  if (actual.nodeName !== expected.nodeName || actual.tagName !== expected.tagName) return false;
  if (expected.nodeName === '#text') return normalize(actual.value) === normalize(expected.value);
  if (expected.tagName && !voidTags.has(expected.tagName) && !actual.sourceCodeLocation?.endTag
    && expected.sourceCodeLocation?.endTag) return false;
  for (const attr of expected.attrs ?? []) {
    const value = attribute(actual, attr.name);
    if (attr.name === 'class') {
      if (!attr.value.split(/\s+/).every(token => (value ?? '').split(/\s+/).includes(token))) return false;
    } else if (attr.name === 'required') {
      if (value === undefined) return false;
    } else if (attr.name === 'type' && attr.value === 'text' && actual.tagName === 'input') {
      if ((value ?? 'text').toLowerCase() !== 'text') return false;
    } else if (value !== attr.value) return false;
  }
  const actualChildren = nodes(actual), expectedChildren = nodes(expected);
  return actualChildren.length === expectedChildren.length && expectedChildren.every((child, i) => matches(actualChildren[i], child));
}

function variant(index: number, v: number): Question {
  const places = ['Moonlit Bridge', 'Crystal Hollow', 'Willow Tower', 'Silver Harbor', 'Amber Shrine', 'Lantern Grove'];
  const routes = ['bridge', 'hollow', 'tower', 'harbor', 'shrine', 'grove'];
  const items = ['Moonstone', 'Bronze compass', 'Willow wand', 'Silver lantern', 'Amber shield', 'Crystal flute'];
  const pictures = ['moonstone', 'compass', 'wand', 'lantern', 'shield', 'flute'];
  const descriptions = ['A glowing moonstone', 'A bronze compass', 'A willow wand', 'A silver lantern', 'An amber shield', 'A crystal flute'];
  const verbs = ['Search', 'Gather', 'Protect', 'Guide', 'Explore', 'Restore'];
  const item = items[v], route = routes[v], place = places[v];
  const question = (instruction: string, starter: string, solution: string, hint: string): Question => ({ instruction, starter, solution, hint });
  switch (index) {
    case 0: return question(`Write an h1 heading saying "${place}". Include its closing tag.`, `<h1>${place}`, `<h1>${place}</h1>`, `Keep "${place}" between <h1> and </h1>.`);
    case 1: {
      const sentence = [`The moon lights the bridge.`, `A crystal marks the path.`, `The willow leaves are still.`, `Our boat reaches the harbor.`, `The shrine glows at dawn.`, `Six lanterns guide us home.`][v];
      return question(`Put "${sentence}" inside a paragraph element.`, sentence, `<p>${sentence}</p>`, `Wrap the complete sentence, including its full stop, in <p> and </p>.`);
    }
    case 2: {
      const lead = ['Caution', 'Danger', 'Beware', 'Warning', 'Attention', 'Stop'][v];
      const tail = ['the bridge is narrow.', 'the crystals are sharp.', 'the roots are slippery.', 'the tide is rising.', 'the stones are hot.', 'the gate is locked.'][v];
      return question(`Create a paragraph saying "${lead} ${tail}". Give only "${lead}" strong importance using strong.`, `<p>${lead} ${tail}</p>`, `<p><strong>${lead}</strong> ${tail}</p>`, `Use <strong>${lead}</strong> inside the paragraph; keep the rest outside strong.`);
    }
    case 3: {
      const word = ['quietly', 'carefully', 'slowly', 'bravely', 'gently', 'wisely'][v];
      return question(`Create a paragraph saying "Travel ${word}." Emphasize only "${word}" using em.`, `<p>Travel ${word}.</p>`, `<p>Travel <em>${word}</em>.</p>`, `Write <em>${word}</em> inside p. Keep "Travel" and the full stop outside em.`);
    }
    case 4: {
      const phrase = ['Stay alert', 'Hold steady', 'Keep exploring', 'Stand together', 'Move carefully', 'Trust yourself'][v];
      return question(`Repair the nesting. Both words "${phrase}" belong in strong, inside p. Explicitly close both tags in the right order.`, `<p><strong>${phrase}</p>`, `<p><strong>${phrase}</strong></p>`, `Close the inner strong before the outer paragraph: </strong></p>. Keep both words inside strong.`);
    }
    case 5: {
      const heading = `${place} restored`, word = ['safe', 'bright', 'open', 'calm', 'warm', 'clear'][v];
      return question(`Build an h1 saying "${heading}", followed by a paragraph saying "The way is ${word}." Give only "${word}" strong importance.`, '<h1></h1>\n<p></p>', `<h1>${heading}</h1>\n<p>The way is <strong>${word}</strong>.</p>`, `Use sibling h1 then p. Put <strong>${word}</strong> inside the paragraph.`);
    }
    case 6: return question(`Make a link labeled "Enter ${place}" pointing to "/${route}".`, `<a>Enter ${place}</a>`, `<a href="/${route}">Enter ${place}</a>`, `Set href="/${route}" on a. Keep "Enter ${place}" between its tags.`);
    case 7: return question(`Add an image with src="/${pictures[v]}.png" and alt="${descriptions[v]}". Images have no closing tag.`, `<img src="/${pictures[v]}.png">`, `<img src="/${pictures[v]}.png" alt="${descriptions[v]}">`, `Add alt="${descriptions[v]}" to img and keep src="/${pictures[v]}.png".`);
    case 8: return question(`Create a link labeled "${place}" with href="#${route}", followed by an h2 saying "Reach ${place}" with id="${route}".`, `<a href="#${route}">${place}</a>\n<h2>Reach ${place}</h2>`, `<a href="#${route}">${place}</a>\n<h2 id="${route}">Reach ${place}</h2>`, `The link uses #${route}; the heading uses id="${route}" without #.`);
    case 9: {
      const tooltip = ['Glows after sunset', 'Points toward home', 'Woven from willow', 'Lights the dark path', 'Blocks flying embers', 'Plays a gentle tune'][v];
      return question(`Give a paragraph saying "${item}" the title attribute "${tooltip}".`, `<p>${item}</p>`, `<p title="${tooltip}">${item}</p>`, `Write title="${tooltip}" inside the opening p tag.`);
    }
    case 10: {
      const name = ['treasure', 'navigation', 'magic', 'lighting', 'armor', 'music'][v];
      return question(`Give a paragraph saying "${item}" the class "${name}". Other classes may stay.`, `<p>${item}</p>`, `<p class="${name}">${item}</p>`, `Add class="${name}" to p. Keep "${item}" as the paragraph text.`);
    }
    case 11: return question(`Make an image into a link. The a points to "/${route}" and contains an img with src="/${pictures[v]}.png" and alt="${descriptions[v]}".`, `<a href="/${route}">\n  <img src="/${pictures[v]}.png">\n</a>`, `<a href="/${route}"><img src="/${pictures[v]}.png" alt="${descriptions[v]}"></a>`, `Put img inside a. Set href on a; set src and alt on img.`);
    case 12: {
      const supplies = [['Map', 'Rope', 'Bread'], ['Torch', 'Compass', 'Water'], ['Wand', 'Potion', 'Cloak'], ['Lantern', 'Oar', 'Apple'], ['Shield', 'Helmet', 'Boots'], ['Flute', 'Scroll', 'Key']][v];
      return question(`Build an unordered list with exactly three items in this order: ${supplies.join(', ')}.`, `<ul>\n  ${supplies.join('\n  ')}\n</ul>`, `<ul>${supplies.map(value => `<li>${value}</li>`).join('')}</ul>`, `Use ul with three li children: ${supplies.join(', ')}, in that order.`);
    }
    case 13: {
      const steps = [['Cross bridge', 'Light lantern'], ['Find crystal', 'Open passage'], ['Climb tower', 'Ring bell'], ['Board boat', 'Raise sail'], ['Enter shrine', 'Read inscription'], ['Follow trail', 'Unlock gate']][v];
      return question(`Build an ordered list with exactly two steps: "${steps[0]}", then "${steps[1]}".`, '<ol>\n</ol>', `<ol><li>${steps[0]}</li><li>${steps[1]}</li></ol>`, `Use ol, then one li for "${steps[0]}" and one li for "${steps[1]}".`);
    }
    case 14: {
      const cost = String(3 + v * 2);
      return question(`Build a table. Its header row has Item and Cost in th cells. The next row has "${item}" and "${cost}" in td cells.`, `<table>\n  <tr><td>Item</td><td>Cost</td></tr>\n  <tr><td>${item}</td><td>${cost}</td></tr>\n</table>`, `<table><tr><th>Item</th><th>Cost</th></tr><tr><td>${item}</td><td>${cost}</td></tr></table>`, `Use th for Item and Cost. Keep "${item}" and "${cost}" in td cells in the next row.`);
    }
    case 15: {
      const caption = `${place} supplies`;
      return question(`Add a caption saying "${caption}" as the first element inside the table. Keep the row with its "${item}" cell.`, `<table>\n  <tr><td>${item}</td></tr>\n</table>`, `<table><caption>${caption}</caption><tr><td>${item}</td></tr></table>`, `Put <caption>${caption}</caption> inside table, before the first row.`);
    }
    case 16: {
      const name = ['travel-kit', 'crystal-kit', 'forest-kit', 'sailing-kit', 'guard-kit', 'music-kit'][v];
      const sentence = [`${item} is ready.`];
      return question(`Put an h2 saying "${place} kit" and a paragraph saying "${sentence[0]}" inside one div with class="${name}".`, `<div class="${name}">\n</div>`, `<div class="${name}"><h2>${place} kit</h2><p>${sentence[0]}</p></div>`, `The div needs class="${name}" and two children: h2, then p with the exact requested text.`);
    }
    case 17: {
      const supplies = [['Map', 'Rope'], ['Crystal', 'Torch'], ['Wand', 'Cloak'], ['Compass', 'Oar'], ['Shield', 'Potion'], ['Flute', 'Scroll']][v];
      return question(`Build a section with an h2 saying "${place} expedition" and a ul containing exactly two li items: "${supplies[0]}" then "${supplies[1]}".`, '<section>\n  <h2></h2>\n  <ul></ul>\n</section>', `<section><h2>${place} expedition</h2><ul><li>${supplies[0]}</li><li>${supplies[1]}</li></ul></section>`, `Nest h2 and ul inside section. The ul needs two li children in the requested order.`);
    }
    case 18: {
      const field = ['scout', 'ranger', 'mage', 'sailor', 'guardian', 'bard'][v];
      const label = ['Scout name', 'Ranger name', 'Mage name', 'Sailor name', 'Guardian name', 'Bard name'][v];
      return question(`Create a label saying "${label}" with for="${field}", followed by a text input with id="${field}" and name="${field}".`, `<label>${label}</label>\n<input type="text">`, `<label for="${field}">${label}</label><input type="text" id="${field}" name="${field}">`, `Match label for="${field}" to input id="${field}". Also give the input name="${field}" and type="text".`);
    }
    case 19: return question(`Create a button labeled "${verbs[v]}" with type="button". It must not submit a form.`, `<button>${verbs[v]}</button>`, `<button type="button">${verbs[v]}</button>`, `Set type="button" in the opening tag and keep "${verbs[v]}" as its text.`);
    case 20: {
      const choices = [['Heal', 'Focus'], ['Fire', 'Ice'], ['North', 'South'], ['Boat', 'Bridge'], ['Sword', 'Shield'], ['Song', 'Silence']][v];
      const field = ['remedy', 'element', 'direction', 'route', 'equipment', 'sound'][v];
      return question(`Build a select with name="${field}". Add two options: "${choices[0]}" with value="${choices[0].toLowerCase()}", then "${choices[1]}" with value="${choices[1].toLowerCase()}".`, `<select name="${field}">\n</select>`, `<select name="${field}"><option value="${choices[0].toLowerCase()}">${choices[0]}</option><option value="${choices[1].toLowerCase()}">${choices[1]}</option></select>`, `Use option children inside select, each with its requested value and visible text. Keep the order.`);
    }
    case 21: {
      const field = ['bridge-note', 'crystal-note', 'forest-note', 'harbor-note', 'shrine-note', 'grove-note'][v];
      const sentence = ['The bridge is repaired.', 'The crystal is glowing.', 'The forest path is clear.', 'The harbor is quiet.', 'The shrine is restored.', 'The lanterns are lit.'][v];
      const rows = String(2 + v % 3);
      return question(`Create a textarea named "${field}" with rows="${rows}", containing "${sentence}".`, '<textarea></textarea>', `<textarea name="${field}" rows="${rows}">${sentence}</textarea>`, `Set name="${field}" and rows="${rows}" on textarea. Put the sentence between its opening and closing tags.`);
    }
    case 22: {
      const sentence = ['The bridge is safe again.', 'A crystal lights the hall.', 'The willow guards the path.', 'The boats have returned.', 'The shrine bell rings.', 'The grove welcomes us.'][v];
      return question(`Create a main containing an article. Inside that article, put an h1 saying "${place} journal" and a paragraph saying "${sentence}".`, '<main>\n  <article>\n  </article>\n</main>', `<main><article><h1>${place} journal</h1><p>${sentence}</p></article></main>`, 'Nest article in main, then h1 and p in article. Use the exact requested heading and sentence.');
    }
    case 23: {
      const field = ['scout', 'ranger', 'mage', 'sailor', 'guardian', 'bard'][v];
      const label = ['Scout', 'Ranger', 'Mage', 'Sailor', 'Guardian', 'Bard'][v];
      const heading = `${place} complete`, button = `Save ${route}`;
      return question(`Build a main with an h1 saying "${heading}" and a form. Inside the form, add a label saying "${label}" with for="${field}", a required text input with id="${field}" and name="${field}", and a submit button labeled "${button}".`, '<main>\n  <h1></h1>\n  <form>\n  </form>\n</main>', `<main><h1>${heading}</h1><form><label for="${field}">${label}</label><input type="text" id="${field}" name="${field}" required><button type="submit">${button}</button></form></main>`, `Put h1 and form inside main. In form, match label for to input id="${field}", add name="${field}" and required, then a type="submit" button with the requested text.`);
    }
    default: throw new RangeError(`Challenge index ${index} is outside the campaign.`);
  }
}

export function createQuestionVariant(base: Challenge, index: number, previousId?: string): Challenge {
  let bag = bags.get(index);
  if (!bag?.length) {
    bag = [0, 1, 2, 3, 4, 5];
    for (let i = bag.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [bag[i], bag[j]] = [bag[j], bag[i]];
    }
    bags.set(index, bag);
  }
  const next = bag.findIndex(value => `${base.id}:variant-${value}` !== previousId);
  if (next < 0) {
    bags.delete(index);
    return createQuestionVariant(base, index, previousId);
  }
  const chosen = bag.splice(next, 1)[0];
  const question = variant(index, chosen);
  const expected = parseFragment(question.solution, { sourceCodeLocationInfo: true }) as unknown as Node;
  return {
    ...base, ...question, id: `${base.id}:variant-${chosen}`,
    validate(html) {
      if (!html.trim()) return { ok: false, message: 'Add your HTML before executing a technique.' };
      let parseError = false;
      const actual = parseFragment(html, { sourceCodeLocationInfo: true, onParseError: () => { parseError = true; } }) as unknown as Node;
      if (parseError) return { ok: false, message: 'Check your tags, quotes, and attributes. Keep your draft and try again.' };
      return matches(actual, expected)
        ? { ok: true, message: 'HTML complete. Your technique is ready.' }
        : { ok: false, message: question.hint };
    },
  };
}
