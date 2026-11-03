import { posts } from '@post-content/catalog.generated';
import { series } from '../../../entities/series';
import { getHomeContent } from '../model/get-home-content';
import { HeroSection } from './hero-section';
import { HomeContent } from './home-content';

export function HomePage() {
  const content = getHomeContent(posts, series);
  return (
    <HeroSection>
      <HomeContent {...content} />
    </HeroSection>
  );
}
