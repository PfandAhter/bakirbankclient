import {RefreshCw} from "lucide-react";
import {useAuth} from "@/src/hooks/login/useAuth";

export const AuthChecker = ({ children }: { children: React.ReactNode }) => {
    const { isLoading } = useAuth();

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
                <div className="text-center">
                    <RefreshCw className="w-8 h-8 text-blue-400 animate-spin mx-auto mb-4" />
                    <p className="text-white">Yükleniyorasd...</p>
                </div>
            </div>
        );
    }

    return <>{children}</>;
};