import { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { User, Moon, Sun, Save, Download, Upload, AlertTriangle } from "lucide-react";
import { Switch } from "@/components/ui/switch";
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

export default function Profile() {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [name, setName] = useState(localStorage.getItem("userName") || "Estudiante");
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [pendingImport, setPendingImport] = useState<any>(null);
  const [showImportConfirm, setShowImportConfirm] = useState(false);
  const [theme, setTheme] = useState(() => {
    if (typeof window !== "undefined") {
      return document.documentElement.classList.contains("dark") ? "dark" : "light";
    }
    return "light";
  });

  const handleSave = () => {
    localStorage.setItem("userName", name);
    toast({
      title: "Perfil actualizado",
      description: "Tus cambios han sido guardados correctamente.",
    });
  };

  const toggleTheme = (checked: boolean) => {
    const newTheme = checked ? "dark" : "light";
    setTheme(newTheme);
    if (newTheme === "dark") {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const [subjectsRes, tasksRes, eventsRes, classesRes] = await Promise.all([
        fetch("/api/subjects", { credentials: "include" }),
        fetch("/api/tasks", { credentials: "include" }),
        fetch("/api/events", { credentials: "include" }),
        fetch("/api/classes", { credentials: "include" }),
      ]);

      const [subjects, tasks, events, classes] = await Promise.all([
        subjectsRes.json(),
        tasksRes.json(),
        eventsRes.json(),
        classesRes.json(),
      ]);

      const exportData = {
        version: 1,
        exportedAt: new Date().toISOString(),
        preferences: {
          userName: localStorage.getItem("userName") || "Estudiante",
          goalGrade: localStorage.getItem("goalGrade") || "8.5",
          theme: localStorage.getItem("theme") || "light",
        },
        subjects,
        tasks,
        events,
        classes,
      };

      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `acadash-backup-${new Date().toISOString().split("T")[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: "Datos exportados",
        description: "Tu archivo de respaldo fue descargado correctamente.",
      });
    } catch (err) {
      toast({
        title: "Error al exportar",
        description: "No se pudo exportar los datos. Intenta de nuevo.",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target?.result as string);
        if (!data.version || !data.subjects) {
          toast({
            title: "Archivo inválido",
            description: "El archivo no tiene el formato correcto de AcaDash.",
            variant: "destructive",
          });
          return;
        }
        setPendingImport(data);
        setShowImportConfirm(true);
      } catch {
        toast({
          title: "Error al leer el archivo",
          description: "El archivo no es un JSON válido.",
          variant: "destructive",
        });
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const executeImport = async () => {
    if (!pendingImport) return;
    setIsImporting(true);
    setShowImportConfirm(false);

    try {
      const data = pendingImport;

      // Restore preferences
      if (data.preferences) {
        if (data.preferences.userName) localStorage.setItem("userName", data.preferences.userName);
        if (data.preferences.goalGrade) localStorage.setItem("goalGrade", data.preferences.goalGrade);
        if (data.preferences.theme) {
          localStorage.setItem("theme", data.preferences.theme);
          if (data.preferences.theme === "dark") {
            document.documentElement.classList.add("dark");
            setTheme("dark");
          } else {
            document.documentElement.classList.remove("dark");
            setTheme("light");
          }
          setName(data.preferences.userName || "Estudiante");
        }
      }

      // Import subjects and build ID mapping (old ID -> new ID)
      const subjectIdMap: Record<number, number> = {};
      for (const subject of data.subjects || []) {
        const { id, ...subjectData } = subject;
        const res = await fetch("/api/subjects", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(subjectData),
          credentials: "include",
        });
        if (res.ok) {
          const created = await res.json();
          subjectIdMap[id] = created.id;
        }
      }

      // Import classes with remapped subjectIds
      for (const cls of data.classes || []) {
        const { id, subjectId, ...classData } = cls;
        const mappedSubjectId = subjectIdMap[subjectId] ?? subjectId;
        await fetch("/api/classes", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...classData, subjectId: mappedSubjectId }),
          credentials: "include",
        });
      }

      // Import tasks with remapped subjectIds
      for (const task of data.tasks || []) {
        const { id, subjectId, ...taskData } = task;
        const mappedSubjectId = subjectId ? (subjectIdMap[subjectId] ?? subjectId) : null;
        await fetch("/api/tasks", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...taskData, subjectId: mappedSubjectId }),
          credentials: "include",
        });
      }

      // Import events (no subject references)
      for (const event of data.events || []) {
        const { id, ...eventData } = event;
        await fetch("/api/events", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(eventData),
          credentials: "include",
        });
      }

      toast({
        title: "Datos importados",
        description: `Se importaron ${data.subjects?.length ?? 0} materias, ${data.tasks?.length ?? 0} tareas, ${data.classes?.length ?? 0} clases y ${data.events?.length ?? 0} eventos.`,
      });

      // Reload the page to reflect imported data
      setTimeout(() => window.location.reload(), 1000);
    } catch (err) {
      toast({
        title: "Error al importar",
        description: "Ocurrió un error durante la importación. Algunos datos pueden haberse importado parcialmente.",
        variant: "destructive",
      });
    } finally {
      setIsImporting(false);
      setPendingImport(null);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Mi Perfil</h1>
        <p className="text-muted-foreground mt-1">Gestiona tu información y preferencias.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5 text-primary" />
              Información Personal
            </CardTitle>
            <CardDescription>Tu nombre aparecerá en el dashboard.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="rounded-xl"
                placeholder="Tu nombre"
              />
            </div>
            <Button onClick={handleSave} className="w-full rounded-xl transition-all active:scale-95">
              <Save className="w-4 h-4 mr-2" />
              Guardar Cambios
            </Button>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {theme === "dark" ? <Moon className="w-5 h-5 text-primary" /> : <Sun className="w-5 h-5 text-primary" />}
              Apariencia
            </CardTitle>
            <CardDescription>Personaliza cómo se ve la aplicación.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Modo Oscuro</Label>
                <p className="text-sm text-muted-foreground">Cambia entre tema claro y oscuro.</p>
              </div>
              <Switch
                checked={theme === "dark"}
                onCheckedChange={toggleTheme}
              />
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Download className="w-5 h-5 text-primary" />
              Exportar Datos
            </CardTitle>
            <CardDescription>
              Descarga un archivo con todos tus datos para respaldo o para cambiar de dispositivo.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={handleExport}
              disabled={isExporting}
              variant="outline"
              className="w-full rounded-xl transition-all active:scale-95"
            >
              <Download className="w-4 h-4 mr-2" />
              {isExporting ? "Exportando..." : "Descargar Respaldo"}
            </Button>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="w-5 h-5 text-primary" />
              Importar Datos
            </CardTitle>
            <CardDescription>
              Restaura tus datos desde un archivo de respaldo. Se agregarán a los datos existentes.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-start gap-2 p-3 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-700 dark:text-orange-400 text-sm">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <p>Los datos importados se añadirán a los existentes, no los reemplazarán.</p>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleFileSelected}
              className="hidden"
            />
            <Button
              onClick={() => fileInputRef.current?.click()}
              disabled={isImporting}
              variant="outline"
              className="w-full rounded-xl transition-all active:scale-95"
            >
              <Upload className="w-4 h-4 mr-2" />
              {isImporting ? "Importando..." : "Seleccionar Archivo"}
            </Button>
          </CardContent>
        </Card>
      </div>

      <AlertDialog open={showImportConfirm} onOpenChange={setShowImportConfirm}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>¿Importar datos?</AlertDialogTitle>
            <AlertDialogDescription>
              Se importarán {pendingImport?.subjects?.length ?? 0} materias,{" "}
              {pendingImport?.tasks?.length ?? 0} tareas,{" "}
              {pendingImport?.classes?.length ?? 0} clases y{" "}
              {pendingImport?.events?.length ?? 0} eventos desde el archivo.
              Esta acción se agregará a tus datos actuales.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={executeImport} className="rounded-xl">
              Importar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
