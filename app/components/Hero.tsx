import React from 'react';
import Image from 'next/image';
import Button from '@/app/components/ui/Button';

export const Hero: React.FC = () => {
    return (
        <div className="relative bg-gradient-to-r from-blue-600 to-purple-700 overflow-hidden">
            <div className="absolute inset-0 bg-black opacity-20"></div>
            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                    <div className="text-white">
                        <h1 className="text-4xl lg:text-6xl font-bold mb-6 leading-tight">
                            Yeni Koleksiyonumuz
                            <span className="block text-yellow-400">Şimdi Burada!</span>
                        </h1>
                        <p className="text-xl mb-8 text-blue-100">
                            En kaliteli ürünleri en uygun fiyatlarla keşfedin. Ücretsiz kargo ve hızlı teslimat avantajıyla.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4">
                            <Button size="lg" className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold">
                                Alışverişe Başla
                            </Button>
                            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600">
                                Kampanyaları Gör
                            </Button>
                        </div>
                    </div>
                    <div className="relative">
                        <div className="aspect-square relative">
                            <Image
                                src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80"
                                alt="Hero Image"
                                fill
                                className="object-cover rounded-2xl shadow-2xl"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};