export interface Product {
    id: string;
    name: string;
    price: number;
    originalPrice?: number;
    image: string;
    images: string[];
    category: string;
    brand: string;
    rating: number;
    reviewCount: number;
    inStock: boolean;
    discount?: number;
    tags: string[];
    description: string;
}

export interface Category {
    id: string;
    name: string;
    slug: string;
    productCount: number;
}

export interface FilterOptions {
    categories: Category[];
    brands: string[];
    priceRange: {
        min: number;
        max: number;
    };
    ratings: number[];
}

export type FilterState = {
    categories?: string[];
    brands?: string[];
    priceRange?: { min: number; max: number };
    rating?: number[];
};
