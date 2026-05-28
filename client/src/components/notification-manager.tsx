import { useEffect } from "react";
import { format } from "date-fns";
import { lsGet } from "@/lib/local-store";
import type { Class, Subject, Task, Event } from "@shared/schema";

const notifSupported = typeof Notification !== "undefined";

export function NotificationManager() {
  useEffect(() => {
    const runCheck = () => {
      const enabled = localStorage.getItem("notificationsEnabled") === "true";
      if (!enabled || !notifSupported || Notification.permission !== "granted") return;

      const now = new Date();
      const today = format(now, "yyyy-MM-dd");
      const firedKey = `notifFired_${today}`;
      const fired: string[] = JSON.parse(localStorage.getItem(firedKey) || "[]");
      let changed = false;

      const fire = (key: string, title: string, body: string) => {
        if (fired.includes(key)) return;
        new Notification(title, { body, icon: "/favicon.ico" });
        fired.push(key);
        changed = true;
      };

      // ── Classes starting within 10 minutes ──
      const classes = lsGet<Class>("acadash_classes");
      const subjects = lsGet<Subject>("acadash_subjects");
      const todayDow = now.getDay() === 0 ? 7 : now.getDay();

      for (const cls of classes) {
        if (!cls.daysOfWeek?.includes(todayDow)) continue;
        const [h, m] = cls.startTime.split(":").map(Number);
        const start = new Date(now);
        start.setHours(h, m, 0, 0);
        const diff = (start.getTime() - now.getTime()) / 60000;
        if (diff >= 0 && diff <= 10) {
          const subj = subjects.find((s) => s.id === cls.subjectId);
          const room = cls.room ? ` · ${cls.room}` : "";
          fire(`class_${cls.id}_${today}`, "🎓 Clase en 10 minutos", `${subj?.name || "Clase"} a las ${cls.startTime}${room}`);
        }
      }

      // ── Tasks due today (notify from 7am) ──
      if (now.getHours() >= 7) {
        for (const task of lsGet<Task>("acadash_tasks")) {
          if (task.completed) continue;
          if (format(new Date(task.dueDate), "yyyy-MM-dd") === today) {
            fire(`task_${task.id}_${today}`, "📋 Tarea para hoy", `"${task.title}" vence hoy`);
          }
        }

        // ── Events today ──
        for (const event of lsGet<Event>("acadash_events")) {
          if (format(new Date(event.date), "yyyy-MM-dd") === today) {
            fire(`event_${event.id}_${today}`, "📅 Evento hoy", `"${event.title}"`);
          }
        }
      }

      if (changed) localStorage.setItem(firedKey, JSON.stringify(fired));
    };

    runCheck();
    const interval = setInterval(runCheck, 60000);
    return () => clearInterval(interval);
  }, []);

  return null;
}
