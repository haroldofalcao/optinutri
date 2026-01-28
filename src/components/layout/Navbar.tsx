'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Calculator, FlaskConical, BookOpen, Home, Menu } from "lucide-react";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/theme-provider"; // Assuming this exists or will be added
import { Button } from "@/components/ui/button";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";
import { useState } from "react";

const navigation = [
    { name: "Painel", href: "/", icon: Home },
    { name: "Calculadora", href: "/calculator", icon: Calculator },
    { name: "Fórmulas", href: "/formulas", icon: FlaskConical },
    { name: "Guia", href: "/guide", icon: BookOpen },
];

export function Navbar() {
    const pathname = usePathname();
    const [open, setOpen] = useState(false);

    return (
        <header className="sticky top-0 z-50 w-full glass border-b border-border/40">
            <div className="container flex h-16 items-center px-4 md:px-6 justify-between">
                {/* Logo Section */}
                <div className="flex items-center gap-2 font-bold text-xl mr-6">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/80 text-primary-foreground shadow-lg shadow-primary/25">
                        <FlaskConical className="h-5 w-5" />
                    </div>
                    <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent hidden md:inline-block">
                        OptiNutri
                    </span>
                </div>

                {/* Desktop Navigation */}
                <nav className="hidden md:flex items-center gap-1">
                    {navigation.map((item) => {
                        const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={cn(
                                    "flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-full transition-all duration-200",
                                    isActive
                                        ? "bg-primary/10 text-primary hover:bg-primary/15"
                                        : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
                                )}
                            >
                                <item.icon className={cn("h-4 w-4", isActive ? "stroke-[2.5px]" : "stroke-2")} />
                                <span>{item.name}</span>
                            </Link>
                        );
                    })}
                </nav>

                {/* Mobile Menu & Extras */}
                <div className="flex items-center gap-2">
                    <div className="hidden md:block">
                        <ThemeToggle />
                    </div>

                    <Sheet open={open} onOpenChange={setOpen}>
                        <SheetTrigger asChild>
                            <Button variant="ghost" size="icon" className="md:hidden">
                                <Menu className="h-5 w-5" />
                                <span className="sr-only">Menu</span>
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                            <SheetHeader>
                                <SheetTitle className="flex items-center gap-2">
                                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                                        <FlaskConical className="h-4 w-4" />
                                    </div>
                                    OptiNutri
                                </SheetTitle>
                            </SheetHeader>
                            <nav className="flex flex-col gap-4 mt-8">
                                {navigation.map((item) => {
                                    const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
                                    return (
                                        <Link
                                            key={item.name}
                                            href={item.href}
                                            onClick={() => setOpen(false)}
                                            className={cn(
                                                "flex items-center gap-4 px-4 py-3 text-sm font-medium rounded-lg transition-colors",
                                                isActive
                                                    ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                                                    : "hover:bg-muted"
                                            )}
                                        >
                                            <item.icon className="h-5 w-5" />
                                            {item.name}
                                        </Link>
                                    );
                                })}
                            </nav>
                        </SheetContent>
                    </Sheet>
                </div>
            </div>
        </header>
    );
}
