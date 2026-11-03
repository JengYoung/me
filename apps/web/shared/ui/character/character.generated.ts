// 자동 생성: pnpm characters:generate. 직접 편집하지 마세요.
import type { CharacterNode } from './character.types';

export const GHOST_PUPPY_VARIANTS = [
  {
    expression: 'neutral',
    label: '기본형',
    caption: '말없이 곁에',
    src: '/characters/character/00-neutral.svg',
  },
  {
    expression: 'happy',
    label: '기쁨',
    caption: '기분이 둥실',
    src: '/characters/character/01-happy.svg',
  },
  {
    expression: 'sad',
    label: '슬픔',
    caption: '조금 속상해',
    src: '/characters/character/02-sad.svg',
  },
  {
    expression: 'sparkly',
    label: '반짝눈',
    caption: '눈이 샤방샤방',
    src: '/characters/character/03-sparkly.svg',
  },
  {
    expression: 'love',
    label: '하트눈',
    caption: '마음이 몽글',
    src: '/characters/character/04-love.svg',
  },
  {
    expression: 'shy',
    label: '수줍음',
    caption: '조금 부끄러워',
    src: '/characters/character/05-shy.svg',
  },
  {
    expression: 'surprised',
    label: '놀람',
    caption: '어, 정말?',
    src: '/characters/character/06-surprised.svg',
  },
  {
    expression: 'grumpy',
    label: '삐침',
    caption: '흥, 나 삐쳤어',
    src: '/characters/character/07-grumpy.svg',
  },
  {
    expression: 'sleepy',
    label: '졸림',
    caption: '꾸벅, 꿈나라',
    src: '/characters/character/08-sleepy.svg',
  },
  {
    expression: 'wink',
    label: '윙크',
    caption: '너한테만 찡긋',
    src: '/characters/character/09-wink.svg',
  },
  {
    expression: 'curious',
    label: '갸우뚱',
    caption: '이건 뭘까?',
    src: '/characters/character/10-curious.svg',
  },
] as const;

export type CharacterExpression = (typeof GHOST_PUPPY_VARIANTS)[number]['expression'];

