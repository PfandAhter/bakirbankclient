export const RetryModal = ({ onRetry }: { onRetry: () => void }) => (
    <div className="fixed inset-0 bg-transparent bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 max-w-sm w-full text-center">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-6">
                ATM Bilgisi Alma İşlemi Başarısız
            </h2>
            <button
                onClick={onRetry}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-all duration-200 shadow-md"
            >
                Yeniden Dene
            </button>
        </div>
    </div>
);