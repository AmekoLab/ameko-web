/** Assembled Product Detail - a component used in the assembly */
export interface AssembledProductDetail {
  baseKitId: string;
  componentId: string;
  quantity: number;
  soundUrl: string;
}

/** Payload for creating an assembled product */
export interface CreateAssembledProductPayload {
  name: string;
  view3DUrl: string;
  price: number;
  details: AssembledProductDetail[];
  image1: string;
  image2: string;
  image3: string;
  description: string;
  quantity: number;
  layout: string;
  mounting: string;
  pcb: string;
  connection: string;
  battery: string;
}

/** Payload for updating an assembled product */
export interface UpdateAssembledProductPayload extends CreateAssembledProductPayload {
  id: string;
}

/** Status mapping: 1 = Active, 0 = Inactive */
export type AssembledProductStatus = 0 | 1;

/** Detail item returned from API (includes component info) */
export interface AssembledProductDetailItem {
  id?: string;
  baseKitId: string;
  baseKitName?: string;
  componentId: string;
  componentName?: string;
  quantity: number;
  soundUrl: string;
}

/** Full assembled product item returned from API */
export interface AssembledProductItem {
  id: string;
  name: string;
  slug?: string;
  view3DUrl: string | null;
  price: number;
  details?: AssembledProductDetailItem[];
  image1: string | null;
  image2: string | null;
  image3: string | null;
  description: string | null;
  quantity: number | null;
  layout: string | null;
  mounting: string | null;
  pcb: string | null;
  connection: string | null;
  battery: string | null;
  isDeleted?: boolean;
  status?: AssembledProductStatus;
  shopId?: string;
  shopName?: string;
  logoUrl?: string;
  shopIsActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
  rating?: number;
  totalReviews?: number;
}

/** Paginated list response returned inside the API envelope `data` field */
export interface AssembledProductListData {
  items: AssembledProductItem[];
  totalCount: number;
  currentPage: number;
  pageSize: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}
