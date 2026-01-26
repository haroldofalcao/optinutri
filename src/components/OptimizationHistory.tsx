import { useState } from "react";
import { useHistory } from "@/hooks/useHistory";
import { OptimizationHistoryEntry } from "@/store/optimizationHistory";
import { trackOptimizationDetailsViewed } from "@/lib/analytics";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Trash2, Calendar, DollarSign, Activity, Droplet, Trash, Eye, Package, Beaker, Scale } from "lucide-react";
import { toast } from "sonner";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";

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
            <Card>
                <CardHeader>
                    <CardTitle>Histórico de Otimizações</CardTitle>
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
            <Card>
                <CardHeader>
                    <CardTitle>Histórico de Otimizações</CardTitle>
                    <CardDescription>
                        As otimizações realizadas aparecerão aqui
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex h-32 items-center justify-center text-muted-foreground">
                        <div className="text-center">
                            <Activity className="mx-auto h-12 w-12 mb-2 opacity-50" />
                            <p>Nenhuma otimização realizada ainda</p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle>Histórico de Otimizações</CardTitle>
                        <CardDescription>
                            {history.length} otimização{history.length !== 1 ? "ões" : ""} realizada{history.length !== 1 ? "s" : ""}
                        </CardDescription>
                    </div>
                    {/* Delete/Clear buttons disabled for MVP persistence until implemented in service */}
                </div>
            </CardHeader>
            <CardContent>
                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[180px]">
                                    <Calendar className="inline mr-2 h-4 w-4" />
                                    Data/Hora
                                </TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">
                                    <DollarSign className="inline mr-1 h-4 w-4" />
                                    Custo Total
                                </TableHead>
                                <TableHead className="text-right">
                                    <Activity className="inline mr-1 h-4 w-4" />
                                    Calorias
                                </TableHead>
                                <TableHead className="text-right">
                                    <Droplet className="inline mr-1 h-4 w-4" />
                                    Proteína
                                </TableHead>
                                <TableHead className="text-center">
                                    <Package className="inline mr-1 h-4 w-4" />
                                    Bolsas
                                </TableHead>
                                <TableHead className="text-right">Ações</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {history.map((entry) => (
                                <TableRow key={entry.id}>
                                    <TableCell className="font-mono text-xs">
                                        {formatDate(entry.timestamp)}
                                    </TableCell>
                                    <TableCell>
                                        <Badge
                                            variant={
                                                entry.result.status === "Optimal"
                                                    ? "default"
                                                    : entry.result.status === "Infeasible"
                                                        ? "secondary"
                                                        : "destructive"
                                            }
                                        >
                                            {entry.result.status === "Optimal" && "Ótimo"}
                                            {entry.result.status === "Infeasible" && "Inviável"}
                                            {entry.result.status === "Error" && "Erro"}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right font-medium">
                                        {entry.result.total_cost !== null
                                            ? `R$ ${entry.result.total_cost?.toFixed(2)}`
                                            : "-"}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <span className="text-sm">{entry.result.total_kcal.toFixed(0)}</span>
                                        <span className="text-xs text-muted-foreground ml-1">kcal</span>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <span className="text-sm">{entry.result.total_protein.toFixed(1)}</span>
                                        <span className="text-xs text-muted-foreground ml-1">g</span>
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <Badge variant="outline">{entry.result.num_bags}</Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-1">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleViewDetails(entry)}
                                                title="Ver detalhes"
                                            >
                                                <Eye className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>

            {/* Details Modal */}
            <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Detalhes da Otimização</DialogTitle>
                        <DialogDescription>
                            {selectedEntry && formatDate(selectedEntry.timestamp)}
                        </DialogDescription>
                    </DialogHeader>

                    {selectedEntry && (
                        <div className="space-y-6">
                            {/* Status and Summary */}
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                <Card>
                                    <CardHeader className="pb-3">
                                        <CardDescription>Status</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <Badge
                                            variant={
                                                selectedEntry.result.status === "Optimal"
                                                    ? "default"
                                                    : selectedEntry.result.status === "Infeasible"
                                                        ? "secondary"
                                                        : "destructive"
                                            }
                                            className="text-sm"
                                        >
                                            {selectedEntry.result.status === "Optimal" && "Ótimo"}
                                            {selectedEntry.result.status === "Infeasible" && "Inviável"}
                                            {selectedEntry.result.status === "Error" && "Erro"}
                                        </Badge>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader className="pb-3">
                                        <CardDescription className="flex items-center gap-1">
                                            <DollarSign className="h-3 w-3" />
                                            Custo Total
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-2xl font-bold">
                                            {selectedEntry.result.total_cost !== null
                                                ? `R$ ${selectedEntry.result.total_cost?.toFixed(2)}`
                                                : "-"}
                                        </p>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader className="pb-3">
                                        <CardDescription className="flex items-center gap-1">
                                            <Package className="h-3 w-3" />
                                            Bolsas
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-2xl font-bold">{selectedEntry.result.num_bags}</p>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader className="pb-3">
                                        <CardDescription className="flex items-center gap-1">
                                            <Activity className="h-3 w-3" />
                                            Fórmulas
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-2xl font-bold">{selectedEntry.selectedFormulas.length}</p>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Constraints */}
                            <div>
                                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                                    <Scale className="h-5 w-5" />
                                    Restrições Aplicadas
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <Card>
                                        <CardHeader className="pb-3">
                                            <CardTitle className="text-sm">Calorias (kcal)</CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-2">
                                            <div className="flex justify-between text-sm">
                                                <span className="text-muted-foreground">Mínimo:</span>
                                                <span className="font-medium">{selectedEntry.constraints.kcal_min} kcal</span>
                                            </div>
                                            <div className="flex justify-between text-sm">
                                                <span className="text-muted-foreground">Máximo:</span>
                                                <span className="font-medium">{selectedEntry.constraints.kcal_max} kcal</span>
                                            </div>
                                            <div className="flex justify-between text-sm">
                                                <span className="text-muted-foreground">Alcançado:</span>
                                                <span className="font-bold text-primary">{selectedEntry.result.total_kcal.toFixed(0)} kcal</span>
                                            </div>
                                        </CardContent>
                                    </Card>

                                    <Card>
                                        <CardHeader className="pb-3">
                                            <CardTitle className="text-sm">Proteína (g)</CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-2">
                                            <div className="flex justify-between text-sm">
                                                <span className="text-muted-foreground">Mínimo:</span>
                                                <span className="font-medium">{selectedEntry.constraints.protein_min} g</span>
                                            </div>
                                            <div className="flex justify-between text-sm">
                                                <span className="text-muted-foreground">Máximo:</span>
                                                <span className="font-medium">{selectedEntry.constraints.protein_max} g</span>
                                            </div>
                                            <div className="flex justify-between text-sm">
                                                <span className="text-muted-foreground">Alcançado:</span>
                                                <span className="font-bold text-primary">{selectedEntry.result.total_protein.toFixed(1)} g</span>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </Card>
    );
}
