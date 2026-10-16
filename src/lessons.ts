import { challenges } from './challenges';

export interface Lesson {
  id: string;
  title: string;
  concept: string;
  summary: string;
  points: string[];
  example: string;
  source: string;
  practice?: string;
}

export interface TutorialStep {
  title: string;
  body: string;
  keys?: string[];
}

export const tutorialSteps: TutorialStep[] = [
  {
    title: 'Meet your first sentry',
    body: 'Walk across the field and approach the sentry. Interact to enter its arena. Movement stops while you type in the editor.',
    keys: ['WASD', 'Arrow keys', 'E'],
  },
  {
    title: 'Learn, choose, then write',
    body: 'Encounters begin right away. Choose an available technique and complete the HTML objective. Call Mr. Rifky to pause the fight while you read. The preview shows what your markup creates.',
    keys: ['Ctrl+Enter', 'Cmd+Enter'],
  },
  {
    title: 'Watch the enemy wind-up',
    body: 'Fast correct answers earn a critical chance. A wrong submission can provoke a critical counterattack; running out of time also triggers an enemy turn. Use the Dodge or Parry controls during the marked defense window. Lessons pause the clock.',
  },
];

export const htmlFoundations: Lesson[] = [
  {
    id: 'foundation-document', title: 'What HTML builds', concept: 'Document structure',
    summary: 'HTML gives a page its content and structure. In this game, your markup describes a real page fragment; the game turns a correct answer into an action.',
    points: [
      'A full page starts with <!DOCTYPE html> and an html element.',
      'head holds page information; body holds the visible content.',
      'The challenge editor already provides a page shell, so write only the requested fragment.',
    ],
    example: '<!DOCTYPE html>\n<html lang="en">\n  <head><title>Camp journal</title></head>\n  <body><h1>Camp journal</h1><p>Day one.</p></body>\n</html>',
    source: 'https://www.w3schools.com/html/html_intro.asp',
    practice: 'Identify the heading and paragraph inside the body before your first encounter.',
  },
  {
    id: 'foundation-elements', title: 'Read a pair of tags', concept: 'Elements and nesting',
    summary: 'Most elements have an opening tag, content, and a closing tag. Elements can contain other elements: close the inner one before the outer one.',
    points: [
      'The slash marks a closing tag: </p>.',
      'In <p><em>Quiet</em></p>, em is inside p.',
      'Void elements such as img and input do not have closing tags.',
    ],
    example: '<p>Keep your <strong>shield</strong> ready.</p>',
    source: 'https://www.w3schools.com/html/html_elements.asp',
    practice: 'Find the opening and closing tags for the outer paragraph and inner strong element.',
  },
  {
    id: 'foundation-attributes', title: 'Give an element details', concept: 'Attributes',
    summary: 'An attribute adds information to an element. Write it inside the opening tag, usually as a name and a quoted value.',
    points: [
      'In href="/camp", href is the name and /camp is the value.',
      'Separate multiple attributes with spaces; their order usually does not matter.',
      'Attributes belong in the opening tag, not in the visible text or closing tag.',
    ],
    example: '<a href="/camp" title="Return to camp">Rest here</a>',
    source: 'https://www.w3schools.com/html/html_attributes.asp',
    practice: 'Find the destination attribute and the visible link text. They have different jobs.',
  },
];

type LessonContent = Pick<Lesson, 'summary' | 'points' | 'example'> & { source?: string };

