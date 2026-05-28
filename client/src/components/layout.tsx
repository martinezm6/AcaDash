import { Link, useLocation } from "wouter";
import { 
  SidebarProvider, 
  Sidebar, 
  SidebarContent, 
  SidebarGroup, 
  SidebarGroupContent, 
  SidebarGroupLabel, 
  SidebarMenu, 
  SidebarMenuItem, 
  SidebarMenuButton,
  SidebarTrigger
} from "@/components/ui/sidebar";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { LayoutDashboard, Calendar as CalendarIcon, CheckSquare, BookOpen, Clock, User } from "lucide-react";

const navItems = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Horarios", url: "/schedule", icon: Clock },
  { title: "Tareas", url: "/tasks", icon: CheckSquare },
  { title: "Materias", url: "/subjects", icon: BookOpen },
  { title: "Calendario", url: "/calendar", icon: CalendarIcon },
];

export function AppLayout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background/50">
        <Sidebar variant="sidebar" className="border-r border-border/50">
          <SidebarContent>
            <div className="p-6">
              <Link href="/">
                <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-br from-primary to-accent bg-clip-text text-transparent cursor-pointer">
                  AcaDash
                </h1>
              </Link>
              <p className="text-xs text-muted-foreground mt-1 font-medium">Asistente Académico</p>
            </div>
            <SidebarGroup>
              <SidebarGroupLabel className="text-xs font-semibold tracking-wider uppercase text-muted-foreground">
                Menú Principal
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {navItems.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton 
                        asChild 
                        isActive={location === item.url}
                        className="transition-all duration-200 hover:bg-primary/5 data-[active=true]:bg-primary/10 data-[active=true]:text-primary font-medium rounded-xl mb-1"
                      >
                        <Link href={item.url} className="flex items-center gap-3 px-3 py-2.5">
                          <item.icon className="w-5 h-5" />
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
        </Sidebar>
        
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center gap-2 border-b border-border/50 bg-background/80 backdrop-blur-xl px-6">
            <SidebarTrigger className="-ml-2 hover:bg-primary/10 hover:text-primary transition-colors rounded-lg" />
            <div className="flex-1" />
            <div className="flex items-center gap-4">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="w-8 h-8 rounded-full bg-gradient-to-tr from-primary to-accent shadow-sm flex items-center justify-center text-white font-bold text-sm text-center hover:opacity-90 transition-opacity">
                    ES
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 rounded-xl">
                  <DropdownMenuLabel>Mi Cuenta</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild className="rounded-lg cursor-pointer">
                    <Link href="/profile" className="flex items-center w-full">
                      <User className="mr-2 h-4 w-4" />
                      <span>Perfil</span>
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </header>
          <main className="flex-1 overflow-y-auto p-4 md:p-8">
            <div className="mx-auto max-w-6xl">
              {children}
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
