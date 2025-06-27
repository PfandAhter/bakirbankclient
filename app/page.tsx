'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams} from 'next/navigation';
//import CategoryMenu from '@/components/CategoryMenu';

/*interface Category {
    id: string;
    name: string;
}*/

interface Product {
    id: string;
    title: string;
    price: number;
    imageUrl: string;
    rating?: number;
}

export default function HomePage() {
   // const [categories, setCategories] = useState<Category[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const searchParams = useSearchParams();
    //const router = useRouter();

    const selectedCategory = searchParams.get('category');

    /*useEffect(() => {
        fetch('/api/categories')
            .then(res => res.json())
            .then(setCategories);
    }, []);*/

    useEffect(() => {
        setLoading(true);
        const url = selectedCategory ? `/api/products?category=${selectedCategory}` : '/api/products';
        fetch(url)
            .then(res => res.json())
            .then(data => {
                setProducts(data);
                setLoading(false);
            });
    }, [selectedCategory]);

    /*const handleCategoryClick = (id: string) => {
        router.push(`/?category=${id}`);
    };*/

    return (
        <div className="min-h-screen bg-gray-100">
            {/* Header */}
            <header className="bg-white shadow px-4 py-4 flex justify-between items-center">
                <h1 className="text-2xl font-bold text-blue-700">BakirMarket</h1>
                <div className="space-x-4">
                    <Link href="/auth/login" className="text-blue-600 hover:underline">Giriş Yap</Link>
                    <Link href="/auth/register" className="text-blue-600 hover:underline">Kayıt Ol</Link>
                </div>
            </header>

            {/* Kategori Menüsü */}
            {/*<CategoryMenu />*/}

            {/* Ürünler */}
            <main className="p-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {loading ? (
                    <p className="col-span-full text-center text-gray-500">Yükleniyor...</p>
                ) : (
                    products.map(product => (
                        <div key={product.id} className="bg-white shadow rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
                            <img src={product.imageUrl} alt={product.title} className="w-full h-48 object-cover" />
                            <div className="p-4">
                                <h2 className="font-semibold text-lg mb-1 line-clamp-2 min-h-[48px]">{product.title}</h2>
                                <p className="text-blue-600 font-bold text-lg">{product.price.toFixed(2)} ₺</p>
                                {product.rating && (
                                    <div className="text-yellow-500 mt-1">
                                        {'★'.repeat(Math.floor(product.rating))}
                                        {'☆'.repeat(5 - Math.floor(product.rating))}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </main>
        </div>
    );
}