const content: LessonContent[] = [
  {
    summary: 'A heading names a page or section. Use h1 for the main heading and lower levels for subsections.',
    points: ['Headings range from h1 to h6.', 'Put the heading text between matching tags.', 'Choose a level for its place in the outline, not just its size.'],
    example: '<h1>Camp journal</h1>\n<h2>Morning patrol</h2>',
  },
  {
    summary: 'A paragraph groups a sentence or a longer passage of text. It gives prose a meaningful block in the document.',
    points: ['Start the paragraph with <p>.', 'Write its text before </p>.', 'Extra spaces and source line breaks usually collapse in the preview.'],
    example: '<p>The lantern lights our camp.</p>',
  },
  {
    summary: 'strong marks content with importance. It can wrap just a few words inside a larger paragraph.',
    points: ['Keep the surrounding sentence in its paragraph.', 'Wrap only the important words in strong.', 'Browsers usually render strong in bold, but its meaning is importance.'],
    example: '<p><strong>Danger:</strong> loose stones ahead.</p>',
  },
  {
    summary: 'em adds stress to a word or phrase, like emphasis in speech. Moving that stress can change the meaning of a sentence.',
    points: ['Use <em> and </em> around the stressed text.', 'Other sentence text stays outside em.', 'Browsers usually use italics; the element communicates emphasis.'],
    example: '<p>Take the <em>narrow</em> path.</p>',
  },
  {
    summary: 'Nested markup works like containers. Finish the innermost element first so the intended structure remains clear.',
    points: ['Open the paragraph before its inner strong element.', 'Close strong before closing p.', 'A browser may repair mistakes, but this repair exercise requires both explicit closing tags.'],
    example: '<p><strong>Hold the line</strong></p>',
  },
  {
    summary: 'Your first guardian combines a heading, a paragraph, and an important word. Build the structure outside in, then check it inside out.',
    points: ['The heading and paragraph are siblings.', 'strong belongs inside the paragraph.', 'Read the exact requested text before submitting.'],
    example: '<h1>Camp secured</h1>\n<p>The bridge is <strong>safe</strong>.</p>',
    source: 'https://www.w3schools.com/html/html_basic.asp',
  },
  {
    summary: 'An anchor creates a link. Its href attribute supplies a destination; the text between its tags tells people where it leads.',
    points: ['Use an a element for the link.', 'Place href in the opening tag.', 'HTML defines navigation; it does not itself perform a combat animation.'],
    example: '<a href="/camp">Return to camp</a>',
  },
  {
    summary: 'An image uses src to locate its file and alt to describe its meaning when the image cannot be seen.',
    points: ['img is a void element, without </img>.', 'src is the file path; alt is replacement text.', 'Describe informative images; decorative ones can use empty alt text.'],
    example: '<img src="/lantern.png" alt="A lit brass lantern">',
  },
  {
    summary: 'A fragment link points to a named location in the same page. Match its #destination to the destination element\'s id.',
    points: ['An id should be unique in a page.', 'href includes the # prefix.', 'The destination id omits the # prefix.'],
    example: '<a href="#bridge">Bridge notes</a>\n<h2 id="bridge">Old bridge</h2>',
  },
  {
    summary: 'The title attribute adds advisory information to an element. It belongs in the opening tag and is separate from visible paragraph text.',
    points: ['Quote a title value that contains spaces.', 'Keep visible text between the tags.', 'Do not hide essential instructions in title; touch and keyboard access can be unreliable.'],
    example: '<p title="Patrol begins at sunrise">East watch</p>',
  },
  {
    summary: 'A class gives an element a reusable group name. CSS or JavaScript can later select that group; a class alone does not apply an appearance.',
    points: ['Set class in the opening tag.', 'Separate multiple class names with spaces.', 'Different elements can share the same class.'],
    example: '<p class="equipment rare">Silver shield</p>',
  },
  {
    summary: 'A link can contain an image instead of text. The image\'s alternative text should make the link\'s purpose understandable.',
    points: ['The outer a supplies href.', 'The inner img supplies src and alt.', 'An image beside a link is different from an image inside it.'],
    example: '<a href="/beacon">\n  <img src="/beacon.png" alt="Open the beacon map">\n</a>',
  },
  {
    summary: 'An unordered list groups related items without a ranking. The ul container holds one li element for each item.',
    points: ['Use ul for the list container.', 'Put each item inside its own li.', 'The exercise specifies an order to check your work, even though the list uses bullets.'],
    example: '<ul>\n  <li>Lantern</li>\n  <li>Shield</li>\n</ul>',
  },
  {
    summary: 'Use an ordered list when the sequence matters, such as instructions or a route. Its items are numbered by default.',
    points: ['Use ol instead of ul.', 'Each step still uses an li element.', 'Write the steps in their intended sequence.'],
    example: '<ol>\n  <li>Open the gate</li>\n  <li>Ring the bell</li>\n</ol>',
  },
  {
    summary: 'A table represents related data in rows and columns. Use header cells to name the data, and data cells for the values.',
    points: ['table contains tr rows.', 'th names a column or row; td holds a data value.', 'Tables describe data, rather than arranging an entire page layout.'],
    example: '<table>\n  <tr><th>Tool</th><th>Count</th></tr>\n  <tr><td>Lantern</td><td>2</td></tr>\n</table>',
  },
  {
    summary: 'A caption gives a table a visible name. Keep it inside table, immediately after the opening table tag.',
    points: ['Use a caption element for the name.', 'Put it before the table rows.', 'The caption describes the whole table, unlike a header cell.'],
    example: '<table>\n  <caption>Camp equipment</caption>\n  <tr><td>Lantern</td></tr>\n</table>',
    source: 'https://www.w3schools.com/tags/tag_caption.asp',
  },
  {
    summary: 'A div groups elements without naming a specific meaning. It is useful when a group needs a shared class but has no suitable semantic element.',
    points: ['Nest the related elements inside div.', 'A class gives the group a reusable name.', 'The container alone does not create an inventory feature or apply CSS.'],
    example: '<div class="equipment">\n  <h2>Camp tools</h2>\n  <p>Two lanterns remain.</p>\n</div>',
  },
  {
    summary: 'A section groups content around one topic. Give it a heading and keep its related list inside the same section.',
    points: ['The heading describes the section.', 'The list contains li elements.', 'Check both nesting and item order in this guardian challenge.'],
    example: '<section>\n  <h2>Night watch</h2>\n  <ul><li>Lantern</li><li>Cloak</li></ul>\n</section>',
    source: 'https://www.w3schools.com/html/html5_semantic_elements.asp',
  },
  {
    summary: 'A text input accepts a short response. Its label gives it an accessible name and a larger clickable target.',
    points: ['label for matches the input id.', 'name identifies the value when a form submits.', 'input is void; label has opening and closing tags.'],
    example: '<label for="traveler">Traveler</label>\n<input type="text" id="traveler" name="traveler">',
    source: 'https://www.w3schools.com/tags/tag_label.asp',
  },
  {
    summary: 'A button is an interactive control. Its type determines whether it is a regular button or a form submission control.',
    points: ['Use type="button" for a regular button.', 'Put its visible name between its tags.', 'Making the button perform an action requires behavior supplied by the surrounding app.'],
    example: '<button type="button">Raise shield</button>',
    source: 'https://www.w3schools.com/tags/tag_button.asp',
  },
  {
    summary: 'A select lets someone choose from a list. Each option has visible text and can have a separate value for submitted form data.',
    points: ['name identifies the select\'s submitted value.', 'Nest each option inside select.', 'In a real form, connect a visible label using for and id.'],
    example: '<label for="tool">Tool</label>\n<select id="tool" name="tool">\n  <option value="lamp">Lantern</option>\n  <option value="rope">Rope</option>\n</select>',
    source: 'https://www.w3schools.com/tags/tag_select.asp',
  },
  {
    summary: 'A textarea is a field for multiple lines of text. Its initial content belongs between its tags, rather than in a value attribute.',
    points: ['Set name to identify the submitted field.', 'rows controls the initial visible line count.', 'Pair the field with a label in a complete form.'],
    example: '<label for="log">Patrol log</label>\n<textarea id="log" name="log" rows="4">The bridge is safe.</textarea>',
    source: 'https://www.w3schools.com/tags/tag_textarea.asp',
  },
  {
    summary: 'Semantic elements describe the role of content. main marks the page\'s primary content, while article holds a self-contained piece.',
    points: ['Use main for the page\'s main content.', 'An article can contain its own heading and paragraphs.', 'Meaningful structure helps people and tools understand the document.'],
    example: '<main>\n  <article>\n    <h1>Patrol report</h1>\n    <p>The camp is quiet.</p>\n  </article>\n</main>',
  },
  {
    summary: 'The final guardian combines a meaningful page region with a small form. The form groups controls; a submit button requests submission.',
    points: ['Match the label for with the input id, and give the input a name.', 'required is a boolean attribute: its presence enables the constraint.', 'A real form needs a destination or application behavior to save data. This preview does not submit it.'],
    example: '<main>\n  <h1>Patrol complete</h1>\n  <form>\n    <label for="traveler">Traveler</label>\n    <input id="traveler" name="traveler" required>\n    <button type="submit">Save report</button>\n  </form>\n</main>',
  },
];

export const lessons: Lesson[] = challenges.map((challenge, index) => ({
  id: `lesson-${challenge.id}`,
  title: challenge.title,
  concept: challenge.concept,
  summary: content[index].summary,
  points: content[index].points,
  example: content[index].example,
  source: content[index].source ?? challenge.source,
  practice: challenge.instruction,
}));

export const learningPath: Lesson[] = [
  ...htmlFoundations,
  ...[9, 0, 1, 4, 2, 3, 5, 6, 7, 8, 11, 14, 15, 12, 13, 16, 10, 17, 22, 18, 19, 20, 21, 23]
    .map(index => lessons[index]),
];

export function getLessonForChallenge(index: number): Lesson {
  const lesson = lessons[index];
  if (!lesson) throw new RangeError(`Lesson index ${index} is outside the campaign.`);
  return lesson;
}
