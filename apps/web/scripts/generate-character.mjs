import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

// SVG와 React 데이터의 단일 편집 원본입니다. pnpm characters:generate로 재생성합니다.
const appDir = dirname(dirname(fileURLToPath(import.meta.url)));
const outputDir = join(appDir, 'public/characters/character');
const componentDir = join(appDir, 'shared/ui/character');
// Figma Brand / Color Palette의 캐릭터 원색: primary/500, secondary/500.
// 브랜드 자산의 원색은 Light / Dark에서 동일하게 유지합니다.
const colors = { body: '#5551AD', face: '#FEE383' };
const number = (value) => String(Math.round(value * 1000) / 1000);
const attrs = (values) =>
  Object.entries(values)
    .map(([key, value]) => ` ${key}="${value}"`)
    .join('');
const path = (id, d, fill = colors.body) => ({ tag: 'path', id, d, fill });
const group = (id, children, transform = '', extra = {}) => ({
  tag: 'g',
  id,
  ...(transform ? { transform } : {}),
  ...extra,
  children: [children].flat(Infinity),
});

function renderNodes(nodes) {
  return [nodes]
    .flat(Infinity)
    .map(({ tag, children, ...attributes }) =>
      tag === 'path' ? `<path${attrs(attributes)}/>` : `<g${attrs(attributes)}>${renderNodes(children)}</g>`,
    )
    .join('');
}

function oval(rx, ry, cx = 0, cy = 0) {
  const k = 0.55228475;
  return `M ${cx - rx} ${cy} C ${cx - rx} ${cy - ry * k} ${cx - rx * k} ${cy - ry} ${cx} ${cy - ry} C ${cx + rx * k} ${cy - ry} ${cx + rx} ${cy - ry * k} ${cx + rx} ${cy} C ${cx + rx} ${cy + ry * k} ${cx + rx * k} ${cy + ry} ${cx} ${cy + ry} C ${cx - rx * k} ${cy + ry} ${cx - rx} ${cy + ry * k} ${cx - rx} ${cy} Z`;
}

function star(size) {
  const a = number(size * 0.2);
  return `M 0 ${-size} C ${a} ${-a} ${a} ${-a} ${size} 0 C ${a} ${a} ${a} ${a} 0 ${size} C ${-a} ${a} ${-a} ${a} ${-size} 0 C ${-a} ${-a} ${-a} ${-a} 0 ${-size} Z`;
}

function heart(size) {
  return `M 0 ${size * 0.68} C ${-size * 0.35} ${size * 0.36} ${-size} ${-size * 0.05} ${-size} ${-size * 0.53} C ${-size} ${-size * 1.03} ${-size * 0.3} ${-size * 1.2} 0 ${-size * 0.64} C ${size * 0.3} ${-size * 1.2} ${size} ${-size * 1.03} ${size} ${-size * 0.53} C ${size} ${-size * 0.05} ${size * 0.35} ${size * 0.36} 0 ${size * 0.68} Z`;
}

const tear = 'M 0 -24 C -3 -9 -14 0 -14 11 C -14 29 14 29 14 11 C 14 0 3 -9 0 -24 Z';
const happyEye = 'M -30 10 C -30 -30 27 -32 31 5 C 33 20 19 24 15 10 C 10 -10 -10 -9 -14 12 C -17 25 -31 24 -30 10 Z';
const sleepyEye = 'M -32 -6 C -16 5 13 6 29 -7 C 37 -13 43 -2 34 6 C 12 26 -14 22 -35 6 C -43 0 -40 -11 -32 -6 Z';
const sleepZ =
  'M -17 -24 H 18 C 24 -24 27 -17 23 -12 L -7 14 H 18 C 25 14 25 25 18 25 H -18 C -24 25 -27 18 -22 13 L 8 -13 H -17 C -24 -13 -24 -24 -17 -24 Z';
const sadEye = 'M -23 -18 C -9 -8 9 -6 24 -15 C 31 0 24 23 11 27 C -4 33 -17 23 -23 9 C -27 0 -27 -10 -23 -18 Z';
const angryEye = 'M -30 -17 C -19 -12 0 -1 28 6 C 31 25 14 37 -2 29 C -18 23 -31 4 -30 -17 Z';

