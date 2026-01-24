'use client';

import { useState, useMemo } from "react";
import { useAtom } from "jotai";
import { activeFormulasAtom, updateFormulaAtom, deleteFormulaAtom, resetLocalFormulasAtom, allFormulasAtom } from "@/store/formulas";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Search, Upload, Download, Pencil, Trash2, FileSpreadsheet, FileJson } from "lucide-react";
import { Formula } from "@/types/formula";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { FormulaDialog } from "@/components/formulas/FormulaDialog";
import * as XLSX from "xlsx";

export default function FormulasManager() {
    // Use allFormulasAtom to see everything including what we will manipulate
    // But wait, activeFormulasAtom filters out hidden ones. We generally want to see active ones here.
    // Actually, we probably want to see active ones to manage them.
    const [formulas] = useAtom(activeFormulasAtom);
    const [, updateFormula] = useAtom(updateFormulaAtom);
    const [, deleteFormula] = useAtom(deleteFormulaAtom);

    const [searchQuery, setSearchQuery] = useState("");
    const [viaFilter, setViaFilter] = useState<string>("Todas");
    const [manufacturerFilter, setManufacturerFilter] = useState<string>("Todos");
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingFormula, setEditingFormula] = useState<Formula | null>(null);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [formulaToDelete, setFormulaToDelete] = useState<string | null>(null);
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

    // Memoized derived state
    const manufacturers = useMemo(() =>
        ["Todos", ...Array.from(new Set(formulas.map((f) => f.manufacturer)))].sort(),
        [formulas]
    );

    // Generate Unique ID (Simple counter based on existing IDs)
    const generateUniqueId = (existingIds: Set<string>): string => {
        let counter = 1;
        // Find absolute max ID number to be safe
        const maxId = Array.from(existingIds).reduce((max, id) => {
            const match = id.match(/F(\d+)/);
            if (match) {
                return Math.max(max, parseInt(match[1]));
            }
            return max;
        }, 0);

        counter = maxId + 1;
        let newId = `F${String(counter).padStart(3, "0")}`;

        // Double check loop
        while (existingIds.has(newId)) {
            counter++;
            newId = `F${String(counter).padStart(3, "0")}`;
        }

        return newId;
    };

    const filteredFormulas = formulas.filter((formula) => {
        const matchesSearch =
            formula.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            formula.manufacturer.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesVia = viaFilter === "Todas" || formula.via === viaFilter;
        const matchesManufacturer = manufacturerFilter === "Todos" || formula.manufacturer === manufacturerFilter;
        return matchesSearch && matchesVia && matchesManufacturer;
    });

    const handleDeleteClick = (id: string) => {
        setFormulaToDelete(id);
        setDeleteDialogOpen(true);
    };

    const handleDeleteConfirm = () => {
        if (!formulaToDelete) return;

        deleteFormula(formulaToDelete);
        setDeleteDialogOpen(false);
        setFormulaToDelete(null);
        toast.success("Fórmula excluída com sucesso (Soft Delete)");
    };

    const toggleSelectFormula = (id: string) => {
        const newSelected = new Set(selectedIds);
        if (newSelected.has(id)) {
            newSelected.delete(id);
        } else {
            newSelected.add(id);
        }
        setSelectedIds(newSelected);
    };

    const toggleSelectAll = () => {
        if (selectedIds.size === filteredFormulas.length) {
            setSelectedIds(new Set());
        } else {
            setSelectedIds(new Set(filteredFormulas.map(f => f.id)));
        }
    };

    const handleEdit = (formula: Formula) => {
        setEditingFormula(formula);
        setDialogOpen(true);
    };

    const handleAdd = () => {
        setEditingFormula(null);
        setDialogOpen(true);
    };

    const handleSave = (data: Omit<Formula, "id"> & { id?: string }) => {
        if (data.id) {
            // Update existing
            updateFormula(data as Formula);
            toast.success("Fórmula atualizada com sucesso");
        } else {
            // Create new
            const existingIds = new Set(formulas.map(f => f.id));
            const newId = generateUniqueId(existingIds);
            const newFormula: Formula = {
                ...data,
                id: newId,
            } as Formula;

            updateFormula(newFormula);
            toast.success(`Fórmula criada com sucesso! ID: ${newId}`);
        }
    };

    const handleExport = () => {
        try {
            const exportData = formulas.map((f) => ({
                ID: f.id,
                Nome: f.name,
                Fabricante: f.manufacturer,
                "Volume (mL)": f.volume_ml,
                Kcal: f.kcal,
                "Proteína (g/L)": f.protein_g_l,
                "Nitrogênio (g/L)": f.nitrogen_g_l,
                "Glicose (g/L)": f.glucose_g_l,
                "Gordura (g/L)": f.fat_g_l,
                "Tipo de Emulsão": f.emulsion_type,
                Via: f.via,
                "Osmolaridade (mOsm/L)": f.osmolarity || "",
                "Custo Base (R$)": f.base_cost,
            }));

            const ws = XLSX.utils.json_to_sheet(exportData);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, "Fórmulas");
            XLSX.writeFile(wb, `formulas_optinutri_${new Date().toISOString().split("T")[0]}.xlsx`);
            toast.success("Excel exportado com sucesso");
        } catch (error) {
            console.error(error);
            toast.error("Erro ao exportar Excel");
        }
    };

    const handleImportExcel = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = new Uint8Array(e.target?.result as ArrayBuffer);
                const workbook = XLSX.read(data, { type: "array" });
                const sheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[sheetName];
                const jsonData = XLSX.utils.sheet_to_json(worksheet) as any[];

                let count = 0;
                const existingIds = new Set(formulas.map(f => f.id));

                jsonData.forEach((row) => {
                    // Helper to get value case insensitive
                    const getVal = (keys: string[]) => {
                        for (const key of keys) if (row[key] !== undefined) return row[key];
                        return undefined;
                    }

                    // Simple mapping or auto-generation
                    let id = getVal(['ID', 'id']);
                    if (!id || existingIds.has(id)) {
                        id = generateUniqueId(existingIds);
                        existingIds.add(id);
                    }

                    const newFormula: Formula = {
                        id: String(id),
                        name: String(getVal(['Nome', 'name', 'Name']) || "Nova Fórmula"),
                        manufacturer: String(getVal(['Fabricante', 'manufacturer']) || "Desconhecido"),
                        volume_ml: Number(getVal(['Volume (mL)', 'volume_ml']) || 0),
                        kcal: Number(getVal(['Kcal', 'kcal']) || 0),
                        protein_g_l: Number(getVal(['Proteína (g/L)', 'protein_g_l']) || 0),
                        nitrogen_g_l: Number(getVal(['Nitrogênio (g/L)', 'nitrogen_g_l']) || 0),
                        glucose_g_l: Number(getVal(['Glicose (g/L)', 'glucose_g_l']) || 0),
                        fat_g_l: Number(getVal(['Gordura (g/L)', 'fat_g_l']) || 0),
                        emulsion_type: String(getVal(['Tipo de Emulsão', 'emulsion_type']) || "Enteral"),
                        via: String(getVal(['Via', 'via']) || "Enteral") as any,
                        base_cost: Number(getVal(['Custo Base (R$)', 'base_cost', 'cost']) || 0),
                        osmolarity: Number(getVal(['Osmolaridade (mOsm/L)', 'osmolarity']) || 0),
                    };

                    updateFormula(newFormula);
                    count++;
                });

                toast.success(`${count} fórmulas importadas/atualizadas com sucesso!`);
            } catch (error) {
                console.error(error);
                toast.error("Erro ao importar Excel. Verifique o formato.");
            }
        };
        reader.readAsArrayBuffer(file);
        event.target.value = "";
    };

    return (
        <div className="space-y-6 p-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Gerenciamento de Fórmulas</h1>
                    <p className="text-muted-foreground mt-1">
                        Gerencie o catálogo de produtos nutricionais
                    </p>
                </div>
                <div className="flex gap-2 flex-wrap">
                    <Button variant="outline" asChild>
                        <label className="cursor-pointer">
                            <Upload className="mr-2 h-4 w-4" />
                            Importar Excel
                            <input
                                type="file"
                                accept=".xlsx,.xls"
                                onChange={handleImportExcel}
                                className="hidden"
                            />
                        </label>
                    </Button>
                    <Button variant="outline" onClick={handleExport}>
                        <Download className="mr-2 h-4 w-4" />
                        Exportar Excel
                    </Button>
                    <Button onClick={handleAdd}>
                        <Plus className="mr-2 h-4 w-4" />
                        Nova Fórmula
                    </Button>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between flex-wrap gap-4">
                        <div>
                            <CardTitle>Base de Fórmulas Ativas</CardTitle>
                            <CardDescription>
                                {filteredFormulas.length} fórmulas encontradas
                            </CardDescription>
                        </div>
                        <div className="flex gap-2 flex-wrap items-center">
                            <div className="relative w-64">
                                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    placeholder="Buscar fórmulas..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-9 h-9"
                                />
                            </div>
                            <Select value={manufacturerFilter} onValueChange={setManufacturerFilter}>
                                <SelectTrigger className="w-[160px] h-9">
                                    <SelectValue placeholder="Fabricante" />
                                </SelectTrigger>
                                <SelectContent>
                                    {manufacturers.map((mfr) => (
                                        <SelectItem key={mfr} value={mfr}>
                                            {mfr}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <Select value={viaFilter} onValueChange={setViaFilter}>
                                <SelectTrigger className="w-[130px] h-9">
                                    <SelectValue placeholder="Via" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Todas">Todas Vias</SelectItem>
                                    <SelectItem value="Central">Central</SelectItem>
                                    <SelectItem value="Peripheral">Periférica</SelectItem>
                                    <SelectItem value="Enteral">Enteral</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    {filteredFormulas.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
                            <p>Nenhuma fórmula encontrada.</p>
                        </div>
                    ) : (
                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Nome</TableHead>
                                        <TableHead>Fabricante</TableHead>
                                        <TableHead>Via</TableHead>
                                        <TableHead>Tipo</TableHead>
                                        <TableHead className="text-right">Vol (mL)</TableHead>
                                        <TableHead className="text-right">Kcal</TableHead>
                                        <TableHead className="text-right">Ptn (g)</TableHead>
                                        <TableHead className="text-right">Custo (R$)</TableHead>
                                        <TableHead className="text-right">Ações</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredFormulas.map((formula) => (
                                        <TableRow key={formula.id}>
                                            <TableCell className="font-medium">{formula.name}</TableCell>
                                            <TableCell>{formula.manufacturer}</TableCell>
                                            <TableCell>
                                                <Badge
                                                    variant={formula.via === "Central" ? "default" : (formula.via === "Enteral" ? "outline" : "secondary")}
                                                >
                                                    {formula.via}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-xs text-muted-foreground">{formula.emulsion_type}</TableCell>
                                            <TableCell className="text-right">{formula.volume_ml}</TableCell>
                                            <TableCell className="text-right">{formula.kcal}</TableCell>
                                            <TableCell className="text-right">
                                                {(formula.protein_g_l * formula.volume_ml / 1000).toFixed(1)}
                                            </TableCell>
                                            <TableCell className="text-right font-medium">
                                                R$ {formula.base_cost.toFixed(2)}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-1">
                                                    <Button size="icon" variant="ghost" onClick={() => handleEdit(formula)}>
                                                        <Pencil className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        size="icon"
                                                        variant="ghost"
                                                        className="text-destructive hover:text-destructive"
                                                        onClick={() => handleDeleteClick(formula.id)}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </CardContent>
            </Card>

            <FormulaDialog
                open={dialogOpen}
                onOpenChange={setDialogOpen}
                formula={editingFormula}
                onSave={handleSave}
            />

            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Excluir Fórmula</AlertDialogTitle>
                        <AlertDialogDescription>
                            Tem certeza? Isso ocultará a fórmula da lista de seleção.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDeleteConfirm}>
                            Confirmar Exclusão
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
