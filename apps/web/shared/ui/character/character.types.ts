export type CharacterNode =
  | {
      tag: 'path';
      id: string;
      path: number;
      fill: string;
    }
  | {
      tag: 'g';
      id: string;
      transform?: string;
      opacity?: string;
      children: readonly CharacterNode[];
    };
