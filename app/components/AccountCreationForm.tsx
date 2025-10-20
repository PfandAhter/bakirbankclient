import React from 'react';

interface City {
    id: string;
    name: string;
}

interface District {
    id: string;
    name: string;
}

interface Branch {
    id: string;
    name: string;
    address: string;
}

interface NewAccount {
    name: string;
    iban: string;
    currency: string;
    description: string;
    city: string;
    district: string;
    branchId: string;
    balance: number;
}

interface AccountCreationFormProps {
    newAccount: NewAccount;
    setNewAccount: React.Dispatch<React.SetStateAction<NewAccount>>;
    cities: City[] | null;
    districts: District[] | null;
    branches: Branch[];
    onSubmit: (e: React.FormEvent) => Promise<void>;
    onCityChange: (city: string) => Promise<void>;
    onDistrictChange: (district: string) => Promise<void>;
}

const AccountCreationForm: React.FC<AccountCreationFormProps> = ({
    newAccount,
    setNewAccount,
    cities,
    districts,
    branches,
    onSubmit,
    onCityChange,
    onDistrictChange
}) => {
    return (
        <form onSubmit={onSubmit} className="mt-6 space-y-4">
            <div>
                <label className="block text-sm text-gray-400 mb-1">Hesap Adı</label>
                <input
                    type="text"
                    value={newAccount.name}
                    onChange={(e) => setNewAccount({...newAccount, name: e.target.value})}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white"
                    required={true}
                />
                {!newAccount.name && (
                    <p className="text-red-500 text-sm mt-1">Hesap adı zorunludur</p>
                )}
            </div>

            <div>
                <label className="block text-sm text-gray-400 mb-1">Açıklama</label>
                <input
                    type="text"
                    value={newAccount.description}
                    onChange={(e) => setNewAccount({
                        ...newAccount,
                        description: e.target.value
                    })}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white"
                />
            </div>

            <div>
                <label className="block text-sm text-gray-400 mb-1">Para Birimi</label>
                <select
                    value={newAccount.currency}
                    onChange={(e) => setNewAccount({
                        ...newAccount,
                        currency: e.target.value
                    })}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white"
                >
                    <option value="TRY">₺ Türk Lirası</option>
                    <option value="USD">$ Dolar</option>
                    <option value="EUR">€ Euro</option>
                    <option value="GOLD">🥇 Altın</option>
                </select>
            </div>

            <div>
                <label className="block text-sm text-gray-400 mb-1">Şehir</label>
                <select
                    value={newAccount.city}
                    onChange={(e) => {
                        const selectedCity = e.target.value;
                        setNewAccount({
                            ...newAccount,
                            city: selectedCity,
                            district: "",
                            branchId: ""
                        });
                        onCityChange(selectedCity);
                    }}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white"
                >
                    <option value="">Şehir seçiniz</option>
                    {cities?.map((city: City) => (
                        <option key={city.id} value={city.id}>
                            {city.name}
                        </option>
                    ))}
                </select>
            </div>

            {districts && districts.length > 0 && (
                <div>
                    <label className="block text-sm text-gray-400 mb-1">İlçe</label>
                    <select
                        value={newAccount.district}
                        onChange={(e) => {
                            const selectedDistrictId = e.target.value;
                            setNewAccount({
                                ...newAccount,
                                district: selectedDistrictId,
                                branchId: ""
                            });
                            onDistrictChange(selectedDistrictId);
                        }}
                        className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white"
                    >
                        <option value="">İlçe seçiniz</option>
                        {districts.map((district: District) => (
                            <option key={district.id} value={district.id}>
                                {district.name}
                            </option>
                        ))}
                    </select>
                </div>
            )}

            {branches.length > 0 && (
                <div>
                    <label className="block text-sm text-gray-400 mb-1">Şube</label>
                    <select
                        value={newAccount.branchId}
                        onChange={(e) =>
                            setNewAccount({
                                ...newAccount,
                                branchId: e.target.value
                            })
                        }
                        className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white"
                    >
                        <option value="">Şube seçiniz</option>
                        {branches.map((branch: Branch) => (
                            <option key={branch.id} value={branch.id}>
                                {branch.name} ({branch.address})
                            </option>
                        ))}
                    </select>

                    {!newAccount.branchId && (
                        <p className="text-red-500 text-sm mt-1">Şube seçilmelidir</p>
                    )}
                </div>
            )}

            <button
                type="submit"
                className="w-full bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg font-semibold"
            >
                Hesap Aç
            </button>
        </form>
    );
};

