import { BrandNew } from "@/src/components/Home/BrandNew";
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
        <BrandNew />
        <CommunityTrending />
        <PromoList />
        <LatestNews />
        <TopCreators />
      </div>
    </div>
  );
}
