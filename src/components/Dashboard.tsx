'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FlaskConical, Calculator, TrendingDown, Package, BookOpen } from "lucide-react";
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
            description: "Disponíveis no banco de dados",
            color: "text-primary",
        },
        {
            title: "Parenteral (Central)",
            value: formulas.filter((f) => f.via === "Central").length,
            icon: Package,
            description: "Nutrição Parenteral",
            color: "text-blue-500",
        },
        {
            title: "Parenteral (Periférica)",
            value: formulas.filter((f) => f.via === "Peripheral").length,
            icon: Package,
            description: "Nutrição Parenteral",
            color: "text-green-500",
        },
        {
            title: "Nutrição Enteral",
            value: formulas.filter((f) => f.via === "Enteral").length,
            icon: Package,
            description: "Fórmulas Enterais",
            color: "text-orange-500",
        },
    ];

    return (
        <div className="space-y-8">
            {/* Hero Section */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-primary to-slate-800 p-8 md:p-12 text-primary-foreground shadow-xl">
                <div className="relative z-10">
                    <h1 className="text-4xl md:text-5xl font-extrabold mb-4 tracking-tight">Otimizador de Nutrição Parenteral</h1>
                    <p className="text-lg md:text-xl text-primary-foreground/90 mb-8 max-w-2xl leading-relaxed">
                        Otimize fórmulas de nutrição parenteral para minimizar custos enquanto atende todos os requisitos nutricionais.
                        Ferramenta profissional para equipes de saúde.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4">
                        <Button
                            size="lg"
                            variant="secondary"
                            asChild
                            className="bg-background text-primary hover:bg-background/90 font-semibold shadow-sm"
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
                            className="bg-primary-foreground/10 border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/20 backdrop-blur-sm"
                        >
                            <Link href="/formulas">
                                <FlaskConical className="mr-2 h-5 w-5" />
                                Gerenciar Fórmulas
                            </Link>
                        </Button>
                    </div>
                </div>
                <div className="absolute right-0 top-1/2 -translate-y-1/2 h-full opacity-10 hidden lg:block -mr-12">
                    <FlaskConical className="h-96 w-96 rotate-12" />
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                {stats.map((stat) => (
                    <Card key={stat.title} className="overflow-hidden hover:shadow-md transition-shadow duration-300 border-none shadow-sm ring-1 ring-border/50">
                        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                            <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                                {stat.title}
                            </CardTitle>
                            <div className={cn("p-2 rounded-full bg-opacity-10", stat.color.replace('text-', 'bg-'))}>
                                <stat.icon className={cn("h-4 w-4", stat.color)} />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold tracking-tight">{stat.value}</div>
                            <p className="text-xs text-muted-foreground mt-2 font-medium">{stat.description}</p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Quick Actions */}
            <div className="grid gap-6 md:grid-cols-2">
                <Link href="/guide" className="block h-full group">
                    <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer border-l-4 border-l-primary h-full">
                        <CardHeader>
                            <CardTitle className="group-hover:text-primary transition-colors flex items-center gap-2">
                                <BookOpen className="h-5 w-5" />
                                Guia de Início Rápido
                            </CardTitle>
                            <CardDescription>
                                Novo no otimizador? Comece aqui para aprender o básico.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center text-sm font-medium text-primary">
                                Ver Tutorial &rarr;
                            </div>
                        </CardContent>
                    </Card>
                </Link>

                <Link href="/formulas" className="block h-full group">
                    <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer border-l-4 border-l-blue-500 h-full">
                        <CardHeader>
                            <CardTitle className="group-hover:text-blue-500 transition-colors flex items-center gap-2">
                                <FlaskConical className="h-5 w-5" />
                                Gerenciamento de Fórmulas
                            </CardTitle>
                            <CardDescription>
                                Adicione, edite ou importe fórmulas de arquivos Excel.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center text-sm font-medium text-blue-500">
                                Acessar Catálogo &rarr;
                            </div>
                        </CardContent>
                    </Card>
                </Link>
            </div>

            {/* Features Overview */}
            <Card>
                <CardHeader>
                    <CardTitle>Recursos Principais</CardTitle>
                    <CardDescription>
                        Ferramentas profissionais de otimização para nutrição parenteral
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-4 md:grid-cols-3">
                        <div className="space-y-2">
                            <div className="flex items-center gap-2 text-primary">
                                <Calculator className="h-5 w-5" />
                                <h3 className="font-semibold">Otimização de Custos</h3>
                            </div>
                            <p className="text-sm text-muted-foreground">
                                Encontre a combinação de fórmulas mais econômica que atenda todas as restrições nutricionais.
                            </p>
                        </div>
                        <div className="space-y-2">
                            <div className="flex items-center gap-2 text-blue-500">
                                <FlaskConical className="h-5 w-5" />
                                <h3 className="font-semibold">Base de Dados de Fórmulas</h3>
                            </div>
                            <p className="text-sm text-muted-foreground">
                                Base de dados abrangente com capacidades de importação/exportação e gerenciamento de custos personalizado.
                            </p>
                        </div>
                        <div className="space-y-2">
                            <div className="flex items-center gap-2 text-green-500">
                                <TrendingDown className="h-5 w-5" />
                                <h3 className="font-semibold">Análise de Restrições</h3>
                            </div>
                            <p className="text-sm text-muted-foreground">
                                Filtragem avançada e análise de sensibilidade para explorar diferentes cenários.
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
