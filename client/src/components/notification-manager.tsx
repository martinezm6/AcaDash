import { useEffect } from "react";
import { format } from "date-fns";

export function NotificationManager() {
  useEffect(() => {
    const runCheck = async () => {
      const enabled = localStorage.getItem("notificationsEnabled") === "true";
      if (!enabled || Notification.permission !== "granted") return;

      const now = new Date();
      const today = format(now, "yyyy-MM-dd");

      const firedKey = `notifFired_${today}`;
      const fired: string[] = JSON.parse(localStorage.getItem(firedKey) || "[]");
      let newFired = [...fired];

      const notify = (key: string, title: string, body: string) => {
        if (fired.includes(key)) return;
        new Notification(title, { body, icon: "/favicon.ico", badge: "/favicon.ico" });
        newFired.push(key);
      };

      try {
        // ── Classes starting soon (within 5 minutes) ──
        const [classesRes, subjectsRes] = await Promise.all([
          fetch("/api/classes", { credentials: "include" }),
          fetch("/api/subjects", { credentials: "include" }),
        ]);
        const classes = await classesRes.json();
        const subjects = await subjectsRes.json();

        const todayDow = now.getDay() === 0 ? 7 : now.getDay();
        const todayClasses = classes.filter((c: any) => c.daysOfWeek?.includes(todayDow));

        for (const cls of todayClasses) {
          const [h, m] = cls.startTime.split(":").map(Number);
          const classStart = new Date(now);
          classStart.setHours(h, m, 0, 0);
          const diffMin = (classStart.getTime() - now.getTime()) / 60000;

          if (diffMin >= 0 && diffMin <= 10) {
            const subject = subjects.find((s: any) => s.id === cls.subjectId);
            const label = subject?.name || "Clase";
            const room = cls.room ? ` · ${cls.room}` : "";
            notify(
              `class_${cls.id}_${today}`,
              "🎓 Clase en 10 minutos",
              `${label} a las ${cls.startTime}${room}`
            );
          }
        }
      } catch {}

      try {
        // ── Tasks due today ──
        if (now.getHours() >= 7) {
          const tasksRes = await fetch("/api/tasks", { credentials: "include" });
          const tasks = await tasksRes.json();
          const pending = tasks.filter((t: any) => !t.completed);

          for (const task of pending) {
            const dueStr = format(new Date(task.dueDate), "yyyy-MM-dd");
            if (dueStr === today) {
              notify(
                `task_${task.id}_${today}`,
                "📋 Tarea para hoy",
                `"${task.title}" vence hoy`
              );
            }
          }
        }
      } catch {}

      try {
        // ── Events today ──
        if (now.getHours() >= 7) {
          const eventsRes = await fetch("/api/events", { credentials: "include" });
          const events = await eventsRes.json();

          for (const event of events) {
            const eventDate = new Date(event.date);
            const eventDateStr = format(eventDate, "yyyy-MM-dd");
            if (eventDateStr === today) {
              const timeStr = format(eventDate, "HH:mm");
              notify(
                `event_${event.id}_${today}`,
                "📅 Evento hoy",
                `"${event.title}" a las ${timeStr}`
              );
            }
          }
        }
      } catch {}

      if (newFired.length > fired.length) {
        localStorage.setItem(firedKey, JSON.stringify(newFired));
      }
    };

    runCheck();
    const interval = setInterval(runCheck, 60000);
    return () => clearInterval(interval);
  }, []);

  return null;
}
