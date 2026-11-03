import gsap from 'gsap';
import type { CharacterExpression } from './character.generated';

export const GHOST_PUPPY_MOTIONS = {
  neutral: { duration: 4.8, description: '둥실 떠서 숨을 쉬고, 눈을 깜박여요.' },
  happy: { duration: 3.4, description: '몸을 웅크렸다 통통! 귀도 뒤따라 팔랑거려요.' },
  sad: { duration: 4.4, description: '귀가 축 처지고, 눈물이 또르르 흘러요.' },
  sparkly: { duration: 3.8, description: '눈 속의 별과 주변 반짝임이 번갈아 빛나요.' },
  love: { duration: 4.6, description: '하트눈이 두근두근, 작은 하트가 떠올라요.' },
  shy: { duration: 4.8, description: '시선을 내리고 몸을 꼼지락, 볼이 발그레해져요.' },
  surprised: { duration: 3.8, description: '깜짝! 눈과 귀가 커지며 위로 폴짝 뛰어요.' },
  grumpy: { duration: 4, description: '몸을 부풀려 부르르 떨고, 콧김을 뿜어요.' },
  sleepy: { duration: 6, description: '꾸벅꾸벅, zzz가 차례로 떠올라요.' },
  wink: { duration: 3.8, description: '몸을 살짝 기울여 찡긋, 귀를 한 번 까딱해요.' },
  curious: { duration: 4.8, description: '갸우뚱하면 물음표가 뿅! 커졌다가 사르르 작아져요.' },
} as const satisfies Record<CharacterExpression, { duration: number; description: string }>;

type Pose = { x?: number; y?: number; rotation?: number; scaleX?: number; scaleY?: number };
type Recipe = {
  move: (part: string, at: number, duration: number, pose: Pose, ease?: string) => void;
  fade: (part: string, at: number, duration: number, opacity: number) => void;
  blink: (at: number, sides?: readonly ('left' | 'right')[]) => void;
  floatEffect: (part: string, at: number, distance?: number) => void;
};

const BODY = 'character-motion';
const LEFT_EAR = 'ear-left-motion';
const RIGHT_EAR = 'ear-right-motion';
const LEFT_EYE = 'eye-left-motion';
const RIGHT_EYE = 'eye-right-motion';
const BOUNCE_EASE = 'back.out(1.4)';

