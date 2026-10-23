export interface ProductItem {
  id: string;
  title: string;
  category: string;
  startingPrice: number;
  formattedPrice: string;
  image: string;
  description?: string;
  slug: string;
}

