import { ReviewsManager } from "@/components/admin/reviews-manager";
import { listReferenceData, listTestimonials } from "@/lib/services/admin-service";

export default async function AdminReviewsPage() {
  const [reviews, reference] = await Promise.all([listTestimonials(), listReferenceData()]);
  return (
    <ReviewsManager
      initialReviews={JSON.parse(JSON.stringify(reviews))}
      doctors={reference.doctors}
      treatments={reference.treatments}
    />
  );
}