const recipes: Record<CharacterExpression, (recipe: Recipe) => void> = {
  neutral: ({ move, blink }) => {
    move(BODY, 0, 1.8, { y: -18, rotation: 1.5, scaleY: 1.015 });
    move(BODY, 1.8, 1.8, { y: 3, rotation: -1 });
    move(LEFT_EAR, 0.2, 1.4, { rotation: 4 });
    move(RIGHT_EAR, 0.4, 1.4, { rotation: -3 });
    move(LEFT_EAR, 1.8, 1.4, { rotation: -2 });
    move(RIGHT_EAR, 2, 1.4, { rotation: 2 });
    blink(1.1);
    blink(3.25);
  },
  happy: ({ move, fade }) => {
    move(BODY, 0, 0.24, { y: 17, scaleX: 1.055, scaleY: 0.94 }, 'power2.in');
    move(BODY, 0.24, 0.4, { y: -72, rotation: -4, scaleX: 0.97, scaleY: 1.055 }, 'power2.out');
    move(BODY, 0.64, 0.4, { y: 12, rotation: 1, scaleX: 1.055, scaleY: 0.95 }, 'power2.in');
    move(BODY, 1.04, 0.34, { y: -34, rotation: 2, scaleY: 1.025 }, 'power2.out');
    move(BODY, 1.38, 0.4, { y: 4, scaleX: 1.025, scaleY: 0.98 }, 'power2.in');
    move(BODY, 1.78, 0.5, {}, BOUNCE_EASE);
    move(LEFT_EAR, 0.24, 0.34, { rotation: 13 });
    move(RIGHT_EAR, 0.3, 0.34, { rotation: -12 });
    move(LEFT_EAR, 0.68, 0.4, { rotation: -6 });
    move(RIGHT_EAR, 0.75, 0.4, { rotation: 7 });
    move(LEFT_EAR, 1.15, 0.6, { rotation: 4 });
    move(RIGHT_EAR, 1.2, 0.6, { rotation: -3 });
    for (const [index, part] of ['joy-spark-left', 'joy-spark-right', 'joy-dot'].entries()) {
      fade(part, 0, 0, 0);
      move(part, 0, 0, { scaleX: 0.4, scaleY: 0.4 });
      const at = 0.35 + index * 0.12;
      fade(part, at, 0.18, 1);
      move(part, at, 0.55, { y: -20, rotation: 25, scaleX: 1.15, scaleY: 1.15 }, BOUNCE_EASE);
      fade(part, at + 0.75, 0.4, 0);
    }
  },
  sad: ({ move, fade }) => {
    move(BODY, 0, 1, { y: 22, rotation: 3, scaleX: 0.99, scaleY: 0.98 });
    move(BODY, 1.5, 0.65, { y: 16, rotation: 2, scaleY: 0.97 });
    move(BODY, 2.15, 1, { y: 24, rotation: 3 });
    move(LEFT_EAR, 0.2, 0.9, { rotation: -8 });
    move(RIGHT_EAR, 0.3, 0.9, { rotation: 8 });
    for (const [index, part] of ['tear-left', 'tear-right', 'falling-tear'].entries()) {
      const at = 0.65 + index * 0.55;
      fade(part, 0, 0, 0);
      fade(part, at, 0.22, 1);
      move(part, at, 1.15, { y: 72, scaleX: 0.85, scaleY: 1.12 }, 'power1.in');
      fade(part, at + 0.82, 0.32, 0);
    }
  },
  sparkly: ({ move, fade }) => {
    move(BODY, 0, 0.8, { y: -12, scaleX: 1.018, scaleY: 1.018 });
    move(BODY, 1.4, 0.9, { y: -5, rotation: 1.5 });
    for (const [index, part] of [LEFT_EYE, RIGHT_EYE].entries()) {
      move(part, 0.2 + index * 0.12, 0.45, { scaleX: 1.08, scaleY: 1.08 });
      move(part, 0.9 + index * 0.12, 0.5, {});
    }
    for (const [index, part] of [
      'eye-left-shine',
      'eye-right-shine',
      'spark-large',
      'spark-small',
      'spark-left',
    ].entries()) {
      const at = 0.1 + index * 0.25;
      move(part, at, 0.42, { rotation: 25, scaleX: 1.25, scaleY: 1.25 });
      fade(part, at + 0.42, 0.3, 0.4);
      move(part, at + 0.42, 0.4, { rotation: -10, scaleX: 0.8, scaleY: 0.8 });
      fade(part, at + 0.8, 0.3, 1);
      move(part, at + 0.8, 0.5, {});
    }
  },
  love: ({ move, floatEffect }) => {
    move(BODY, 0, 0.9, { x: -8, y: -8, rotation: -4 });
    move(BODY, 0.9, 1.3, { x: 8, y: -14, rotation: 4 });
    move(BODY, 2.2, 1, { x: -4, y: -4, rotation: -2 });
    move(LEFT_EAR, 0.25, 1, { rotation: 5 });
    move(RIGHT_EAR, 0.4, 1, { rotation: -5 });
    for (const at of [0.3, 0.8, 2]) {
      for (const part of [LEFT_EYE, RIGHT_EYE]) {
        move(part, at, 0.18, { scaleX: 1.15, scaleY: 1.15 }, 'power2.out');
        move(part, at + 0.18, 0.25, {});
      }
    }
    floatEffect('heart-large', 0.3, 62);
    floatEffect('heart-small', 0.85, 70);
    floatEffect('heart-left', 1.4, 58);
  },
  shy: ({ move, fade, blink }) => {
    move(BODY, 0, 0.8, { x: 8, y: 12, rotation: 5, scaleX: 0.985 });
    move(BODY, 1, 0.65, { x: -7, y: 10, rotation: 2 });
    move(BODY, 1.65, 0.65, { x: 7, y: 10, rotation: 5 });
    move(BODY, 2.3, 0.65, { x: -4, y: 8, rotation: 2 });
    move(LEFT_EAR, 0.3, 0.9, { rotation: -5 });
    move(RIGHT_EAR, 0.4, 0.9, { rotation: 6 });
    for (const part of [LEFT_EYE, RIGHT_EYE]) move(part, 0.2, 0.6, { y: 7, scaleX: 0.92, scaleY: 0.92 });
    for (const part of ['blush-left', 'blush-right']) {
      fade(part, 0.3, 0.8, 0.75);
      fade(part, 2.8, 0.8, 0.38);
    }
    blink(3.45);
  },
  surprised: ({ move, fade }) => {
    move(BODY, 0.08, 0.18, { y: -50, rotation: -3, scaleX: 0.95, scaleY: 1.06 }, 'power3.out');
    move(BODY, 0.26, 0.4, { y: 8, scaleX: 1.025, scaleY: 0.98 }, 'power2.in');
    move(BODY, 0.66, 0.65, { y: -5 }, BOUNCE_EASE);
    for (const part of [LEFT_EYE, RIGHT_EYE]) {
      move(part, 0.08, 0.2, { scaleX: 1.18, scaleY: 1.14 }, 'power3.out');
      move(part, 0.9, 0.8, {});
    }
    move(LEFT_EAR, 0.1, 0.2, { rotation: 12 }, 'power3.out');
    move(RIGHT_EAR, 0.1, 0.2, { rotation: -12 }, 'power3.out');
    move(LEFT_EAR, 0.45, 0.55, { rotation: -4 });
    move(RIGHT_EAR, 0.5, 0.55, { rotation: 4 });
    for (const [index, part] of ['surprise-ray-left', 'surprise-ray-middle', 'surprise-ray-right'].entries()) {
      fade(part, 0, 0, 0);
      fade(part, 0.08 + index * 0.035, 0.12, 1);
      move(part, 0.1, 0.3, { y: -15, scaleY: 1.15 });
      fade(part, 0.75, 0.5, 0);
    }
  },
  grumpy: ({ move, floatEffect }) => {
    move(BODY, 0, 0.5, { y: -4, scaleX: 1.045, scaleY: 1.02 });
    [0.55, 0.73, 0.91, 1.09].forEach((at, index) => {
      move(BODY, at, 0.18, { x: index % 2 ? 8 : -8, rotation: index % 2 ? 2 : -2, scaleX: 1.045, scaleY: 1.02 });
    });
    move(BODY, 1.27, 0.6, { scaleX: 1.015 });
    move(LEFT_EAR, 0.5, 0.2, { rotation: 6 });
    move(RIGHT_EAR, 0.6, 0.2, { rotation: -6 });
    move(LEFT_EAR, 0.8, 0.3, { rotation: -3 });
    move(RIGHT_EAR, 0.9, 0.3, { rotation: 3 });
    floatEffect('puff-large', 0.8, 40);
    floatEffect('puff-small', 1, 30);
  },
  sleepy: ({ move, floatEffect }) => {
    move(BODY, 0, 1.8, { y: -6, rotation: -2, scaleX: 1.025, scaleY: 0.985 });
    move(BODY, 1.8, 1.3, { y: 10, rotation: 3, scaleX: 0.995, scaleY: 1.01 });
    move(BODY, 3.1, 0.55, { y: 18, rotation: 5, scaleY: 0.98 });
    move(BODY, 3.65, 0.85, { y: 3, rotation: 1 });
    move(LEFT_EAR, 0.3, 2, { rotation: -3 });
    move(RIGHT_EAR, 0.4, 2, { rotation: 3 });
    floatEffect('sleep-z-small', 0.7, 35);
    floatEffect('sleep-z-middle', 1.15, 44);
    floatEffect('sleep-z-large', 1.6, 54);
  },
  wink: ({ move, fade, blink }) => {
    move(BODY, 0.1, 0.5, { y: -9, rotation: -5 });
    move(BODY, 1.3, 0.6, { y: -2, rotation: -1 });
    move(LEFT_EAR, 0.25, 0.24, { rotation: 11 }, 'power2.out');
    move(LEFT_EAR, 0.49, 0.5, { rotation: -3 }, BOUNCE_EASE);
    blink(0.35, ['right']);
    blink(0.85, ['right']);
    blink(2.25, ['left']);
    fade('wink-spark', 0, 0, 0);
    fade('wink-spark', 0.35, 0.15, 1);
    move('wink-spark', 0.35, 0.5, { rotation: 35, scaleX: 1.2, scaleY: 1.2 });
    fade('wink-spark', 1.1, 0.45, 0);
  },
  curious: ({ move, fade, blink }) => {
    move(BODY, 0, 0.9, { x: -7, rotation: -8 });
    move(BODY, 1.25, 1, { x: 8, rotation: 5 });
    move(BODY, 2.8, 0.7, { x: -3, rotation: -3 });
    move(LEFT_EAR, 0.1, 0.7, { rotation: 10 });
    move(LEFT_EAR, 1.4, 0.8, { rotation: -4 });
    move(RIGHT_EAR, 1.5, 0.8, { rotation: 7 });
    for (const part of [LEFT_EYE, RIGHT_EYE]) {
      move(part, 0.2, 0.45, { x: -8, y: -3 });
      move(part, 1.5, 0.45, { x: 8, y: -1 });
      move(part, 2.6, 0.5, {});
    }
    fade('question-mark', 0, 0, 0);
    move('question-mark', 0, 0, { y: 12, rotation: -12, scaleX: 0.45, scaleY: 0.45 });
    fade('question-mark', 0.35, 0.24, 1);
    move('question-mark', 0.35, 0.42, { y: -12, rotation: -8, scaleX: 1.28, scaleY: 1.28 }, 'power3.out');
    move('question-mark', 0.77, 0.28, { y: -8, rotation: -3 });
    move('question-mark', 1.45, 0.55, { y: -4, rotation: 8, scaleX: 1.07, scaleY: 1.07 });
    move('question-mark', 2.05, 0.5, { y: -1 });
    fade('question-mark', 2.9, 0.55, 0);
    move('question-mark', 2.9, 0.55, { y: 12, rotation: -4, scaleX: 0.45, scaleY: 0.45 }, 'power2.in');
    blink(3.5);
  },
};

