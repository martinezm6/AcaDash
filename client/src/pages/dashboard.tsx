import { useState, useEffect } from "react";
import { useTasks } from "@/hooks/use-tasks";
import { useClasses } from "@/hooks/use-classes";
import { useSubjects } from "@/hooks/use-subjects";
import { useEvents } from "@/hooks/use-events";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Calendar as CalendarUI } from "@/components/ui/calendar";
import { format, isToday, isTomorrow, addDays, isBefore } from "date-fns";
import { es } from "date-fns/locale";
import { CheckSquare, Clock, AlertCircle, TrendingUp, Calendar as CalIcon, MapPin, User } from "lucide-react";
import { Link } from "wouter";

export default function Dashboard() {
  const { data: tasks = [] } = useTasks();
  const { data: classes = [] } = useClasses();
  const { data: subjects = [] } = useSubjects();
  const { data: events = [] } = useEvents();
  const [time, setTime] = useState(new Date());
  const [goalGrade] = useState(() => {
    const saved = localStorage.getItem("goalGrade");
    return saved ? Number(saved) : 8.5;
  });

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const pendingTasks = tasks.filter(t => !t.completed);
  const urgentTasks = pendingTasks.filter(t => {
    const due = new Date(t.dueDate);
    return isBefore(due, addDays(new Date(), 3));
  }).sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());

  const today = new Date().getDay(); // 0 is Sunday, 1 is Monday
  const todayDayOfWeek = today === 0 ? 7 : today;
  const currentTimeStr = format(time, "HH:mm");
  
  const todayClasses = classes
    .filter(c => c.daysOfWeek && c.daysOfWeek.includes(todayDayOfWeek))
    .sort((a, b) => a.startTime.localeCompare(b.startTime));

  const nextClass = todayClasses.find(c => c.startTime >= currentTimeStr);

  const upcomingEvents = events
    .filter(e => new Date(e.date) >= new Date())
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 5);

  const avgGrade = subjects.length > 0 
    ? subjects.reduce((acc, s) => acc + Number(s.currentGrade || 0), 0) / subjects.length 
    : 0;

  const userName = localStorage.getItem("userName") || "Estudiante";

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="animate-in fade-in slide-in-from-left-4 duration-700">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground">¡Hola, {userName}! 👋</h1>
          <p className="text-muted-foreground mt-2 text-lg">Aquí tienes un resumen de tu actividad académica.</p>
        </div>
        <div className="px-4 py-2 rounded-2xl bg-primary/10 border border-primary/20 animate-in fade-in slide-in-from-right-4 duration-700">
          <p className="text-sm font-semibold text-primary">Promedio General: {avgGrade.toFixed(2)}</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Link href="/tasks">
          <Card className="glass-card hover-lift cursor-pointer transition-all hover:shadow-lg animate-in fade-in zoom-in-95 duration-500 delay-100">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Tareas Pendientes</CardTitle>
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <CheckSquare className="w-4 h-4 text-primary" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{pendingTasks.length}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {urgentTasks.length} para los próximos 3 días
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/schedule">
          <Card className="glass-card hover-lift cursor-pointer transition-all hover:shadow-lg animate-in fade-in zoom-in-95 duration-500 delay-200">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Clases Hoy</CardTitle>
              <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center">
                <Clock className="w-4 h-4 text-accent" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{todayClasses.length}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {nextClass ? `Siguiente: ${nextClass.startTime}` : todayClasses.length > 0 ? 'Clases terminadas' : 'Día libre'}
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/subjects">
          <Card className="glass-card hover-lift cursor-pointer transition-all hover:shadow-lg animate-in fade-in zoom-in-95 duration-500 delay-300">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Promedio Actual</CardTitle>
              <div className="w-8 h-8 rounded-full bg-green-500/10 flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-green-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{avgGrade.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Meta: {goalGrade.toFixed(1)}
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/calendar">
          <Card className="glass-card hover-lift cursor-pointer transition-all hover:shadow-lg animate-in fade-in zoom-in-95 duration-500 delay-400">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Próximos Eventos</CardTitle>
              <div className="w-8 h-8 rounded-full bg-orange-500/10 flex items-center justify-center">
                <CalIcon className="w-4 h-4 text-orange-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{upcomingEvents.length}</div>
              <p className="text-xs text-muted-foreground mt-1">
                En los próximos días
              </p>
            </CardContent>
          </Card>
        </Link>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2 space-y-6 animate-in fade-in slide-in-from-left-4 duration-700 delay-300">
          <Card className="glass-card">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Tu Día</CardTitle>
                  <CardDescription>Clases, horarios y eventos de hoy</CardDescription>
                </div>
                <Link href="/calendar" className="text-sm text-primary hover:underline font-medium">Ver calendario</Link>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <h3 className="font-semibold text-sm mb-4 flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Clases de Hoy ({todayClasses.length})
                  </h3>
                  {todayClasses.length === 0 ? (
                    <p className="text-sm text-muted-foreground italic">Día sin clases registradas.</p>
                  ) : (
                    <div className="space-y-4 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-border before:to-transparent">
                      {todayClasses.map((cls, idx) => {
                        const subject = subjects.find(s => s.id === cls.subjectId);
                        const isPast = cls.endTime < currentTimeStr;
                        const isCurrent = cls.startTime <= currentTimeStr && cls.endTime >= currentTimeStr;
                        
                        return (
                          <div key={cls.id} className={`relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group ${isPast ? 'opacity-50' : ''}`}>
                            <div className={`flex items-center justify-center w-10 h-10 rounded-full border-4 border-background ${isCurrent ? 'bg-primary text-white scale-110' : 'bg-primary/20 text-primary'} shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 transition-all duration-300`}>
                              <Clock className="w-4 h-4" />
                            </div>
                            <div className={`w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl border ${isCurrent ? 'border-primary bg-primary/5' : 'border-border/50 bg-card'} shadow-sm group-hover:shadow-md transition-all duration-300`}>
                              <div className="flex items-center justify-between mb-1">
                                <span className={`font-bold ${isCurrent ? 'text-primary' : ''}`}>{cls.startTime}</span>
                                <span className="text-xs font-medium text-muted-foreground">{cls.endTime}</span>
                              </div>
                              <h4 className="font-semibold text-sm">{subject?.name || 'Clase'}</h4>
                              {cls.room && <p className="text-xs text-muted-foreground mt-1">📍 {cls.room}</p>}
                              {cls.professor && <p className="text-xs text-muted-foreground">👨‍🏫 {cls.professor}</p>}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                <div>
                  <h3 className="font-semibold text-sm mb-4 flex items-center gap-2">
                    <CalIcon className="w-4 h-4" />
                    Próximos Eventos ({upcomingEvents.length})
                  </h3>
                  {upcomingEvents.length === 0 ? (
                    <p className="text-sm text-muted-foreground italic">No hay eventos próximos.</p>
                  ) : (
                    <div className="space-y-3">
                      {upcomingEvents.map(event => (
                        <div key={event.id} className="p-3 rounded-xl bg-secondary/30 border border-border/50 hover:bg-secondary/50 transition-colors">
                          <div className="flex items-start justify-between mb-1">
                            <h4 className="font-semibold text-sm">{event.title}</h4>
                            <span className={`text-xs font-semibold px-2 py-0.5 rounded-md ${event.type === 'academic' ? 'bg-primary/10 text-primary' : 'bg-accent/10 text-accent'}`}>
                              {event.type === 'academic' ? 'Académico' : 'Personal'}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {format(new Date(event.date), "d MMMM, HH:mm", { locale: es })}
                          </p>
                          {event.description && <p className="text-xs mt-1">{event.description}</p>}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card animate-in fade-in slide-in-from-up-4 duration-700 delay-500">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Tareas Urgentes</CardTitle>
                  <CardDescription>Para entregar en los próximos días</CardDescription>
                </div>
                <Link href="/tasks" className="text-sm text-primary hover:underline font-medium">Ver todas</Link>
              </div>
            </CardHeader>
            <CardContent>
              {urgentTasks.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center py-8 text-muted-foreground">
                  <CheckSquare className="w-12 h-12 mb-4 opacity-20" />
                  <p>¡Todo al día!</p>
                  <p className="text-sm">No hay tareas urgentes.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {urgentTasks.slice(0, 4).map(task => {
                    const subject = subjects.find(s => s.id === task.subjectId);
                    const isOverdue = isBefore(new Date(task.dueDate), new Date()) && !isToday(new Date(task.dueDate));
                    
                    return (
                      <div key={task.id} className="flex items-center justify-between p-3 rounded-xl bg-secondary/30 border border-border/50 hover:bg-secondary/50 transition-all duration-300">
                        <div className="flex items-start gap-3">
                          <AlertCircle className={`w-5 h-5 mt-0.5 ${isOverdue ? 'text-destructive' : 'text-orange-500'}`} />
                          <div>
                            <p className="font-medium text-sm">{task.title}</p>
                            <p className="text-xs text-muted-foreground">{subject?.name || 'General'}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className={`text-xs font-semibold px-2 py-1 rounded-md ${isOverdue ? 'bg-destructive/10 text-destructive' : 'bg-orange-500/10 text-orange-600'}`}>
                            {isToday(new Date(task.dueDate)) ? 'Hoy' : isTomorrow(new Date(task.dueDate)) ? 'Mañana' : format(new Date(task.dueDate), "d MMM", { locale: es })}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-700 delay-400">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-sm">Hora y Fecha</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">
                  {format(time, "HH:mm:ss")}
                </div>
                <p className="text-xs text-muted-foreground mt-1 text-capitalize">
                  {format(time, "EEEE, d MMMM", { locale: es })}
                </p>
              </div>
              <div className="rounded-xl overflow-hidden border border-border/50">
                <CalendarUI
                  mode="single"
                  selected={new Date()}
                  disabled={true}
                  className="w-full"
                  classNames={{
                    day_selected: "bg-primary text-primary-foreground rounded-lg",
                    day_today: "bg-accent/20 text-accent font-bold rounded-lg",
                  }}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
