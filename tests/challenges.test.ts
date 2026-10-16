import { describe, expect, it } from 'vitest';
import { challenges, getChallenge } from '../src/challenges';

describe('HTML curriculum', () => {
  it('has six original exercises per biome and unique IDs', () => {
    expect(challenges).toHaveLength(24);
    expect(new Set(challenges.map(c => c.id)).size).toBe(24);
    for (let biome = 0; biome < 4; biome++) {
      expect(challenges.filter(c => c.biome === biome)).toHaveLength(6);
    }
  });

  for (const challenge of challenges) {
    it(`accepts the intended solution for ${challenge.id}`, () => {
      expect(challenge.validate(challenge.solution)).toEqual({ ok: true, message: 'HTML complete. Your move is ready.' });
      expect(challenge.validate('   ').ok).toBe(false);
      expect(challenge.source.startsWith('https://www.w3schools.com/html/')).toBe(true);
    });
  }

  it('accepts equivalent quoting, whitespace and HTML tag case', () => {
    expect(getChallenge(6).validate("  <A HREF='/ruins'>\n  Enter ruins \n</A> ").ok).toBe(true);
    expect(getChallenge(7).validate("<IMG ALT='A blue crystal' SRC='/relic.png' />").ok).toBe(true);
    expect(getChallenge(10).validate('<p class="equipped relic rare">Crystal staff</p>').ok).toBe(true);
  });

  it('checks actual elements and attributes rather than text that resembles HTML', () => {
    expect(getChallenge(6).validate('&lt;a href="/ruins"&gt;Enter ruins&lt;/a&gt;').ok).toBe(false);
    expect(getChallenge(6).validate('<a href="/wrong">Enter ruins</a>').ok).toBe(false);
    expect(getChallenge(7).validate('<img src="/relic.png" alt="">').ok).toBe(false);
    expect(getChallenge(18).validate('<label for="wrong">Hero name</label><input id="hero" name="hero">').ok).toBe(false);
    expect(getChallenge(23).validate(getChallenge(23).solution.replace(' required', '')).ok).toBe(false);
  });

  it('rejects misspelled tags and malformed source even if a browser repairs it', () => {
    expect(getChallenge(0).validate('<h1>Forest Gate</h1><paragraph>extra</paragraph>').ok).toBe(false);
    expect(getChallenge(0).validate('<h1>Forest Gate').ok).toBe(false);
    expect(getChallenge(4).validate('<p><strong>Stay ready</p>').ok).toBe(false);
    expect(getChallenge(6).validate('<a href="/ruins" href="/wrong">Enter ruins</a>').ok).toBe(false);
  });

  it('checks list order, containment and table cell semantics', () => {
    expect(getChallenge(12).validate('<ul><li>Potion</li><li>Rope</li><li>Map</li></ul>').ok).toBe(false);
    expect(getChallenge(11).validate('<a href="/sanctum"></a><img src="/relic.png" alt="Crystal key">').ok).toBe(false);
    expect(getChallenge(14).validate('<table><tr><td>Item</td><td>Cost</td></tr><tr><td>Potion</td><td>5</td></tr></table>').ok).toBe(false);
  });

  it('allows standard optional end tags where the task does not require explicit closing tags', () => {
    expect(getChallenge(12).validate('<ul><li>Map<li>Rope<li>Potion</ul>').ok).toBe(true);
  });

  it('fails clearly if a caller requests a nonexistent challenge', () => {
    expect(() => getChallenge(24)).toThrow(RangeError);
    expect(() => getChallenge(-1)).toThrow(RangeError);
  });
});
