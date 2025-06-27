'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Head from 'next/head';
import { Hero } from '../components/Hero';
import { ProductCard } from '../components/ProductCard';
import { ProductFilters } from '../components/ProductFilters';
import { Button }from '@/app/components/ui/Button';
import { Input } from '../components/ui/Input';
import { Product, FilterOptions } from '../types/product';

// Mock data - Gerçek projede API'den gelecek
const mockProducts: Product[] = [
    {
        id: '1',
        name: 'Premium Wireless Headphones',
        price: 299,
        originalPrice: 399,
        image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?ixlib=rb-4.0.3&w=500&q=80',
        images: [],
        category: 'electronics',
        brand: 'TechBrand',
        rating: 4.5,
        reviewCount: 128,
        inStock: true,
        tags: ['wireless', 'premium'],
        description: 'High-quality wireless headphones'
    },
    {
        id: '2',
        name: 'Smart Watch Series X',
        price: 599,
        originalPrice: 699,
        image: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?ixlib=rb-4.0.3&w=500&q=80',
        images: [],
        category: 'electronics',
        brand: 'SmartTech',
        rating: 4.8,
        reviewCount: 89,
        inStock: true,
        tags: ['smart', 'fitness'],
        description: 'Advanced smart watch with health tracking'
    },
    {
        id: '3',
        name: 'Designer Sunglasses',
        price: 149,
        image: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?ixlib=rb-4.0.3&w=500&q=80',
        images: [],
        category: 'fashion',
        brand: 'FashionCo',
        rating: 4.2,
        reviewCount: 45,
        inStock: true,
        tags: ['designer', 'summer'],
        description: 'Stylish designer sunglasses'
    },
    {
        id: '4',
        name: 'Leather Laptop Bag',
        price: 199,
        originalPrice: 249,
        image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?ixlib=rb-4.0.3&w=500&q=80',
        images: [],
        category: 'accessories',
        brand: 'LeatherCraft',
        rating: 4.6,
        reviewCount: 67,
        inStock: false,
        tags: ['leather', 'business'],
        description: 'Premium leather laptop bag'
    },
    {
        id: '5',
        name: 'Running Shoes Pro',
        price: 129,
        image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?ixlib=rb-4.0.3&w=500&q=80',
        images: [],
        category: 'sports',
        brand: 'SportsBrand',
        rating: 4.4,
        reviewCount: 156,
        inStock: true,
        tags: ['running', 'comfortable'],
        description: 'Professional running shoes'
    },
    {
        id: '6',
        name: 'Organic Cotton T-Shirt',
        price: 29,
        originalPrice: 39,
        image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?ixlib=rb-4.0.3&w=500&q=80',
        images: [],
        category: 'fashion',
        brand: 'EcoWear',
        rating: 4.3,
        reviewCount: 234,
        inStock: true,
        tags: ['organic', 'sustainable'],
        description: 'Sustainable organic cotton t-shirt'
    }
];

const mockFilters: FilterOptions = {
    categories: [
        { id: 'electronics', name: 'Elektronik', slug: 'electronics', productCount: 2 },
        { id: 'fashion', name: 'Moda', slug: 'fashion', productCount: 2 },
        { id: 'accessories', name: 'Aksesuar', slug: 'accessories', productCount: 1 },
        { id: 'sports', name: 'Spor', slug: 'sports', productCount: 1 }
    ],
    brands: ['TechBrand', 'SmartTech', 'FashionCo', 'LeatherCraft', 'SportsBrand', 'EcoWear'],
    priceRange: { min: 0, max: 1000 },
    ratings: [1, 2, 3, 4, 5]
};

const sortOptions = [
    { value: 'default', label: 'Varsayılan' },
    { value: 'price-low', label: 'Fiyat: Düşük → Yüksek' },
    { value: 'price-high', label: 'Fiyat: Yüksek → Düşük' },
    { value: 'rating', label: 'En Yüksek Puan' },
    { value: 'newest', label: 'En Yeni' }
];

