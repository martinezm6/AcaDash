import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppLayout } from "@/components/layout";
import Dashboard from "@/pages/dashboard";
import Schedule from "@/pages/schedule";
import Tasks from "@/pages/tasks";
import Subjects from "@/pages/subjects";
import CalendarApp from "@/pages/calendar";
import Profile from "@/pages/profile";
import NotFound from "@/pages/not-found";

function Router() {
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
        <Router />
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