export const GHOST_PUPPY_PATHS: readonly string[] = [
  'M -149.1 -291.2 C -42 -337.4 69.3 -329.7 153.3 -271.6 C 252.7 -242.9 267.4 -112.7 256.2 28 C 255.5 156.8 226.1 254.1 177.8 299.6 C 116.2 358.4 17.5 354.9 -36.4 309.4 C -67.2 282.8 -72.1 245.7 -105 249.9 C -149.1 246.4 -196.7 304.5 -275.1 303.1 C -339.5 303.8 -384.3 272.3 -387.8 211.4 C -394.8 158.9 -352.8 92.4 -319.9 16.1 C -287.7 -60.2 -275.1 -148.4 -238 -210.7 C -214.9 -248.5 -188.3 -275.8 -149.1 -291.2 Z',
  'M 30.8 -25.9 C 6.3 -55.3 -21.7 -63.7 -49 -58.8 C -99.4 -59.5 -136.5 -11.9 -177.1 22.4 C -214.9 52.5 -250.6 68.6 -266 112.7 C -281.4 152.6 -268.8 187.6 -237.3 200.2 C -196.7 217.7 -152.6 189 -128.8 163.1 C -95.2 127.4 -80.5 86.8 -60.9 49.7 C -44.8 19.6 -39.2 8.4 -18.2 -5.6 C -0.7 -16.8 17.5 -21.7 30.8 -25.9 Z',
  'M -19.6 -26.6 C 27.3 -55.3 68.6 -43.4 101.5 -16.8 C 135.1 10.5 140.7 43.4 170.1 82.6 C 196.7 119 225.4 145.6 221.2 188.3 C 218.4 229.6 189.7 256.9 151.2 251.3 C 114.8 247.1 86.1 222.6 67.9 189 C 50.4 156.1 49.7 94.5 42.7 30.8 C 37.8 2.8 11.2 -10.5 -19.6 -26.6 Z',
  'M -2.8 -169.4 C 105.7 -170.1 196.7 -103.6 218.4 -10.5 C 228.2 31.5 222.6 81.9 199.5 114.8 C 173.6 152.6 131.6 167.3 72.1 169.4 C 4.2 172.2 -77.7 157.5 -138.6 130.2 C -186.9 108.5 -215.6 76.3 -215.6 29.4 C -215.6 -73.5 -117.6 -168.7 -2.8 -169.4 Z',
  'M -26.5 0 C -26.5 -21.262962875 -14.635545875 -38.5 0 -38.5 C 14.635545875 -38.5 26.5 -21.262962875 26.5 0 C 26.5 21.262962875 14.635545875 38.5 0 38.5 C -14.635545875 38.5 -26.5 21.262962875 -26.5 0 Z',
  'M -30 10 C -30 -30 27 -32 31 5 C 33 20 19 24 15 10 C 10 -10 -10 -9 -14 12 C -17 25 -31 24 -30 10 Z',
  'M 0 -26 C 5.2 -5.2 5.2 -5.2 26 0 C 5.2 5.2 5.2 5.2 0 26 C -5.2 5.2 -5.2 5.2 -26 0 C -5.2 -5.2 -5.2 -5.2 0 -26 Z',
  'M 0 -31 C 6.2 -6.2 6.2 -6.2 31 0 C 6.2 6.2 6.2 6.2 0 31 C -6.2 6.2 -6.2 6.2 -31 0 C -6.2 -6.2 -6.2 -6.2 0 -31 Z',
  'M -8 0 C -8 -4.418278 -4.418278 -8 0 -8 C 4.418278 -8 8 -4.418278 8 0 C 8 4.418278 4.418278 8 0 8 C -4.418278 8 -8 4.418278 -8 0 Z',
  'M -23 -18 C -9 -8 9 -6 24 -15 C 31 0 24 23 11 27 C -4 33 -17 23 -23 9 C -27 0 -27 -10 -23 -18 Z',
  'M 0 -24 C -3 -9 -14 0 -14 11 C -14 29 14 29 14 11 C 14 0 3 -9 0 -24 Z',
  'M -36 0 C -36 -26.509667999999998 -19.882251 -48 0 -48 C 19.882251 -48 36 -26.509667999999998 36 0 C 36 26.509667999999998 19.882251 48 0 48 C -19.882251 48 -36 26.509667999999998 -36 0 Z',
  'M 0 -22 C 4.4 -4.4 4.4 -4.4 22 0 C 4.4 4.4 4.4 4.4 0 22 C -4.4 4.4 -4.4 4.4 -22 0 C -4.4 -4.4 -4.4 -4.4 0 -22 Z',
  'M 0 -6 C 1.2 -1.2 1.2 -1.2 6 0 C 1.2 1.2 1.2 1.2 0 6 C -1.2 1.2 -1.2 1.2 -6 0 C -1.2 -1.2 -1.2 -1.2 0 -6 Z',
  'M 0 -42 C 8.4 -8.4 8.4 -8.4 42 0 C 8.4 8.4 8.4 8.4 0 42 C -8.4 8.4 -8.4 8.4 -42 0 C -8.4 -8.4 -8.4 -8.4 0 -42 Z',
  'M 0 -23 C 4.6 -4.6 4.6 -4.6 23 0 C 4.6 4.6 4.6 4.6 0 23 C -4.6 4.6 -4.6 4.6 -23 0 C -4.6 -4.6 -4.6 -4.6 0 -23 Z',
  'M 0 -27 C 5.4 -5.4 5.4 -5.4 27 0 C 5.4 5.4 5.4 5.4 0 27 C -5.4 5.4 -5.4 5.4 -27 0 C -5.4 -5.4 -5.4 -5.4 0 -27 Z',
  'M 0 23.12 C -11.899999999999999 12.24 -34 -1.7000000000000002 -34 -18.02 C -34 -35.02 -10.2 -40.8 0 -21.76 C 10.2 -40.8 34 -35.02 34 -18.02 C 34 -1.7000000000000002 11.899999999999999 12.24 0 23.12 Z',
  'M 0 21.080000000000002 C -10.85 11.16 -31 -1.55 -31 -16.43 C -31 -31.93 -9.299999999999999 -37.199999999999996 0 -19.84 C 9.299999999999999 -37.199999999999996 31 -31.93 31 -16.43 C 31 -1.55 10.85 11.16 0 21.080000000000002 Z',
  'M 0 12.24 C -6.3 6.4799999999999995 -18 -0.9 -18 -9.540000000000001 C -18 -18.54 -5.3999999999999995 -21.599999999999998 0 -11.52 C 5.3999999999999995 -21.599999999999998 18 -18.54 18 -9.540000000000001 C 18 -0.9 6.3 6.4799999999999995 0 12.24 Z',
  'M 0 14.280000000000001 C -7.35 7.56 -21 -1.05 -21 -11.13 C -21 -21.63 -6.3 -25.2 0 -13.44 C 6.3 -25.2 21 -21.63 21 -11.13 C 21 -1.05 7.35 7.56 0 14.280000000000001 Z',
  'M -22 0 C -22 -16.5685425 -12.1502645 -30 0 -30 C 12.1502645 -30 22 -16.5685425 22 0 C 22 16.5685425 12.1502645 30 0 30 C -12.1502645 30 -22 16.5685425 -22 0 Z',
  'M -3.7 0 C -3.7 -5.5228475 -2.043453575 -10 0 -10 C 2.043453575 -10 3.7 -5.5228475 3.7 0 C 3.7 5.5228475 2.043453575 10 0 10 C -2.043453575 10 -3.7 5.5228475 -3.7 0 Z',
  'M -36 0 C -36 -25.95738325 -19.882251 -47 0 -47 C 19.882251 -47 36 -25.95738325 36 0 C 36 25.95738325 19.882251 47 0 47 C -19.882251 47 -36 25.95738325 -36 0 Z',
  'M -7 0 C -7 -16.01625775 -3.86599325 -29 0 -29 C 3.86599325 -29 7 -16.01625775 7 0 C 7 16.01625775 3.86599325 29 0 29 C -3.86599325 29 -7 16.01625775 -7 0 Z',
  'M -7 0 C -7 -18.7776815 -3.86599325 -34 0 -34 C 3.86599325 -34 7 -18.7776815 7 0 C 7 18.7776815 3.86599325 34 0 34 C -3.86599325 34 -7 18.7776815 -7 0 Z',
  'M -7 0 C -7 -14.91168825 -3.86599325 -27 0 -27 C 3.86599325 -27 7 -14.91168825 7 0 C 7 14.91168825 3.86599325 27 0 27 C -3.86599325 27 -7 14.91168825 -7 0 Z',
  'M -30 -17 C -19 -12 0 -1 28 6 C 31 25 14 37 -2 29 C -18 23 -31 4 -30 -17 Z',
  'M -28 5 C -44 -6 -34 -29 -16 -25 C -9 -47 19 -43 22 -25 C 47 -31 53 3 32 11 C 15 22 -6 23 -28 5 Z',
  'M -32 -6 C -16 5 13 6 29 -7 C 37 -13 43 -2 34 6 C 12 26 -14 22 -35 6 C -43 0 -40 -11 -32 -6 Z',
  'M -17 -24 H 18 C 24 -24 27 -17 23 -12 L -7 14 H 18 C 25 14 25 25 18 25 H -18 C -24 25 -27 18 -22 13 L 8 -13 H -17 C -24 -13 -24 -24 -17 -24 Z',
  'M 0 -34 C 6.8 -6.8 6.8 -6.8 34 0 C 6.8 6.8 6.8 6.8 0 34 C -6.8 6.8 -6.8 6.8 -34 0 C -6.8 -6.8 -6.8 -6.8 0 -34 Z',
  'M -31 0 C -31 -22.64367475 -17.12082725 -41 0 -41 C 17.12082725 -41 31 -22.64367475 31 0 C 31 22.64367475 17.12082725 41 0 41 C -17.12082725 41 -31 22.64367475 -31 0 Z',
  'M -21 0 C -21 -16.5685425 -11.59797975 -30 0 -30 C 11.59797975 -30 21 -16.5685425 21 0 C 21 16.5685425 11.59797975 30 0 30 C -11.59797975 30 -21 16.5685425 -21 0 Z',
  'M -25 -27 C -23 -60 30 -64 39 -34 C 49 -3 17 5 13 15 C 11 22 12 28 4 29 C -9 29 -7 15 -3 6 C 3 -7 27 -15 23 -29 C 18 -45 -8 -41 -9 -25 C -11 -13 -26 -14 -25 -27 Z',
  'M -7.5 0 C -7.5 -4.142135625 -4.142135625 -7.5 0 -7.5 C 4.142135625 -7.5 7.5 -4.142135625 7.5 0 C 7.5 4.142135625 4.142135625 7.5 0 7.5 C -4.142135625 7.5 -7.5 4.142135625 -7.5 0 Z',
];

