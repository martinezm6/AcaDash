import { useEffect } from "react";
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppLayout } from "@/components/layout";
import { NotificationManager } from "@/components/notification-manager";
import { lsGet, lsSet } from "@/lib/local-store";
import Dashboard from "@/pages/dashboard";
import Schedule from "@/pages/schedule";
import Tasks from "@/pages/tasks";
import Subjects from "@/pages/subjects";
import CalendarApp from "@/pages/calendar";
import Profile from "@/pages/profile";
import NotFound from "@/pages/not-found";

/**
 * One-time migration: if the user has never run the localStorage version,
 * pull all data from the server API and write it to localStorage,
 * then set a flag so this never runs again.
 */
function useMigrateFromServer() {
  useEffect(() => {
    if (localStorage.getItem("acadash_migrated")) return;

    const migrate = async () => {
      try {
        const [sRes, tRes, eRes, cRes] = await Promise.all([
          fetch("/api/subjects", { credentials: "include" }),
          fetch("/api/tasks", { credentials: "include" }),
          fetch("/api/events", { credentials: "include" }),
          fetch("/api/classes", { credentials: "include" }),
        ]);
        if (!sRes.ok || !tRes.ok || !eRes.ok || !cRes.ok) return;
        const [subjects, tasks, events, classes] = await Promise.all([
          sRes.json(), tRes.json(), eRes.json(), cRes.json(),
        ]);

        // Only write if localStorage is currently empty (don't overwrite user data)
        if (lsGet("acadash_subjects").length === 0 && subjects.length > 0) lsSet("acadash_subjects", subjects);
        if (lsGet("acadash_tasks").length === 0 && tasks.length > 0) lsSet("acadash_tasks", tasks);
        if (lsGet("acadash_events").length === 0 && events.length > 0) lsSet("acadash_events", events);
        if (lsGet("acadash_classes").length === 0 && classes.length > 0) lsSet("acadash_classes", classes);
      } catch {
        // Migration is best-effort; silently skip if server unavailable
      } finally {
        localStorage.setItem("acadash_migrated", "1");
        // Refresh React Query cache so pages see the imported data immediately
        queryClient.invalidateQueries();
      }
    };

    migrate();
  }, []);
}

function Router() {
  useMigrateFromServer();
  return (
    <AppLayout>
      <Switch>
        <Route path="/" component={Dashboard}/>
        <Route path="/schedule" component={Schedule}/>
        <Route path="/tasks" component={Tasks}/>
        <Route path="/subjects" component={Subjects}/>
        <Route path="/calendar" component={CalendarApp}/>
        <Route path="/profile" component={Profile}/>
        <Route component={NotFound} />
      </Switch>
    </AppLayout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <NotificationManager />
        <Router />
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
