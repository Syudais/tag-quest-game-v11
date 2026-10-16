import { icon } from './icons';

const actionIcon=(id:string,name:string,label:string,extra='')=>`<button id="${id}" class="icon-button" aria-label="${label}" data-tooltip="${label}" title="${label}" ${extra}>${icon(name)}</button>`;

export const gameFrameMarkup = `
<main class="game-shell">
  <section class="play-layout game-frame" id="play-layout" aria-label="Tag Quest game">
    <section class="world-frame" aria-label="Playable fantasy world">
      <div id="game-stage" aria-label="Use WASD or arrow keys to move, E to interact."></div>
      <header class="game-toolbar">
        <div class="brand">${icon('book')}<span>Tag Quest</span></div>
        <div class="location-summary"><span class="chapter-number" id="chapter-number">Chapter I</span><h1 id="region-title">Verdant Ruins</h1><span class="location-kind" id="location-kind">Exploration field</span></div>
        <nav class="header-actions" aria-label="Game utilities">
          ${actionIcon('map-button','map','Stage menu')}
          ${actionIcon('lessons-button','lesson','Learn HTML with Mr. Rifky')}
          ${actionIcon('guide-toggle','mentor','Call Mr. Rifky','aria-haspopup="dialog" aria-controls="rifky-dialog"')}
          ${actionIcon('code-toggle','code','Show or hide code panel','aria-controls="code-panel" aria-expanded="true" hidden')}
          ${actionIcon('fullscreen-button','fullscreen','Enter fullscreen')}
          <button id="sound-button" class="icon-button" aria-label="Turn sound on" data-tooltip="Turn sound on" title="Turn sound on" aria-pressed="false">${icon('sound')}<span class="muted-mark"></span></button>
          ${actionIcon('difficulty-button','difficulty','Difficulty: Normal','aria-haspopup="dialog" aria-controls="rifky-dialog"')}
        </nav>
      </header>
      <section class="world-health hero-hud" aria-label="Hero status">
        <div class="hero-identity"><strong id="hero-level">Level 1</strong><span>Codex initiate</span></div>
        <div class="hero-resources">
          <div class="resource-group"><div class="resource-label"><span>HP</span><strong id="hero-health">100 / 100</strong></div><div class="resource-track"><i id="hero-health-fill"></i></div></div>
          <div class="resource-group"><div class="resource-label"><span>Chakra</span><strong id="chakra-count">80 / 80</strong></div><div class="resource-track chakra"><i id="chakra-fill"></i></div></div>
          <div class="resource-group"><div class="resource-label"><span>Stamina</span><strong id="stamina-count">100</strong></div><div class="resource-track stamina"><i id="stamina-fill"></i></div></div>
          <div class="resource-group"><div class="resource-label"><span>XP</span><strong id="xp-count">0 / 80</strong></div><div class="resource-track experience"><i id="xp-fill"></i></div></div>
        </div>
        <div class="campaign-progress"><span id="campaign-count">0 / 24 encounters</span><span class="progress-track"><i id="campaign-fill"></i></span><span id="boss-count">0 / 4 guardians</span></div>
      </section>
      <div class="quest-overlay" id="quest-overlay"><h2 id="quest-title">A world in fragments.</h2><p id="quest-description">Find the sentry ahead. Your HTML will open the path.</p></div>
      <section class="combat-hud" id="combat-hud" aria-label="Enemy status" hidden></section>
      <strong id="admin-mode-banner" class="admin-mode-banner" hidden>ADMIN TEST MODE</strong>
      <span id="mentor-hint-announcement" class="sr-only" role="status" aria-live="polite" aria-atomic="true"></span>
      <button id="interact-button" class="interact-button icon-button" aria-label="Approach a sentry" data-tooltip="Approach a sentry, then press E" title="Interact · E" disabled>${icon('begin')}<kbd>E</kbd><span id="interact-label" class="sr-only">Approach a sentry</span></button>
      <div class="touch-controls" aria-label="Touch movement"><button data-direction="up" aria-label="Move up">${icon('up')}</button><div><button data-direction="left" aria-label="Move left">${icon('left')}</button><button data-direction="down" aria-label="Move down">${icon('down')}</button><button data-direction="right" aria-label="Move right">${icon('right')}</button></div></div>

      <section id="action-bar" class="action-bar" aria-label="Combat techniques and defense" hidden>
        <div class="skill-strip"><div class="skill-bar" id="skill-bar" aria-label="Choose your combat technique"></div><p class="skill-detail sr-only" id="skill-detail"></p></div>
        <div id="defense-controls" class="defense-controls" aria-label="Timed defense"></div>
      </section>
      <div class="game-status floating-status"><div class="status-message" id="status-message" role="status" aria-live="polite">Restore the Codex, one HTML encounter at a time.</div><div class="keybindings"><span><kbd>WASD</kbd> Move</span><span><kbd>E</kbd> Interact</span></div></div>
      <div class="load-screen" id="load-screen"><div class="load-seal">${icon('book')}</div><h2>Opening the Codex</h2><p id="load-message">Loading the lands and animated characters…</p></div>
      <div class="toast" id="toast" role="status" hidden></div>
    </section>

    <aside id="code-panel" class="code-panel" aria-label="HTML editor and previews" hidden>
      <section class="workbench" id="workbench" aria-label="Write your HTML">
        <header class="workbench-top"><span id="encounter-label">Sentry encounter</span><span class="lesson-progress" id="lesson-progress">Encounter 1 of 24</span>${actionIcon('retreat-button','retreat','Retreat to the field')}${actionIcon('close-editor','close','Hide code panel')}</header>
        <div class="lesson-copy"><h2 id="challenge-title">A first heading</h2><p id="challenge-instruction"></p><a id="lesson-source" class="sr-only" tabindex="-1" aria-hidden="true" href="https://www.w3schools.com/html/" target="_blank" rel="noreferrer">W3Schools source lesson</a></div>
        <div class="pressure-clock" id="pressure-clock" tabindex="0"><div><span>${icon('timer')} Pressure</span><strong id="pressure-seconds">Paused</strong></div><div class="pressure-track"><i id="pressure-fill"></i></div><span class="pressure-budget" id="pressure-budget"></span><p id="critical-window">Fast answers can critically strike.</p></div>
        <div class="editor-heading"><label id="editor-label">Your HTML</label><span>Ctrl + Enter</span></div><div id="code-editor" aria-labelledby="editor-label"></div>
        <div class="feedback" id="feedback" role="status" aria-live="polite">Read the task, then write your HTML.</div>
      </section>
      <section id="output-rail" class="output-rail" aria-label="Compare HTML output">
        <section class="preview-pane output-pane expected-pane"><h2>Expected result</h2><p id="expected-hint">Match the target.</p><iframe id="expected-preview" title="Expected HTML result" sandbox=""></iframe></section>
        <section class="preview-pane output-pane actual-pane"><h2>Your output</h2><p id="actual-hint">Updates as you type.</p><iframe id="html-preview" title="Your live HTML output" sandbox=""></iframe></section>
        <p class="preview-semantic-note">Match the result and use the requested HTML tags.</p>
      </section>
      <div class="code-actions" aria-label="HTML actions">
        <button id="execute-button" class="icon-button execute-button" aria-label="Execute Blade strike" data-tooltip="Execute Blade strike · Ctrl + Enter" title="Execute Blade strike · Ctrl + Enter">${icon('sword')}</button>
        ${actionIcon('hint-button','hint','Ask Mr. Rifky for a hint')}
        ${actionIcon('solution-button','example','Study a code example with Mr. Rifky')}
        ${actionIcon('read-lesson','book','Read this lesson with Mr. Rifky · pauses the fight')}
      </div>
    </aside>

    <dialog id="map-dialog" class="map-dialog"><div class="dialog-heading"><div><h2>The fractured lands</h2><p>Five sentries and one guardian stand in each region.</p></div>${actionIcon('credits-button','info','Art and credits')}<button class="icon-button" data-close="map-dialog" aria-label="Close map">${icon('close')}</button></div><div id="map-grid" class="map-grid"></div><p class="map-note">Defeat a region’s guardian to unlock the next land. Each land has an exploration field and a fighting ground.</p><button id="reset-button" class="quiet-danger">Reset journey</button></dialog>
    <dialog id="credits-dialog"><div class="dialog-heading"><h2>Made from open game art.</h2><button class="icon-button" data-close="credits-dialog" aria-label="Close credits">${icon('close')}</button></div><p>Characters, effects, environments, and ground layers come from OpenDuelyst, released under CC0 by Counterplay Games. This is an independent HTML learning game.</p><p>Phaser: MIT. Lucide icons: ISC. Cinzel type: SIL Open Font License. Original HTML lessons and exercises follow source-linked W3Schools topics.</p><div class="credit-links"><a href="https://github.com/open-duelyst/duelyst" target="_blank" rel="noreferrer">OpenDuelyst source</a><a href="https://www.w3schools.com/html/" target="_blank" rel="noreferrer">HTML lessons</a></div></dialog>
    <dialog id="ending-dialog"><div class="ending-art">${icon('book')}</div><h2>The Codex is whole.</h2><p>You completed 24 HTML encounters and defeated four guardians. Every fight tested fresh questions. Your final topic builds a semantic page.</p><button id="ending-close" class="execute-button">Return to the realm</button></dialog>
    <dialog id="stage-menu" class="stage-menu" aria-label="Choose a stage"></dialog>
    <dialog id="rifky-dialog" class="rifky-dialog" aria-labelledby="rifky-speaker rifky-title">
      <div class="rifky-scene">
        <img class="rifky-portrait" src="${import.meta.env.BASE_URL}assets/mentor/portrait.png" alt="Mr. Rifky">
        <section class="rifky-dialogue-box">
          <header class="rifky-speaker-line"><strong id="rifky-speaker">Mr. Rifky</strong><span id="rifky-page"></span><button id="rifky-close" class="icon-button" aria-label="Close conversation">${icon('close')}</button></header>
          <h2 id="rifky-title"></h2><p id="rifky-message"></p>
          <section id="rifky-example" class="rifky-example" aria-label="HTML example and result" hidden><div><h3>Your HTML</h3><pre id="rifky-code"></pre></div><div><h3>What the browser shows</h3><iframe id="rifky-preview" title="Mr. Rifky's rendered HTML example" sandbox=""></iframe></div></section>
          <a id="rifky-source" target="_blank" rel="noreferrer" hidden>Source lesson at W3Schools</a>
          <nav id="rifky-choices" class="rifky-choices" aria-label="Conversation choices"></nav>
          <div class="rifky-dialogue-actions"><button id="rifky-back" class="secondary-action" hidden>Back</button><button id="rifky-next" class="execute-button">Next</button></div>
          <span class="rifky-pause-note">The world waits while we talk.</span>
        </section>
      </div>
    </dialog>
    <dialog id="guided-tour" class="guided-tour" aria-labelledby="tour-speaker tour-title" aria-describedby="tour-message">
      <svg class="tour-dimmer" aria-hidden="true" preserveAspectRatio="none"><defs><mask id="tour-spotlight-mask"><rect width="100%" height="100%" fill="white"/><rect id="tour-cutout" width="0" height="0" rx="5" fill="black"/></mask></defs><rect width="100%" height="100%" fill="rgba(3,7,12,.84)" mask="url(#tour-spotlight-mask)"/></svg>
      <div id="tour-outline" class="tour-outline" aria-hidden="true" hidden></div>
      <section class="tour-presentation">
        <img class="tour-portrait" src="${import.meta.env.BASE_URL}assets/mentor/portrait.png" alt="Mr. Rifky">
        <div class="tour-dialogue-box"><div class="tour-copy" aria-live="polite" aria-atomic="true"><header><strong id="tour-speaker">Mr. Rifky</strong><span id="tour-count"></span></header><h2 id="tour-title"></h2><p id="tour-message"></p></div><p class="tour-pause-note">Training only. Your fight and code are safe.</p><nav class="tour-actions" aria-label="Tutorial navigation"><button id="tour-back" class="secondary-action" hidden>Back</button><button id="tour-skip" class="secondary-action">Skip tour</button><button id="tour-next" class="execute-button">Next</button></nav></div>
      </section>
    </dialog>
    <dialog id="defeat-dialog"><div class="dialog-heading"><h2>A lesson, not the end.</h2></div><p>The enemy won this exchange. Your completed challenges and experience are safe. Retry with restored vitality and chakra.</p><button id="retry-button" class="execute-button">${icon('reset')} Retry encounter</button><button id="defeat-lesson" class="secondary-action">Review this HTML lesson</button></dialog>
  </section>
</main>`;
