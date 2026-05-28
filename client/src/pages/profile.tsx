import { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { User, Moon, Sun, Save, Download, Upload, AlertTriangle, Trash2, Bell, BellOff, Camera, Check, Type } from "lucide-react";
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

const PALETTES = [
  { id: "indigo", label: "Índigo", light: "#6366f1", dark: "#818cf8" },
  { id: "emerald", label: "Esmeralda", light: "#10b981", dark: "#34d399" },
  { id: "rose", label: "Rosa", light: "#f43f5e", dark: "#fb7185" },
  { id: "amber", label: "Ámbar", light: "#f59e0b", dark: "#fbbf24" },
  { id: "sky", label: "Cielo", light: "#0ea5e9", dark: "#38bdf8" },
];

const FONT_SIZES = [
  { id: "normal", label: "Normal", cls: "text-sm" },
  { id: "large", label: "Grande", cls: "text-base" },
  { id: "xl", label: "Muy Grande", cls: "text-lg" },
];

// Notification API is NOT available in iOS Safari
const notifSupported = typeof Notification !== "undefined";

function resizeImageToBase64(file: File, size = 200): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext("2d")!;
      const min = Math.min(img.width, img.height);
      const sx = (img.width - min) / 2;
      const sy = (img.height - min) / 2;
      ctx.drawImage(img, sx, sy, min, min, 0, 0, size, size);
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL("image/jpeg", 0.8));
    };
    img.onerror = reject;
    img.src = url;
  });
}

