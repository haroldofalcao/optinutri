'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Calculator, FlaskConical, BookOpen, Home } from "lucide-react";
import { cn } from "@/lib/utils";

const navigation = [
    { name: "Painel", href: "/", icon: Home },
    { name: "Calculadora", href: "/calculator", icon: Calculator },
    { name: "Fórmulas", href: "/formulas", icon: FlaskConical },
    { name: "Guia", href: "/guide", icon: BookOpen },
];

export function Navbar() {
    const pathname = usePathname();

    return (
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container flex h-16 items-center px-4 md:px-6">
                <div className="flex items-center gap-2 font-bold text-xl mr-6">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                        <FlaskConical className="h-5 w-5" />
                    </div>
                    <span className="text-primary hidden md:inline-block">OptiNutri</span>
                </div>

                <nav className="flex items-center gap-1 overflow-x-auto no-scrollbar">
                    {navigation.map((item) => {
                        const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={cn(
                                    "flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg transition-colors whitespace-nowrap",
                                    isActive
                                        ? "bg-primary text-primary-foreground"
                                        : "text-muted-foreground hover:bg-secondary hover:text-secondary-foreground"
                                )}
                            >
                                <item.icon className="h-4 w-4" />
                                <span className="hidden sm:inline-block">{item.name}</span>
                            </Link>
                        );
                    })}
                </nav>
            </div>
        </header>
    );
}
