import { EditorState } from '@codemirror/state';
import { EditorView, keymap, lineNumbers, highlightActiveLine, highlightSpecialChars, drawSelection } from '@codemirror/view';
import { history, historyKeymap, defaultKeymap } from '@codemirror/commands';
import { syntaxHighlighting, defaultHighlightStyle } from '@codemirror/language';
import { html } from '@codemirror/lang-html';
import { createGame } from './game';
import { getChallengeVariant } from './challenges';
import type { Challenge, GameAPI, GameState, SkillId, Difficulty } from './types';
import { SKILLS } from './combat';
import { getLessonForChallenge, htmlFoundations, learningPath, type Lesson } from './lessons';
import { icon } from './components/icons';
import { SkillBar } from './components/SkillBar';
import { CombatHUD } from './components/CombatHUD';
import { gameFrameMarkup } from './components/GameFrame';
import { PreviewComparison, previewDocument } from './components/PreviewComparison';
import { GuideCompanion } from './components/GuideCompanion';
import { RifkyDialogue, type RifkyPage } from './components/RifkyDialogue';
import { Tooltip } from './components/Tooltip';
import { GuidedTutorial } from './components/GuidedTutorial';
import { tutorialDemo, type GuidedTutorialPage } from './tutorialContent';
import { StageMenu } from './components/StageMenu';
import { gameOverviewPages, getShortHint } from './stageContent';
import './styles.css';

const root=document.querySelector<HTMLDivElement>('#app')!;
root.innerHTML=gameFrameMarkup;
const effectsButton=document.createElement('button');
effectsButton.id='effects-button';
effectsButton.type='button';
effectsButton.className='icon-button';
effectsButton.setAttribute('aria-label','Reduced effects');
effectsButton.innerHTML=icon('example')+'<span class="effects-reduced-mark" aria-hidden="true"></span>';
root.querySelector('#sound-button')!.after(effectsButton);
const tooltips=new Tooltip(root);

const $=<T extends HTMLElement=HTMLElement>(id:string)=>document.getElementById(id) as T;
let api:GameAPI|undefined, selectedMove:SkillId='attack', currentChallenge:Challenge|undefined;
let state:GameState={phase:'explore',biome:0,heroHp:100,enemyHp:100,completed:0,bosses:0,total:24,message:'',level:1,xp:0,xpToNext:100,maxHp:100,chakra:80,maxChakra:80,stamina:100,enemyMaxHp:100,reactionRemainingMs:0,defenseWindow:false,pressureRemainingMs:30000,pressureLimitMs:30000,pressureBaseMs:30000,pressureMultiplier:1,activeStageIndex:0,adminMode:false,stageTesting:false,skillCooldowns:{attack:0,fireball:0,ice:0,lightning:0,heal:0,guard:0},unlockedSkills:['attack','fireball','heal','guard'],lastCritical:false,encounterTurn:0,learningPaused:false,answerElapsedMs:0,companionHealsRemaining:1,difficulty:'normal'};
let muted=false, submitting=false, previewTimer=0, toastTimer=0, lastCompleted=-1;
try{muted=localStorage.getItem('tag-quest-sound-muted')==='true';}catch{}
const effectsPreferenceKey='tag-quest-reduced-effects';
const reducedMotionPreference=window.matchMedia('(prefers-reduced-motion: reduce)');
let reducedEffects=reducedMotionPreference.matches, effectsPreferenceSaved=false;
try{const saved=localStorage.getItem(effectsPreferenceKey);if(saved==='true'||saved==='false'){reducedEffects=saved==='true';effectsPreferenceSaved=true;}}catch{}
let assisted=false, consumedCorrectAnswer=false, codeExpanded=true, encounterReady=false, tutorialActive=false, activeChallengeIndex=-1, elapsedMs=0, turnKey='', lastLevel=0;
const setupKey='tag-quest-start-flow-v1';
let flowActive=true,firstSetup=true,difficultyChosen=false,questionHintSent=false,victoryHandled=false;
try{firstSetup=localStorage.getItem(setupKey)!=='complete';}catch{}
let launchMenuLocked=firstSetup;
const testDrafts:Record<string,string>={};
const questionCache=new Map<string,{challenge:Challenge;assisted:boolean;hintSent:boolean}>();
interface TourSnapshot { code:string; editorState:EditorState; editorScroll:{top:number;left:number}; expanded:boolean; panelScroll:number; expected:string; texts:Record<string,string>; feedbackClass:string; focus:HTMLElement; }
let tourSnapshot:TourSnapshot|undefined;
const skillBar=new SkillBar($('skill-bar'),setMove);
const combatHUD=new CombatHUD($('combat-hud'),$('defense-controls'),kind=>api?.defend(kind));
const previewComparison=new PreviewComparison($('expected-preview'),$('html-preview'),$('expected-hint'),$('actual-hint'));
const rifky=new RifkyDialogue($('rifky-dialog'),()=>{syncPause();refreshControls();});
const guideCompanion=new GuideCompanion($<HTMLButtonElement>('guide-toggle'),()=>showMentorMenu());
const guidedTutorial=new GuidedTutorial($('guided-tour'),{start:beginGuidedTutorial,page:showTutorialPage,finish:finishGuidedTutorial,syncPause,completed:()=>showGameOverview(true)});
const stageMenu=new StageMenu($('stage-menu'),{start:startSelectedStage,admin:toggleAdmin,close:closeStageMenu,overview:()=>showGameOverview(false),tutorial:showTutorial,difficulty:()=>showDifficultyChoice(true),credits:()=>openDialog('credits-dialog'),artwork:index=>environmentData[index]?.background?assetUrl(environmentData[index].background):''});
root.querySelectorAll<HTMLButtonElement>('button.icon-button').forEach(button=>{const label=button.getAttribute('aria-label');if(label){button.title ||= label;button.dataset.tooltip ||= label;}});
const roman=['I','II','III','IV'];
const regionNames=['Verdant Ruins','Frostfall Citadel','Ember Reach','Hollow Gate'];
let environmentData:any[]=[];
let drafts:Record<string,string>={};
try{drafts=JSON.parse(localStorage.getItem('tag-quest-drafts')||'{}');}catch{drafts={};}

