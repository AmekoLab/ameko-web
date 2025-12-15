import { BrandNew } from "@/src/components/Home/BrandNew";
import { BuilderCTA } from "@/src/components/Home/BuilderCTA";
import { CategoryGrid } from "@/src/components/Home/CategoryGrid";
import { CommunityTrending } from "@/src/components/Home/CommunityTrending";

import { HeroBanner } from "@/src/components/Home/HeroBanner";
import { PromoList } from "@/src/components/Home/PromoList";
import { TopCreators } from "@/src/components/Home/TopCreators";
import { LatestNews } from "@/src/components/News/LatestNews";

export default function Home() {
  return (
    <div>
      <div>
        <HeroBanner />

        <CommunityTrending />
        <BuilderCTA />
        <BrandNew />
        <PromoList />
        <CategoryGrid />
        <LatestNews />
        <TopCreators />
      </div>
    </div>
  );
}