export const GHOST_PUPPY_ARTWORK: Record<CharacterExpression, readonly CharacterNode[]> = {
  neutral: [
    {
      tag: 'g',
      id: 'character',
      transform: 'translate(512 530)',
      children: [
        {
          tag: 'g',
          id: 'character-motion',
          children: [
            {
              tag: 'g',
              id: 'character-pose',
              children: [
                {
                  tag: 'g',
                  id: 'body',
                  children: [
                    {
                      tag: 'path',
                      id: 'body-shape',
                      fill: '#5551AD',
                      path: 0,
                    },
                  ],
                },
                {
                  tag: 'g',
                  id: 'ear-left',
                  transform: 'translate(-108.5 -284.9)',
                  children: [
                    {
                      tag: 'g',
                      id: 'ear-left-motion',
                      children: [
                        {
                          tag: 'g',
                          id: 'ear-left-pose',
                          transform: 'rotate(0)',
                          children: [
                            {
                              tag: 'path',
                              id: 'ear-left-shape',
                              fill: '#5551AD',
                              path: 1,
                            },
                          ],
                        },
                      ],
                    },
                  ],
                },
                {
                  tag: 'g',
                  id: 'ear-right',
                  transform: 'translate(167.3 -248.5)',
                  children: [
                    {
                      tag: 'g',
                      id: 'ear-right-motion',
                      children: [
                        {
                          tag: 'g',
                          id: 'ear-right-pose',
                          transform: 'rotate(0)',
                          children: [
                            {
                              tag: 'path',
                              id: 'ear-right-shape',
                              fill: '#5551AD',
                              path: 2,
                            },
                          ],
                        },
                      ],
                    },
                  ],
                },
                {
                  tag: 'g',
                  id: 'face',
                  transform: 'translate(-11.2 -74.2)',
                  children: [
                    {
                      tag: 'path',
                      id: 'face-surface',
                      fill: '#FEE383',
                      path: 3,
                    },
                    {
                      tag: 'g',
                      id: 'eyes',
                      children: [
                        {
                          tag: 'g',
                          id: 'eye-left',
                          transform: 'translate(-95.9 5.6) rotate(12)',
                          children: [
                            {
                              tag: 'g',
                              id: 'eye-left-motion',
                              children: [
                                {
                                  tag: 'g',
                                  id: 'eye-left-expression',
                                  children: [
                                    {
                                      tag: 'path',
                                      id: 'eye-left-shape',
                                      fill: '#5551AD',
                                      path: 4,
                                    },
                                  ],
                                },
                              ],
                            },
                          ],
                        },
                        {
                          tag: 'g',
                          id: 'eye-right',
                          transform: 'translate(111.3 37.8) rotate(12)',
                          children: [
                            {
                              tag: 'g',
                              id: 'eye-right-motion',
                              children: [
                                {
                                  tag: 'g',
                                  id: 'eye-right-expression',
                                  children: [
                                    {
                                      tag: 'path',
                                      id: 'eye-right-shape',
                                      fill: '#5551AD',
                                      path: 4,
                                    },
                                  ],
                                },
                              ],
                            },
                          ],
                        },
                      ],
                    },
                    {
                      tag: 'g',
                      id: 'face-effects',
                      children: [],
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
    {
      tag: 'g',
      id: 'effects',
      children: [],
    },
  ],
  happy: [
    {
      tag: 'g',
      id: 'character',
      transform: 'translate(512 530)',
      children: [
        {
          tag: 'g',
          id: 'character-motion',
          children: [
            {
              tag: 'g',
              id: 'character-pose',
              transform: 'translate(0 -25) rotate(-6) scale(1.03 0.97)',
              children: [
                {
                  tag: 'g',
                  id: 'body',
                  children: [
                    {
                      tag: 'path',
                      id: 'body-shape',
                      fill: '#5551AD',
                      path: 0,
                    },
                  ],
                },
                {
                  tag: 'g',
                  id: 'ear-left',
                  transform: 'translate(-108.5 -284.9)',
                  children: [
                    {
                      tag: 'g',
                      id: 'ear-left-motion',
                      children: [
                        {
                          tag: 'g',
                          id: 'ear-left-pose',
                          transform: 'rotate(15)',
                          children: [
                            {
                              tag: 'path',
                              id: 'ear-left-shape',
                              fill: '#5551AD',
                              path: 1,
                            },
                          ],
                        },
                      ],
                    },
                  ],
                },
                {
                  tag: 'g',
                  id: 'ear-right',
                  transform: 'translate(167.3 -248.5)',
                  children: [
                    {
                      tag: 'g',
                      id: 'ear-right-motion',
                      children: [
                        {
                          tag: 'g',
                          id: 'ear-right-pose',
                          transform: 'rotate(-14)',
                          children: [
                            {
                              tag: 'path',
                              id: 'ear-right-shape',
                              fill: '#5551AD',
                              path: 2,
                            },
                          ],
                        },
                      ],
                    },
                  ],
                },
                {
                  tag: 'g',
                  id: 'face',
                  transform: 'translate(-11.2 -74.2)',
                  children: [
                    {
                      tag: 'path',
                      id: 'face-surface',
                      fill: '#FEE383',
                      path: 3,
                    },
                    {
                      tag: 'g',
                      id: 'eyes',
                      children: [
                        {
                          tag: 'g',
                          id: 'eye-left',
                          transform: 'translate(-95.9 5.6) rotate(12)',
                          children: [
                            {
                              tag: 'g',
                              id: 'eye-left-motion',
                              children: [
                                {
                                  tag: 'g',
                                  id: 'eye-left-expression',
                                  children: [
                                    {
                                      tag: 'path',
                                      id: 'eye-left-shape',
                                      fill: '#5551AD',
                                      path: 5,
                                    },
                                  ],
                                },
                              ],
                            },
                          ],
                        },
                        {
                          tag: 'g',
                          id: 'eye-right',
                          transform: 'translate(111.3 37.8) rotate(12)',
                          children: [
                            {
                              tag: 'g',
                              id: 'eye-right-motion',
                              children: [
                                {
                                  tag: 'g',
                                  id: 'eye-right-expression',
                                  children: [
                                    {
                                      tag: 'path',
                                      id: 'eye-right-shape',
                                      fill: '#5551AD',
                                      path: 5,
                                    },
                                  ],
                                },
                              ],
                            },
                          ],
                        },
                      ],
                    },
                    {
                      tag: 'g',
                      id: 'face-effects',
                      children: [],
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
    {
      tag: 'g',
      id: 'effects',
      children: [
        {
          tag: 'g',
          id: 'joy-spark-left',
          transform: 'translate(151 315) rotate(12)',
          children: [
            {
              tag: 'path',
              id: 'joy-spark-left-shape',
              fill: '#FEE383',
              path: 6,
            },
          ],
        },
        {
          tag: 'g',
          id: 'joy-spark-right',
          transform: 'translate(844 219)',
          children: [
            {
              tag: 'path',
              id: 'joy-spark-right-shape',
              fill: '#FEE383',
              path: 7,
            },
          ],
        },
        {
          tag: 'g',
          id: 'joy-dot',
          transform: 'translate(889 265)',
          children: [
            {
              tag: 'path',
              id: 'joy-dot-shape',
              fill: '#5551AD',
              path: 8,
            },
          ],
        },
      ],
    },
  ],
  sad: [
    {
      tag: 'g',
      id: 'character',
      transform: 'translate(512 530)',
      children: [
        {
          tag: 'g',
          id: 'character-motion',
          children: [
            {
              tag: 'g',
              id: 'character-pose',
              transform: 'translate(0 15) rotate(4) scale(0.97 1.02)',
              children: [
                {
                  tag: 'g',
                  id: 'body',
                  children: [
                    {
                      tag: 'path',
                      id: 'body-shape',
                      fill: '#5551AD',
                      path: 0,
                    },
                  ],
                },
                {
                  tag: 'g',
                  id: 'ear-left',
                  transform: 'translate(-108.5 -284.9)',
                  children: [
                    {
                      tag: 'g',
                      id: 'ear-left-motion',
                      children: [
                        {
                          tag: 'g',
                          id: 'ear-left-pose',
                          transform: 'rotate(-11)',
                          children: [
                            {
                              tag: 'path',
                              id: 'ear-left-shape',
                              fill: '#5551AD',
                              path: 1,
                            },
                          ],
                        },
                      ],
                    },
                  ],
                },
                {
                  tag: 'g',
                  id: 'ear-right',
                  transform: 'translate(167.3 -248.5)',
                  children: [
                    {
                      tag: 'g',
                      id: 'ear-right-motion',
                      children: [
                        {
                          tag: 'g',
                          id: 'ear-right-pose',
                          transform: 'rotate(8)',
                          children: [
                            {
                              tag: 'path',
                              id: 'ear-right-shape',
                              fill: '#5551AD',
                              path: 2,
                            },
                          ],
                        },
                      ],
                    },
                  ],
                },
                {
                  tag: 'g',
                  id: 'face',
                  transform: 'translate(-11.2 -74.2)',
                  children: [
                    {
                      tag: 'path',
                      id: 'face-surface',
                      fill: '#FEE383',
                      path: 3,
                    },
                    {
                      tag: 'g',
                      id: 'eyes',
                      children: [
                        {
                          tag: 'g',
                          id: 'eye-left',
                          transform: 'translate(-95.9 5.6) rotate(12)',
                          children: [
                            {
                              tag: 'g',
                              id: 'eye-left-motion',
                              children: [
                                {
                                  tag: 'g',
                                  id: 'eye-left-expression',
                                  children: [
                                    {
                                      tag: 'path',
                                      id: 'eye-left-shape',
                                      fill: '#5551AD',
                                      path: 9,
                                    },
                                  ],
                                },
                              ],
                            },
                          ],
                        },
                        {
                          tag: 'g',
                          id: 'eye-right',
                          transform: 'translate(111.3 37.8) rotate(12)',
                          children: [
                            {
                              tag: 'g',
                              id: 'eye-right-motion',
                              children: [
                                {
                                  tag: 'g',
                                  id: 'eye-right-expression',
                                  children: [
                                    {
                                      tag: 'path',
                                      id: 'eye-right-shape',
                                      fill: '#5551AD',
                                      path: 9,
                                    },
                                  ],
                                },
                              ],
                            },
                          ],
                        },
                      ],
                    },
                    {
                      tag: 'g',
                      id: 'face-effects',
                      children: [
                        {
                          tag: 'g',
                          id: 'tear-left',
                          transform: 'translate(-96 66) scale(0.72)',
                          children: [
                            {
                              tag: 'path',
                              id: 'tear-left-shape',
                              fill: '#5551AD',
                              path: 10,
                            },
                          ],
                        },
                        {
                          tag: 'g',
                          id: 'tear-right',
                          transform: 'translate(114 106) scale(0.6)',
                          children: [
                            {
                              tag: 'path',
                              id: 'tear-right-shape',
                              fill: '#5551AD',
                              path: 10,
                            },
                          ],
                        },
                      ],
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
    {
      tag: 'g',
      id: 'effects',
      children: [
        {
          tag: 'g',
          id: 'falling-tear',
          transform: 'translate(675 709) rotate(-13) scale(0.62)',
          children: [
            {
              tag: 'path',
              id: 'falling-tear-shape',
              fill: '#5551AD',
              path: 10,
            },
          ],
        },
      ],
    },
  ],
  sparkly: [
    {
      tag: 'g',
      id: 'character',
      transform: 'translate(512 530)',
      children: [
        {
          tag: 'g',
          id: 'character-motion',
          children: [
            {
              tag: 'g',
              id: 'character-pose',
              transform: 'translate(0 -12) rotate(-2)',
              children: [
                {
                  tag: 'g',
                  id: 'body',
                  children: [
                    {
                      tag: 'path',
                      id: 'body-shape',
                      fill: '#5551AD',
                      path: 0,
                    },
                  ],
                },
                {
                  tag: 'g',
                  id: 'ear-left',
                  transform: 'translate(-108.5 -284.9)',
                  children: [
                    {
                      tag: 'g',
                      id: 'ear-left-motion',
                      children: [
                        {
                          tag: 'g',
                          id: 'ear-left-pose',
                          transform: 'rotate(5)',
                          children: [
                            {
                              tag: 'path',
                              id: 'ear-left-shape',
                              fill: '#5551AD',
                              path: 1,
                            },
                          ],
                        },
                      ],
                    },
                  ],
                },
                {
                  tag: 'g',
                  id: 'ear-right',
                  transform: 'translate(167.3 -248.5)',
                  children: [
                    {
                      tag: 'g',
                      id: 'ear-right-motion',
                      children: [
                        {
                          tag: 'g',
                          id: 'ear-right-pose',
                          transform: 'rotate(-6)',
                          children: [
                            {
                              tag: 'path',
                              id: 'ear-right-shape',
                              fill: '#5551AD',
                              path: 2,
                            },
                          ],
                        },
                      ],
                    },
                  ],
                },
                {
                  tag: 'g',
                  id: 'face',
                  transform: 'translate(-11.2 -74.2)',
                  children: [
                    {
                      tag: 'path',
                      id: 'face-surface',
                      fill: '#FEE383',
                      path: 3,
                    },
                    {
                      tag: 'g',
                      id: 'eyes',
                      children: [
                        {
                          tag: 'g',
                          id: 'eye-left',
                          transform: 'translate(-95.9 5.6) rotate(12)',
                          children: [
                            {
                              tag: 'g',
                              id: 'eye-left-motion',
                              children: [
                                {
                                  tag: 'g',
                                  id: 'eye-left-expression',
                                  children: [
                                    {
                                      tag: 'path',
                                      id: 'eye-left-shape',
                                      fill: '#5551AD',
                                      path: 11,
                                    },
                                    {
                                      tag: 'g',
                                      id: 'eye-left-shine',
                                      transform: 'translate(-3 -9)',
                                      children: [
                                        {
                                          tag: 'path',
                                          id: 'eye-left-shine-large',
                                          fill: '#FEE383',
                                          path: 12,
                                        },
                                      ],
                                    },
                                    {
                                      tag: 'g',
                                      id: 'eye-left-shine-small',
                                      transform: 'translate(15 20)',
                                      children: [
                                        {
                                          tag: 'path',
                                          id: 'eye-left-shine-small-shape',
                                          fill: '#FEE383',
                                          path: 13,
                                        },
                                      ],
                                    },
                                  ],
                                },
                              ],
                            },
                          ],
                        },
                        {
                          tag: 'g',
                          id: 'eye-right',
                          transform: 'translate(111.3 37.8) rotate(12)',
                          children: [
                            {
                              tag: 'g',
                              id: 'eye-right-motion',
                              children: [
                                {
                                  tag: 'g',
                                  id: 'eye-right-expression',
                                  children: [
                                    {
                                      tag: 'path',
                                      id: 'eye-right-shape',
                                      fill: '#5551AD',
                                      path: 11,
                                    },
                                    {
                                      tag: 'g',
                                      id: 'eye-right-shine',
                                      transform: 'translate(-3 -9)',
                                      children: [
                                        {
                                          tag: 'path',
                                          id: 'eye-right-shine-large',
                                          fill: '#FEE383',
                                          path: 12,
                                        },
                                      ],
                                    },
                                    {
                                      tag: 'g',
                                      id: 'eye-right-shine-small',
                                      transform: 'translate(15 20)',
                                      children: [
                                        {
                                          tag: 'path',
                                          id: 'eye-right-shine-small-shape',
                                          fill: '#FEE383',
                                          path: 13,
                                        },
                                      ],
                                    },
                                  ],
                                },
                              ],
                            },
                          ],
                        },
                      ],
                    },
                    {
                      tag: 'g',
                      id: 'face-effects',
                      children: [],
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
    {
      tag: 'g',
      id: 'effects',
      children: [
        {
          tag: 'g',
          id: 'spark-large',
          transform: 'translate(817 167)',
          children: [
            {
              tag: 'path',
              id: 'spark-large-shape',
              fill: '#FEE383',
              path: 14,
            },
          ],
        },
        {
          tag: 'g',
          id: 'spark-small',
          transform: 'translate(885 234)',
          children: [
            {
              tag: 'path',
              id: 'spark-small-shape',
              fill: '#5551AD',
              path: 15,
            },
          ],
        },
        {
          tag: 'g',
          id: 'spark-left',
          transform: 'translate(144 512)',
          children: [
            {
              tag: 'path',
              id: 'spark-left-shape',
              fill: '#FEE383',
              path: 16,
            },
          ],
        },
      ],
    },
  ],
  love: [
    {
      tag: 'g',
      id: 'character',
      transform: 'translate(512 530)',
      children: [
        {
          tag: 'g',
          id: 'character-motion',
          children: [
            {
              tag: 'g',
              id: 'character-pose',
              transform: 'translate(0 -8) rotate(5) scale(1.02 0.98)',
              children: [
                {
                  tag: 'g',
                  id: 'body',
                  children: [
                    {
                      tag: 'path',
                      id: 'body-shape',
                      fill: '#5551AD',
                      path: 0,
                    },
                  ],
                },
                {
                  tag: 'g',
                  id: 'ear-left',
                  transform: 'translate(-108.5 -284.9)',
                  children: [
                    {
                      tag: 'g',
                      id: 'ear-left-motion',
                      children: [
                        {
                          tag: 'g',
                          id: 'ear-left-pose',
                          transform: 'rotate(9)',
                          children: [
                            {
                              tag: 'path',
                              id: 'ear-left-shape',
                              fill: '#5551AD',
                              path: 1,
                            },
                          ],
                        },
                      ],
                    },
                  ],
                },
                {
                  tag: 'g',
                  id: 'ear-right',
                  transform: 'translate(167.3 -248.5)',
                  children: [
                    {
                      tag: 'g',
                      id: 'ear-right-motion',
                      children: [
                        {
                          tag: 'g',
                          id: 'ear-right-pose',
                          transform: 'rotate(-8)',
                          children: [
                            {
                              tag: 'path',
                              id: 'ear-right-shape',
                              fill: '#5551AD',
                              path: 2,
                            },
                          ],
                        },
                      ],
                    },
                  ],
                },
                {
                  tag: 'g',
                  id: 'face',
                  transform: 'translate(-11.2 -74.2)',
                  children: [
                    {
                      tag: 'path',
                      id: 'face-surface',
                      fill: '#FEE383',
                      path: 3,
                    },
                    {
                      tag: 'g',
                      id: 'eyes',
                      children: [
                        {
                          tag: 'g',
                          id: 'eye-left',
                          transform: 'translate(-95.9 5.6) rotate(12)',
                          children: [
                            {
                              tag: 'g',
                              id: 'eye-left-motion',
                              children: [
                                {
                                  tag: 'g',
                                  id: 'eye-left-expression',
                                  transform: 'translate(0 6)',
                                  children: [
                                    {
                                      tag: 'path',
                                      id: 'eye-left-shape',
                                      fill: '#5551AD',
                                      path: 17,
                                    },
                                  ],
                                },
                              ],
                            },
                          ],
                        },
                        {
                          tag: 'g',
                          id: 'eye-right',
                          transform: 'translate(111.3 37.8) rotate(12)',
                          children: [
                            {
                              tag: 'g',
                              id: 'eye-right-motion',
                              children: [
                                {
                                  tag: 'g',
                                  id: 'eye-right-expression',
                                  transform: 'translate(0 6)',
                                  children: [
                                    {
                                      tag: 'path',
                                      id: 'eye-right-shape',
                                      fill: '#5551AD',
                                      path: 17,
                                    },
                                  ],
                                },
                              ],
                            },
                          ],
                        },
                      ],
                    },
                    {
                      tag: 'g',
                      id: 'face-effects',
                      children: [],
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
    {
      tag: 'g',
      id: 'effects',
      children: [
        {
          tag: 'g',
          id: 'heart-large',
          transform: 'translate(791 151) rotate(13)',
          children: [
            {
              tag: 'path',
              id: 'heart-large-shape',
              fill: '#5551AD',
              path: 18,
            },
          ],
        },
        {
          tag: 'g',
          id: 'heart-small',
          transform: 'translate(874 226) rotate(18)',
          children: [
            {
              tag: 'path',
              id: 'heart-small-shape',
              fill: '#FEE383',
              path: 19,
            },
          ],
        },
        {
          tag: 'g',
          id: 'heart-left',
          transform: 'translate(158 376) rotate(-18)',
          children: [
            {
              tag: 'path',
              id: 'heart-left-shape',
              fill: '#FEE383',
              path: 20,
            },
          ],
        },
      ],
    },
  ],
  shy: [
    {
      tag: 'g',
      id: 'character',
      transform: 'translate(512 530)',
      children: [
        {
          tag: 'g',
          id: 'character-motion',
          children: [
            {
              tag: 'g',
              id: 'character-pose',
              transform: 'translate(10 18) rotate(9) scale(0.96 0.98)',
              children: [
                {
                  tag: 'g',
                  id: 'body',
                  children: [
                    {
                      tag: 'path',
                      id: 'body-shape',
                      fill: '#5551AD',
                      path: 0,
                    },
                  ],
                },
                {
                  tag: 'g',
                  id: 'ear-left',
                  transform: 'translate(-108.5 -284.9)',
                  children: [
                    {
                      tag: 'g',
                      id: 'ear-left-motion',
                      children: [
                        {
                          tag: 'g',
                          id: 'ear-left-pose',
                          transform: 'rotate(-5)',
                          children: [
                            {
                              tag: 'path',
                              id: 'ear-left-shape',
                              fill: '#5551AD',
                              path: 1,
                            },
                          ],
                        },
                      ],
                    },
                  ],
                },
                {
                  tag: 'g',
                  id: 'ear-right',
                  transform: 'translate(167.3 -248.5)',
                  children: [
                    {
                      tag: 'g',
                      id: 'ear-right-motion',
                      children: [
                        {
                          tag: 'g',
                          id: 'ear-right-pose',
                          transform: 'rotate(4)',
                          children: [
                            {
                              tag: 'path',
                              id: 'ear-right-shape',
                              fill: '#5551AD',
                              path: 2,
                            },
                          ],
                        },
                      ],
                    },
                  ],
                },
                {
                  tag: 'g',
                  id: 'face',
                  transform: 'translate(-11.2 -74.2)',
                  children: [
                    {
                      tag: 'path',
                      id: 'face-surface',
                      fill: '#FEE383',
                      path: 3,
                    },
                    {
                      tag: 'g',
                      id: 'eyes',
                      children: [
                        {
                          tag: 'g',
                          id: 'eye-left',
                          transform: 'translate(-95.9 5.6) rotate(12)',
                          children: [
                            {
                              tag: 'g',
                              id: 'eye-left-motion',
                              children: [
                                {
                                  tag: 'g',
                                  id: 'eye-left-expression',
                                  transform: 'translate(0 14)',
                                  children: [
                                    {
                                      tag: 'path',
                                      id: 'eye-left-shape',
                                      fill: '#5551AD',
                                      path: 21,
                                    },
                                  ],
                                },
                              ],
                            },
                          ],
                        },
                        {
                          tag: 'g',
                          id: 'eye-right',
                          transform: 'translate(111.3 37.8) rotate(12)',
                          children: [
                            {
                              tag: 'g',
                              id: 'eye-right-motion',
                              children: [
                                {
                                  tag: 'g',
                                  id: 'eye-right-expression',
                                  transform: 'translate(0 14)',
                                  children: [
                                    {
                                      tag: 'path',
                                      id: 'eye-right-shape',
                                      fill: '#5551AD',
                                      path: 21,
                                    },
                                  ],
                                },
                              ],
                            },
                          ],
                        },
                      ],
                    },
                    {
                      tag: 'g',
                      id: 'face-effects',
                      children: [
                        {
                          tag: 'g',
                          id: 'blush-left',
                          transform: 'translate(-142 59)',
                          opacity: '0.38',
                          children: [
                            {
                              tag: 'g',
                              id: 'blush-left-1',
                              transform: 'translate(-14 0) rotate(20)',
                              children: [
                                {
                                  tag: 'path',
                                  id: 'blush-left-1-shape',
                                  fill: '#5551AD',
                                  path: 22,
                                },
                              ],
                            },
                            {
                              tag: 'g',
                              id: 'blush-left-2',
                              transform: 'translate(0 0) rotate(20)',
                              children: [
                                {
                                  tag: 'path',
                                  id: 'blush-left-2-shape',
                                  fill: '#5551AD',
                                  path: 22,
                                },
                              ],
                            },
                            {
                              tag: 'g',
                              id: 'blush-left-3',
                              transform: 'translate(14 0) rotate(20)',
                              children: [
                                {
                                  tag: 'path',
                                  id: 'blush-left-3-shape',
                                  fill: '#5551AD',
                                  path: 22,
                                },
                              ],
                            },
                          ],
                        },
                        {
                          tag: 'g',
                          id: 'blush-right',
                          transform: 'translate(151 90)',
                          opacity: '0.38',
                          children: [
                            {
                              tag: 'g',
                              id: 'blush-right-1',
                              transform: 'translate(-14 0) rotate(20)',
                              children: [
                                {
                                  tag: 'path',
                                  id: 'blush-right-1-shape',
                                  fill: '#5551AD',
                                  path: 22,
                                },
                              ],
                            },
                            {
                              tag: 'g',
                              id: 'blush-right-2',
                              transform: 'translate(0 0) rotate(20)',
                              children: [
                                {
                                  tag: 'path',
                                  id: 'blush-right-2-shape',
                                  fill: '#5551AD',
                                  path: 22,
                                },
                              ],
                            },
                            {
                              tag: 'g',
                              id: 'blush-right-3',
                              transform: 'translate(14 0) rotate(20)',
                              children: [
                                {
                                  tag: 'path',
                                  id: 'blush-right-3-shape',
                                  fill: '#5551AD',
                                  path: 22,
                                },
                              ],
                            },
                          ],
                        },
                      ],
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
    {
      tag: 'g',
      id: 'effects',
      children: [],
    },
  ],
  surprised: [
    {
      tag: 'g',
      id: 'character',
      transform: 'translate(512 530)',
      children: [
        {
          tag: 'g',
          id: 'character-motion',
          children: [
            {
              tag: 'g',
              id: 'character-pose',
              transform: 'translate(0 -23) rotate(-3) scale(0.96 1.05)',
              children: [
                {
                  tag: 'g',
                  id: 'body',
                  children: [
                    {
                      tag: 'path',
                      id: 'body-shape',
                      fill: '#5551AD',
                      path: 0,
                    },
                  ],
                },
                {
                  tag: 'g',
                  id: 'ear-left',
                  transform: 'translate(-108.5 -284.9)',
                  children: [
                    {
                      tag: 'g',
                      id: 'ear-left-motion',
                      children: [
                        {
                          tag: 'g',
                          id: 'ear-left-pose',
                          transform: 'rotate(22)',
                          children: [
                            {
                              tag: 'path',
                              id: 'ear-left-shape',
                              fill: '#5551AD',
                              path: 1,
                            },
                          ],
                        },
                      ],
                    },
                  ],
                },
                {
                  tag: 'g',
                  id: 'ear-right',
                  transform: 'translate(167.3 -248.5)',
                  children: [
                    {
                      tag: 'g',
                      id: 'ear-right-motion',
                      children: [
                        {
                          tag: 'g',
                          id: 'ear-right-pose',
                          transform: 'rotate(-21)',
                          children: [
                            {
                              tag: 'path',
                              id: 'ear-right-shape',
                              fill: '#5551AD',
                              path: 2,
                            },
                          ],
                        },
                      ],
                    },
                  ],
                },
                {
                  tag: 'g',
                  id: 'face',
                  transform: 'translate(-11.2 -74.2)',
                  children: [
                    {
                      tag: 'path',
                      id: 'face-surface',
                      fill: '#FEE383',
                      path: 3,
                    },
                    {
                      tag: 'g',
                      id: 'eyes',
                      children: [
                        {
                          tag: 'g',
                          id: 'eye-left',
                          transform: 'translate(-95.9 5.6) rotate(12)',
                          children: [
                            {
                              tag: 'g',
                              id: 'eye-left-motion',
                              children: [
                                {
                                  tag: 'g',
                                  id: 'eye-left-expression',
                                  children: [
                                    {
                                      tag: 'path',
                                      id: 'eye-left-shape',
                                      fill: '#5551AD',
                                      path: 23,
                                    },
                                  ],
                                },
                              ],
                            },
                          ],
                        },
                        {
                          tag: 'g',
                          id: 'eye-right',
                          transform: 'translate(111.3 37.8) rotate(12)',
                          children: [
                            {
                              tag: 'g',
                              id: 'eye-right-motion',
                              children: [
                                {
                                  tag: 'g',
                                  id: 'eye-right-expression',
                                  children: [
                                    {
                                      tag: 'path',
                                      id: 'eye-right-shape',
                                      fill: '#5551AD',
                                      path: 23,
                                    },
                                  ],
                                },
                              ],
                            },
                          ],
                        },
                      ],
                    },
                    {
                      tag: 'g',
                      id: 'face-effects',
                      children: [],
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
    {
      tag: 'g',
      id: 'effects',
      children: [
        {
          tag: 'g',
          id: 'surprise-ray-left',
          transform: 'translate(472 120) rotate(-17)',
          children: [
            {
              tag: 'path',
              id: 'surprise-ray-left-shape',
              fill: '#5551AD',
              path: 24,
            },
          ],
        },
        {
          tag: 'g',
          id: 'surprise-ray-middle',
          transform: 'translate(525 100)',
          children: [
            {
              tag: 'path',
              id: 'surprise-ray-middle-shape',
              fill: '#5551AD',
              path: 25,
            },
          ],
        },
        {
          tag: 'g',
          id: 'surprise-ray-right',
          transform: 'translate(578 123) rotate(20)',
          children: [
            {
              tag: 'path',
              id: 'surprise-ray-right-shape',
              fill: '#5551AD',
              path: 26,
            },
          ],
        },
      ],
    },
  ],
  grumpy: [
    {
      tag: 'g',
      id: 'character',
      transform: 'translate(512 530)',
      children: [
        {
          tag: 'g',
          id: 'character-motion',
          children: [
            {
              tag: 'g',
              id: 'character-pose',
              transform: 'translate(0 17) rotate(2) scale(1.05 0.94)',
              children: [
                {
                  tag: 'g',
                  id: 'body',
                  children: [
                    {
                      tag: 'path',
                      id: 'body-shape',
                      fill: '#5551AD',
                      path: 0,
                    },
                  ],
                },
                {
                  tag: 'g',
                  id: 'ear-left',
                  transform: 'translate(-108.5 -284.9)',
                  children: [
                    {
                      tag: 'g',
                      id: 'ear-left-motion',
                      children: [
                        {
                          tag: 'g',
                          id: 'ear-left-pose',
                          transform: 'rotate(10)',
                          children: [
                            {
                              tag: 'path',
                              id: 'ear-left-shape',
                              fill: '#5551AD',
                              path: 1,
                            },
                          ],
                        },
                      ],
                    },
                  ],
                },
                {
                  tag: 'g',
                  id: 'ear-right',
                  transform: 'translate(167.3 -248.5)',
                  children: [
                    {
                      tag: 'g',
                      id: 'ear-right-motion',
                      children: [
                        {
                          tag: 'g',
                          id: 'ear-right-pose',
                          transform: 'rotate(-10)',
                          children: [
                            {
                              tag: 'path',
                              id: 'ear-right-shape',
                              fill: '#5551AD',
                              path: 2,
                            },
                          ],
                        },
                      ],
                    },
                  ],
                },
                {
                  tag: 'g',
                  id: 'face',
                  transform: 'translate(-11.2 -74.2)',
                  children: [
                    {
                      tag: 'path',
                      id: 'face-surface',
                      fill: '#FEE383',
                      path: 3,
                    },
                    {
                      tag: 'g',
                      id: 'eyes',
                      children: [
                        {
                          tag: 'g',
                          id: 'eye-left',
                          transform: 'translate(-95.9 5.6) rotate(12)',
                          children: [
                            {
                              tag: 'g',
                              id: 'eye-left-motion',
                              children: [
                                {
                                  tag: 'g',
                                  id: 'eye-left-expression',
                                  children: [
                                    {
                                      tag: 'path',
                                      id: 'eye-left-shape',
                                      fill: '#5551AD',
                                      path: 27,
                                    },
                                  ],
                                },
                              ],
                            },
                          ],
                        },
                        {
                          tag: 'g',
                          id: 'eye-right',
                          transform: 'translate(111.3 37.8) rotate(12)',
                          children: [
                            {
                              tag: 'g',
                              id: 'eye-right-motion',
                              children: [
                                {
                                  tag: 'g',
                                  id: 'eye-right-expression',
                                  transform: 'scale(-1 1)',
                                  children: [
                                    {
                                      tag: 'path',
                                      id: 'eye-right-shape',
                                      fill: '#5551AD',
                                      path: 27,
                                    },
                                  ],
                                },
                              ],
                            },
                          ],
                        },
                      ],
                    },
                    {
                      tag: 'g',
                      id: 'face-effects',
                      children: [],
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
    {
      tag: 'g',
      id: 'effects',
      children: [
        {
          tag: 'g',
          id: 'puff-large',
          transform: 'translate(816 253) rotate(9)',
          children: [
            {
              tag: 'path',
              id: 'puff-large-shape',
              fill: '#5551AD',
              path: 28,
            },
          ],
        },
        {
          tag: 'g',
          id: 'puff-small',
          transform: 'translate(783 301)',
          children: [
            {
              tag: 'path',
              id: 'puff-small-shape',
              fill: '#5551AD',
              path: 8,
            },
          ],
        },
      ],
    },
  ],
  sleepy: [
    {
      tag: 'g',
      id: 'character',
      transform: 'translate(512 530)',
      children: [
        {
          tag: 'g',
          id: 'character-motion',
          children: [
            {
              tag: 'g',
              id: 'character-pose',
              transform: 'translate(0 35) rotate(-10) scale(1.07 0.87)',
              children: [
                {
                  tag: 'g',
                  id: 'body',
                  children: [
                    {
                      tag: 'path',
                      id: 'body-shape',
                      fill: '#5551AD',
                      path: 0,
                    },
                  ],
                },
                {
                  tag: 'g',
                  id: 'ear-left',
                  transform: 'translate(-108.5 -284.9)',
                  children: [
                    {
                      tag: 'g',
                      id: 'ear-left-motion',
                      children: [
                        {
                          tag: 'g',
                          id: 'ear-left-pose',
                          transform: 'rotate(-13)',
                          children: [
                            {
                              tag: 'path',
                              id: 'ear-left-shape',
                              fill: '#5551AD',
                              path: 1,
                            },
                          ],
                        },
                      ],
                    },
                  ],
                },
                {
                  tag: 'g',
                  id: 'ear-right',
                  transform: 'translate(167.3 -248.5)',
                  children: [
                    {
                      tag: 'g',
                      id: 'ear-right-motion',
                      children: [
                        {
                          tag: 'g',
                          id: 'ear-right-pose',
                          transform: 'rotate(12)',
                          children: [
                            {
                              tag: 'path',
                              id: 'ear-right-shape',
                              fill: '#5551AD',
                              path: 2,
                            },
                          ],
                        },
                      ],
                    },
                  ],
                },
                {
                  tag: 'g',
                  id: 'face',
                  transform: 'translate(-11.2 -74.2)',
                  children: [
                    {
                      tag: 'path',
                      id: 'face-surface',
                      fill: '#FEE383',
                      path: 3,
                    },
                    {
                      tag: 'g',
                      id: 'eyes',
                      children: [
                        {
                          tag: 'g',
                          id: 'eye-left',
                          transform: 'translate(-95.9 5.6) rotate(12)',
                          children: [
                            {
                              tag: 'g',
                              id: 'eye-left-motion',
                              children: [
                                {
                                  tag: 'g',
                                  id: 'eye-left-expression',
                                  children: [
                                    {
                                      tag: 'path',
                                      id: 'eye-left-shape',
                                      fill: '#5551AD',
                                      path: 29,
                                    },
                                  ],
                                },
                              ],
                            },
                          ],
                        },
                        {
                          tag: 'g',
                          id: 'eye-right',
                          transform: 'translate(111.3 37.8) rotate(12)',
                          children: [
                            {
                              tag: 'g',
                              id: 'eye-right-motion',
                              children: [
                                {
                                  tag: 'g',
                                  id: 'eye-right-expression',
                                  children: [
                                    {
                                      tag: 'path',
                                      id: 'eye-right-shape',
                                      fill: '#5551AD',
                                      path: 29,
                                    },
                                  ],
                                },
                              ],
                            },
                          ],
                        },
                      ],
                    },
                    {
                      tag: 'g',
                      id: 'face-effects',
                      children: [],
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
    {
      tag: 'g',
      id: 'effects',
      children: [
        {
          tag: 'g',
          id: 'sleep-z-small',
          transform: 'translate(780 317) rotate(-7) scale(0.75)',
          children: [
            {
              tag: 'path',
              id: 'sleep-z-small-shape',
              fill: '#5551AD',
              path: 30,
            },
          ],
        },
        {
          tag: 'g',
          id: 'sleep-z-middle',
          transform: 'translate(838 258) rotate(5)',
          children: [
            {
              tag: 'path',
              id: 'sleep-z-middle-shape',
              fill: '#5551AD',
              path: 30,
            },
          ],
        },
        {
          tag: 'g',
          id: 'sleep-z-large',
          transform: 'translate(902 184) rotate(-7) scale(1.25)',
          children: [
            {
              tag: 'path',
              id: 'sleep-z-large-shape',
              fill: '#5551AD',
              path: 30,
            },
          ],
        },
      ],
    },
  ],
  wink: [
    {
      tag: 'g',
      id: 'character',
      transform: 'translate(512 530)',
      children: [
        {
          tag: 'g',
          id: 'character-motion',
          children: [
            {
              tag: 'g',
              id: 'character-pose',
              transform: 'translate(0 -5) rotate(-7)',
              children: [
                {
                  tag: 'g',
                  id: 'body',
                  children: [
                    {
                      tag: 'path',
                      id: 'body-shape',
                      fill: '#5551AD',
                      path: 0,
                    },
                  ],
                },
                {
                  tag: 'g',
                  id: 'ear-left',
                  transform: 'translate(-108.5 -284.9)',
                  children: [
                    {
                      tag: 'g',
                      id: 'ear-left-motion',
                      children: [
                        {
                          tag: 'g',
                          id: 'ear-left-pose',
                          transform: 'rotate(13)',
                          children: [
                            {
                              tag: 'path',
                              id: 'ear-left-shape',
                              fill: '#5551AD',
                              path: 1,
                            },
                          ],
                        },
                      ],
                    },
                  ],
                },
                {
                  tag: 'g',
                  id: 'ear-right',
                  transform: 'translate(167.3 -248.5)',
                  children: [
                    {
                      tag: 'g',
                      id: 'ear-right-motion',
                      children: [
                        {
                          tag: 'g',
                          id: 'ear-right-pose',
                          transform: 'rotate(-4)',
                          children: [
                            {
                              tag: 'path',
                              id: 'ear-right-shape',
                              fill: '#5551AD',
                              path: 2,
                            },
                          ],
                        },
                      ],
                    },
                  ],
                },
                {
                  tag: 'g',
                  id: 'face',
                  transform: 'translate(-11.2 -74.2)',
                  children: [
                    {
                      tag: 'path',
                      id: 'face-surface',
                      fill: '#FEE383',
                      path: 3,
                    },
                    {
                      tag: 'g',
                      id: 'eyes',
                      children: [
                        {
                          tag: 'g',
                          id: 'eye-left',
                          transform: 'translate(-95.9 5.6) rotate(12)',
                          children: [
                            {
                              tag: 'g',
                              id: 'eye-left-motion',
                              children: [
                                {
                                  tag: 'g',
                                  id: 'eye-left-expression',
                                  children: [
                                    {
                                      tag: 'path',
                                      id: 'eye-left-shape',
                                      fill: '#5551AD',
                                      path: 4,
                                    },
                                  ],
                                },
                              ],
                            },
                          ],
                        },
                        {
                          tag: 'g',
                          id: 'eye-right',
                          transform: 'translate(111.3 37.8) rotate(12)',
                          children: [
                            {
                              tag: 'g',
                              id: 'eye-right-motion',
                              children: [
                                {
                                  tag: 'g',
                                  id: 'eye-right-expression',
                                  children: [
                                    {
                                      tag: 'path',
                                      id: 'eye-right-shape',
                                      fill: '#5551AD',
                                      path: 5,
                                    },
                                  ],
                                },
                              ],
                            },
                          ],
                        },
                      ],
                    },
                    {
                      tag: 'g',
                      id: 'face-effects',
                      children: [],
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
    {
      tag: 'g',
      id: 'effects',
      children: [
        {
          tag: 'g',
          id: 'wink-spark',
          transform: 'translate(825 230) rotate(8)',
          children: [
            {
              tag: 'path',
              id: 'wink-spark-shape',
              fill: '#FEE383',
              path: 31,
            },
          ],
        },
      ],
    },
  ],
  curious: [
    {
      tag: 'g',
      id: 'character',
      transform: 'translate(512 530)',
      children: [
        {
          tag: 'g',
          id: 'character-motion',
          children: [
            {
              tag: 'g',
              id: 'character-pose',
              transform: 'translate(0 -5) rotate(12)',
              children: [
                {
                  tag: 'g',
                  id: 'body',
                  children: [
                    {
                      tag: 'path',
                      id: 'body-shape',
                      fill: '#5551AD',
                      path: 0,
                    },
                  ],
                },
                {
                  tag: 'g',
                  id: 'ear-left',
                  transform: 'translate(-108.5 -284.9)',
                  children: [
                    {
                      tag: 'g',
                      id: 'ear-left-motion',
                      children: [
                        {
                          tag: 'g',
                          id: 'ear-left-pose',
                          transform: 'rotate(19)',
                          children: [
                            {
                              tag: 'path',
                              id: 'ear-left-shape',
                              fill: '#5551AD',
                              path: 1,
                            },
                          ],
                        },
                      ],
                    },
                  ],
                },
                {
                  tag: 'g',
                  id: 'ear-right',
                  transform: 'translate(167.3 -248.5)',
                  children: [
                    {
                      tag: 'g',
                      id: 'ear-right-motion',
                      children: [
                        {
                          tag: 'g',
                          id: 'ear-right-pose',
                          transform: 'rotate(5)',
                          children: [
                            {
                              tag: 'path',
                              id: 'ear-right-shape',
                              fill: '#5551AD',
                              path: 2,
                            },
                          ],
                        },
                      ],
                    },
                  ],
                },
                {
                  tag: 'g',
                  id: 'face',
                  transform: 'translate(-11.2 -74.2)',
                  children: [
                    {
                      tag: 'path',
                      id: 'face-surface',
                      fill: '#FEE383',
                      path: 3,
                    },
                    {
                      tag: 'g',
                      id: 'eyes',
                      children: [
                        {
                          tag: 'g',
                          id: 'eye-left',
                          transform: 'translate(-95.9 5.6) rotate(12)',
                          children: [
                            {
                              tag: 'g',
                              id: 'eye-left-motion',
                              children: [
                                {
                                  tag: 'g',
                                  id: 'eye-left-expression',
                                  children: [
                                    {
                                      tag: 'path',
                                      id: 'eye-left-shape',
                                      fill: '#5551AD',
                                      path: 32,
                                    },
                                  ],
                                },
                              ],
                            },
                          ],
                        },
                        {
                          tag: 'g',
                          id: 'eye-right',
                          transform: 'translate(111.3 37.8) rotate(12)',
                          children: [
                            {
                              tag: 'g',
                              id: 'eye-right-motion',
                              children: [
                                {
                                  tag: 'g',
                                  id: 'eye-right-expression',
                                  children: [
                                    {
                                      tag: 'path',
                                      id: 'eye-right-shape',
                                      fill: '#5551AD',
                                      path: 33,
                                    },
                                  ],
                                },
                              ],
                            },
                          ],
                        },
                      ],
                    },
                    {
                      tag: 'g',
                      id: 'face-effects',
                      children: [],
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
    {
      tag: 'g',
      id: 'effects',
      children: [
        {
          tag: 'g',
          id: 'question-mark',
          transform: 'translate(802 173)',
          children: [
            {
              tag: 'g',
              id: 'question-hook',
              transform: 'translate(0 -10) rotate(14)',
              children: [
                {
                  tag: 'path',
                  id: 'question-hook-shape',
                  fill: '#5551AD',
                  path: 34,
                },
              ],
            },
            {
              tag: 'g',
              id: 'question-dot',
              transform: 'translate(-4 38)',
              children: [
                {
                  tag: 'path',
                  id: 'question-dot-shape',
                  fill: '#5551AD',
                  path: 35,
                },
              ],
            },
          ],
        },
      ],
    },
  ],
};