export default function HomePage() {
    const [products] = useState<Product[]>(mockProducts);
    const [filters, setFilters] = useState<Record<string, any>>({});
    const [searchQuery, setSearchQuery] = useState('');
    const [sortBy, setSortBy] = useState('default');
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const productsPerPage = 6;

    useEffect(() => {
        console.log('Effect triggered');
    }, []);

    // Filter and sort products
    const filteredProducts = useMemo(() => {
        const filtered = products.filter(product => {
            // Search filter
            if (searchQuery && !product.name.toLowerCase().includes(searchQuery.toLowerCase())) {
                return false;
            }

            // Category filter
            if (filters.categories?.length && !filters.categories.includes(product.category)) {
                return false;
            }

            // Brand filter
            if (filters.brands?.length && !filters.brands.includes(product.brand)) {
                return false;
            }

            // Price range filter
            if (filters.priceRange) {
                const { min, max } = filters.priceRange;
                if (product.price < min || product.price > max) {
                    return false;
                }
            }

            // Rating filter
            if (filters.rating?.length) {
                const minRating = Math.min(...filters.rating);
                if (product.rating < minRating) {
                    return false;
                }
            }

            return true;
        });

        // Sort products
        switch (sortBy) {
            case 'price-low':
                filtered.sort((a, b) => a.price - b.price);
                break;
            case 'price-high':
                filtered.sort((a, b) => b.price - a.price);
                break;
            case 'rating':
                filtered.sort((a, b) => b.rating - a.rating);
                break;
            case 'newest':
                // Assume products are already in newest order
                break;
            default:
                break;
        }

        return filtered;
    }, [products, filters, searchQuery, sortBy]);

    // Pagination
    const totalPages = Math.ceil(filteredProducts.length / productsPerPage);
    const paginatedProducts = filteredProducts.slice(
        (currentPage - 1) * productsPerPage,
        currentPage * productsPerPage
    );

    const handleAddToCart = (productId: string) => {
        console.log('Adding to cart:', productId);
        // Implement cart logic
    };

    const handleQuickView = (product: Product) => {
        setSelectedProduct(product);
    };

    return (
        <>
            <Head>
                <title>E-Ticaret Sitesi - Ana Sayfa</title>
                <meta name="description" content="En kaliteli ürünleri en uygun fiyatlarla bulun" />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <link rel="icon" href="/favicon.ico" />
            </Head>

            <div className="min-h-screen bg-gray-50">
                {/* Hero Section */}
                <Hero />

                {/* Main Content */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    {/* Search and Sort Bar */}
                    <div className="mb-8">
                        <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
                            <div className="flex-1 max-w-md">
                                <Input
                                    type="text"
                                    placeholder="Ürün ara..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full"
                                />
                            </div>
                            <div className="flex items-center gap-4">
                                <select
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value)}
                                    className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    {sortOptions.map(option => (
                                        <option key={option.value} value={option.value}>
                                            {option.label}
                                        </option>
                                    ))}
                                </select>
                                <span className="text-sm text-gray-600">
                  {filteredProducts.length} ürün bulundu
                </span>
                            </div>
                        </div>
                    </div>

                    {/* Products Grid with Filters */}
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                        {/* Filters Sidebar */}
                        <div className="lg:col-span-1">
                            <ProductFilters
                                filters={mockFilters}
                                activeFilters={filters}
                                onFilterChange={setFilters}
                            />
                        </div>

                        {/* Products Grid */}
                        <div className="lg:col-span-3">
                            {paginatedProducts.length > 0 ? (
                                <>
                                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
                                        {paginatedProducts.map((product) => (
                                            <ProductCard
                                                key={product.id}
                                                product={product}
                                                onAddToCart={handleAddToCart}
                                                onQuickView={handleQuickView}
                                            />
                                        ))}
                                    </div>

                                    {/* Pagination */}
                                    {totalPages > 1 && (
                                        <div className="flex items-center justify-center space-x-2">
                                            <Button
                                                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                                                disabled={currentPage === 1}
                                                variant="outline"
                                                size="sm"
                                            >
                                                Önceki
                                            </Button>

                                            {[...Array(totalPages)].map((_, i) => {
                                                const page = i + 1;
                                                return (
                                                    <Button
                                                        key={page}
                                                        onClick={() => setCurrentPage(page)}
                                                        variant={currentPage === page ? 'primary' : 'outline'}
                                                        size="sm"
                                                        className="min-w-[40px]"
                                                    >
                                                        {page}
                                                    </Button>
                                                );
                                            })}

                                            <Button
                                                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                                                disabled={currentPage === totalPages}
                                                variant="outline"
                                                size="sm"
                                            >
                                                Sonraki
                                            </Button>
                                        </div>
                                    )}
                                </>
                            ) : (
                                <div className="text-center py-12">
                                    <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                                        <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                        </svg>
                                    </div>
                                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Ürün bulunamadı</h3>
                                    <p className="text-gray-600 mb-4">Arama kriterlerinize uygun ürün bulunamadı.</p>
                                    <Button onClick={() => {
                                        setFilters({});
                                        setSearchQuery('');
                                        setCurrentPage(1);
                                    }}>
                                        Filtreleri Temizle
                                    </Button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Featured Categories */}
                    <div className="mt-16">
                        <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Popüler Kategoriler</h2>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                            {mockFilters.categories.map((category) => (
                                <div
                                    key={category.id}
                                    className="group cursor-pointer bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden border border-gray-100"
                                    onClick={() => setFilters({ ...filters, categories: [category.id] })}
                                >
                                    <div className="aspect-square relative bg-gradient-to-br from-blue-50 to-purple-50">
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                                                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                                </svg>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="p-4 text-center">
                                        <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                                            {category.name}
                                        </h3>
                                        <p className="text-sm text-gray-600 mt-1">
                                            {category.productCount} ürün
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Newsletter Section */}
                    <div className="mt-16 bg-gradient-to-r from-blue-600 to-purple-700 rounded-2xl p-8 text-center">
                        <h2 className="text-3xl font-bold text-white mb-4">
                            Özel Fırsatları Kaçırma!
                        </h2>
                        <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
                            E-bültenimize abone ol, yeni ürünler ve kampanyalar hakkında ilk sen haberdar ol.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
                            <Input
                                type="email"
                                placeholder="E-posta adresiniz"
                                className="flex-1"
                            />
                            <Button className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold">
                                Abone Ol
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Quick View Modal */}
                {selectedProduct && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                        <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                            <div className="p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-xl font-bold text-gray-900">Ürün Detayı</h3>
                                    <button
                                        onClick={() => setSelectedProduct(null)}
                                        className="text-gray-400 hover:text-gray-600 transition-colors"
                                    >
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="aspect-square relative">
                                        <img
                                            src={selectedProduct.image}
                                            alt={selectedProduct.name}
                                            className="w-full h-full object-cover rounded-lg"
                                        />
                                    </div>

                                    <div>
                                        <p className="text-sm text-gray-500 uppercase tracking-wide mb-2">
                                            {selectedProduct.brand}
                                        </p>
                                        <h4 className="text-xl font-bold text-gray-900 mb-4">
                                            {selectedProduct.name}
                                        </h4>

                                        <div className="flex items-center mb-4">
                                            <div className="flex items-center">
                                                {[...Array(5)].map((_, i) => (
                                                    <svg
                                                        key={i}
                                                        className={`w-5 h-5 ${
                                                            i < Math.floor(selectedProduct.rating) ? 'text-yellow-400' : 'text-gray-300'
                                                        }`}
                                                        fill="currentColor"
                                                        viewBox="0 0 20 20"
                                                    >
                                                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                                    </svg>
                                                ))}
                                            </div>
                                            <span className="ml-2 text-sm text-gray-600">
                        ({selectedProduct.reviewCount} değerlendirme)
                      </span>
                                        </div>

                                        <div className="flex items-center space-x-3 mb-4">
                      <span className="text-2xl font-bold text-gray-900">
                        ₺{selectedProduct.price.toLocaleString('tr-TR')}
                      </span>
                                            {selectedProduct.originalPrice && (
                                                <span className="text-lg text-gray-500 line-through">
                          ₺{selectedProduct.originalPrice.toLocaleString('tr-TR')}
                        </span>
                                            )}
                                        </div>

                                        <p className="text-gray-600 mb-6">
                                            {selectedProduct.description}
                                        </p>

                                        <div className="flex space-x-3">
                                            <Button
                                                onClick={() => handleAddToCart(selectedProduct.id)}
                                                disabled={!selectedProduct.inStock}
                                                className="flex-1"
                                            >
                                                {selectedProduct.inStock ? 'Sepete Ekle' : 'Tükendi'}
                                            </Button>
                                            <Button variant="outline">
                                                Favorilere Ekle
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Footer */}
                <footer className="bg-gray-900 text-white mt-16">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                            <div>
                                <h3 className="text-lg font-semibold mb-4">E-Ticaret</h3>
                                <p className="text-gray-400 mb-4">
                                    En kaliteli ürünleri en uygun fiyatlarla sunuyoruz.
                                </p>
                                <div className="flex space-x-4">
                                    <a href="#" className="text-gray-400 hover:text-white transition-colors">
                                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M20 10C20 4.477 15.523 0 10 0S0 4.477 0 10c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V10h2.54V7.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V10h2.773l-.443 2.89h-2.33v6.988C16.343 19.128 20 14.991 20 10z" clipRule="evenodd" />
                                        </svg>
                                    </a>
                                    <a href="#" className="text-gray-400 hover:text-white transition-colors">
                                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M10 0C4.477 0 0 4.484 0 10.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0110 4.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.942.359.31.678.921.678 1.856 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0020 10.017C20 4.484 15.522 0 10 0z" clipRule="evenodd" />
                                        </svg>
                                    </a>
                                </div>
                            </div>

                            <div>
                                <h4 className="font-semibold mb-4">Kategoriler</h4>
                                <ul className="space-y-2 text-gray-400">
                                    {mockFilters.categories.map((category) => (
                                        <li key={category.id}>
                                            <a href="#" className="hover:text-white transition-colors">
                                                {category.name}
                                            </a>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <div>
                                <h4 className="font-semibold mb-4">Müşteri Hizmetleri</h4>
                                <ul className="space-y-2 text-gray-400">
                                    <li><a href="#" className="hover:text-white transition-colors">İletişim</a></li>
                                    <li><a href="#" className="hover:text-white transition-colors">SSS</a></li>
                                    <li><a href="#" className="hover:text-white transition-colors">Kargo & İade</a></li>
                                    <li><a href="#" className="hover:text-white transition-colors">Boyut Rehberi</a></li>
                                </ul>
                            </div>

                            <div>
                                <h4 className="font-semibold mb-4">Yasal</h4>
                                <ul className="space-y-2 text-gray-400">
                                    <li><a href="#" className="hover:text-white transition-colors">Gizlilik Politikası</a></li>
                                    <li><a href="#" className="hover:text-white transition-colors">Kullanım Şartları</a></li>
                                    <li><a href="#" className="hover:text-white transition-colors">Çerez Politikası</a></li>
                                </ul>
                            </div>
                        </div>

                        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
                            <p>&copy; 2025 E-Ticaret Sitesi. Tüm hakları saklıdır.</p>
                        </div>
                    </div>
                </footer>
            </div>
        </>
    );
}