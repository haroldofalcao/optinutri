import { useState } from "react";
import { useHistory } from "@/hooks/useHistory";
import { OptimizationHistoryEntry } from "@/store/optimizationHistory";
import { trackOptimizationDetailsViewed } from "@/lib/analytics";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Trash2, Calendar, DollarSign, Activity, Droplet, Trash, Eye, Package, Beaker, Scale, Clock, CheckCircle2, XCircle } from "lucide-react";
import { toast } from "sonner";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";

export function OptimizationHistory() {
    // Persistence Hook
    const { history, loading } = useHistory();
    const [selectedEntry, setSelectedEntry] = useState<OptimizationHistoryEntry | null>(null);
    const [detailsOpen, setDetailsOpen] = useState(false);

    // TODO: Implement delete in persistence layer
    const handleDelete = (id: string) => {
        toast.error("Exclusão ainda não implementada no banco de dados.");
    };

    const handleClearAll = () => {
        toast.error("Limpeza de histórico ainda não implementada no banco de dados.");
    };

    const handleViewDetails = (entry: any) => { // Using any broadly due to timestamp/data types mismatch between local/service
        const convertedEntry: OptimizationHistoryEntry = {
            ...entry,
            timestamp: entry.timestamp?.seconds ? entry.timestamp.seconds * 1000 : Date.now(), // Handle Firestore Timestamp
        };
        setSelectedEntry(convertedEntry);
        setDetailsOpen(true);
        // Track details view
        trackOptimizationDetailsViewed(entry.id || "unknown", true);
    };

    const formatDate = (timestamp: any) => {
        if (!timestamp) return "-";
        // Handle Firestore Timestamp (seconds) or JS Date number
        const date = timestamp.seconds ? new Date(timestamp.seconds * 1000) : new Date(timestamp);
        return date.toLocaleString("pt-BR", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    if (loading) {
        return (
            <Card className="border-border/60 shadow-sm animate-pulse">
                <CardHeader>
                    <CardTitle className="h-6 w-48 bg-muted rounded"></CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex h-32 items-center justify-center text-muted-foreground">
                        <p>Carregando histórico...</p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (history.length === 0) {
        return (
            <Card className="border-border/60 shadow-sm bg-muted/5">
                <CardHeader>
                    <CardTitle>Histórico de Otimizações</CardTitle>
                    <CardDescription>
                        Seus cálculos recentes
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col items-center justify-center h-48 text-muted-foreground">
                        <div className="p-4 rounded-full bg-muted/20 mb-3">
                            <Clock className="h-8 w-8 opacity-40" />
                        </div>
                        <p className="font-medium">Nenhuma otimização realizada ainda</p>
                        <p className="text-xs text-muted-foreground mt-1 text-center max-w-xs">
                            Execute uma otimização na calculadora para gerar registros aqui.
                        </p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="border-border/60 shadow-md overflow-hidden transition-all hover:shadow-lg">
            <CardHeader className="bg-muted/5 pb-4">
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="text-xl flex items-center gap-2">
                            <Clock className="h-5 w-5 text-primary" />
                            Histórico
                        </CardTitle>
                        <CardDescription>
                            Últimos {history.length} registros
                        </CardDescription>
                    </div>
                    {/* Delete/Clear buttons disabled for MVP persistence until implemented in service */}
                </div>
            </CardHeader>
            <CardContent className="p-0">
                <div className="rounded-none border-t border-border/40">
                    <Table>
                        <TableHeader className="bg-muted/50">
                            <TableRow className="hover:bg-transparent">
                                <TableHead className="w-[180px] font-semibold">Data</TableHead>
                                <TableHead className="font-semibold">Status</TableHead>
                                <TableHead className="text-right font-semibold">Custo</TableHead>
                                <TableHead className="text-right hidden sm:table-cell font-semibold">Bolsas</TableHead>
                                <TableHead className="text-right font-semibold">Ações</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {history.slice(0, 5).map((entry) => (
                                <TableRow key={entry.id} className="cursor-pointer hover:bg-muted/30 transition-colors" onClick={() => handleViewDetails(entry)}>
                                    <TableCell className="font-mono text-xs text-muted-foreground">
                                        {formatDate(entry.timestamp)}
                                    </TableCell>
                                    <TableCell>
                                        <Badge
                                            variant="outline"
                                            className={`
                                                font-normal gap-1
                                                ${entry.result.status === "Optimal"
                                                    ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                                                    : "bg-destructive/10 text-destructive border-destructive/20"
                                                }
                                            `}
                                        >
                                            {entry.result.status === "Optimal" ? <CheckCircle2 className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                                            {entry.result.status === "Optimal" ? "Sucesso" : "Falha"}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right font-medium text-foreground">
                                        {entry.result.total_cost !== null
                                            ? `R$ ${entry.result.total_cost?.toFixed(2)}`
                                            : "-"}
                                    </TableCell>
                                    <TableCell className="text-right hidden sm:table-cell">
                                        <Badge variant="secondary" className="font-normal text-xs">{entry.result.num_bags} un</Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 text-muted-foreground hover:text-primary"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleViewDetails(entry);
                                            }}
                                        >
                                            <Eye className="h-4 w-4" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                    {history.length > 5 && (
                        <div className="p-3 text-center border-t border-border/40 bg-muted/5">
                            <Button variant="link" size="sm" className="text-xs text-muted-foreground">
                                Ver todos os registros ({history.length})
                            </Button>
                        </div>
                    )}
                </div>
            </CardContent>

            {/* Details Modal */}
            <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
                <DialogContent className="max-w-3xl max-h-[90vh] p-0 gap-0 overflow-hidden sm:rounded-xl">
                    <DialogHeader className="p-6 pb-4 bg-muted/5 border-b">
                        <DialogTitle className="text-xl flex items-center gap-2">
                            <Activity className="h-5 w-5 text-primary" />
                            Detalhes do Cálculo
                        </DialogTitle>
                        <DialogDescription>
                            Realizado em {selectedEntry && formatDate(selectedEntry.timestamp)}
                        </DialogDescription>
                    </DialogHeader>

                    <ScrollArea className="max-h-[70vh]">
                        {selectedEntry && (
                            <div className="p-6 space-y-8">
                                {/* Summary KPIs */}
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                    <div className="flex flex-col items-center justify-center p-4 bg-card border rounded-lg shadow-sm text-center">
                                        <span className="text-xs font-semibold uppercase text-muted-foreground mb-1">Custo Total</span>
                                        <span className="text-xl font-bold text-primary">R$ {selectedEntry.result.total_cost?.toFixed(2)}</span>
                                    </div>
                                    <div className="flex flex-col items-center justify-center p-4 bg-card border rounded-lg shadow-sm text-center">
                                        <span className="text-xs font-semibold uppercase text-muted-foreground mb-1">Volume</span>
                                        <span className="text-xl font-bold">{selectedEntry.result.total_volume} mL</span>
                                    </div>
                                    <div className="flex flex-col items-center justify-center p-4 bg-card border rounded-lg shadow-sm text-center">
                                        <span className="text-xs font-semibold uppercase text-muted-foreground mb-1">Calorias</span>
                                        <span className="text-xl font-bold">{selectedEntry.result.total_kcal.toFixed(0)}</span>
                                    </div>
                                    <div className="flex flex-col items-center justify-center p-4 bg-card border rounded-lg shadow-sm text-center">
                                        <span className="text-xs font-semibold uppercase text-muted-foreground mb-1">Proteínas</span>
                                        <span className="text-xl font-bold">{selectedEntry.result.total_protein.toFixed(1)} g</span>
                                    </div>
                                </div>

                                {/* Constraints vs Achieved */}
                                <div className="space-y-4">
                                    <h3 className="text-sm font-semibold flex items-center gap-2 text-foreground/80">
                                        <Scale className="h-4 w-4" />
                                        Alvos Nutricionais
                                    </h3>
                                    <div className="grid sm:grid-cols-2 gap-4">
                                        <div className="space-y-3 p-4 border rounded-lg bg-card/50">
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-sm font-medium">Calorias (kcal)</span>
                                                <Badge variant="outline" className="text-xs font-mono">{selectedEntry.constraints.kcal_min} - {selectedEntry.constraints.kcal_max}</Badge>
                                            </div>
                                            <div className="flex items-center justify-between text-sm">
                                                <span className="text-muted-foreground">Atingido:</span>
                                                <span className="font-bold text-lg text-primary">{selectedEntry.result.total_kcal.toFixed(0)}</span>
                                            </div>
                                        </div>

                                        <div className="space-y-3 p-4 border rounded-lg bg-card/50">
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-sm font-medium">Proteínas (g)</span>
                                                <Badge variant="outline" className="text-xs font-mono">{selectedEntry.constraints.protein_min} - {selectedEntry.constraints.protein_max}</Badge>
                                            </div>
                                            <div className="flex items-center justify-between text-sm">
                                                <span className="text-muted-foreground">Atingido:</span>
                                                <span className="font-bold text-lg text-primary">{selectedEntry.result.total_protein.toFixed(1)}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Formulas Used */}
                                <div className="space-y-4">
                                    <h3 className="text-sm font-semibold flex items-center gap-2 text-foreground/80">
                                        <Package className="h-4 w-4" />
                                        Composição da Prescrição
                                    </h3>
                                    <div className="border rounded-lg overflow-hidden">
                                        <Table>
                                            <TableHeader className="bg-muted/30">
                                                <TableRow>
                                                    <TableHead>Fórmula</TableHead>
                                                    <TableHead className="text-center w-20">Qtd</TableHead>
                                                    <TableHead className="text-right">Custo</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {selectedEntry.result.selected_bags.map((bag, i) => (
                                                    <TableRow key={i}>
                                                        <TableCell className="font-medium text-sm py-3">
                                                            {bag.name}
                                                            <div className="text-[10px] text-muted-foreground">{bag.via}</div>
                                                        </TableCell>
                                                        <TableCell className="text-center py-3">
                                                            <Badge variant="secondary" className="font-mono">{bag.quantity}</Badge>
                                                        </TableCell>
                                                        <TableCell className="text-right font-medium py-3">
                                                            R$ {bag.total_cost.toFixed(2)}
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </div>
                                </div>
                            </div>
                        )}
                    </ScrollArea>
                </DialogContent>
            </Dialog>
        </Card>
    );
}