// 입력 이미지의 외곽을 큰 베지어 곡선으로 재구성합니다. 질감 픽셀은 포함하지 않습니다.
const sourcePaths = {
  body: 'M 351 304 C 504 238 663 249 783 332 C 925 373 946 559 930 760 C 929 944 887 1083 818 1148 C 730 1232 589 1227 512 1162 C 468 1124 461 1071 414 1077 C 351 1072 283 1155 171 1153 C 79 1154 15 1109 10 1022 C 0 947 60 852 107 743 C 153 634 171 508 224 419 C 257 365 295 326 351 304 Z',
  earLeft:
    'M 453 276 C 418 234 378 222 339 229 C 267 228 214 296 156 345 C 102 388 51 411 29 474 C 7 531 25 581 70 599 C 128 624 191 583 225 546 C 273 495 294 437 322 384 C 345 341 353 325 383 305 C 408 289 434 282 453 276 Z',
  earRight:
    'M 775 327 C 842 286 901 303 948 341 C 996 380 1004 427 1046 483 C 1084 535 1125 573 1119 634 C 1115 693 1074 732 1019 724 C 967 718 926 683 900 635 C 875 588 874 500 864 409 C 857 369 819 350 775 327 Z',
  face: 'M 544 372 C 699 371 829 466 860 599 C 874 659 866 731 833 778 C 796 832 736 853 651 856 C 554 860 437 839 350 800 C 281 769 240 723 240 656 C 240 509 380 373 544 372 Z',
};

function localPath(d, anchor) {
  let coordinateIndex = 0;
  return d.replace(/-?\d+(?:\.\d+)?/g, (value) => {
    const coordinate = coordinateIndex++ % 2;
    return number((Number(value) - anchor[coordinate]) * 0.7);
  });
}

const geometry = {
  body: localPath(sourcePaths.body, [564, 720]),
  earLeft: localPath(sourcePaths.earLeft, [409, 313]),
  earRight: localPath(sourcePaths.earRight, [803, 365]),
  face: localPath(sourcePaths.face, [548, 614]),
};

const variants = [
  { slug: 'neutral', label: '기본형', caption: '말없이 곁에', pose: '', ears: [0, 0], eyes: 'open' },
  {
    slug: 'happy',
    label: '기쁨',
    caption: '기분이 둥실',
    pose: 'translate(0 -25) rotate(-6) scale(1.03 0.97)',
    ears: [15, -14],
    eyes: 'happy',
  },
  {
    slug: 'sad',
    label: '슬픔',
    caption: '조금 속상해',
    pose: 'translate(0 15) rotate(4) scale(0.97 1.02)',
    ears: [-11, 8],
    eyes: 'sad',
  },
  {
    slug: 'sparkly',
    label: '반짝눈',
    caption: '눈이 샤방샤방',
    pose: 'translate(0 -12) rotate(-2)',
    ears: [5, -6],
    eyes: 'sparkly',
  },
  {
    slug: 'love',
    label: '하트눈',
    caption: '마음이 몽글',
    pose: 'translate(0 -8) rotate(5) scale(1.02 0.98)',
    ears: [9, -8],
    eyes: 'love',
  },
  {
    slug: 'shy',
    label: '수줍음',
    caption: '조금 부끄러워',
    pose: 'translate(10 18) rotate(9) scale(0.96 0.98)',
    ears: [-5, 4],
    eyes: 'shy',
  },
  {
    slug: 'surprised',
    label: '놀람',
    caption: '어, 정말?',
    pose: 'translate(0 -23) rotate(-3) scale(0.96 1.05)',
    ears: [22, -21],
    eyes: 'surprised',
  },
  {
    slug: 'grumpy',
    label: '삐침',
    caption: '흥, 나 삐쳤어',
    pose: 'translate(0 17) rotate(2) scale(1.05 0.94)',
    ears: [10, -10],
    eyes: 'grumpy',
  },
  {
    slug: 'sleepy',
    label: '졸림',
    caption: '꾸벅, 꿈나라',
    pose: 'translate(0 35) rotate(-10) scale(1.07 0.87)',
    ears: [-13, 12],
    eyes: 'sleepy',
  },
  {
    slug: 'wink',
    label: '윙크',
    caption: '너한테만 찡긋',
    pose: 'translate(0 -5) rotate(-7)',
    ears: [13, -4],
    eyes: 'wink',
  },
  {
    slug: 'curious',
    label: '갸우뚱',
    caption: '이건 뭘까?',
    pose: 'translate(0 -5) rotate(12)',
    ears: [19, 5],
    eyes: 'curious',
  },
];

