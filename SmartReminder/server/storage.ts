import { reminders, users, type User, type InsertUser, type Reminder, type InsertReminder, type UpdateReminder } from "@shared/schema";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Reminder methods
  getAllReminders(): Promise<Reminder[]>;
  getReminderById(id: number): Promise<Reminder | undefined>;
  createReminder(reminder: InsertReminder): Promise<Reminder>;
  updateReminder(id: number, reminder: UpdateReminder): Promise<Reminder | undefined>;
  deleteReminder(id: number): Promise<boolean>;
  toggleReminderComplete(id: number): Promise<Reminder | undefined>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private reminders: Map<number, Reminder>;
  private currentUserId: number;
  private currentReminderId: number;

  constructor() {
    this.users = new Map();
    this.reminders = new Map();
    this.currentUserId = 1;
    this.currentReminderId = 1;
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getAllReminders(): Promise<Reminder[]> {
    return Array.from(this.reminders.values()).sort((a, b) => {
      // Sort by date/time, then by creation date
      const dateTimeA = new Date(`${a.date}T${a.time}`);
      const dateTimeB = new Date(`${b.date}T${b.time}`);
      
      if (dateTimeA.getTime() !== dateTimeB.getTime()) {
        return dateTimeA.getTime() - dateTimeB.getTime();
      }
      
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    });
  }

  async getReminderById(id: number): Promise<Reminder | undefined> {
    return this.reminders.get(id);
  }

  async createReminder(insertReminder: InsertReminder): Promise<Reminder> {
    const id = this.currentReminderId++;
    const now = new Date();
    const reminder: Reminder = {
      ...insertReminder,
      id,
      completed: false,
      completedAt: null,
      createdAt: now,
    };
    this.reminders.set(id, reminder);
    return reminder;
  }

  async updateReminder(id: number, updateReminder: UpdateReminder): Promise<Reminder | undefined> {
    const existing = this.reminders.get(id);
    if (!existing) return undefined;

    const updated: Reminder = {
      ...existing,
      ...updateReminder,
    };
    
    this.reminders.set(id, updated);
    return updated;
  }

  async deleteReminder(id: number): Promise<boolean> {
    return this.reminders.delete(id);
  }

  async toggleReminderComplete(id: number): Promise<Reminder | undefined> {
    const existing = this.reminders.get(id);
    if (!existing) return undefined;

    const updated: Reminder = {
      ...existing,
      completed: !existing.completed,
      completedAt: !existing.completed ? new Date() : null,
    };
    
    this.reminders.set(id, updated);
    return updated;
  }
}

export const storage = new MemStorage();
