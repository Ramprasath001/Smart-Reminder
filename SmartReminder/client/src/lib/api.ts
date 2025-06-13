import { apiRequest } from "./queryClient";
import type { Reminder, InsertReminder, UpdateReminder } from "@shared/schema";

export const reminderApi = {
  getAll: (): Promise<Reminder[]> =>
    fetch("/api/reminders").then(res => res.json()),

  getById: (id: number): Promise<Reminder> =>
    fetch(`/api/reminders/${id}`).then(res => res.json()),

  create: (reminder: InsertReminder): Promise<Reminder> =>
    apiRequest("POST", "/api/reminders", reminder).then(res => res.json()),

  update: (id: number, reminder: UpdateReminder): Promise<Reminder> =>
    apiRequest("PUT", `/api/reminders/${id}`, reminder).then(res => res.json()),

  delete: (id: number): Promise<void> =>
    apiRequest("DELETE", `/api/reminders/${id}`).then(() => {}),

  toggleComplete: (id: number): Promise<Reminder> =>
    apiRequest("PATCH", `/api/reminders/${id}/toggle`).then(res => res.json()),
};