export default function Profile() {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState(localStorage.getItem("userName") || "Estudiante");
  const [photo, setPhoto] = useState<string | null>(localStorage.getItem("profilePhoto"));
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [pendingImport, setPendingImport] = useState<any>(null);
  const [showImportConfirm, setShowImportConfirm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [notifEnabled, setNotifEnabled] = useState(localStorage.getItem("notificationsEnabled") === "true");
  const [fontSize, setFontSize] = useState<string>(localStorage.getItem("fontSize") || "normal");

  const [theme, setTheme] = useState<string>(() =>
    document.documentElement.classList.contains("dark") ? "dark" : "light"
  );
  const [palette, setPalette] = useState<string>(
    localStorage.getItem("colorPalette") || "indigo"
  );

  const handleSave = () => {
    localStorage.setItem("userName", name);
    toast({ title: "Perfil actualizado", description: "Tu nombre ha sido guardado." });
  };

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const base64 = await resizeImageToBase64(file);
      localStorage.setItem("profilePhoto", base64);
      setPhoto(base64);
      toast({ title: "Foto actualizada", description: "Tu foto de perfil ha sido guardada." });
    } catch {
      toast({ title: "Error", description: "No se pudo procesar la imagen.", variant: "destructive" });
    }
    if (photoInputRef.current) photoInputRef.current.value = "";
  };

  const removePhoto = () => {
    localStorage.removeItem("profilePhoto");
    setPhoto(null);
  };

  const toggleTheme = (checked: boolean) => {
    const newTheme = checked ? "dark" : "light";
    setTheme(newTheme);
    document.documentElement.classList.toggle("dark", checked);
    localStorage.setItem("theme", newTheme);
  };

  const applyPalette = (id: string) => {
    setPalette(id);
    localStorage.setItem("colorPalette", id);
    if (id === "indigo") {
      document.documentElement.removeAttribute("data-palette");
    } else {
      document.documentElement.setAttribute("data-palette", id);
    }
  };

  const applyFontSize = (size: string) => {
    setFontSize(size);
    localStorage.setItem("fontSize", size);
    document.documentElement.classList.remove("font-large", "font-xl");
    if (size === "large") document.documentElement.classList.add("font-large");
    else if (size === "xl") document.documentElement.classList.add("font-xl");
  };

  const toggleNotifications = async (checked: boolean) => {
    if (!notifSupported) {
      toast({
        title: "No disponible",
        description: "Las notificaciones del navegador no están disponibles en este dispositivo.",
        variant: "destructive",
      });
      return;
    }
    if (checked) {
      if (Notification.permission === "denied") {
        toast({
          title: "Permiso denegado",
          description: "Activa las notificaciones en la configuración de tu navegador.",
          variant: "destructive",
        });
        return;
      }
      if (Notification.permission !== "granted") {
        const result = await Notification.requestPermission();
        if (result !== "granted") {
          toast({ title: "Permiso denegado", variant: "destructive" });
          return;
        }
      }
      localStorage.setItem("notificationsEnabled", "true");
      setNotifEnabled(true);
      toast({ title: "Notificaciones activadas", description: "Recibirás alertas de clases, tareas y eventos." });
    } else {
      localStorage.setItem("notificationsEnabled", "false");
      setNotifEnabled(false);
      toast({ title: "Notificaciones desactivadas" });
    }
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const [sRes, tRes, eRes, cRes] = await Promise.all([
        fetch("/api/subjects", { credentials: "include" }),
        fetch("/api/tasks", { credentials: "include" }),
        fetch("/api/events", { credentials: "include" }),
        fetch("/api/classes", { credentials: "include" }),
      ]);
      const [subjects, tasks, events, classes] = await Promise.all([sRes.json(), tRes.json(), eRes.json(), cRes.json()]);
      const exportData = {
        version: 1,
        exportedAt: new Date().toISOString(),
        preferences: {
          userName: localStorage.getItem("userName") || "Estudiante",
          goalGrade: localStorage.getItem("goalGrade") || "8.5",
          theme: localStorage.getItem("theme") || "light",
          colorPalette: localStorage.getItem("colorPalette") || "indigo",
          fontSize: localStorage.getItem("fontSize") || "normal",
        },
        subjects, tasks, events, classes,
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
      toast({ title: "Datos exportados", description: "Tu respaldo fue descargado correctamente." });
    } catch {
      toast({ title: "Error al exportar", variant: "destructive" });
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
          toast({ title: "Archivo inválido", variant: "destructive" });
          return;
        }
        setPendingImport(data);
        setShowImportConfirm(true);
      } catch {
        toast({ title: "Error al leer el archivo", variant: "destructive" });
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
      if (data.preferences) {
        if (data.preferences.userName) { localStorage.setItem("userName", data.preferences.userName); setName(data.preferences.userName); }
        if (data.preferences.goalGrade) localStorage.setItem("goalGrade", data.preferences.goalGrade);
        if (data.preferences.theme) { toggleTheme(data.preferences.theme === "dark"); }
        if (data.preferences.colorPalette) applyPalette(data.preferences.colorPalette);
        if (data.preferences.fontSize) applyFontSize(data.preferences.fontSize);
      }
      const subjectIdMap: Record<number, number> = {};
      for (const subject of data.subjects || []) {
        const { id, ...subjectData } = subject;
        const res = await fetch("/api/subjects", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(subjectData), credentials: "include" });
        if (res.ok) { const created = await res.json(); subjectIdMap[id] = created.id; }
      }
      for (const cls of data.classes || []) {
        const { id, subjectId, ...classData } = cls;
        await fetch("/api/classes", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...classData, subjectId: subjectIdMap[subjectId] ?? subjectId }), credentials: "include" });
      }
      for (const task of data.tasks || []) {
        const { id, subjectId, ...taskData } = task;
        await fetch("/api/tasks", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...taskData, subjectId: subjectId ? (subjectIdMap[subjectId] ?? subjectId) : null }), credentials: "include" });
      }
      for (const event of data.events || []) {
        const { id, ...eventData } = event;
        await fetch("/api/events", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(eventData), credentials: "include" });
      }
      toast({ title: "Datos importados" });
      setTimeout(() => window.location.reload(), 1000);
    } catch {
      toast({ title: "Error al importar", variant: "destructive" });
    } finally {
      setIsImporting(false);
      setPendingImport(null);
    }
  };

  const handleDeleteAll = async () => {
    setIsDeleting(true);
    setShowDeleteConfirm(false);
    try {
      const [sRes, tRes, eRes, cRes] = await Promise.all([
        fetch("/api/subjects", { credentials: "include" }),
        fetch("/api/tasks", { credentials: "include" }),
        fetch("/api/events", { credentials: "include" }),
        fetch("/api/classes", { credentials: "include" }),
      ]);
      const [subjects, tasks, events, classes] = await Promise.all([sRes.json(), tRes.json(), eRes.json(), cRes.json()]);
      await Promise.all([
        ...subjects.map((s: any) => fetch(`/api/subjects/${s.id}`, { method: "DELETE", credentials: "include" })),
        ...tasks.map((t: any) => fetch(`/api/tasks/${t.id}`, { method: "DELETE", credentials: "include" })),
        ...events.map((e: any) => fetch(`/api/events/${e.id}`, { method: "DELETE", credentials: "include" })),
        ...classes.map((c: any) => fetch(`/api/classes/${c.id}`, { method: "DELETE", credentials: "include" })),
      ]);
      localStorage.removeItem("goalGrade");
      toast({ title: "Datos eliminados", description: "Todos tus datos han sido borrados." });
      setTimeout(() => window.location.reload(), 1000);
    } catch {
      toast({ title: "Error al eliminar", variant: "destructive" });
    } finally {
      setIsDeleting(false);
    }
  };

  const isDark = theme === "dark";
  const notifDenied = notifSupported && Notification.permission === "denied";

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Mi Perfil</h1>
        <p className="text-muted-foreground mt-1">Gestiona tu información y preferencias.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">

        {/* Personal info + photo */}
        <Card className="glass-card md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5 text-primary" />
              Información Personal
            </CardTitle>
            <CardDescription>Tu nombre y foto aparecerán en el dashboard.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="relative group shrink-0">
                <div
                  onClick={() => photoInputRef.current?.click()}
                  className="w-24 h-24 rounded-full overflow-hidden cursor-pointer ring-4 ring-primary/20 hover:ring-primary/50 transition-all"
                >
                  {photo ? (
                    <img src={photo} alt="Perfil" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-tr from-primary to-accent flex items-center justify-center text-white text-2xl font-bold">
                      {name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Camera className="w-6 h-6 text-white" />
                  </div>
                </div>
                {photo && (
                  <button
                    onClick={removePhoto}
                    className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center hover:opacity-90 transition-opacity shadow-md"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                )}
                <input ref={photoInputRef} type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" />
              </div>
              <div className="flex-1 space-y-3 w-full">
                <div className="space-y-1">
                  <Label htmlFor="name">Nombre</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="rounded-xl"
                    placeholder="Tu nombre"
                  />
                </div>
                <Button onClick={handleSave} className="rounded-xl transition-all active:scale-95">
                  <Save className="w-4 h-4 mr-2" />
                  Guardar Nombre
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Apariencia */}
        <Card className="glass-card md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {isDark ? <Moon className="w-5 h-5 text-primary" /> : <Sun className="w-5 h-5 text-primary" />}
              Apariencia
            </CardTitle>
            <CardDescription>Modo oscuro, paleta de colores y tamaño de texto.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Dark mode */}
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Modo Oscuro</Label>
                <p className="text-sm text-muted-foreground">Cambia entre tema claro y oscuro.</p>
              </div>
              <Switch checked={isDark} onCheckedChange={toggleTheme} />
            </div>

            {/* Color palette */}
            <div className="space-y-3">
              <Label>Paleta de Colores</Label>
              <div className="flex gap-3 flex-wrap">
                {PALETTES.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => applyPalette(p.id)}
                    title={p.label}
                    className="flex flex-col items-center gap-1.5"
                  >
                    <div
                      className={`w-10 h-10 rounded-full shadow-md transition-all ring-2 ring-offset-2 ring-offset-card flex items-center justify-center ${palette === p.id ? "ring-foreground scale-110" : "ring-transparent"}`}
                      style={{ background: `linear-gradient(135deg, ${p.light}, ${p.dark})` }}
                    >
                      {palette === p.id && <Check className="w-4 h-4 text-white drop-shadow" />}
                    </div>
                    <span className={`text-xs font-medium ${palette === p.id ? "text-foreground" : "text-muted-foreground"}`}>
                      {p.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Font size */}
            <div className="space-y-3">
              <Label className="flex items-center gap-2">
                <Type className="w-4 h-4" />
                Tamaño de Texto
              </Label>
              <div className="flex gap-3">
                {FONT_SIZES.map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => applyFontSize(opt.id)}
                    className={`flex-1 py-3 px-2 rounded-xl border-2 transition-all text-center ${fontSize === opt.id ? "border-primary bg-primary/10 text-primary font-semibold" : "border-border hover:border-primary/50 text-muted-foreground"}`}
                  >
                    <div className={`font-bold ${opt.cls}`}>Aa</div>
                    <p className="text-xs mt-1">{opt.label}</p>
                  </button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notificaciones */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {notifEnabled ? <Bell className="w-5 h-5 text-primary" /> : <BellOff className="w-5 h-5 text-muted-foreground" />}
              Notificaciones
            </CardTitle>
            <CardDescription>Alertas del navegador para clases, tareas y eventos.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {!notifSupported ? (
              <div className="p-3 rounded-xl bg-muted/50 border border-border text-sm text-muted-foreground">
                Las notificaciones no están disponibles en este navegador/dispositivo.
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Activar Notificaciones</Label>
                    <p className="text-sm text-muted-foreground">10 min antes de clases · día de tareas y eventos.</p>
                  </div>
                  <Switch checked={notifEnabled} onCheckedChange={toggleNotifications} />
                </div>
                {notifEnabled && (
                  <div className="p-3 rounded-xl bg-primary/5 border border-primary/20 text-sm text-primary">
                    ✅ Activas. Mantén el navegador abierto para recibir alertas.
                  </div>
                )}
                {notifDenied && (
                  <div className="p-3 rounded-xl bg-destructive/5 border border-destructive/20 text-sm text-destructive">
                    ⚠️ Bloqueadas por el navegador. Habilítalas en Configuración del sitio.
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>

        {/* Exportar */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Download className="w-5 h-5 text-primary" />
              Exportar / Importar
            </CardTitle>
            <CardDescription>Descarga un respaldo o restaura desde un archivo.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button onClick={handleExport} disabled={isExporting} variant="outline" className="w-full rounded-xl transition-all active:scale-95">
              <Download className="w-4 h-4 mr-2" />
              {isExporting ? "Exportando..." : "Descargar Respaldo (.json)"}
            </Button>
            <div className="flex items-start gap-2 p-3 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-700 dark:text-orange-400 text-sm">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <p>Los datos importados se añadirán a los existentes.</p>
            </div>
            <input ref={fileInputRef} type="file" accept=".json" onChange={handleFileSelected} className="hidden" />
            <Button onClick={() => fileInputRef.current?.click()} disabled={isImporting} variant="outline" className="w-full rounded-xl transition-all active:scale-95">
              <Upload className="w-4 h-4 mr-2" />
              {isImporting ? "Importando..." : "Importar Archivo"}
            </Button>
          </CardContent>
        </Card>

        {/* Zona de peligro */}
        <Card className="glass-card md:col-span-2 border-destructive/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <Trash2 className="w-5 h-5" />
              Zona de Peligro
            </CardTitle>
            <CardDescription>Acciones irreversibles. Procede con cuidado.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-4 rounded-xl border border-destructive/20 bg-destructive/5">
              <div>
                <p className="font-semibold text-sm">Borrar todos los datos</p>
                <p className="text-sm text-muted-foreground mt-0.5">Elimina permanentemente materias, tareas, clases y eventos.</p>
              </div>
              <Button
                variant="destructive"
                onClick={() => setShowDeleteConfirm(true)}
                disabled={isDeleting}
                className="rounded-xl shrink-0 transition-all active:scale-95"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                {isDeleting ? "Borrando..." : "Borrar Todo"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>¿Borrar todos los datos?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción eliminará permanentemente todas tus materias, tareas, clases y eventos. <strong>No se puede deshacer.</strong> Te recomendamos exportar un respaldo antes.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteAll} className="rounded-xl bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Sí, borrar todo
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showImportConfirm} onOpenChange={setShowImportConfirm}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>¿Importar datos?</AlertDialogTitle>
            <AlertDialogDescription>
              Se importarán {pendingImport?.subjects?.length ?? 0} materias, {pendingImport?.tasks?.length ?? 0} tareas, {pendingImport?.classes?.length ?? 0} clases y {pendingImport?.events?.length ?? 0} eventos.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={executeImport} className="rounded-xl">Importar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
