import React, { useState } from 'react';
import { FilterOptions } from '@/app/types/product';
import { Button } from '@/app/components/ui/Button';
import { Input } from '@/app/components/ui/Input';

interface ProductFiltersProps {
    filters: FilterOptions;
    onFilterChange: (filters: any) => void;
    activeFilters: any;
}

export const ProductFilters: React.FC<ProductFiltersProps> = ({
                                                                  filters,
                                                                  onFilterChange,
                                                                  activeFilters
                                                              }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [priceRange, setPriceRange] = useState({
        min: activeFilters.priceRange?.min || filters.priceRange.min,
        max: activeFilters.priceRange?.max || filters.priceRange.max
    });

    const handleCategoryChange = (categoryId: string) => {
        const newCategories = activeFilters.categories?.includes(categoryId)
            ? activeFilters.categories.filter((id: string) => id !== categoryId)
            : [...(activeFilters.categories || []), categoryId];

        onFilterChange({ ...activeFilters, categories: newCategories });
    };

    const handleBrandChange = (brand: string) => {
        const newBrands = activeFilters.brands?.includes(brand)
            ? activeFilters.brands.filter((b: string) => b !== brand)
            : [...(activeFilters.brands || []), brand];

        onFilterChange({ ...activeFilters, brands: newBrands });
    };

    const handlePriceRangeChange = () => {
        onFilterChange({ ...activeFilters, priceRange });
    };

    const clearAllFilters = () => {
        onFilterChange({});
        setPriceRange({ min: filters.priceRange.min, max: filters.priceRange.max });
    };

    return (
        <div className="w-full">
            {/* Mobile Filter Toggle */}
            <div className="lg:hidden mb-4">
                <Button
                    onClick={() => setIsOpen(!isOpen)}
                    variant="outline"
                    className="w-full"
                >
                    Filtreler {isOpen ? '▲' : '▼'}
                </Button>
            </div>

            {/* Filter Panel */}
            <div className={`${isOpen ? 'block' : 'hidden'} lg:block bg-white rounded-lg shadow-sm border border-gray-200 p-6`}>
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-gray-900">Filtreler</h3>
                    <Button
                        onClick={clearAllFilters}
                        variant="ghost"
                        size="sm"
                    >
                        Temizle
                    </Button>
                </div>

                {/* Categories */}
                <div className="mb-6">
                    <h4 className="font-medium text-gray-900 mb-3">Kategoriler</h4>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                        {filters.categories.map((category) => (
                            <label key={category.id} className="flex items-center">
                                <input
                                    type="checkbox"
                                    checked={activeFilters.categories?.includes(category.id) || false}
                                    onChange={() => handleCategoryChange(category.id)}
                                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                />
                                <span className="ml-2 text-sm text-gray-700">
                  {category.name} ({category.productCount})
                </span>
                            </label>
                        ))}
                    </div>
                </div>

                {/* Brands */}
                <div className="mb-6">
                    <h4 className="font-medium text-gray-900 mb-3">Markalar</h4>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                        {filters.brands.map((brand) => (
                            <label key={brand} className="flex items-center">
                                <input
                                    type="checkbox"
                                    checked={activeFilters.brands?.includes(brand) || false}
                                    onChange={() => handleBrandChange(brand)}
                                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                />
                                <span className="ml-2 text-sm text-gray-700">{brand}</span>
                            </label>
                        ))}
                    </div>
                </div>

                {/* Price Range */}
                <div className="mb-6">
                    <h4 className="font-medium text-gray-900 mb-3">Fiyat Aralığı</h4>
                    <div className="space-y-3">
                        <div className="flex space-x-2">
                            <Input
                                type="number"
                                placeholder="Min"
                                value={priceRange.min}
                                onChange={(e) => setPriceRange({ ...priceRange, min: Number(e.target.value) })}
                                className="text-sm"
                            />
                            <Input
                                type="number"
                                placeholder="Max"
                                value={priceRange.max}
                                onChange={(e) => setPriceRange({ ...priceRange, max: Number(e.target.value) })}
                                className="text-sm"
                            />
                        </div>
                        <Button
                            onClick={handlePriceRangeChange}
                            variant="outline"
                            size="sm"
                            className="w-full"
                        >
                            Uygula
                        </Button>
                    </div>
                </div>

                {/* Rating */}
                <div className="mb-6">
                    <h4 className="font-medium text-gray-900 mb-3">Değerlendirme</h4>
                    <div className="space-y-2">
                        {[4, 3, 2, 1].map((rating) => (
                            <label key={rating} className="flex items-center">
                                <input
                                    type="checkbox"
                                    checked={activeFilters.rating?.includes(rating) || false}
                                    onChange={() => {
                                        const newRatings = activeFilters.rating?.includes(rating)
                                            ? activeFilters.rating.filter((r: number) => r !== rating)
                                            : [...(activeFilters.rating || []), rating];
                                        onFilterChange({ ...activeFilters, rating: newRatings });
                                    }}
                                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                />
                                <div className="ml-2 flex items-center">
                                    {[...Array(5)].map((_, i) => (
                                        <svg
                                            key={i}
                                            className={`w-4 h-4 ${
                                                i < rating ? 'text-yellow-400' : 'text-gray-300'
                                            }`}
                                            fill="currentColor"
                                            viewBox="0 0 20 20"
                                        >
                                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                        </svg>
                                    ))}
                                    <span className="ml-1 text-sm text-gray-600">ve üzeri</span>
                                </div>
                            </label>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};