import { createElement, BookOpen, Volume2, Map, Sword, Flame, Snowflake, Zap, HeartPulse, Shield, X, ChevronRight, RotateCcw, Wind, LockKeyhole, GraduationCap, Timer, Swords, Maximize, Minimize, Code, Play, LogOut, Lightbulb, Info, CircleQuestionMark, Eye, ArrowUp, ArrowDown, ArrowLeft, ArrowRight, SlidersHorizontal, MessageCircle } from 'lucide';

const icons = { book: BookOpen, sound: Volume2, map: Map, sword: Sword, attack: Sword, fireball: Flame, magic: Flame, ice: Snowflake, lightning: Zap, heal: HeartPulse, guard: Shield, close: X, chevron: ChevronRight, reset: RotateCcw, dodge: Wind, parry: Swords, lock: LockKeyhole, lesson: GraduationCap, timer: Timer, fullscreen: Maximize, minimize: Minimize, code: Code, begin: Play, retreat: LogOut, hint: Lightbulb, info: Info, help: CircleQuestionMark, example: Eye, up: ArrowUp, down: ArrowDown, left: ArrowLeft, right: ArrowRight, difficulty: SlidersHorizontal, mentor: MessageCircle };

export function icon(name: string): string {
  return createElement(icons[name as keyof typeof icons] ?? BookOpen, { 'aria-hidden': 'true', 'stroke-width': 1.8 }).outerHTML;
}
