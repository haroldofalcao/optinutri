import Calculator from "@/components/Calculator";
import { Toaster } from "@/components/ui/sonner";

export default function Home() {
    return (
        <main className="min-h-screen p-8 bg-background">
            <div className="max-w-7xl mx-auto space-y-8">
                <header className="flex items-center justify-between pb-6 border-b">
                    <div>
                        <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl">
                            OptiNutri
                        </h1>
                        <p className="mt-2 text-muted-foreground">
                            Sistema de Otimização de Nutrição Parenteral
                        </p>
                    </div>
                </header>

                <Calculator />
            </div>
            <Toaster />
        </main>
    );
}
