import type { PartProps } from '../_shared/react/index';

export const landmarkElements = {
  banner: 'header',
  complementary: 'aside',
  contentinfo: 'footer',
  form: 'form',
  main: 'main',
  navigation: 'nav',
  region: 'section',
  search: 'search',
} as const;
export type LandmarkKind = keyof typeof landmarkElements;
export type LandmarkElement<Kind extends LandmarkKind> = (typeof landmarkElements)[Kind];
export interface LandmarkOptions<Kind extends LandmarkKind = LandmarkKind> {
  kind: Kind;
  id?: string;
}

export function connectLandmark<Kind extends LandmarkKind>(options: LandmarkOptions<Kind> & { id: string }) {
  return {
    id: options.id,
    element: landmarkElements[options.kind],
    getRootProps(
      props: PartProps<LandmarkElement<Kind>> = {} as PartProps<LandmarkElement<Kind>>,
    ): PartProps<LandmarkElement<Kind>> {
      if (
        (options.kind === 'form' || options.kind === 'region') &&
        !props['aria-label']?.trim() &&
        !props['aria-labelledby']?.trim()
      )
        throw new Error(`${options.kind} landmarks need aria-label or aria-labelledby.`);
      // Native header/footer deliberately retain their context-dependent semantics.
      // Never force banner/contentinfo inside an article, section, aside, nav, or main.
      return Object.assign({}, props, {
        role: undefined,
        id: options.id,
        'data-scope': 'landmarks',
        'data-part': options.kind,
      });
    },
  };
}
export type LandmarkApi<Kind extends LandmarkKind = LandmarkKind> = ReturnType<typeof connectLandmark<Kind>>;
