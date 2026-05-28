import { useState } from "react";
import { useTasks, useCreateTask, useUpdateTask, useDeleteTask } from "@/hooks/use-tasks";
import { useSubjects } from "@/hooks/use-subjects";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { format, isBefore, isToday, addDays } from "date-fns";
import { es } from "date-fns/locale";
import { CalendarIcon, Plus, Trash2, Tag, Clock, CheckSquare } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Tasks() {
  const { data: tasks = [], isLoading } = useTasks();
  const { data: subjects = [] } = useSubjects();
  const createTask = useCreateTask();
  const updateTask = useUpdateTask();
  const deleteTask = useDeleteTask();
  const { toast } = useToast();

  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    subjectId: "none",
    dueDate: format(new Date(), "yyyy-MM-dd"),
  });

  const pendingTasks = tasks.filter(t => !t.completed).sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
  const completedTasks = tasks.filter(t => t.completed).sort((a, b) => new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime());

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const [year, month, day] = formData.dueDate.split('-').map(Number);
    const localDate = new Date(year, month - 1, day);
    createTask.mutate({
      title: formData.title,
      subjectId: formData.subjectId === "none" ? null : Number(formData.subjectId),
      dueDate: localDate.toISOString(),
    }, {
      onSuccess: () => {
        setIsOpen(false);
        setFormData({ title: "", subjectId: "none", dueDate: format(new Date(), "yyyy-MM-dd") });
        toast({ title: "Tarea creada", description: "La tarea se ha añadido a tu lista." });
      }
    });
  };

  const getStatusColor = (dueDateStr: string) => {
    const due = new Date(dueDateStr);
    if (isBefore(due, new Date()) && !isToday(due)) return "text-destructive bg-destructive/10 border-destructive/20";
    if (isBefore(due, addDays(new Date(), 3))) return "text-orange-600 bg-orange-500/10 border-orange-500/20";
    return "text-green-600 bg-green-500/10 border-green-500/20";
  };

  const getStatusText = (dueDateStr: string) => {
    const due = new Date(dueDateStr);
    if (isBefore(due, new Date()) && !isToday(due)) return "Atrasada";
    if (isToday(due)) return "Hoy";
    return format(due, "d MMM", { locale: es });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tareas</h1>
          <p className="text-muted-foreground mt-1">Organiza tus entregas y pendientes.</p>
        </div>
        
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button className="rounded-xl shadow-lg shadow-primary/20 hover:shadow-xl transition-all">
              <Plus className="w-5 h-5 mr-2" />
              Nueva Tarea
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md rounded-2xl">
            <DialogHeader>
              <DialogTitle>Añadir nueva tarea</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Título de la tarea</label>
                <Input 
                  required 
                  placeholder="Ej. Ensayo de Historia..."
                  value={formData.title}
                  onChange={e => setFormData({...formData, title: e.target.value})}
                  className="rounded-xl"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Materia</label>
                  <Select 
                    value={formData.subjectId} 
                    onValueChange={v => setFormData({...formData, subjectId: v})}
                  >
                    <SelectTrigger className="rounded-xl">
                      <SelectValue placeholder="Selecciona..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Ninguna</SelectItem>
                      {subjects.map(s => (
                        <SelectItem key={s.id} value={String(s.id)}>{s.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Fecha de entrega</label>
                  <Input 
                    type="date" 
                    required
                    value={formData.dueDate}
                    onChange={e => setFormData({...formData, dueDate: e.target.value})}
                    className="rounded-xl"
                  />
                </div>
              </div>
              <Button type="submit" className="w-full rounded-xl" disabled={createTask.isPending}>
                {createTask.isPending ? "Guardando..." : "Guardar tarea"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-2 space-y-6">
          <div>
            <h3 className="text-lg font-semibold flex items-center gap-2 mb-4">
              <Clock className="w-5 h-5 text-primary" />
              Pendientes ({pendingTasks.length})
            </h3>
            {pendingTasks.length === 0 ? (
              <Card className="glass-card border-dashed border-2 bg-transparent">
                <CardContent className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                  <CheckSquare className="w-12 h-12 mb-4 opacity-20" />
                  <p>¡Todo listo! No tienes tareas pendientes.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {pendingTasks.map(task => {
                  const subject = subjects.find(s => s.id === task.subjectId);
                  return (
                    <Card key={task.id} className="group overflow-hidden transition-all hover:shadow-md hover:border-primary/30 border-l-4 border-l-primary">
                      <div className="p-4 flex items-center gap-4">
                        <Checkbox 
                          checked={task.completed} 
                          onCheckedChange={(checked) => {
                            updateTask.mutate({ id: task.id, completed: checked as boolean }, {
                              onSuccess: () => toast({ description: "Tarea completada 🎉" })
                            })
                          }}
                          className="w-5 h-5 rounded-md data-[state=checked]:bg-green-500 data-[state=checked]:border-green-500"
                        />
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-foreground truncate">{task.title}</h4>
                          <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                            {subject && (
                              <span className="flex items-center gap-1">
                                <Tag className="w-3 h-3" /> {subject.name}
                              </span>
                            )}
                            <span className="flex items-center gap-1">
                              <CalendarIcon className="w-3 h-3" /> 
                              {format(new Date(task.dueDate), "PPP", { locale: es })}
                            </span>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <span className={`px-2.5 py-1 text-xs font-bold rounded-md border ${getStatusColor(task.dueDate)}`}>
                            {getStatusText(task.dueDate)}
                          </span>
                          <button 
                            onClick={() => {
                              if(confirm("¿Eliminar tarea?")) deleteTask.mutate(task.id);
                            }}
                            className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive p-1"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </Card>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold flex items-center gap-2 mb-4 text-muted-foreground">
              <CheckSquare className="w-5 h-5" />
              Completadas ({completedTasks.length})
            </h3>
            <div className="space-y-3 opacity-60">
              {completedTasks.slice(0, 5).map(task => (
                <div key={task.id} className="flex items-center gap-3 p-3 bg-secondary/30 rounded-xl border border-border/50">
                  <Checkbox 
                    checked={true}
                    onCheckedChange={(checked) => {
                      updateTask.mutate({ id: task.id, completed: checked as boolean })
                    }}
                    className="w-4 h-4 rounded-sm data-[state=checked]:bg-muted-foreground data-[state=checked]:border-muted-foreground"
                  />
                  <span className="text-sm line-through truncate">{task.title}</span>
                </div>
              ))}
              {completedTasks.length > 5 && (
                <p className="text-xs text-center text-muted-foreground">Y {completedTasks.length - 5} más...</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
