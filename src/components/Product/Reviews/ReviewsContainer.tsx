import { ReviewService } from "@/src/services/review.service";
import { ReviewsSection } from "./ReviewsSection";
import { Loader2 } from "lucide-react";

export async function ReviewsContainer({ slug }: { slug: string }) {
  const [reviews, stats] = await Promise.all([
    ReviewService.getByProductSlug(slug),
    ReviewService.getStats(slug),
  ]);

  return <ReviewsSection initialReviews={reviews} stats={stats} />;
}
