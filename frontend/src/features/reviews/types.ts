export type ReviewUser = {
  name: string;
  email: string;
};

export type Review = {
  _id: string;
  user: ReviewUser;
  product: string;
  rating: number;
  title?: string;
  comment?: string;
  isApproved?: boolean;
  createdAt: string;
};

export type ProductReviewsResponse = {
  reviews: Review[];
  page: number;
  pages: number;
  total: number;
};
