import React from 'react';
import Image from 'next/image';
import { Product } from '../types/product';
import Button from '@/app/components/ui/Button';

interface ProductCardProps {
    product: Product;
    onAddToCart: (productId: string) => void;
    onQuickView: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
                                                            product,
                                                            onAddToCart,
                                                            onQuickView
                                                        }) => {
    const discountPercentage = product.originalPrice
        ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
        : 0;

    return (
        <div className="group relative bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden border border-gray-100">
            {/* Discount Badge */}
            {discountPercentage > 0 && (
                <div className="absolute top-3 left-3 z-10 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-semibold">
                    -%{discountPercentage}
                </div>
            )}

            {/* Quick View Button */}
            <button
                onClick={() => onQuickView(product)}
                className="absolute top-3 right-3 z-10 bg-white rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-gray-100"
            >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
            </button>

            {/* Product Image */}
            <div className="relative aspect-square overflow-hidden">
                <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
                {!product.inStock && (
                    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                        <span className="text-white font-semibold">Tükendi</span>
                    </div>
                )}
            </div>

            {/* Product Info */}
            <div className="p-4">
                <div className="mb-2">
                    <p className="text-xs text-gray-500 uppercase tracking-wide">{product.brand}</p>
                    <h3 className="font-semibold text-gray-900 line-clamp-2 hover:text-blue-600 transition-colors">
                        {product.name}
                    </h3>
                </div>

                {/* Rating */}
                <div className="flex items-center mb-2">
                    <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                            <svg
                                key={i}
                                className={`w-4 h-4 ${
                                    i < Math.floor(product.rating) ? 'text-yellow-400' : 'text-gray-300'
                                }`}
                                fill="currentColor"
                                viewBox="0 0 20 20"
                            >
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                        ))}
                    </div>
                    <span className="ml-1 text-sm text-gray-600">({product.reviewCount})</span>
                </div>

                {/* Price */}
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
            <span className="text-lg font-bold text-gray-900">
              ₺{product.price.toLocaleString('tr-TR')}
            </span>
                        {product.originalPrice && (
                            <span className="text-sm text-gray-500 line-through">
                ₺{product.originalPrice.toLocaleString('tr-TR')}
              </span>
                        )}
                    </div>
                </div>

                {/* Add to Cart Button */}
                <Button
                    onClick={() => onAddToCart(product.id)}
                    disabled={!product.inStock}
                    className="w-full"
                    variant={product.inStock ? 'primary' : 'outline'}
                >
                    {product.inStock ? 'Sepete Ekle' : 'Tükendi'}
                </Button>
            </div>
        </div>
    );
};