function eye(side, type) {
  let d = oval(26.5, 38.5);
  let inner = [];
  let expressionTransform = '';
  if (type === 'happy' || (type === 'wink' && side === 'right')) d = happyEye;
  if (type === 'sad') d = sadEye;
  if (type === 'sleepy') d = sleepyEye;
  if (type === 'shy') {
    d = oval(22, 30);
    expressionTransform = 'translate(0 14)';
  }
  if (type === 'grumpy') {
    d = angryEye;
    expressionTransform = side === 'right' ? 'scale(-1 1)' : '';
  }
  if (type === 'curious') d = side === 'left' ? oval(31, 41) : oval(21, 30);
  if (type === 'love') {
    d = heart(34);
    expressionTransform = 'translate(0 6)';
  }
  if (type === 'surprised') d = oval(36, 47);
  if (type === 'sparkly') {
    d = oval(36, 48);
    inner = [
      group(`eye-${side}-shine`, path(`eye-${side}-shine-large`, star(22), colors.face), 'translate(-3 -9)'),
      group(`eye-${side}-shine-small`, path(`eye-${side}-shine-small-shape`, star(6), colors.face), 'translate(15 20)'),
    ];
  }
  return group(
    `eye-${side}`,
    group(
      `eye-${side}-motion`,
      group(`eye-${side}-expression`, [path(`eye-${side}-shape`, d), inner], expressionTransform),
    ),
    side === 'left' ? 'translate(-95.9 5.6) rotate(12)' : 'translate(111.3 37.8) rotate(12)',
  );
}

function faceEffects(type) {
  if (type === 'sad')
    return [
      group('tear-left', path('tear-left-shape', tear), 'translate(-96 66) scale(0.72)'),
      group('tear-right', path('tear-right-shape', tear), 'translate(114 106) scale(0.6)'),
    ];
  if (type === 'shy') {
    return ['left', 'right'].map((side, index) =>
      group(
        `blush-${side}`,
        [-14, 0, 14].map((x, stripe) =>
          group(
            `blush-${side}-${stripe + 1}`,
            path(`blush-${side}-${stripe + 1}-shape`, oval(3.7, 10)),
            `translate(${x} 0) rotate(20)`,
          ),
        ),
        `translate(${index ? 151 : -142} ${index ? 90 : 59})`,
        { opacity: '0.38' },
      ),
    );
  }
  return [];
}

function effect(id, d, x, y, fill = colors.body, transform = '') {
  return group(id, path(`${id}-shape`, d, fill), `translate(${x} ${y})${transform ? ` ${transform}` : ''}`);
}

function effects(slug) {
  switch (slug) {
    case 'happy':
      return [
        effect('joy-spark-left', star(26), 151, 315, colors.face, 'rotate(12)'),
        effect('joy-spark-right', star(31), 844, 219, colors.face),
        effect('joy-dot', oval(8, 8), 889, 265),
      ];
    case 'sad':
      return effect('falling-tear', tear, 675, 709, colors.body, 'rotate(-13) scale(0.62)');
    case 'sparkly':
      return [
        effect('spark-large', star(42), 817, 167, colors.face),
        effect('spark-small', star(23), 885, 234),
        effect('spark-left', star(27), 144, 512, colors.face),
      ];
    case 'love':
      return [
        effect('heart-large', heart(31), 791, 151, colors.body, 'rotate(13)'),
        effect('heart-small', heart(18), 874, 226, colors.face, 'rotate(18)'),
        effect('heart-left', heart(21), 158, 376, colors.face, 'rotate(-18)'),
      ];
    case 'surprised':
      return [
        effect('surprise-ray-left', oval(7, 29), 472, 120, colors.body, 'rotate(-17)'),
        effect('surprise-ray-middle', oval(7, 34), 525, 100, colors.body),
        effect('surprise-ray-right', oval(7, 27), 578, 123, colors.body, 'rotate(20)'),
      ];
    case 'grumpy':
      return [
        effect(
          'puff-large',
          'M -28 5 C -44 -6 -34 -29 -16 -25 C -9 -47 19 -43 22 -25 C 47 -31 53 3 32 11 C 15 22 -6 23 -28 5 Z',
          816,
          253,
          colors.body,
          'rotate(9)',
        ),
        effect('puff-small', oval(8, 8), 783, 301),
      ];
    case 'sleepy':
      return [
        effect('sleep-z-small', sleepZ, 780, 317, colors.body, 'rotate(-7) scale(0.75)'),
        effect('sleep-z-middle', sleepZ, 838, 258, colors.body, 'rotate(5)'),
        effect('sleep-z-large', sleepZ, 902, 184, colors.body, 'rotate(-7) scale(1.25)'),
      ];
    case 'wink':
      return effect('wink-spark', star(34), 825, 230, colors.face, 'rotate(8)');
    case 'curious':
      return group(
        'question-mark',
        [
          effect(
            'question-hook',
            'M -25 -27 C -23 -60 30 -64 39 -34 C 49 -3 17 5 13 15 C 11 22 12 28 4 29 C -9 29 -7 15 -3 6 C 3 -7 27 -15 23 -29 C 18 -45 -8 -41 -9 -25 C -11 -13 -26 -14 -25 -27 Z',
            0,
            -10,
            colors.body,
            'rotate(14)',
          ),
          effect('question-dot', oval(7.5, 7.5), -4, 38),
        ],
        'translate(802 173)',
      );
    default:
      return [];
  }
}

