import keychainImg from '../assests/1cliq-keychain.jpg';
import mugImg from '../assests/1cliq-mug.jpg';
import capImg from '../assests/1cliq-cap.jpg';
import tshirtImg from '../assests/1cliq-tshirt.jpg';

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

export const PRODUCTS_COLLECTION: ProductItem[] = [
  {
    id: 'keychain',
    title: 'Customised Key Chain',
    category: 'ACCESSORIES',
    startingPrice: 99,
    formattedPrice: 'From ₹99',
    image: keychainImg,
    description: 'Durable acrylic key chains with double-sided HD print. Compact and scratch-resistant.',
    slug: 'customised-key-chain',
  },
  {
    id: 'mug',
    title: 'Mug Printing',
    category: 'DRINKWARE',
    startingPrice: 199,
    formattedPrice: 'From ₹199',
    image: mugImg,
    description: 'Glossy ceramic mugs with microwave-safe vivid sublimation print.',
    slug: 'mug-printing',
  },
  {
    id: 'cap',
    title: 'Cap Printing',
    category: 'APPAREL',
    startingPrice: 249,
    formattedPrice: 'From ₹249',
    image: capImg,
    description: 'Structured 6-panel cotton twill caps with high-density embroidered monogram or print.',
    slug: 'cap-printing',
  },
  {
    id: 'tshirt',
    title: 'T-Shirt Printing',
    category: 'APPAREL',
    startingPrice: 349,
    formattedPrice: 'From ₹349',
    image: tshirtImg,
    description: '100% combed cotton 220 GSM heavyweight tees with breathable DTG print.',
    slug: 't-shirt-printing',
  },
];
