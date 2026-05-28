import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const subjects = sqliteTable("subjects", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  semester: text("semester").notNull(),
  targetGrade: real("target_grade"),
  currentGrade: real("current_grade"),
  completed: integer("completed", { mode: "boolean" }).default(false).notNull(),
});

export const tasks = sqliteTable("tasks", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  title: text("title").notNull(),
  // SE AÑADIÓ: onDelete: "cascade" para evitar tareas huérfanas si se borra la materia
  subjectId: integer("subject_id").references(() => subjects.id, { onDelete: "cascade" }),
  dueDate: text("due_date").notNull(), 
  completed: integer("completed", { mode: "boolean" }).default(false).notNull(),
});

export const events = sqliteTable("events", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  title: text("title").notNull(),
  date: text("date").notNull(), 
  description: text("description"),
  type: text("type").notNull(), // 'custom', 'academic'
});

export const classes = sqliteTable("classes", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  // SE AÑADIÓ: onDelete: "cascade" para limpiar los horarios automáticamente si se elimina la materia
  subjectId: integer("subject_id").references(() => subjects.id, { onDelete: "cascade" }).notNull(),
  daysOfWeek: text("days_of_week").notNull(), 
  startTime: text("start_time").notNull(), // HH:mm
  endTime: text("end_time").notNull(), // HH:mm
  room: text("room"),
  professor: text("professor"),
});

// --- Relaciones ---
export const subjectsRelations = relations(subjects, ({ many }) => ({
  tasks: many(tasks),
  classes: many(classes),
}));

export const tasksRelations = relations(tasks, ({ one }) => ({
  subject: one(subjects, {
    fields: [tasks.subjectId],
    references: [subjects.id],
  }),
}));

export const classesRelations = relations(classes, ({ one }) => ({
  subject: one(subjects, {
    fields: [classes.subjectId],
    references: [subjects.id],
  }),
}));

// --- Schemas de Inserción (Base) ---
export const insertSubjectSchema = createInsertSchema(subjects).omit({ id: true });
export const insertTaskSchema = createInsertSchema(tasks).omit({ id: true });
export const insertEventSchema = createInsertSchema(events).omit({ id: true });

// --- Parche de Validación Inteligente para Horarios (Zod) ---
// Modificamos el esquema de inserción de clases para que acepte un array de números en el frontend 
// y lo transforme automáticamente en la cadena de texto que la base de datos requiere.
export const insertClassSchema = createInsertSchema(classes, {
  daysOfWeek: z.array(z.number()).transform((val) => val.join(",")),
}).omit({ id: true });

// --- Tipos para TypeScript ---
export type Subject = typeof subjects.$inferSelect;
export type InsertSubject = z.infer<typeof insertSubjectSchema>;

export type Task = typeof tasks.$inferSelect;
export type InsertTask = z.infer<typeof insertTaskSchema>;

export type Event = typeof events.$inferSelect;
export type InsertEvent = z.infer<typeof insertEventSchema>;

// Tipo de selección corregido para el Frontend
export type Class = Omit<typeof classes.$inferSelect, 'daysOfWeek'> & {
  daysOfWeek: number[];
};
export type InsertClass = Omit<z.infer<typeof insertClassSchema>, 'daysOfWeek'> & {
  daysOfWeek: number[];
};

// Requests
export type CreateSubjectRequest = InsertSubject;
export type UpdateSubjectRequest = Partial<InsertSubject>;
export type CreateTaskRequest = InsertTask;
export type UpdateTaskRequest = Partial<InsertTask>;
export type CreateEventRequest = InsertEvent;
export type UpdateEventRequest = Partial<InsertEvent>;
export type CreateClassRequest = InsertClass;
export type UpdateClassRequest = Partial<InsertClass>;