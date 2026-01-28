'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FlaskConical, Calculator, TrendingDown, Package, BookOpen, ArrowRight } from "lucide-react";
import { useAtom } from "jotai";
import { activeFormulasAtom } from "@/store/formulas";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useEffect } from "react";
import { trackPageView } from "@/lib/analytics";

export default function Dashboard() {
    const [formulas] = useAtom(activeFormulasAtom);

    useEffect(() => {
        trackPageView('dashboard', 'Dashboard');
    }, []);

    const stats = [
        {
            title: "Total de Fórmulas",
            value: formulas.length,
            icon: FlaskConical,
            description: "Disponíveis no banco",
            color: "text-primary",
            bg: "bg-primary/10",
        },
        {
            title: "Parenteral (Central)",
            value: formulas.filter((f) => f.via === "Central").length,
            icon: Package,
            description: "Nutrição Parenteral",
            color: "text-blue-500",
            bg: "bg-blue-500/10",
        },
        {
            title: "Parenteral (Periférica)",
            value: formulas.filter((f) => f.via === "Peripheral").length,
            icon: Package,
            description: "Nutrição Parenteral",
            color: "text-emerald-500",
            bg: "bg-emerald-500/10",
        },
        {
            title: "Nutrição Enteral",
            value: formulas.filter((f) => f.via === "Enteral").length,
            icon: Package,
            description: "Fórmulas Enterais",
            color: "text-orange-500",
            bg: "bg-orange-500/10",
        },
    ];

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Hero Section */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary via-primary/90 to-slate-900 border border-white/10 dark:border-white/5 shadow-2xl p-8 md:p-12 text-primary-foreground card-hover">
                <div className="relative z-10 max-w-3xl">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-medium mb-6 border border-white/20">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                        </span>
                        Sistema Operacional v1.2
                    </div>
                    <h1 className="text-4xl md:text-6xl font-black mb-6 tracking-tight bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">
                        Otimizador de Nutrição Parenteral
                    </h1>
                    <p className="text-lg md:text-xl text-primary-foreground/90 mb-8 leading-relaxed font-light">
                        Maximize a eficácia clínica e minimize custos com nossa tecnologia avançada de otimização de fórmulas.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4">
                        <Button
                            size="lg"
                            variant="secondary"
                            asChild
                            className="bg-white text-primary hover:bg-white/90 font-bold shadow-xl border-0 h-14 px-8 rounded-full"
                        >
                            <Link href="/calculator">
                                <Calculator className="mr-2 h-5 w-5" />
                                Iniciar Otimização
                            </Link>
                        </Button>
                        <Button
                            size="lg"
                            variant="outline"
                            asChild
                            className="bg-transparent border-white/30 text-white hover:bg-white/10 backdrop-blur-sm h-14 px-8 rounded-full"
                        >
                            <Link href="/formulas">
                                <FlaskConical className="mr-2 h-5 w-5" />
                                Gerenciar Fórmulas
                            </Link>
                        </Button>
                    </div>
                </div>

                {/* Decorative Elements */}
                <div className="absolute right-0 top-1/2 -translate-y-1/2 h-full opacity-5 hidden lg:block -mr-12 pointer-events-none">
                    <FlaskConical className="h-[500px] w-[500px] rotate-12" />
                </div>
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
            </div>

            {/* Stats Grid */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                {stats.map((stat) => (
                    <Card key={stat.title} className="card-hover border-border/50 bg-card/60 backdrop-blur-sm">
                        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                            <CardTitle className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                                {stat.title}
                            </CardTitle>
                            <div className={cn("p-2.5 rounded-xl", stat.bg)}>
                                <stat.icon className={cn("h-4 w-4", stat.color)} />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-black tracking-tight text-foreground">{stat.value}</div>
                            <p className="text-xs text-muted-foreground mt-1 font-medium">{stat.description}</p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Quick Actions & Features */}
            <div className="grid gap-6 md:grid-cols-3">
                {/* Quick Actions Col */}
                <div className="space-y-6 md:col-span-2">
                    <div className="grid gap-6 sm:grid-cols-2">
                        <Link href="/guide" className="block group h-full">
                            <div className="relative h-full overflow-hidden rounded-2xl border bg-card p-6 shadow-sm transition-all hover:shadow-lg hover:border-primary/20">
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="p-3 rounded-xl bg-orange-500/10 text-orange-500">
                                        <BookOpen className="h-6 w-6" />
                                    </div>
                                    <h3 className="font-bold text-lg">Guia Rápido</h3>
                                </div>
                                <p className="text-sm text-muted-foreground mb-4">
                                    Aprenda como utilizar todas as funcionalidades do otimizador em poucos minutos.
                                </p>
                                <span className="text-sm font-semibold text-primary flex items-center gap-1 group-hover:gap-2 transition-all">
                                    Ler Tutorial <ArrowRight className="h-4 w-4" />
                                </span>
                            </div>
                        </Link>

                        <Link href="/formulas" className="block group h-full">
                            <div className="relative h-full overflow-hidden rounded-2xl border bg-card p-6 shadow-sm transition-all hover:shadow-lg hover:border-blue-500/20">
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="p-3 rounded-xl bg-blue-500/10 text-blue-500">
                                        <FlaskConical className="h-6 w-6" />
                                    </div>
                                    <h3 className="font-bold text-lg">Catálogo</h3>
                                </div>
                                <p className="text-sm text-muted-foreground mb-4">
                                    Adicione novas fórmulas, edite preços ou importe dados via Excel.
                                </p>
                                <span className="text-sm font-semibold text-blue-500 flex items-center gap-1 group-hover:gap-2 transition-all">
                                    Gerenciar <ArrowRight className="h-4 w-4" />
                                </span>
                            </div>
                        </Link>
                    </div>
                </div>

                {/* Features Highlights */}
                <Card className="md:col-span-1 h-full border-border/50 bg-gradient-to-b from-card to-secondary/20">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <TrendingDown className="h-5 w-5 text-primary" />
                            Por que usar?
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-2">
                            <h4 className="font-semibold text-foreground text-sm flex items-center gap-2">
                                <span className="h-1.5 w-1.5 rounded-full bg-primary"></span>
                                Redução de Custos
                            </h4>
                            <p className="text-xs text-muted-foreground pl-3.5 border-l border-border ml-0.5">
                                Algoritmos matemáticos encontram a combinação exata mais barata.
                            </p>
                        </div>
                        <div className="space-y-2">
                            <h4 className="font-semibold text-foreground text-sm flex items-center gap-2">
                                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                                Precisão Clínica
                            </h4>
                            <p className="text-xs text-muted-foreground pl-3.5 border-l border-border ml-0.5">
                                Garanta que calorias, proteínas e volume estejam dentro dos limites.
                            </p>
                        </div>
                        <div className="space-y-2">
                            <h4 className="font-semibold text-foreground text-sm flex items-center gap-2">
                                <span className="h-1.5 w-1.5 rounded-full bg-orange-500"></span>
                                Flexibilidade
                            </h4>
                            <p className="text-xs text-muted-foreground pl-3.5 border-l border-border ml-0.5">
                                Fixe fórmulas obrigatórias e deixe o sistema completar o resto.
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
