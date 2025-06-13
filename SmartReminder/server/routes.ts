import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertReminderSchema, updateReminderSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Get all reminders
  app.get("/api/reminders", async (req, res) => {
    try {
      const reminders = await storage.getAllReminders();
      res.json(reminders);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch reminders" });
    }
  });

  // Get reminder by ID
  app.get("/api/reminders/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid reminder ID" });
      }

      const reminder = await storage.getReminderById(id);
      if (!reminder) {
        return res.status(404).json({ message: "Reminder not found" });
      }

      res.json(reminder);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch reminder" });
    }
  });

  // Create new reminder
  app.post("/api/reminders", async (req, res) => {
    try {
      const validatedData = insertReminderSchema.parse(req.body);
      
      // Validate that the date/time is not in the past
      const reminderDateTime = new Date(`${validatedData.date}T${validatedData.time}`);
      if (reminderDateTime <= new Date()) {
        return res.status(400).json({ message: "Reminder date and time must be in the future" });
      }

      const reminder = await storage.createReminder(validatedData);
      res.status(201).json(reminder);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Validation error", 
          errors: error.errors 
        });
      }
      res.status(500).json({ message: "Failed to create reminder" });
    }
  });

  // Update reminder
  app.put("/api/reminders/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid reminder ID" });
      }

      const validatedData = updateReminderSchema.parse(req.body);
      
      // If updating date/time, validate it's not in the past
      if (validatedData.date && validatedData.time) {
        const reminderDateTime = new Date(`${validatedData.date}T${validatedData.time}`);
        if (reminderDateTime <= new Date()) {
          return res.status(400).json({ message: "Reminder date and time must be in the future" });
        }
      }

      const reminder = await storage.updateReminder(id, validatedData);
      if (!reminder) {
        return res.status(404).json({ message: "Reminder not found" });
      }

      res.json(reminder);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Validation error", 
          errors: error.errors 
        });
      }
      res.status(500).json({ message: "Failed to update reminder" });
    }
  });

  // Toggle reminder completion status
  app.patch("/api/reminders/:id/toggle", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid reminder ID" });
      }

      const reminder = await storage.toggleReminderComplete(id);
      if (!reminder) {
        return res.status(404).json({ message: "Reminder not found" });
      }

      res.json(reminder);
    } catch (error) {
      res.status(500).json({ message: "Failed to toggle reminder completion" });
    }
  });

  // Delete reminder
  app.delete("/api/reminders/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid reminder ID" });
      }

      const deleted = await storage.deleteReminder(id);
      if (!deleted) {
        return res.status(404).json({ message: "Reminder not found" });
      }

      res.json({ message: "Reminder deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete reminder" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
