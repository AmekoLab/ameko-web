import { BrandNew } from "@/src/components/Home/BrandNew";

import { HeroBanner } from "@/src/components/Home/HeroBanner";
import { PromoList } from "@/src/components/Home/PromoList";
import { LatestNews } from "@/src/components/News/LatestNews";

export default function Home() {
  return (
    <div>
      <div>
        <HeroBanner />
        <BrandNew />
        <PromoList />
        <LatestNews />
      </div>
    </div>
  );
}
