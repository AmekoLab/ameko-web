import { ProductService } from "@/src/services/product.service";
import { RelatedProducts } from "./RelatedProducts";

export async function RelatedProductsContainer({ slug }: { slug: string }) {
  const relatedProducts = await ProductService.getRelated(slug);

  if (relatedProducts.length === 0) return null;

  return <RelatedProducts products={relatedProducts} />;
}
