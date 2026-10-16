import { challenges } from './challenges';
import type { Challenge } from './types';

export interface StageMeta {
  id: string;
  index: number;
  biome: number;
  title: string;
  material: string;
  source: string;
}

export interface OverviewPage {
  title: string;
  message: string;
}

export interface ChapterOverview {
  id: string;
  biome: number;
  title: string;
  pages: OverviewPage[];
}

const materials = [
  'Main headings with <h1>.',
  'Paragraphs with <p>.',
  'Important words with <strong>.',
  'Stressed words with <em>.',
  'Nested elements and closing tags.',
  'Guardian: combine a heading, paragraph, and important word.',
  'Links and the href attribute.',
  'Images with src and meaningful alt text.',
  'Page bookmarks with href and id.',
  'Extra element information with title.',
  'Reusable group names with class.',
  'Guardian: put an image inside a link.',
  'Bulleted lists with <ul> and <li>.',
  'Numbered steps with <ol> and <li>.',
  'Table rows, header cells, and data cells.',
  'Table names with <caption>.',
  'Group related elements inside <div>.',
  'Guardian: a section with a heading and a list.',
  'Connect a label to a named text input.',
  'Regular buttons and their type attribute.',
  'Choices with <select> and <option>.',
  'Longer text input with <textarea>.',
  'Meaningful page regions with <main> and <article>.',
  'Final guardian: a labeled form with a required input.',
];

export const stages: StageMeta[] = challenges.map((challenge, index) => ({
  id: challenge.id,
  index,
  biome: challenge.biome,
  title: challenge.title,
  material: materials[index],
  source: challenge.source,
}));

export const chapterOverviews: ChapterOverview[] = [
  {
    id: 'verdant', biome: 0, title: 'Verdant Ruins',
    pages: [{
      title: 'Verdant Ruins: learn the tags.',
      message: 'Stages 1 to 5 teach headings, paragraphs, important words, emphasis, and nesting. At stage 6, the Root Warden asks you to combine those skills.',
    }],
  },
  {
    id: 'glacier', biome: 1, title: 'Frostfall Citadel',
    pages: [{
      title: 'Frostfall Citadel: connect the page.',
      message: 'Stages 7 to 11 teach links, images, bookmarks, title attributes, and classes. At stage 12, the Crystal Sentinel asks you to make an image into a link.',
    }],
  },
  {
    id: 'ember', biome: 2, title: 'Ember Reach',
    pages: [{
      title: 'Ember Reach: organize your content.',
      message: 'Stages 13 to 17 teach lists, table cells, table captions, and containers. At stage 18, the Ash Colossus asks for a section with a heading and list.',
    }],
  },
  {
    id: 'void', biome: 3, title: 'Hollow Gate',
    pages: [{
      title: 'Hollow Gate: build a useful page.',
      message: 'Stages 19 to 23 teach labels, inputs, buttons, choices, textareas, and meaningful page regions. At stage 24, the Null King asks you to build a labeled form.',
    }],
  },
];

export const gameOverviewPages: OverviewPage[] = [
  {
    title: 'Four lands. Twenty-four stages.',
    message: 'Each land has five sentries and one guardian. Defeat the opponent to clear its stage. Your completed stages stay open, and the next stage opens when you win.',
  },
  {
    title: 'Your code readies your art.',
    message: 'Match the HTML task, choose an art, and execute. Each correct answer readies one move. More complex HTML gets extra time. Call me whenever you want to pause and learn.',
  },
  ...chapterOverviews.flatMap(chapter => chapter.pages),
];

const shortHints = [
  'Headings use <h1> and </h1>.',
  'Remember <p> and </p>.',
  'Put <strong> around only the important word.',
  '<em> wraps the word you want to stress.',
  'Close the inner tag before the outer tag.',
  'Keep the heading and paragraph beside each other.',
  'The link destination belongs in href on <a>.',
  '<img> needs src and meaningful alt text.',
  'Match href="#name" with id="name".',
  'title="..." goes in the opening tag.',
  'Group names go inside class="...".',
  'The image belongs inside the link.',
  'Each list item needs its own <li>.',
  'Use <ol> for steps, with <li> inside.',
  'Headers use <th>; data uses <td>.',
  'Put <caption> before the first table row.',
  'Keep related elements inside the same <div>.',
  'Place the heading and list inside <section>.',
  'The label for value must match the input id.',
  'A regular button uses type="button".',
  'Each <option> belongs inside <select>.',
  'Textarea text goes between its two tags.',
  'Put the article inside main, then add its content.',
  'Match label and input, then check required and submit.',
];

export function getShortHint(challenge: Challenge, index: number): string {
  const baseIndex = challenges.findIndex(base => challenge.id === base.id || challenge.id.startsWith(`${base.id}:`));
  return shortHints[baseIndex >= 0 ? baseIndex : index]
    ?? 'Check your opening tags, closing tags, and quoted attributes.';
}
