import { BecomeSellerSection } from "@/src/components/Home/BecomeSellerSection";
import { BrandNew } from "@/src/components/Home/BrandNew";
import { BuilderCTA } from "@/src/components/Home/BuilderCTA";
import { CategoryGrid } from "@/src/components/Home/CategoryGrid";
import { CommunityTrending } from "@/src/components/Home/CommunityTrending";

import { HeroBanner } from "@/src/components/Home/HeroBanner";
import { HeroVideoSection } from "@/src/components/Home/HeroVideoSection";
import { PromoGridSection } from "@/src/components/Home/PromoGridSection";
import { PromoList } from "@/src/components/Home/PromoList";
import { SplitPromoSection } from "@/src/components/Home/SplitPromoSection";
import { TopCreators } from "@/src/components/Home/TopCreators";
import { LatestNews } from "@/src/components/News/LatestNews";

export default function Home() {
  return (
    <main className="bg-amazon-bgSecondary min-h-screen w-full text-amazon-text overflow-x-hidden">
      <HeroVideoSection />
      {/* <CommunityTrending /> */}
      <SplitPromoSection />
      <BrandNew />
      <PromoGridSection />
      <BuilderCTA />
      <PromoList />
      {/* <CategoryGrid /> */}
      {/* <LatestNews /> */}
      <BecomeSellerSection />
      {/* <TopCreators /> */}
    </main>
  );
}