function activeDrafts(){return state.stageTesting?testDrafts:drafts;}
function persistDrafts(){if(!state.stageTesting)try{localStorage.setItem('tag-quest-drafts',JSON.stringify(drafts));}catch{}}
function cacheQuestion(){if(currentChallenge&&activeChallengeIndex>=0)questionCache.set(`${state.stageTesting?'test':'campaign'}:${activeChallengeIndex}`,{challenge:currentChallenge,assisted,hintSent:questionHintSent});}

function toast(message:string){$('toast').textContent=message;$('toast').hidden=false;window.clearTimeout(toastTimer);toastTimer=window.setTimeout(()=>$('toast').hidden=true,3500);}
const editor=new EditorView({parent:$('code-editor'),state:EditorState.create({doc:'',extensions:[lineNumbers(),highlightSpecialChars(),drawSelection(),highlightActiveLine(),history(),syntaxHighlighting(defaultHighlightStyle),html({autoCloseTags:false}),keymap.of([{key:'Mod-Enter',run:()=>{void submit();return true;}},...defaultKeymap,...historyKeymap]),EditorView.lineWrapping,EditorView.contentAttributes.of({'aria-label':'HTML answer editor','spellcheck':'false','autocomplete':'off','autocorrect':'off','autocapitalize':'off'}),EditorView.updateListener.of(update=>{if(update.docChanged){if(!tutorialActive&&currentChallenge){activeDrafts()[currentChallenge.id]=update.state.doc.toString();persistDrafts();}if(!tutorialActive){window.clearTimeout(previewTimer);previewTimer=window.setTimeout(renderPreview,180);}}}),EditorView.theme({'&':{backgroundColor:'#141d28',color:'#e4e9ed',fontSize:'14px'},'.cm-content':{fontFamily:'Consolas, ui-monospace, monospace',caretColor:'#e7bc73',minHeight:'140px',padding:'12px 0'},'.cm-line':{padding:'0 14px'},'.cm-gutters':{backgroundColor:'#111923',color:'#788b99',border:'none'},'.cm-activeLineGutter':{backgroundColor:'#1c2935'},'.cm-activeLine':{backgroundColor:'#1b283344'},'&.cm-focused':{outline:'none'},'.cm-selectionBackground':{backgroundColor:'#344d66 !important'},'.cm-cursor':{borderLeftColor:'#e7bc73'},'.cm-scroller':{overflow:'auto'}})]})});
editor.dom.addEventListener('focusin',()=>api?.setEditorFocused(true));
editor.dom.addEventListener('focusout',()=>window.setTimeout(syncPause,0));
function renderPreview(){
  previewComparison.render(editor.state.doc.toString());
}
function setMove(move:SkillId){
  const skill=SKILLS.find(item=>item.id===move);
  if(!skill)return;
  if(state.level<skill.unlockLevel){toast(`${skill.name} unlocks at level ${skill.unlockLevel}.`);return;}
  selectedMove=move;
  $('execute-button').innerHTML=icon(move);
  $('execute-button').setAttribute('aria-label',`Execute ${skill.name}`);
  $('execute-button').dataset.tooltip=`Execute ${skill.name} · Ctrl + Enter`;
  $('execute-button').title=`Execute ${skill.name} · Ctrl + Enter`;
  refreshControls();
}
function inBattle(){return ['challenge','animating','defending'].includes(state.phase);}
function syncPause(){
  const paused=document.hidden||flowActive||tutorialActive||!!document.querySelector('dialog[open]')||(inBattle()&&!encounterReady);
  if(api&&state.learningPaused!==paused)api.setLearningPaused(paused);
  api?.setEditorFocused(tutorialActive||editor.hasFocus||!!document.querySelector('dialog[open]'));
}
function refreshControls(){
  const busy=tutorialActive||submitting||state.phase!=='challenge'||state.learningPaused||!encounterReady;
  const actionLocked=tutorialActive||submitting||state.phase==='defending'||state.phase==='animating';
  guideCompanion.update(state,!actionLocked&&(state.phase==='challenge'||state.phase==='explore'));
  for(const id of ['read-lesson','map-button','lessons-button','credits-button'])$<HTMLButtonElement>(id).disabled=actionLocked;
  $<HTMLButtonElement>('difficulty-button').disabled=actionLocked||!['explore','challenge'].includes(state.phase);
  const difficultyLabel=`Difficulty: ${state.difficulty==='easy'?'Easy':'Normal'}`;
  $('difficulty-button').setAttribute('aria-label',difficultyLabel);
  $('difficulty-button').dataset.tooltip=difficultyLabel;
  $('difficulty-button').title=difficultyLabel;
  skillBar.update(state,selectedMove,busy);
  const skill=SKILLS.find(item=>item.id===selectedMove)!;
  $<HTMLButtonElement>('execute-button').disabled=busy||state.level<skill.unlockLevel||state.chakra<skill.cost||(state.skillCooldowns[selectedMove]??0)>0;
  $<HTMLButtonElement>('hint-button').disabled=submitting||state.phase==='defending';
  $<HTMLButtonElement>('solution-button').disabled=submitting||state.phase==='defending';
  $<HTMLButtonElement>('close-editor').disabled=submitting||state.phase==='defending'||state.phase==='animating';
  $<HTMLButtonElement>('retreat-button').disabled=actionLocked;
  $('pressure-seconds').textContent=tutorialActive?'Training · paused':state.learningPaused||!encounterReady?'Paused':`${Math.ceil(state.pressureRemainingMs/1000)} s`;
  $('pressure-fill').style.width=`${Math.max(0,Math.min(100,state.pressureRemainingMs/state.pressureLimitMs*100))}%`;
  const budget=`${state.pressureBaseMs/1000} s base × ${state.pressureMultiplier} = ${Number((state.pressureLimitMs/1000).toFixed(2))} s per coding turn`;
  $('pressure-budget').textContent=tutorialActive?'Training clock · paused':budget;
  $('pressure-clock').title=budget;
  $('pressure-clock').dataset.tooltip=budget;
  $('pressure-clock').classList.toggle('urgent',state.pressureRemainingMs<8000&&!state.learningPaused&&encounterReady&&!tutorialActive);
  elapsedMs=state.answerElapsedMs;
  $('critical-window').textContent=tutorialActive?'Training uses no health or turns.':assisted?'Example used · no critical.':elapsedMs<8000?`${Math.max(0,Math.ceil((8000-elapsedMs)/1000))} s fast window · 50% critical`:elapsedMs<18000?'25% critical chance':'10% critical chance';
  tooltips.refresh();
}
function syncCodeVisibility(){
  const battling=inBattle();
  $('code-panel').hidden=tutorialActive?false:!battling||!codeExpanded||!encounterReady;
  $('workbench').hidden=false;
  $('action-bar').hidden=tutorialActive||!battling||!encounterReady;
  $('code-toggle').hidden=tutorialActive||!battling||!encounterReady;
  $('code-toggle').setAttribute('aria-expanded',String(codeExpanded));
  $('code-toggle').setAttribute('aria-label',codeExpanded?'Hide code panel':'Open code panel');
  $('code-toggle').dataset.tooltip=codeExpanded?'Hide code panel':'Open code panel';
  $('code-toggle').title=codeExpanded?'Hide code panel':'Open code panel';
  $('play-layout').classList.toggle('code-collapsed',!tutorialActive&&battling&&!codeExpanded);
}
function setCodeExpanded(open:boolean){
  tooltips.hide();
  codeExpanded=open;syncCodeVisibility();
  if(!open&&editor.hasFocus)editor.contentDOM.blur();
  api?.setEditorFocused(editor.hasFocus||!!document.querySelector('dialog[open]'));
}
function presentQuestion(challenge:Challenge,useDraft:boolean){
  currentChallenge=challenge;
  previewComparison.setChallenge(challenge);
  $('lesson-progress').textContent=`Encounter ${activeChallengeIndex+1} / 24 · Question ${state.encounterTurn+1}`;
  $('challenge-title').textContent=challenge.title;
  $('challenge-instruction').textContent=challenge.instruction;
  $('challenge-instruction').dataset.tooltip=challenge.instruction;
  $('challenge-instruction').title=challenge.instruction;
  $('challenge-instruction').setAttribute('tabindex','0');
  $<HTMLAnchorElement>('lesson-source').href=challenge.source;
  const code=useDraft?(activeDrafts()[challenge.id]??challenge.starter):challenge.starter;
  if(!useDraft){delete activeDrafts()[challenge.id];questionHintSent=false;$('mentor-hint-announcement').textContent='';}
  window.clearTimeout(previewTimer);
  editor.dispatch({changes:{from:0,to:editor.state.doc.length,insert:code}});
  renderPreview();
}
function showChallenge(_biome:number,boss:boolean){
  const index=state.activeStageIndex;
  const fresh=!currentChallenge||activeChallengeIndex!==index;
  if(fresh){
    activeChallengeIndex=index;assisted=false;consumedCorrectAnswer=false;elapsedMs=0;
    const cached=questionCache.get(`${state.stageTesting?'test':'campaign'}:${index}`);
    if(cached){assisted=cached.assisted;questionHintSent=cached.hintSent;presentQuestion(cached.challenge,true);}
    else presentQuestion(getChallengeVariant(index),false);
  }else presentQuestion(currentChallenge!,true);
  codeExpanded=true;
  encounterReady=true;
  $('encounter-label').textContent=boss?'Guardian encounter':'Sentry encounter';
  $('feedback').textContent='Choose a technique and write the HTML. Call Mr. Rifky to pause and learn.';
  $('feedback').className='feedback';
  $('output-rail').hidden=false;$('play-layout').classList.add('in-encounter');$('quest-overlay').hidden=true;
  syncCodeVisibility();syncPause();refreshControls();
}
function setDisabled(_value:boolean){refreshControls();}
function checkActionResult(){if(state.phase==='victory')updateState(state);}
async function submit(){
  if(!api||!currentChallenge||tutorialActive||submitting||state.phase!=='challenge'||state.learningPaused||!encounterReady)return;
  const skill=SKILLS.find(item=>item.id===selectedMove)!;
  if(state.chakra<skill.cost||state.level<skill.unlockLevel||(state.skillCooldowns[selectedMove]??0)>0){toast('Choose a ready technique with enough chakra.');return;}
  const result=currentChallenge.validate(editor.state.doc.toString());
  previewComparison.feedback(result.message,result.ok);
  $('feedback').textContent=result.message;$('feedback').className='feedback '+(result.ok?'success':'error');
  if(!result.ok){$('feedback').setAttribute('role','alert');api.reportMistake();return;}
  $('feedback').setAttribute('role','status');submitting=true;consumedCorrectAnswer=true;setDisabled(true);api.setEditorFocused(false);(document.activeElement as HTMLElement|null)?.blur();
  $('feedback').textContent=`Correct. ${skill.name} is ready. Watch for the enemy counterattack.`;
  try{await api.execute(selectedMove,{elapsedMs,assisted});}catch(error){console.error(error);$('feedback').textContent='The action was interrupted. Return to the field and try again.';$('feedback').className='feedback error';}finally{submitting=false;setDisabled(false);checkActionResult();}
}
function updateState(next:GameState){
  const changedStage=next.activeStageIndex!==state.activeStageIndex||next.stageTesting!==state.stageTesting;
  if(changedStage){cacheQuestion();currentChallenge=undefined;activeChallengeIndex=-1;consumedCorrectAnswer=false;questionHintSent=false;turnKey='';$('mentor-hint-announcement').textContent='';}
  state=next;$('region-title').textContent=regionNames[next.biome]??regionNames[0];$('chapter-number').textContent='Chapter '+roman[next.biome];$('campaign-count').textContent=`${next.completed} / 24 encounters`;$('boss-count').textContent=`${next.bosses} / 4 guardians`;$('campaign-fill').style.width=(next.completed/24*100)+'%';$('hero-health').textContent=`${next.heroHp} / ${next.maxHp}`;$('hero-health-fill').style.width=Math.max(0,next.heroHp/next.maxHp*100)+'%';$('status-message').textContent=next.message||'Walk toward a sentry and press E.';$('location-kind').textContent=inBattle()?'Fighting ground':'Exploration field';
  const battling=inBattle();if(!battling)encounterReady=false;syncCodeVisibility();$('output-rail').hidden=!battling&&!tutorialActive;$('play-layout').classList.toggle('in-encounter',battling||tutorialActive);$('quest-overlay').hidden=battling||tutorialActive;$('interact-button').hidden=battling||tutorialActive;$('interact-label').textContent=next.nearby?'Face the sentry':'Approach a sentry';$<HTMLButtonElement>('interact-button').disabled=!next.nearby||next.phase!=='explore';
  $('combat-hud').hidden=!battling;combatHUD.update(next);
  $('interact-button').setAttribute('aria-label',next.nearby?'Face the sentry':'Approach a sentry');
  $('interact-button').dataset.tooltip=next.nearby?'Face the sentry · E':'Approach a sentry, then press E';
  $('hero-level').textContent=`Level ${next.level}`;
  $('chakra-count').textContent=`${next.chakra} / ${next.maxChakra}`;$('chakra-fill').style.width=`${Math.max(0,next.chakra/next.maxChakra*100)}%`;
  $('stamina-count').textContent=String(next.stamina);$('stamina-fill').style.width=`${Math.max(0,next.stamina)}%`;
  $('xp-count').textContent=`${next.xp} / ${next.xpToNext}`;$('xp-fill').style.width=`${Math.max(0,next.xp/next.xpToNext*100)}%`;
  if(lastLevel&&next.level>lastLevel)toast(`Level ${next.level}! More vitality, chakra, and new techniques.`);lastLevel=next.level;
  const key=`${next.activeStageIndex}:${next.stageTesting}:${next.encounterTurn}`;
  if(key!==turnKey&&next.phase==='challenge'){
    turnKey=key;elapsedMs=0;
    if(consumedCorrectAnswer&&currentChallenge){
      consumedCorrectAnswer=false;assisted=false;
      const solvedId=currentChallenge.id;delete activeDrafts()[solvedId];persistDrafts();
      presentQuestion(getChallengeVariant(activeChallengeIndex,solvedId),false);
      codeExpanded=true;syncCodeVisibility();
      $('feedback').textContent='A new question readies your next technique. Read the new task before writing.';
      $('feedback').className='feedback';
    }
  }
  refreshControls();
  $('quest-title').textContent=next.stageTesting?(next.adminMode?'Admin test stage':'Replay practice'):next.phase==='victory'?'The Codex is whole.':next.completed===0?'A world in fragments.':'The next fragment awaits.';
  $('quest-description').textContent=next.phase==='victory'?(next.stageTesting?'Test stage cleared. Campaign progress and XP are unchanged.':'Twenty-four encounters complete. Four guardians defeated.'):`${next.stageTesting?(next.adminMode?'Admin test · ':'Replay · '):''}${next.activeStageIndex%6+1} of 6 encounters in this land. Walk to the ${next.activeStageIndex%6===5?'guardian':'sentry'} ahead.`;
  if(lastCompleted>=0&&next.completed>lastCompleted)toast(next.completed%6===0?'Guardian defeated. A new land is open.':'Fragment restored. Find the next sentry.');
  $('admin-mode-banner').hidden=!next.adminMode;
  stageMenu.update(next);
  if(next.phase!=='victory')victoryHandled=false;
  if(next.phase==='victory'&&!victoryHandled&&!flowActive&&!tutorialActive&&!submitting){
    victoryHandled=true;
    if(next.stageTesting){stageMenu.recordTest(next.activeStageIndex,true);showStageMenu('Test stage cleared. Your campaign progress and XP are unchanged.');}
    else openDialog('ending-dialog');
  }
  if(next.phase==='defeat'&&!flowActive&&!$<HTMLDialogElement>('defeat-dialog').open)openDialog('defeat-dialog');
  if(next.phase==='challenge'&&encounterReady&&!next.learningPaused&&!flowActive&&!tutorialActive&&currentChallenge&&!questionHintSent&&next.answerElapsedMs>30000){
    questionHintSent=true;
    const hint=getShortHint(currentChallenge,next.activeStageIndex);
    $('mentor-hint-announcement').textContent=`Mr. Rifky: ${hint}`;
    api?.showMentorHint(hint);
  }
  lastCompleted=next.completed;syncPause();
}
function canTalk(){return !tutorialActive&&(state.phase==='defeat'||(!submitting&&state.phase!=='defending'&&state.phase!=='animating'&&(!inBattle()||encounterReady)));}
function showMentorMenu(){
  if(!canTalk())return;
  const inEncounter=state.phase==='challenge';
  const canHeal=inEncounter&&encounterReady&&state.heroHp<state.maxHp&&state.companionHealsRemaining>0;
  rifky.show([{
    title:'What shall we work on?',
    message:inEncounter?(state.difficulty==='easy'?'Easy mode: I auto-heal at 40% HP. You can spend that same one healing gift manually instead. What would help?':'Normal mode: my one 20 HP healing gift is manual. What would help you now?'):'Welcome back. I can explain the HTML or help you find your next encounter.',
    choices:[
      {label:'Give me a hint',action:showHint},
      {label:inEncounter?'Explain this lesson':'Teach me the HTML basics',action:()=>inEncounter?readLesson():readLibrary(0)},
      {label:'Show me how to play',action:showTutorial},
      {label:'Choose a stage',action:()=>showStageMenu()},
      {label:'Explain the adventure',action:()=>showGameOverview(false)},
      {label:state.companionHealsRemaining<1?'Healing used this encounter':state.heroHp>=state.maxHp?'My HP is already full':'Heal 20 HP · one gift',disabled:!canHeal,action:()=>{rifky.close();api?.companionHeal();}},
      {label:'Continue game',action:()=>rifky.close()},
    ],
  }]);
}
function showDifficultyChoice(returnToMenu=false,required=false){
  if(!canTalk())return;
  if(returnToMenu){flowActive=true;syncPause();stageMenu.hide();}
  const select=(difficulty:Difficulty)=>{
    if(!api?.setDifficulty(difficulty))return;
    difficultyChosen=true;
    if(returnToMenu){showStageMenu();return;}
    rifky.show([{title:difficulty==='easy'?'Easy mode is on.':'Normal mode is on.',message:difficulty==='easy'?'Easy starts with a 90-second base, with more time for complex HTML tasks. I heal 20 HP at 40% HP or lower, using our shared one gift per encounter.':'Normal starts with a 30-second base, with more time for complex HTML tasks. Ask me for the one 20 HP healing gift when you need it.'}]);
  };
  rifky.show([{title:'Choose your challenge.',message:'Easy has a 90-second base and an automatic 20 HP heal at 40% HP. Normal has a 30-second base and a manual heal. Complex tasks get extra time in both modes; the stage menu shows your exact budget.',choices:[
    {label:'Easy · 90 s base + automatic heal',action:()=>select('easy')},
    {label:'Normal · 30 s base + manual heal',action:()=>select('normal')},
    ...(!required?[{label:'Keep my current mode',action:()=>returnToMenu?showStageMenu():rifky.close()}]:[]),
  ]}],undefined,{lockClose:required,onDismiss:returnToMenu&&!required?()=>showStageMenu():undefined});
}

