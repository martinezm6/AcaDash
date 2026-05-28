import { useState } from "react";
import { useEvents, useCreateEvent, useDeleteEvent } from "@/hooks/use-events";
import { useTasks } from "@/hooks/use-tasks";
import { Calendar as CalendarUI } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format, isSameDay } from "date-fns";
import { es } from "date-fns/locale";
import { Plus, Trash2, CalendarIcon, CheckSquare } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function CalendarApp() {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const { data: events = [] } = useEvents();
  const { data: tasks = [] } = useTasks();
  const createEvent = useCreateEvent();
  const deleteEvent = useDeleteEvent();
  const { toast } = useToast();

  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    date: format(new Date(), "yyyy-MM-dd"),
    type: "custom",
    description: "",
  });

  const selectedDateEvents = events.filter(e => date && isSameDay(new Date(e.date), date));
  const selectedDateTasks = tasks.filter(t => date && isSameDay(new Date(t.dueDate), date));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const [year, month, day] = formData.date.split('-').map(Number);
    const localDate = new Date(year, month - 1, day);
    createEvent.mutate({
      title: formData.title,
      date: localDate.toISOString(),
      type: formData.type,
      description: formData.description || null,
    }, {
      onSuccess: () => {
        setIsOpen(false);
        setFormData({ title: "", date: format(date || new Date(), "yyyy-MM-dd"), type: "custom", description: "" });
        toast({ title: "Evento guardado" });
      }
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Calendario</h1>
          <p className="text-muted-foreground mt-1">Tus eventos y fechas de entrega.</p>
        </div>
        
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button className="rounded-xl shadow-lg shadow-primary/20">
              <Plus className="w-5 h-5 mr-2" />
              <span className="hidden sm:inline">Nuevo Evento</span>
              <span className="sm:hidden">Nuevo</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md rounded-2xl">
            <DialogHeader>
              <DialogTitle>Programar Evento</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Título</label>
                <Input required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="rounded-xl"/>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Fecha</label>
                  <Input type="date" required value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} className="rounded-xl"/>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Tipo</label>
                  <Select value={formData.type} onValueChange={v => setFormData({...formData, type: v})}>
                    <SelectTrigger className="rounded-xl"><SelectValue/></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="academic">Académico</SelectItem>
                      <SelectItem value="custom">Personal</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Descripción (Opcional)</label>
                <Input value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="rounded-xl"/>
              </div>
              <Button type="submit" className="w-full rounded-xl" disabled={createEvent.isPending}>
                Guardar
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Responsive layout: calendar stacks above on mobile */}
      <div className="grid gap-6 lg:grid-cols-[auto_1fr]">
        <Card className="glass-card h-fit">
          <CardContent className="p-2 sm:p-3">
            {/* Allow horizontal scroll on very narrow viewports */}
            <div className="overflow-x-auto">
              <div className="min-w-[280px]">
                <CalendarUI
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  className="rounded-xl"
                  classNames={{
                    cell: "h-9 w-9 text-center text-sm p-0 relative focus-within:relative focus-within:z-20",
                    day: "h-9 w-9 p-0 font-normal rounded-full hover:bg-muted transition-all flex items-center justify-center",
                    day_selected: "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground rounded-full",
                    day_today: "bg-accent/20 text-accent font-bold rounded-full",
                    day_outside: "text-muted-foreground opacity-50",
                  }}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card min-h-[400px]">
          <CardHeader className="border-b border-border/50 pb-4">
            <CardTitle className="text-xl flex items-center gap-2">
              <CalendarIcon className="w-5 h-5 text-primary shrink-0" />
              <span className="truncate">
                {date ? format(date, "EEEE, d 'de' MMMM", { locale: es }) : "Selecciona una fecha"}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 space-y-6">
            
            <div>
              <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider mb-4">Eventos programados</h3>
              {selectedDateEvents.length === 0 ? (
                <p className="text-sm text-muted-foreground italic pl-2 border-l-2 border-border">No hay eventos para este día.</p>
              ) : (
                <div className="space-y-3">
                  {selectedDateEvents.map(event => (
                    <div key={event.id} className="flex items-start justify-between p-4 rounded-xl bg-secondary/30 border border-border/50 group">
                      <div className="flex gap-3 min-w-0">
                        <div className={`w-2 h-10 rounded-full shrink-0 ${event.type === 'academic' ? 'bg-primary' : 'bg-accent'}`}></div>
                        <div className="min-w-0">
                          <p className="font-semibold text-foreground leading-none mb-1.5 truncate">{event.title}</p>
                          {event.description && <p className="text-sm text-muted-foreground">{event.description}</p>}
                        </div>
                      </div>
                      <button 
                        onClick={() => { if(confirm("¿Eliminar evento?")) deleteEvent.mutate(event.id); }}
                        className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive p-2 shrink-0"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="pt-2">
              <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider mb-4 flex items-center gap-2">
                <CheckSquare className="w-4 h-4" />
                Tareas por entregar
              </h3>
              {selectedDateTasks.length === 0 ? (
                <p className="text-sm text-muted-foreground italic pl-2 border-l-2 border-border">Sin fechas límite para hoy.</p>
              ) : (
                <div className="space-y-3">
                  {selectedDateTasks.map(task => (
                    <div key={task.id} className={`flex items-center p-3 rounded-xl border ${task.completed ? 'bg-muted/50 border-transparent opacity-60' : 'bg-card border-orange-500/30 shadow-sm'}`}>
                      <div className="w-2 h-2 rounded-full bg-orange-500 mr-3 shrink-0"></div>
                      <p className={`font-medium text-sm ${task.completed ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                        {task.title}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </CardContent>
        </Card>
      </div>
    </div>
  );
}
