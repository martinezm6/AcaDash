import { useState } from "react";
import { useSubjects, useCreateSubject, useUpdateSubject, useDeleteSubject } from "@/hooks/use-subjects";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Plus, Target, BookOpen, Trash2, Edit2, AlertCircle, CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Subjects() {
  const { data: subjects = [] } = useSubjects();
  const createSubject = useCreateSubject();
  const updateSubject = useUpdateSubject();
  const deleteSubject = useDeleteSubject();
  const { toast } = useToast();

  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [goalGrade, setGoalGrade] = useState(() => {
    const saved = localStorage.getItem("goalGrade");
    return saved ? Number(saved) : 8.5;
  });
  const [editingGoal, setEditingGoal] = useState(false);
  const [newGoal, setNewGoal] = useState(String(goalGrade));
  
  const [formData, setFormData] = useState({
    name: "",
    semester: "1",
    currentGrade: "",
    completed: false,
  });

  const handleSaveGoal = () => {
    const goal = Number(newGoal);
    if (goal > 0 && goal <= 10) {
      localStorage.setItem("goalGrade", String(goal));
      setGoalGrade(goal);
      setEditingGoal(false);
      toast({ title: "Meta actualizada", description: `Nueva meta: ${goal}` });
    }
  };

  const openEdit = (s: any) => {
    setFormData({
      name: s.name,
      semester: s.semester,
      currentGrade: s.currentGrade ? String(s.currentGrade) : "",
      completed: s.completed || false,
    });
    setEditingId(s.id);
    setIsOpen(true);
  };

  const handleOpenNew = () => {
    setFormData({ name: "", semester: "1", currentGrade: "", completed: false });
    setEditingId(null);
    setIsOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      name: formData.name,
      semester: formData.semester,
      targetGrade: String(goalGrade),
      currentGrade: formData.currentGrade ? Number(formData.currentGrade) : null,
      completed: formData.completed,
    };

    if (editingId) {
      updateSubject.mutate({ id: editingId, ...payload }, {
        onSuccess: () => {
          setIsOpen(false);
          toast({ title: "Actualizado", description: "La materia ha sido actualizada." });
        }
      });
    } else {
      createSubject.mutate(payload, {
        onSuccess: () => {
          setIsOpen(false);
          toast({ title: "Materia creada", description: "Se ha añadido a tu lista." });
        }
      });
    }
  };

  const completedSubjects = subjects.filter(s => s.completed);
  const pendingSubjects = subjects.filter(s => !s.completed);
  
  const completedAvg = completedSubjects.length > 0 
    ? completedSubjects.reduce((acc, s) => acc + Number(s.currentGrade || 0), 0) / completedSubjects.length 
    : 0;
  
  const pendingAvg = pendingSubjects.length > 0
    ? pendingSubjects.reduce((acc, s) => acc + Number(s.currentGrade || 0), 0) / pendingSubjects.length
    : 0;

  const totalSubjects = subjects.length;
  let suggestedGrade = 0;
  if (pendingSubjects.length > 0) {
    const neededTotal = goalGrade * totalSubjects - completedAvg * completedSubjects.length;
    suggestedGrade = neededTotal / pendingSubjects.length;
  }
  
  const avgGrade = completedSubjects.length > 0
    ? completedSubjects.reduce((acc, s) => acc + Number(s.currentGrade || 0), 0) / completedSubjects.length
    : 0;
  const needsImprovement = avgGrade > 0 && avgGrade < goalGrade - 0.5;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Materias y Calificaciones</h1>
          <p className="text-muted-foreground mt-1">Registra tu progreso académico.</p>
        </div>
        
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleOpenNew} className="rounded-xl shadow-lg shadow-primary/20">
              <Plus className="w-5 h-5 mr-2" />
              Añadir Materia
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md rounded-2xl animate-in zoom-in-95 duration-300">
            <DialogHeader>
              <DialogTitle>{editingId ? "Editar Materia" : "Nueva Materia"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              <div className="flex items-center gap-3 p-3 rounded-xl bg-secondary/30 border border-border/50">
                <input
                  type="checkbox"
                  id="completed"
                  checked={formData.completed}
                  onChange={e => setFormData({...formData, completed: e.target.checked, currentGrade: e.target.checked ? formData.currentGrade : ""})}
                  className="w-4 h-4 rounded"
                />
                <label htmlFor="completed" className="text-sm font-medium cursor-pointer">
                  Materia ya completada (tiene calificación final)
                </label>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Nombre de la materia</label>
                <Input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="rounded-xl"/>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Semestre / Periodo</label>
                <Input required value={formData.semester} onChange={e => setFormData({...formData, semester: e.target.value})} className="rounded-xl"/>
              </div>
              {formData.completed && (
                <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
                  <label className="text-sm font-medium">Calificación Final</label>
                  <Input
                    type="number"
                    step="0.1"
                    min="0"
                    max="10"
                    required
                    value={formData.currentGrade}
                    onChange={e => setFormData({...formData, currentGrade: e.target.value})}
                    className="rounded-xl"
                    placeholder="Ej: 9.5"
                  />
                </div>
              )}
              <Button type="submit" className="w-full rounded-xl transition-all active:scale-95" disabled={createSubject.isPending || updateSubject.isPending}>
                {createSubject.isPending || updateSubject.isPending ? "Guardando..." : "Guardar"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card className={`glass-card ${needsImprovement ? 'border-orange-500/30' : ''}`}>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold flex items-center gap-2">
                <Target className="w-5 h-5 text-primary" />
                Meta de Promedio General
              </h3>
              <div className="flex items-baseline gap-2 mt-2">
                <div className="text-2xl font-bold text-primary">{goalGrade.toFixed(1)}</div>
                <div className="text-sm text-muted-foreground">
                  Actual: <span className={avgGrade < goalGrade ? 'text-orange-600 font-semibold' : 'text-green-600 font-semibold'}>{avgGrade.toFixed(2)}</span>
                </div>
              </div>
              {needsImprovement && (
                <div className="flex items-center gap-1 mt-2 text-orange-600 text-sm">
                  <AlertCircle className="w-4 h-4" />
                  Necesitas mejorar {(goalGrade - avgGrade).toFixed(2)} puntos
                </div>
              )}
            </div>
            {!editingGoal && (
              <Button variant="outline" size="sm" onClick={() => { setNewGoal(String(goalGrade)); setEditingGoal(true); }}>
                Editar
              </Button>
            )}
            {editingGoal && (
              <div className="flex gap-2">
                <Input
                  type="number"
                  step="0.1"
                  min="1"
                  max="10"
                  value={newGoal}
                  onChange={e => setNewGoal(e.target.value)}
                  className="w-20 rounded-lg"
                />
                <Button size="sm" onClick={handleSaveGoal}>Guardar</Button>
                <Button variant="outline" size="sm" onClick={() => setEditingGoal(false)}>Cancelar</Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {pendingSubjects.length > 0 && (
        <Card className="glass-card border-blue-500/30 bg-blue-500/5">
          <CardContent className="pt-6">
            <div className="space-y-3">
              <h3 className="font-semibold flex items-center gap-2 text-blue-600">
                <Target className="w-5 h-5" />
                Sugerencia para Materias Pendientes
              </h3>
              <p className="text-sm text-muted-foreground">
                {completedSubjects.length > 0 && (
                  <>Ya completaste {completedSubjects.length} materia{completedSubjects.length > 1 ? 's' : ''} con promedio <span className="font-semibold text-foreground">{completedAvg.toFixed(2)}</span>.<br /></>
                )}
                Para alcanzar tu meta de <span className="font-semibold">{goalGrade.toFixed(1)}</span>, necesitas sacar un promedio de{" "}
                <span className={`font-bold text-lg ${suggestedGrade >= goalGrade ? 'text-green-600' : suggestedGrade >= goalGrade - 0.5 ? 'text-orange-600' : 'text-destructive'}`}>
                  {suggestedGrade.toFixed(2)}
                </span>{" "}
                en tus {pendingSubjects.length} materia{pendingSubjects.length > 1 ? 's' : ''} pendiente{pendingSubjects.length > 1 ? 's' : ''}.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      <div>
        <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
          <BookOpen className="w-5 h-5" />
          {pendingSubjects.length > 0 && `Materias Pendientes (${pendingSubjects.length})`}
          {pendingSubjects.length === 0 && "Todas las Materias Completadas"}
        </h3>
      </div>

      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
        {pendingSubjects.map(subject => {
          const current = Number(subject.currentGrade || 0);
          const progress = Math.min(100, Math.max(0, (current / goalGrade) * 100));
          const isAtRisk = current > 0 && current < goalGrade - 1.5;

          return (
            <Card key={subject.id} className="glass-card hover-lift overflow-hidden group">
              <div className={`h-2 w-full ${isAtRisk ? 'bg-destructive' : 'bg-primary'}`}></div>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-xl">{subject.name}</CardTitle>
                    <p className="text-xs text-muted-foreground mt-1 font-medium bg-secondary inline-block px-2 py-0.5 rounded-md">
                      Semestre {subject.semester}
                    </p>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => openEdit(subject)} className="p-1.5 text-muted-foreground hover:text-primary transition-colors">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button onClick={() => { if(confirm("¿Eliminar materia?")) deleteSubject.mutate(subject.id); }} className="p-1.5 text-muted-foreground hover:text-destructive transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground font-medium mb-1">Calificación</p>
                    <p className={`text-3xl font-bold ${isAtRisk ? 'text-orange-600' : 'text-foreground'}`}>
                      {subject.currentGrade ? Number(subject.currentGrade).toFixed(1) : '-'}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground font-medium flex items-center gap-1 justify-end mb-1">
                      <Target className="w-3 h-3" /> Meta General
                    </p>
                    <p className="text-2xl font-bold text-primary">
                      {goalGrade.toFixed(1)}
                    </p>
                  </div>
                </div>
                
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="font-medium text-muted-foreground">Progreso hacia la meta</span>
                    <span className="font-bold">{progress.toFixed(0)}%</span>
                  </div>
                  <Progress value={progress} className="h-2" />
                </div>
                {isAtRisk && current > 0 && (
                  <p className="text-xs text-orange-600 font-semibold flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    Necesita {(goalGrade - current).toFixed(2)} puntos
                  </p>
                )}
              </CardContent>
            </Card>
          );
        })}

        {pendingSubjects.length === 0 && subjects.length === 0 && (
          <div className="col-span-full py-16 flex flex-col items-center justify-center text-muted-foreground border-2 border-dashed rounded-2xl">
            <BookOpen className="w-12 h-12 mb-4 opacity-20" />
            <p className="text-lg font-medium">Aún no hay materias registradas.</p>
            <p className="text-sm mt-1">Añade tu primera materia para comenzar a medir tu progreso.</p>
          </div>
        )}
      </div>

      {completedSubjects.length > 0 && (
        <>
          <div>
            <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
              Materias Completadas ({completedSubjects.length})
            </h3>
          </div>
          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
            {completedSubjects.map(subject => {
              const current = Number(subject.currentGrade || 0);
              const progress = Math.min(100, Math.max(0, (current / goalGrade) * 100));
              return (
                <Card key={subject.id} className="glass-card hover-lift overflow-hidden group opacity-75">
                  <div className="h-2 w-full bg-green-600"></div>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-xl">{subject.name}</CardTitle>
                        <p className="text-xs text-muted-foreground mt-1 font-medium bg-secondary inline-block px-2 py-0.5 rounded-md">
                          Semestre {subject.semester}
                        </p>
                      </div>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => openEdit(subject)} className="p-1.5 text-muted-foreground hover:text-primary transition-colors">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button onClick={() => { if(confirm("¿Eliminar materia?")) deleteSubject.mutate(subject.id); }} className="p-1.5 text-muted-foreground hover:text-destructive transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-end justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground font-medium mb-1">Calificación Final</p>
                        <p className="text-3xl font-bold text-foreground">
                          {subject.currentGrade ? Number(subject.currentGrade).toFixed(1) : '-'}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground font-medium flex items-center gap-1 justify-end mb-1">
                          <CheckCircle2 className="w-3 h-3 text-green-600" /> Completada
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
