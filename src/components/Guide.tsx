'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { BookOpen, Calculator, FlaskConical, HelpCircle, Lightbulb } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useEffect } from "react";
import { trackPageView } from "@/lib/analytics";

export default function Guide() {
    useEffect(() => {
        trackPageView('guide', 'Guia do Usuário');
    }, []);

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold">Guia do Usuário</h1>
                <p className="text-muted-foreground mt-1">
                    Aprenda a usar o Otimizador de Terapia Nutricional de forma eficaz
                </p>
            </div>

            {/* Getting Started */}
            <Card>
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <BookOpen className="h-5 w-5 text-primary" />
                        <CardTitle>Primeiros Passos</CardTitle>
                    </div>
                    <CardDescription>Introdução rápida ao otimizador</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <h3 className="font-semibold">O que é esta ferramenta?</h3>
                        <p className="text-sm text-muted-foreground">
                            O OptiNutri é uma ferramenta de apoio à decisão que usa programação linear para encontrar
                            a combinação de menor custo de fórmulas de nutrição enteral e parenteral que atenda às metas
                            nutricionais do paciente. É possível combinar fórmulas de vias diferentes (por exemplo,
                            enteral com um complemento parenteral) na mesma prescrição. Foi projetado para profissionais
                            de saúde, farmacêuticos e nutricionistas.
                        </p>
                    </div>

                    <div className="space-y-2">
                        <h3 className="font-semibold">Principais Benefícios</h3>
                        <ul className="space-y-1 text-sm text-muted-foreground list-disc list-inside">
                            <li>Minimize custos enquanto atende todas as restrições nutricionais</li>
                            <li>Comparação rápida de múltiplas combinações de fórmulas</li>
                            <li>Custos ajustáveis por fórmula, cadastro de fórmulas próprias e filtros por fabricante e via</li>
                            <li>Combinação de fórmulas enterais e parenterais, com limite de tipos de fórmula definido por você</li>
                            <li>Importação/exportação em Excel para fácil gerenciamento de dados</li>
                            <li>Análise visual dos resultados com gráficos</li>
                        </ul>
                    </div>
                </CardContent>
            </Card>

            {/* Step by Step Guide */}
            <Card>
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <Lightbulb className="h-5 w-5 text-accent" />
                        <CardTitle>Tutorial Passo a Passo</CardTitle>
                    </div>
                    <CardDescription>Siga estes passos para otimizar fórmulas</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-6">
                        <div className="flex gap-4">
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold">
                                1
                            </div>
                            <div className="space-y-1">
                                <h3 className="font-semibold">Gerencie Suas Fórmulas</h3>
                                <p className="text-sm text-muted-foreground">
                                    Navegue até a página de Fórmulas para visualizar, adicionar, editar ou importar fórmulas do Excel.
                                    Certifique-se de que sua base de dados inclui todas as fórmulas que você deseja considerar.
                                </p>
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold">
                                2
                            </div>
                            <div className="space-y-1">
                                <h3 className="font-semibold">Defina as Restrições</h3>
                                <p className="text-sm text-muted-foreground">
                                    Vá para a página da Calculadora e insira os requisitos nutricionais do paciente:
                                    calorias mínimas/máximas, proteína, volume máximo e o máximo de tipos de fórmula.
                                </p>
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold">
                                3
                            </div>
                            <div className="space-y-1">
                                <h3 className="font-semibold">Execute a Otimização</h3>
                                <p className="text-sm text-muted-foreground">
                                    Clique em "Calcular Otimização" para executar o algoritmo de otimização.
                                    O sistema encontrará a melhor combinação em segundos.
                                </p>
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold">
                                4
                            </div>
                            <div className="space-y-1">
                                <h3 className="font-semibold">Revise os Resultados</h3>
                                <p className="text-sm text-muted-foreground">
                                    Examine os resultados incluindo custo total, fórmulas selecionadas e composição nutricional.
                                    Use os gráficos para visualizar a distribuição.
                                </p>
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold">
                                5
                            </div>
                            <div className="space-y-1">
                                <h3 className="font-semibold">Consulte o Histórico</h3>
                                <p className="text-sm text-muted-foreground">
                                    Os cálculos recentes ficam listados em "Histórico de Otimizações", abaixo da calculadora.
                                    A exportação do resultado em PDF e Excel está prevista para uma próxima versão.
                                </p>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* FAQ */}
            <Card>
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <HelpCircle className="h-5 w-5 text-green-500" />
                        <CardTitle>Perguntas Frequentes</CardTitle>
                    </div>
                </CardHeader>
                <CardContent>
                    <Accordion type="single" collapsible className="w-full">
                        <AccordionItem value="item-1">
                            <AccordionTrigger>O que é otimização por programação linear?</AccordionTrigger>
                            <AccordionContent>
                                Programação linear é um método matemático para encontrar o melhor resultado em um modelo
                                matemático com relacionamentos lineares. No nosso caso, encontra a combinação de fórmulas que
                                minimiza o custo enquanto satisfaz todas as restrições nutricionais.
                            </AccordionContent>
                        </AccordionItem>

                        <AccordionItem value="item-2">
                            <AccordionTrigger>Quão precisos são os resultados?</AccordionTrigger>
                            <AccordionContent>
                                O otimizador fornece soluções matematicamente ótimas baseadas nos dados e restrições
                                que você fornece. Sempre verifique os resultados com julgamento clínico e protocolos institucionais.
                            </AccordionContent>
                        </AccordionItem>

                        <AccordionItem value="item-3">
                            <AccordionTrigger>Posso personalizar os custos das fórmulas?</AccordionTrigger>
                            <AccordionContent>
                                Sim. Na página Fórmulas, clique no lápis da fórmula e altere o "Custo Base (R$)" para refletir
                                os preços da sua instituição ou do seu contrato. A calculadora passa a usar o novo valor. Os
                                ajustes ficam salvos neste navegador e neste computador; limpar os dados do navegador os apaga.
                            </AccordionContent>
                        </AccordionItem>

                        <AccordionItem value="item-4">
                            <AccordionTrigger>E se nenhuma solução for encontrada?</AccordionTrigger>
                            <AccordionContent>
                                Se o otimizador retornar "Inviável", significa que nenhuma combinação de fórmulas disponíveis
                                pode satisfazer todas as suas restrições. Tente relaxar algumas restrições ou adicionar mais fórmulas
                                ao seu banco de dados.
                            </AccordionContent>
                        </AccordionItem>

                        <AccordionItem value="item-5">
                            <AccordionTrigger>Como importo fórmulas do Excel?</AccordionTrigger>
                            <AccordionContent>
                                Na página de Fórmulas, clique em "Importar Excel" e selecione seu arquivo. O sistema suporta
                                formatos padrão do Excel (.xlsx, .xls) com colunas para nome, volume, calorias, proteína
                                e outras propriedades das fórmulas.
                            </AccordionContent>
                        </AccordionItem>

                        <AccordionItem value="item-6">
                            <AccordionTrigger>Posso combinar nutrição enteral e parenteral?</AccordionTrigger>
                            <AccordionContent>
                                Sim. Selecione fórmulas de vias diferentes e defina, em "Máx. de tipos de fórmula", quantas
                                podem entrar na prescrição (ex.: 2). O sistema mostra a combinação de menor custo entre as
                                fórmulas selecionadas; ele não escolhe a via por você. Quando o trato digestivo é funcional,
                                a nutrição enteral tem prioridade: use o julgamento clínico e o protocolo da sua instituição.
                            </AccordionContent>
                        </AccordionItem>
                    </Accordion>
                </CardContent>
            </Card>

            {/* Glossary */}
            <Card>
                <CardHeader>
                    <CardTitle>Glossário</CardTitle>
                    <CardDescription>Termos comuns usados em terapia nutricional</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <Badge variant="outline">kcal</Badge>
                                <span className="font-semibold">Quilocalorias</span>
                            </div>
                            <p className="text-sm text-muted-foreground">
                                Unidade de energia fornecida pela fórmula nutricional.
                            </p>
                        </div>

                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <Badge variant="outline">MCT/LCT</Badge>
                                <span className="font-semibold">Triglicerídeos de Cadeia Média/Longa</span>
                            </div>
                            <p className="text-sm text-muted-foreground">
                                Tipo de emulsão lipídica que mistura ácidos graxos de cadeia média e longa.
                            </p>
                        </div>

                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <Badge variant="outline">Central</Badge>
                                <span className="font-semibold">Acesso Venoso Central</span>
                            </div>
                            <p className="text-sm text-muted-foreground">
                                Administração via cateter venoso central, permite maior osmolaridade.
                            </p>
                        </div>

                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <Badge variant="outline">Periférica</Badge>
                                <span className="font-semibold">Acesso Venoso Periférico</span>
                            </div>
                            <p className="text-sm text-muted-foreground">
                                Administração via veia periférica, requer fórmulas de menor osmolaridade.
                            </p>
                        </div>

                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <Badge variant="outline">Enteral</Badge>
                                <span className="font-semibold">Via Digestiva</span>
                            </div>
                            <p className="text-sm text-muted-foreground">
                                Via digestiva (oral ou sonda). Fórmulas enterais nunca são administradas por via venosa.
                            </p>
                        </div>

                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <Badge variant="outline">Parenteral (componente)</Badge>
                                <span className="font-semibold">Lipídios ou Aminoácidos Isolados</span>
                            </div>
                            <p className="text-sm text-muted-foreground">
                                Bolsas isoladas de lipídios ou aminoácidos, usadas para complementar outra fórmula.
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
