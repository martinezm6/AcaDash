import { useState } from "react";
import { useClasses, useCreateClass, useDeleteClass } from "@/hooks/use-classes";
import { useSubjects } from "@/hooks/use-subjects";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2, MapPin, User, Clock, Info } from "lucide-react";
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";

const DAYS = [
  { id: 1, name: "Lunes" },
  { id: 2, name: "Martes" },
  { id: 3, name: "Miércoles" },
  { id: 4, name: "Jueves" },
  { id: 5, name: "Viernes" },
  { id: 6, name: "Sábado" },
];

export default function Schedule() {
  const { data: classes = [] } = useClasses();
  const { data: subjects = [] } = useSubjects();
  const createClass = useCreateClass();
  const deleteClass = useDeleteClass();
  const { toast } = useToast();

  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    subjectId: "",
    daysOfWeek: [1],
    startTime: "08:00",
    endTime: "10:00",
    room: "",
    professor: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.subjectId) return alert("Selecciona una materia");
    if (formData.daysOfWeek.length === 0) return alert("Selecciona al menos un día");
    
    createClass.mutate({
      subjectId: Number(formData.subjectId),
      daysOfWeek: formData.daysOfWeek,
      startTime: formData.startTime,
      endTime: formData.endTime,
      room: formData.room || null,
      professor: formData.professor || null,
    }, {
      onSuccess: () => {
        setIsOpen(false);
        setFormData({
          subjectId: "",
          daysOfWeek: [1],
          startTime: "08:00",
          endTime: "10:00",
          room: "",
          professor: "",
        });
        toast({ title: "Clase guardada", description: "El horario se ha actualizado." });
      }
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Horario</h1>
          <p className="text-muted-foreground mt-1">Tu semana de un vistazo.</p>
        </div>
        
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button className="rounded-xl shadow-lg shadow-primary/20">
              <Plus className="w-5 h-5 mr-2" />
              Nueva Clase
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md rounded-2xl">
            <DialogHeader>
              <DialogTitle>Añadir Clase al Horario</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Materia</label>
                {subjects.length === 0 ? (
                  <div className="flex flex-col items-center gap-3 p-4 rounded-xl bg-orange-500/10 border border-orange-500/20 text-center">
                    <Info className="w-5 h-5 text-orange-500" />
                    <p className="text-sm text-orange-700 dark:text-orange-400 font-medium">
                      No tienes materias registradas todavía.
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Primero crea tus materias en la sección de Materias y Calificaciones.
                    </p>
                    <Link href="/subjects">
                      <span className="text-xs font-semibold text-primary underline cursor-pointer hover:opacity-80">
                        Ir a Materias →
                      </span>
                    </Link>
                  </div>
                ) : (
                  <>
                    <Select required value={formData.subjectId} onValueChange={v => setFormData({...formData, subjectId: v})}>
                      <SelectTrigger className="rounded-xl">
                        <SelectValue placeholder="Selecciona..." />
                      </SelectTrigger>
                      <SelectContent>
                        {subjects.map(s => <SelectItem key={s.id} value={String(s.id)}>{s.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground flex items-center gap-1.5 pt-0.5">
                      <Info className="w-3.5 h-3.5 shrink-0" />
                      ¿No encuentras tu materia?{" "}
                      <Link href="/subjects">
                        <span className="text-primary underline cursor-pointer hover:opacity-80 font-medium">Créala primero aquí</span>
                      </Link>
                    </p>
                  </>
                )}
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Días de la semana</label>
                <div className="grid grid-cols-2 gap-2 p-2 border border-border/50 rounded-xl bg-secondary/30">
                  {DAYS.map(d => (
                    <button
                      key={d.id}
                      type="button"
                      onClick={() => {
                        if (formData.daysOfWeek.includes(d.id)) {
                          setFormData({...formData, daysOfWeek: formData.daysOfWeek.filter(day => day !== d.id)});
                        } else {
                          setFormData({...formData, daysOfWeek: [...formData.daysOfWeek, d.id].sort()});
                        }
                      }}
                      className={`py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                        formData.daysOfWeek.includes(d.id)
                          ? "bg-primary text-primary-foreground shadow-md"
                          : "bg-background border border-border/50 text-muted-foreground hover:border-primary/30"
                      }`}
                    >
                      {d.name.slice(0, 3)}
                    </button>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Hora Inicio</label>
                  <Input type="time" required value={formData.startTime} onChange={e => setFormData({...formData, startTime: e.target.value})} className="rounded-xl"/>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Hora Fin</label>
                  <Input type="time" required value={formData.endTime} onChange={e => setFormData({...formData, endTime: e.target.value})} className="rounded-xl"/>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Salón (Opcional)</label>
                  <Input value={formData.room} onChange={e => setFormData({...formData, room: e.target.value})} className="rounded-xl"/>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Profesor (Opcional)</label>
                  <Input value={formData.professor} onChange={e => setFormData({...formData, professor: e.target.value})} className="rounded-xl"/>
                </div>
              </div>
              <Button type="submit" className="w-full rounded-xl" disabled={createClass.isPending}>
                Guardar Clase
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="bg-card rounded-2xl border border-border/50 shadow-sm overflow-x-auto p-4 lg:p-6">
        <div className="min-w-[800px] grid grid-cols-6 gap-4">
          {DAYS.map(day => (
            <div key={day.id} className="flex flex-col gap-3">
              <div className="text-center font-semibold pb-2 border-b border-border/50 sticky top-0 bg-card z-10 text-primary">
                {day.name}
              </div>
              <div className="flex flex-col gap-3">
                {classes
                  .filter(c => c.daysOfWeek && c.daysOfWeek.includes(day.id))
                  .sort((a, b) => a.startTime.localeCompare(b.startTime))
                  .map(cls => {
                    const subject = subjects.find(s => s.id === cls.subjectId);
                    return (
                      <div key={cls.id} className="group relative bg-secondary/50 rounded-xl p-3 border border-border/50 hover:border-primary/30 hover:shadow-md transition-all">
                        <button 
                          onClick={() => { if(confirm("¿Eliminar esta clase?")) deleteClass.mutate(cls.id); }}
                          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-opacity bg-background/80 p-1 rounded-md backdrop-blur-sm"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                        <div className="flex items-center gap-1.5 text-xs font-bold text-primary mb-1">
                          <Clock className="w-3 h-3" />
                          {cls.startTime} - {cls.endTime}
                        </div>
                        <div className="font-semibold text-sm leading-tight mb-2 text-foreground">
                          {subject?.name || "Clase"}
                        </div>
                        {cls.room && (
                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-1">
                            <MapPin className="w-3 h-3 shrink-0" /> <span className="truncate">{cls.room}</span>
                          </div>
                        )}
                        {cls.professor && (
                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-0.5">
                            <User className="w-3 h-3 shrink-0" /> <span className="truncate">{cls.professor}</span>
                          </div>
                        )}
                      </div>
                    )
                  })}
                {classes.filter(c => c.daysOfWeek && c.daysOfWeek.includes(day.id)).length === 0 && (
                  <div className="h-24 rounded-xl border-2 border-dashed border-border/50 flex items-center justify-center text-xs text-muted-foreground/50 font-medium">
                    Libre
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
