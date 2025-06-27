import {Category} from "@/app/types/category";

export interface FilterOptions {
    categories: Category[];
    brands: string[];
    priceRange: {
        min: number;
        max: number;
    };
    ratings: number[];
}