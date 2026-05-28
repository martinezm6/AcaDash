import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Subjects
  app.get(api.subjects.list.path, async (req, res) => {
    const subjects = await storage.getSubjects();
    res.json(subjects);
  });

  app.post(api.subjects.create.path, async (req, res) => {
    try {
      const inputSchema = api.subjects.create.input.extend({
        targetGrade: z.coerce.number().optional(),
        currentGrade: z.coerce.number().optional(),
        completed: z.boolean().optional().default(false)
      });
      const input = inputSchema.parse(req.body);
      const subject = await storage.createSubject(input as any);
      res.status(201).json(subject);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message, field: err.errors[0].path.join('.') });
      }
      throw err;
    }
  });

  app.patch(api.subjects.update.path, async (req, res) => {
    try {
      const inputSchema = api.subjects.update.input.extend({
        targetGrade: z.coerce.number().optional(),
        currentGrade: z.coerce.number().optional(),
        completed: z.boolean().optional()
      });
      const input = inputSchema.parse(req.body);
      const subject = await storage.updateSubject(Number(req.params.id), input as any);
      if (!subject) return res.status(404).json({ message: 'Subject not found' });
      res.json(subject);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message, field: err.errors[0].path.join('.') });
      }
      throw err;
    }
  });

  app.delete(api.subjects.delete.path, async (req, res) => {
    await storage.deleteSubject(Number(req.params.id));
    res.status(204).send();
  });

  // Tasks
  app.get(api.tasks.list.path, async (req, res) => {
    const tasks = await storage.getTasks();
    res.json(tasks);
  });

  app.post(api.tasks.create.path, async (req, res) => {
    try {
      // CORRECCIÓN: Transformamos el objeto Date a un string ISO plano para SQLite
      const inputSchema = api.tasks.create.input.extend({
        dueDate: z.coerce.date().transform(val => val.toISOString()),
        subjectId: z.coerce.number().optional()
      });
      const input = inputSchema.parse(req.body);
      const task = await storage.createTask(input as any);
      res.status(201).json(task);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message, field: err.errors[0].path.join('.') });
      }
      throw err;
    }
  });

  app.patch(api.tasks.update.path, async (req, res) => {
    try {
      // CORRECCIÓN: Transformamos el objeto Date opcional a string ISO plano
      const inputSchema = api.tasks.update.input.extend({
        dueDate: z.coerce.date().optional().transform(val => val?.toISOString()),
        subjectId: z.coerce.number().optional()
      });
      const input = inputSchema.parse(req.body);
      const task = await storage.updateTask(Number(req.params.id), input as any);
      if (!task) return res.status(404).json({ message: 'Task not found' });
      res.json(task);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message, field: err.errors[0].path.join('.') });
      }
      throw err;
    }
  });

  app.delete(api.tasks.delete.path, async (req, res) => {
    await storage.deleteTask(Number(req.params.id));
    res.status(204).send();
  });

  // Events
  app.get(api.events.list.path, async (req, res) => {
    const events = await storage.getEvents();
    res.json(events);
  });

  app.post(api.events.create.path, async (req, res) => {
    try {
      // CORRECCIÓN: Transformamos la fecha del evento a string ISO plano
      const inputSchema = api.events.create.input.extend({
        date: z.coerce.date().transform(val => val.toISOString())
      });
      const input = inputSchema.parse(req.body);
      const event = await storage.createEvent(input as any);
      res.status(201).json(event);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message, field: err.errors[0].path.join('.') });
      }
      throw err;
    }
  });

  app.delete(api.events.delete.path, async (req, res) => {
    await storage.deleteEvent(Number(req.params.id));
    res.status(204).send();
  });

  // Classes
  app.get(api.classes.list.path, async (req, res) => {
    const classes = await storage.getClasses();
    res.json(classes);
  });

  app.post(api.classes.create.path, async (req, res) => {
    try {
      const inputSchema = api.classes.create.input.extend({
        subjectId: z.coerce.number(),
        daysOfWeek: z.array(z.coerce.number()).transform(val => val.join(','))
      });
      const input = inputSchema.parse(req.body);
      const cls = await storage.createClass(input as any);
      res.status(201).json(cls);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message, field: err.errors[0].path.join('.') });
      }
      throw err;
    }
  });

  app.delete(api.classes.delete.path, async (req, res) => {
    await storage.deleteClass(Number(req.params.id));
    res.status(204).send();
  });

  //await seedDatabase();
  return httpServer;
}

async function seedDatabase() {
  try {
    const existingSubjects = await storage.getSubjects();
    if (existingSubjects.length === 0) {
      const math = await storage.createSubject({
        name: "Matemáticas Avanzadas",
        semester: "2024-1",
        targetGrade: 9.0,
        currentGrade: 8.5,
        completed: false
      });
      
      const physics = await storage.createSubject({
        name: "Física",
        semester: "2024-1",
        targetGrade: 8.0,
        currentGrade: 7.0,
        completed: false
      });

      await storage.createTask({
        title: "Resolver guía de derivadas",
        subjectId: math.id,
        dueDate: new Date(Date.now() + 86400000 * 2).toISOString(),
        completed: false
      });

      await storage.createEvent({
        title: "Examen parcial de Matemáticas",
        date: new Date(Date.now() + 86400000 * 7).toISOString(),
        description: "Temas del 1 al 4",
        type: "academic"
      });

      await storage.createClass({
        subjectId: math.id,
        daysOfWeek: "1,3", 
        startTime: "08:00",
        endTime: "10:00",
        room: "A-201",
        professor: "Dr. García"
      });
    }
  } catch (error) {
    console.error("Failed to seed database:", error);
  }
}