export default AccountCreationForm;
/*
{showAccountForm && (
                                <form
                                    onSubmit={handleCreateAccount}
                                    className="mt-6 space-y-4"
                                >
                                    <div>
                                        <label className="block text-sm text-gray-400 mb-1">Hesap Adı</label>
                                        <input
                                            type="text"
                                            value={newAccount.name}
                                            onChange={(e) => setNewAccount({...newAccount, name: e.target.value})}
                                            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white"
                                            required={true}
                                        />
                                        {!newAccount.name && (
                                            <p className="text-red-500 text-sm mt-1">Hesap adı zorunludur</p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm text-gray-400 mb-1">Açıklama</label>
                                        <input
                                            type="text"
                                            value={newAccount.description}
                                            onChange={(e) => setNewAccount({
                                                ...newAccount,
                                                description: e.target.value
                                            })}
                                            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm text-gray-400 mb-1">Para Birimi</label>
                                        <select
                                            value={newAccount.currency}
                                            onChange={(e) => setNewAccount({
                                                ...newAccount,
                                                currency: e.target.value
                                            })}
                                            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white"
                                        >
                                            <option value="TRY">₺ Türk Lirası</option>
                                            <option value="USD">$ Dolar</option>
                                            <option value="EUR">€ Euro</option>
                                            <option value="GOLD">🥇 Altın</option>
                                        </select>
                                    </div>

                                    <select
                                        value={newAccount.city}
                                        onChange={(e) => {
                                            const selectedCity = e.target.value;
                                            setNewAccount({
                                                ...newAccount,
                                                city: selectedCity,
                                                district: "",
                                                branchId: ""
                                            });
                                            // async işlemi ayrı fonksiyona taşıyoruz
                                            fetchDistricts(selectedCity);
                                        }}
                                        className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white"
                                    >
                                        <option value="">Şehir seçiniz</option>
                                        {cities?.map((city: City) => (
                                            <option key={city.id} value={city.id}>
                                                {city.name}
                                            </option>
                                        ))}
                                    </select>

{districts.length > 0 && (
    <div>
        <label className="block text-sm text-gray-400 mb-1">İlçe</label>
        <select
            value={newAccount.district}
            onChange={(e) => {
                const selectedDistrictId = e.target.value;
                setNewAccount({
                    ...newAccount,
                    district: selectedDistrictId,
                    branchId: ""
                });
                fetchBranches(selectedDistrictId); // seçilen ilçe için branch'ler getir
            }}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white"
        >
            <option value="">İlçe seçiniz</option>
            {districts?.map((district: District) => (
                <option key={district.id} value={district.id}>
                    {district.name}
                </option>
            ))}
        </select>
    </div>
)}

{branches.length > 0 && (
    <div>
        <label className="block text-sm text-gray-400 mb-1">Şube</label>
        <select
            value={newAccount.branchId}
            onChange={(e) =>
                setNewAccount({
                    ...newAccount,
                    branchId: e.target.value
                })
            }
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white"
        >
            <option value="">Şube seçiniz</option>
            {branches.map((branch: Branch) => (
                <option key={branch.id} value={branch.id}>
                    {branch.name} ({branch.address})
                </option>
            ))}
        </select>

        {!newAccount.branchId && (
            <p className="text-red-500 text-sm mt-1">Şube seçilmelidir</p>
        )}
    </div>
)}


<button
    type="submit"
    className="w-full bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg font-semibold"
>
    Hesap Aç
</button>
</form>
)}
 */