function artwork(variant) {
  const face = group(
    'face',
    [
      path('face-surface', geometry.face, colors.face),
      group('eyes', [eye('left', variant.eyes), eye('right', variant.eyes)]),
      group('face-effects', faceEffects(variant.eyes)),
    ],
    'translate(-11.2 -74.2)',
  );
  const ears = [
    group(
      'ear-left',
      group(
        'ear-left-motion',
        group('ear-left-pose', path('ear-left-shape', geometry.earLeft), `rotate(${variant.ears[0]})`),
      ),
      'translate(-108.5 -284.9)',
    ),
    group(
      'ear-right',
      group(
        'ear-right-motion',
        group('ear-right-pose', path('ear-right-shape', geometry.earRight), `rotate(${variant.ears[1]})`),
      ),
      'translate(167.3 -248.5)',
    ),
  ];
  return [
    group(
      'character',
      group(
        'character-motion',
        group('character-pose', [group('body', path('body-shape', geometry.body)), ears, face], variant.pose),
      ),
      'translate(512 530)',
    ),
    group('effects', effects(variant.slug)),
  ];
}

function svg(variant) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1024 1024" role="img" aria-labelledby="title description">\n<title id="title">Ghost Puppy — ${variant.label}</title>\n<desc id="description">젱영 캐릭터. ${variant.caption}. 배경이 투명한 편집용 벡터. 몸통, 귀, 얼굴, 눈, 효과가 개별 그룹으로 분리되어 있습니다.</desc>\n${renderNodes(artwork(variant))}\n</svg>\n`;
}

await Promise.all([outputDir, componentDir].map((dir) => mkdir(dir, { recursive: true })));
for (const [index, variant] of variants.entries()) {
  variant.file = `${String(index).padStart(2, '0')}-${variant.slug}.svg`;
  await writeFile(join(outputDir, variant.file), svg(variant));
}

// 중복 경로를 한 번만 저장한 동일 도형 트리를 React에도 제공합니다.
const paths = [];
function compactNode(node) {
  if (node.tag === 'g') return { ...node, children: node.children.map(compactNode) };
  const { d, ...rest } = node;
  let pathIndex = paths.indexOf(d);
  if (pathIndex === -1) {
    pathIndex = paths.length;
    paths.push(d);
  }
  return { ...rest, path: pathIndex };
}
const definitions = Object.fromEntries(variants.map((variant) => [variant.slug, artwork(variant).map(compactNode)]));
const summaries = variants.map(({ slug, label, caption, file }) => ({
  expression: slug,
  label,
  caption,
  src: `/characters/character/${file}`,
}));
const generated = `// 자동 생성: pnpm characters:generate. 직접 편집하지 마세요.\nimport type { CharacterNode } from "./character.types";\n\nexport const GHOST_PUPPY_VARIANTS = ${JSON.stringify(summaries, null, 2)} as const;\n\nexport type CharacterExpression = typeof GHOST_PUPPY_VARIANTS[number]["expression"];\n\nexport const GHOST_PUPPY_PATHS: readonly string[] = ${JSON.stringify(paths, null, 2)};\n\nexport const GHOST_PUPPY_ARTWORK: Record<CharacterExpression, readonly CharacterNode[]> = ${JSON.stringify(definitions, null, 2)};\n`;
await writeFile(join(componentDir, 'character.generated.ts'), generated);
console.log(`Generated ${variants.length} SVGs and React artwork (${paths.length} shared paths).`);