function transform({ x = 0, y = 0, rotation = 0, scaleX = 1, scaleY = 1 }: Pose = {}) {
  return `translate(${x} ${y}) rotate(${rotation}) scale(${scaleX} ${scaleY})`;
}

/** SVG 로컬 좌표계의 transform 속성만 움직여 귀의 부착점과 고정 포즈를 보존합니다. */
export function createCharacterAnimation(svg: SVGSVGElement, expression: CharacterExpression, loop = true) {
  const originals = new Map<Element, Map<string, string | null>>();
  const transforms = new Map<Element, string>();
  let timeline!: gsap.core.Timeline;

  const remember = (element: Element, attribute: string) => {
    let attributes = originals.get(element);
    if (!attributes) {
      attributes = new Map();
      originals.set(element, attributes);
    }
    if (!attributes.has(attribute)) attributes.set(attribute, element.getAttribute(attribute));
  };

  const context = gsap.context(() => {
    timeline = gsap.timeline({ paused: true, repeat: loop ? -1 : 0, defaults: { ease: 'sine.inOut' } });
    const target = (part: string) => svg.querySelector<SVGElement>(`[data-part="${part}"]`);
    const move: Recipe['move'] = (part, at, duration, pose, ease = 'sine.inOut') => {
      const element = target(part);
      if (!element) return;
      if (!transforms.has(element)) {
        remember(element, 'transform');
        const base = element.getAttribute('transform');
        transforms.set(element, base ? `${base} ` : '');
        timeline.set(element, { attr: { transform: `${transforms.get(element)}${transform()}` } }, 0);
      }
      timeline.to(element, { attr: { transform: `${transforms.get(element)}${transform(pose)}` }, duration, ease }, at);
    };
    const fade: Recipe['fade'] = (part, at, duration, opacity) => {
      const element = target(part);
      if (!element) return;
      const initialized = originals.get(element)?.has('opacity');
      remember(element, 'opacity');
      if (!initialized) timeline.set(element, { attr: { opacity: element.getAttribute('opacity') ?? '1' } }, 0);
      timeline.to(element, { attr: { opacity }, duration }, at);
    };
    const blink: Recipe['blink'] = (at, sides = ['left', 'right']) => {
      for (const side of sides) {
        move(`eye-${side}-motion`, at, 0.085, { scaleY: 0.08 }, 'power2.in');
        move(`eye-${side}-motion`, at + 0.115, 0.16, {}, 'power2.out');
      }
    };
    const floatEffect: Recipe['floatEffect'] = (part, at, distance = 55) => {
      fade(part, 0, 0, 0);
      move(part, 0, 0, { scaleX: 0.7, scaleY: 0.7 });
      fade(part, at, 0.24, 1);
      move(part, at, 1.45, { x: 7, y: -distance, rotation: 12, scaleX: 1.18, scaleY: 1.18 }, 'power1.out');
      fade(part, at + 0.9, 0.55, 0);
    };

    recipes[expression]({ move, fade, blink, floatEffect });
    const duration = GHOST_PUPPY_MOTIONS[expression].duration;
    for (const [element, base] of transforms) {
      timeline.to(element, { attr: { transform: `${base}${transform()}` }, duration: 0.6 }, duration - 0.8);
    }
    timeline.to({}, { duration }, 0);
  }, svg);

  return {
    timeline,
    dispose() {
      context.revert();
      // AttrPlugin의 null 속성 복원도 정규화하여 최초의 SVG와 동일하게 돌려놓습니다.
      for (const [element, attributes] of originals) {
        for (const [name, value] of attributes) {
          if (value === null) element.removeAttribute(name);
          else element.setAttribute(name, value);
        }
      }
    },
  };
}