function showGameOverview(onboarding:boolean){
  if(!canTalk())return;
  flowActive=true;syncPause();stageMenu.hide();
  rifky.show(gameOverviewPages,onboarding?()=>showDifficultyChoice(true,true):()=>showStageMenu(),{lockClose:onboarding,onDismiss:onboarding?undefined:()=>showStageMenu()});
}
function showStageMenu(message=''){
  if(!canTalk())return;
  flowActive=true;syncPause();rifky.close(true);
  stageMenu.show(state,!launchMenuLocked,message);
  if(difficultyChosen){try{localStorage.setItem(setupKey,'complete');}catch{}firstSetup=false;}
  syncPause();
}
function closeStageMenu(){if(launchMenuLocked)return;stageMenu.hide();flowActive=false;syncPause();}
function startSelectedStage(index:number){
  cacheQuestion();
  if(!api?.selectStage(index))return;
  if(state.stageTesting)stageMenu.recordTest(index,false);
  launchMenuLocked=false;stageMenu.hide();flowActive=false;victoryHandled=state.phase==='victory';syncPause();
  toast('Walk toward the sentry, then press E. Your HTML readies your techniques.');
}
function toggleAdmin(enabled:boolean){
  cacheQuestion();
  if(!api?.setAdminMode(enabled))return false;
  stageMenu.show(state,!launchMenuLocked,enabled?'Admin test mode: all stages are open. Tests do not change your campaign.':'Admin test mode is off. Campaign progress is unchanged.');
  syncPause();return true;
}
function showHint(){
  if(!canTalk())return;
  const lesson=inBattle()?getLessonForChallenge(state.activeStageIndex):htmlFoundations[0];
  rifky.show([{
    title:inBattle()?'Here is one hint.':'Find your next encounter.',
    message:inBattle()&&currentChallenge?currentChallenge.hint:'Walk toward the sentry, then press E when you are close. The map shows which lands are open.',
    example:inBattle()?lesson.example:undefined,
  }]);
}
function explainLesson(lesson:Lesson,libraryIndex?:number){
  const pages:RifkyPage[]=[
    {title:lesson.title,message:lesson.summary,example:lesson.example,source:lesson.source},
    ...lesson.points.map(point=>({title:lesson.title,message:point,example:lesson.example,source:lesson.source})),
  ];
  if(lesson.practice)pages.push({title:'Try thinking it through.',message:lesson.practice,example:lesson.example,source:lesson.source});
  if(libraryIndex===undefined&&inBattle()&&currentChallenge)pages.unshift({title:currentChallenge.title,message:currentChallenge.instruction});
  rifky.show(pages,()=>rifky.show([{
    title:'Ready for the next step?',
    message:'You can practise now, or stay with me for another topic.',
    choices:[
      ...(libraryIndex!==undefined&&libraryIndex<learningPath.length-1?[{label:'Next HTML topic',action:()=>readLibrary(libraryIndex+1)}]:[]),
      ...(libraryIndex!==undefined&&libraryIndex>0?[{label:'Previous HTML topic',action:()=>readLibrary(libraryIndex-1)}]:[]),
      {label:'Ask Mr. Rifky something else',action:showMentorMenu},
      {label:'Continue game',action:()=>rifky.close()},
    ],
  }]));
}
function readLesson(index=state.activeStageIndex){
  if(!canTalk())return;
  const lesson=index<0?htmlFoundations[index+htmlFoundations.length]:getLessonForChallenge(index);
  if(lesson)explainLesson(lesson);
}
function readLibrary(index=0){
  if(!canTalk())return;
  const lesson=learningPath[index];if(lesson)explainLesson(lesson,index);
}
function beginGuidedTutorial(){
  const texts:Record<string,string>={};
  for(const id of ['encounter-label','lesson-progress','challenge-title','challenge-instruction','expected-hint','actual-hint','feedback'])texts[id]=$(id).textContent??'';
  tourSnapshot={code:editor.state.doc.toString(),editorState:editor.state,editorScroll:{top:editor.scrollDOM.scrollTop,left:editor.scrollDOM.scrollLeft},expanded:codeExpanded,panelScroll:$('code-panel').scrollTop,expected:$<HTMLIFrameElement>('expected-preview').srcdoc,texts,feedbackClass:$('feedback').className,focus:editor.hasFocus?editor.contentDOM:$('guide-toggle')};
  tutorialActive=true;
  $('play-layout').classList.add('tutorial-active');
  window.clearTimeout(previewTimer);tooltips.hide();syncPause();
  if($<HTMLDialogElement>('rifky-dialog').open)rifky.close(true);
  codeExpanded=true;syncCodeVisibility();
  $('play-layout').classList.add('in-encounter');
  $('output-rail').hidden=false;$('quest-overlay').hidden=true;$('interact-button').hidden=true;
  $('encounter-label').textContent='Training only';
  $('lesson-progress').textContent='No health, turns, or progress used';
  $('challenge-title').textContent='Create a heading';
  $('challenge-instruction').textContent=tutorialDemo.instruction;
  $('challenge-instruction').dataset.tooltip=tutorialDemo.instruction;
  $<HTMLIFrameElement>('expected-preview').srcdoc=previewDocument(tutorialDemo.expectedHtml);
  editor.dispatch({changes:{from:0,to:editor.state.doc.length,insert:tutorialDemo.correctHtml}});
  previewComparison.render(tutorialDemo.correctHtml);
  $('expected-hint').textContent='Target: a heading called Quest.';
  $('feedback').textContent='Training example. The fight is paused.';
  $('feedback').className='feedback';
  $('code-panel').scrollTop=0;
  refreshControls();
}
function showTutorialPage(page:GuidedTutorialPage){
  $('play-layout').dataset.tutorialTarget=page.target??'none';
  if(!page.demo)return;
  const code=page.demo==='wrong-tag'?tutorialDemo.wrongTagHtml:page.demo==='missing-tag'?tutorialDemo.missingTagHtml:tutorialDemo.correctHtml;
  editor.dispatch({changes:{from:0,to:editor.state.doc.length,insert:code}});
  window.clearTimeout(previewTimer);
  previewComparison.render(code);
  $('expected-hint').textContent='Target: a heading called Quest.';
  $('actual-hint').textContent=page.demo==='wrong-tag'?'A paragraph is a different element.':page.demo==='missing-tag'?'The browser repairs this, but the code is incomplete.':'This heading matches the target.';
  $('feedback').textContent='Training only. No answer is submitted.';
}
function finishGuidedTutorial():HTMLElement|null{
  const snapshot=tourSnapshot;
  if(!snapshot)return $('guide-toggle');
  window.clearTimeout(previewTimer);
  editor.setState(snapshot.editorState);
  editor.scrollDOM.scrollTop=snapshot.editorScroll.top;editor.scrollDOM.scrollLeft=snapshot.editorScroll.left;
  $<HTMLIFrameElement>('expected-preview').srcdoc=snapshot.expected;
  previewComparison.render(snapshot.code);
  for(const [id,text]of Object.entries(snapshot.texts))$(id).textContent=text;
  $('feedback').className=snapshot.feedbackClass;
  $('challenge-instruction').dataset.tooltip=snapshot.texts['challenge-instruction'];
  $('challenge-instruction').title=snapshot.texts['challenge-instruction'];
  codeExpanded=snapshot.expanded;
  tutorialActive=false;tourSnapshot=undefined;
  $('play-layout').classList.remove('tutorial-active');
  delete $('play-layout').dataset.tutorialTarget;
  $('play-layout').classList.toggle('in-encounter',inBattle());
  $('output-rail').hidden=!inBattle();$('quest-overlay').hidden=inBattle();$('interact-button').hidden=inBattle();
  syncCodeVisibility();$('code-panel').scrollTop=snapshot.panelScroll;
  refreshControls();syncPause();
  return snapshot.focus;
}
function showTutorial(){
  if(!canTalk())return;
  flowActive=true;syncPause();stageMenu.hide();guidedTutorial.start();
}
function syncSoundControl(){
  const label=muted?'Enable music and effects':'Mute music and effects';
  $('sound-button').setAttribute('aria-pressed',String(!muted));
  $('sound-button').setAttribute('aria-label',label);
  $('sound-button').dataset.tooltip=label;$('sound-button').title=label;
  $('sound-button').classList.toggle('sound-on',!muted);
}
function syncEffectsControl(){
  effectsButton.setAttribute('aria-pressed',String(reducedEffects));
  const label=reducedEffects?'Reduced effects on: less motion, no shake or bright flash. Activate for Cinematic effects.':'Cinematic effects: full spell motion and impact. Activate for Reduced effects.';
  effectsButton.dataset.tooltip=label;
  effectsButton.title=label;
}
reducedMotionPreference.addEventListener('change',event=>{
  if(effectsPreferenceSaved)return;
  reducedEffects=event.matches;api?.setReducedEffects(reducedEffects);syncEffectsControl();tooltips.refresh();
});
function showCodeExample(){
  if(!canTalk()||!currentChallenge)return;
  assisted=true;refreshControls();
  rifky.show([{title:'Study one correct example.',message:'Read the tags and the result. When you return, type the answer yourself. This question will not earn a speed critical.',example:currentChallenge.solution}]);
}
async function toggleFullscreen(){
  try{
    if(document.fullscreenElement)await document.exitFullscreen();
    else if($('play-layout').requestFullscreen)await $('play-layout').requestFullscreen();
    else toast('Fullscreen is not available here. You can still play in this window.');
  }catch{toast('Fullscreen is not available here. You can still play in this window.');}
}
function assetUrl(path:string){return path.startsWith('/')?import.meta.env.BASE_URL+path.replace(/^\//,''):import.meta.env.BASE_URL+path;}
function openDialog(id:string){if(id!=='defeat-dialog'&&!canTalk())return;const dialog=$<HTMLDialogElement>(id);if(!dialog.open)dialog.showModal();syncPause();}
$('execute-button').addEventListener('click',()=>void submit());$('hint-button').addEventListener('click',showHint);
$('solution-button').addEventListener('click',showCodeExample);
$('close-editor').addEventListener('click',()=>setCodeExpanded(false));
$('code-toggle').addEventListener('click',()=>setCodeExpanded(!codeExpanded));
$('retreat-button').addEventListener('click',()=>{api?.closeChallenge();(document.activeElement as HTMLElement|null)?.blur();api?.setEditorFocused(false);});
$('interact-button').addEventListener('click',()=>api?.interact());$('map-button').addEventListener('click',()=>showStageMenu());$('credits-button').addEventListener('click',()=>openDialog('credits-dialog'));
$('difficulty-button').addEventListener('click',()=>showDifficultyChoice());
$('read-lesson').addEventListener('click',()=>readLesson());$('lessons-button').addEventListener('click',()=>readLibrary(0));
$('fullscreen-button').addEventListener('click',()=>void toggleFullscreen());
document.addEventListener('fullscreenchange',()=>{const label=document.fullscreenElement?'Exit fullscreen':'Enter fullscreen';$('fullscreen-button').setAttribute('aria-label',label);$('fullscreen-button').dataset.tooltip=label;$('fullscreen-button').title=label;$('fullscreen-button').innerHTML=icon(document.fullscreenElement?'minimize':'fullscreen');tooltips.hide();});
$('retry-button').addEventListener('click',()=>{$<HTMLDialogElement>('defeat-dialog').close();api?.retry();syncPause();});
$('defeat-lesson').addEventListener('click',()=>readLesson());
$('sound-button').addEventListener('click',()=>{muted=!muted;try{localStorage.setItem('tag-quest-sound-muted',String(muted));}catch{}api?.setMuted(muted);syncSoundControl();toast(muted?'Music and effects muted.':'Music and effects on.');tooltips.refresh();});
effectsButton.addEventListener('click',()=>{
  reducedEffects=!reducedEffects;effectsPreferenceSaved=true;
  try{localStorage.setItem(effectsPreferenceKey,String(reducedEffects));}catch{}
  api?.setReducedEffects(reducedEffects);syncEffectsControl();tooltips.refresh();
  toast(reducedEffects?'Reduced effects: less motion, no shake or bright flash.':'Cinematic effects: full spell motion and impact.');
});
document.querySelectorAll<HTMLButtonElement>('[data-close]').forEach(b=>b.addEventListener('click',()=>$<HTMLDialogElement>(b.dataset.close!).close()));
document.querySelectorAll('dialog').forEach(d=>{d.addEventListener('close',()=>{syncPause();refreshControls();});d.addEventListener('click',e=>{if(e.target===d&&!['defeat-dialog','rifky-dialog','guided-tour','stage-menu'].includes(d.id)){const rect=d.getBoundingClientRect();const event=e as MouseEvent;if(event.clientX<rect.left||event.clientX>rect.right||event.clientY<rect.top||event.clientY>rect.bottom)d.close();}});});
$('defeat-dialog').addEventListener('cancel',e=>e.preventDefault());
document.addEventListener('visibilitychange',syncPause);
root.addEventListener('keydown',event=>{if((event.key===' '||event.key==='Enter')&&(event.target as HTMLElement).closest('button,a,summary'))event.stopPropagation();});
$('ending-close').addEventListener('click',()=>{flowActive=true;$<HTMLDialogElement>('ending-dialog').close();showStageMenu('The campaign is complete. Replay any stage for practice.');});
$('reset-button').addEventListener('click',()=>{if(!confirm('Reset your saved progress and start again?'))return;drafts={};currentChallenge=undefined;activeChallengeIndex=-1;consumedCorrectAnswer=false;localStorage.removeItem('tag-quest-drafts');api?.restart();$<HTMLDialogElement>('map-dialog').close();toast('A new journey begins.');});
window.addEventListener('keydown',e=>{const target=e.target as HTMLElement;const typing=target.closest('input,textarea,[contenteditable=true],.cm-editor');const dialog=!!document.querySelector('dialog[open]');if(dialog||typing)return;const skill=SKILLS[Number(e.key)-1];if(skill&&!e.ctrlKey&&!e.metaKey&&!e.altKey)setMove(skill.id);if(e.key==='Escape'&&state.phase==='explore')showStageMenu();});
document.querySelectorAll<HTMLButtonElement>('[data-direction]').forEach(b=>{const keys:Record<string,string>={up:'w',down:'s',left:'a',right:'d'};const key=keys[b.dataset.direction!];const fire=(type:string)=>{window.dispatchEvent(new KeyboardEvent(type,{key,code:'Key'+key.toUpperCase(),bubbles:true}));};b.addEventListener('pointerdown',e=>{e.preventDefault();b.setPointerCapture(e.pointerId);fire('keydown');});for(const name of ['pointerup','pointercancel','lostpointercapture'])b.addEventListener(name,()=>fire('keyup'));});
async function boot(){try{const response=await fetch(import.meta.env.BASE_URL+'assets/manifest.json');if(!response.ok)throw new Error('The asset manifest could not be loaded.');const manifest=await response.json();environmentData=manifest.biomes??[];api=createGame($('game-stage'),{onState:updateState,onEncounter:showChallenge,onMentorInteract:()=>{if(!submitting&&['explore','challenge'].includes(state.phase))showMentorMenu();},onReady:()=>{api?.setMuted(muted);api?.setReducedEffects(reducedEffects);$('load-screen').hidden=true;syncPause();if(firstSetup)showTutorial();else showStageMenu();}});api.setMuted(muted);api.setReducedEffects(reducedEffects);Object.assign(window,{__TAG_QUEST_UI__:{editor,getState:()=>state,getChallenge:()=>currentChallenge,submit,setMove,api:()=>api}});setMove('attack');}catch(error){console.error(error);$('load-message').textContent='The realm could not load. Refresh the page to try again.';$('load-screen').classList.add('load-error');}}
syncSoundControl();
syncEffectsControl();
void boot();
