import { db } from "./db";
import {
  subjects, tasks, events, classes,
  type InsertSubject, type InsertTask, type InsertEvent, type InsertClass,
  type Subject, type Task, type Event, type Class
} from "@shared/schema";
import { eq } from "drizzle-orm";

export interface IStorage {
  // Subjects
  getSubjects(): Promise<Subject[]>;
  getSubject(id: number): Promise<Subject | undefined>;
  createSubject(subject: InsertSubject): Promise<Subject>;
  updateSubject(id: number, updates: Partial<InsertSubject>): Promise<Subject>;
  deleteSubject(id: number): Promise<void>;

  // Tasks
  getTasks(): Promise<Task[]>;
  getTask(id: number): Promise<Task | undefined>;
  createTask(task: InsertTask): Promise<Task>;
  updateTask(id: number, updates: Partial<InsertTask>): Promise<Task>;
  deleteTask(id: number): Promise<void>;

  // Events
  getEvents(): Promise<Event[]>;
  getEvent(id: number): Promise<Event | undefined>;
  createEvent(event: InsertEvent): Promise<Event>;
  updateEvent(id: number, updates: Partial<InsertEvent>): Promise<Event>;
  deleteEvent(id: number): Promise<void>;

  // Classes
  getClasses(): Promise<Class[]>;
  getClass(id: number): Promise<Class | undefined>;
  createClass(cls: InsertClass): Promise<Class>;
  updateClass(id: number, updates: Partial<InsertClass>): Promise<Class>;
  deleteClass(id: number): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  // Función interna para transmutar el formato de los días (Texto "1,2" -> Array [1,2])
  private formatClass(cls: any): Class {
    if (!cls) return cls;
    return {
      ...cls,
      daysOfWeek: typeof cls.daysOfWeek === 'string' 
        ? cls.daysOfWeek.split(',').filter(Boolean).map(Number) 
        : cls.daysOfWeek
    };
  }

  // --- Subjects ---
  async getSubjects(): Promise<Subject[]> {
    return await db.select().from(subjects);
  }

  async getSubject(id: number): Promise<Subject | undefined> {
    const [subject] = await db.select().from(subjects).where(eq(subjects.id, id));
    return subject;
  }

  async createSubject(subject: InsertSubject): Promise<Subject> {
    // OPTIMIZACIÓN: Se usa .returning() para recuperar el objeto directo en una sola transacción
    const [created] = await db.insert(subjects).values(subject).returning();
    return created;
  }

  async updateSubject(id: number, updates: Partial<InsertSubject>): Promise<Subject> {
    const [updated] = await db.update(subjects).set(updates).where(eq(subjects.id, id)).returning();
    return updated!;
  }

  async deleteSubject(id: number): Promise<void> {
    await db.delete(subjects).where(eq(subjects.id, id));
  }

  // --- Tasks ---
  async getTasks(): Promise<Task[]> {
    return await db.select().from(tasks);
  }

  async getTask(id: number): Promise<Task | undefined> {
    const [task] = await db.select().from(tasks).where(eq(tasks.id, id));
    return task;
  }

  async createTask(task: InsertTask): Promise<Task> {
    const [created] = await db.insert(tasks).values(task).returning();
    return created;
  }

  async updateTask(id: number, updates: Partial<InsertTask>): Promise<Task> {
    const [updated] = await db.update(tasks).set(updates).where(eq(tasks.id, id)).returning();
    return updated!;
  }

  async deleteTask(id: number): Promise<void> {
    await db.delete(tasks).where(eq(tasks.id, id));
  }

  // --- Events ---
  async getEvents(): Promise<Event[]> {
    return await db.select().from(events);
  }

  async getEvent(id: number): Promise<Event | undefined> {
    const [event] = await db.select().from(events).where(eq(events.id, id));
    return event;
  }

  async createEvent(event: InsertEvent): Promise<Event> {
    const [created] = await db.insert(events).values(event).returning();
    return created;
  }

  async updateEvent(id: number, updates: Partial<InsertEvent>): Promise<Event> {
    const [updated] = await db.update(events).set(updates).where(eq(events.id, id)).returning();
    return updated!;
  }

  async deleteEvent(id: number): Promise<void> {
    await db.delete(events).where(eq(events.id, id));
  }

  // --- Classes ---
  async getClasses(): Promise<Class[]> {
    const rows = await db.select().from(classes);
    return rows.map(row => this.formatClass(row));
  }

  async getClass(id: number): Promise<Class | undefined> {
    const [cls] = await db.select().from(classes).where(eq(classes.id, id));
    return this.formatClass(cls);
  }

  async createClass(cls: InsertClass): Promise<Class> {
    const [created] = await db.insert(classes).values(cls).returning();
    return this.formatClass(created);
  }

  async updateClass(id: number, updates: Partial<InsertClass>): Promise<Class> {
    const [updated] = await db.update(classes).set(updates).where(eq(classes.id, id)).returning();
    return this.formatClass(updated);
  }

  async deleteClass(id: number): Promise<void> {
    await db.delete(classes).where(eq(classes.id, id));
  }
}

export const storage = new DatabaseStorage();