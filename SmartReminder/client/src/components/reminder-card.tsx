import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, Edit2, Trash2, Clock, Calendar, AlertTriangle, CheckCircle } from "lucide-react";
import type { Reminder } from "@shared/schema";

interface ReminderCardProps {
  reminder: Reminder;
  onToggleComplete: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export default function ReminderCard({
  reminder,
  onToggleComplete,
  onEdit,
  onDelete,
}: ReminderCardProps) {
  const isCompleted = reminder.completed;
  const dateTime = new Date(`${reminder.date}T${reminder.time}`);
  const now = new Date();
  const isOverdue = dateTime < now && !isCompleted;

  const formatDateTime = (dateTime: Date, now: Date) => {
    const diff = dateTime.getTime() - now.getTime();
    const diffDays = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return `Today, ${dateTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
    } else if (diffDays === 1) {
      return `Tomorrow, ${dateTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
    } else if (diffDays === -1) {
      return `Yesterday, ${dateTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
    } else if (diffDays < -1) {
      return `${Math.abs(diffDays)} days ago`;
    } else {
      return `${dateTime.toLocaleDateString()}, ${dateTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
    }
  };

  const timeDisplay = formatDateTime(dateTime, now);
  const timeClass = isOverdue
    ? "text-red-600"
    : isCompleted
    ? "text-emerald-600"
    : "text-amber-600";
  const TimeIcon = isOverdue
    ? AlertTriangle
    : isCompleted
    ? CheckCircle
    : Clock;

  return (
    <Card
      className={`p-6 hover:shadow-md transition-all duration-200 animate-in slide-in-from-top-2 ${
        isCompleted ? "border-emerald-200 opacity-60" : "border-slate-200"
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-4 flex-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleComplete}
            className={`mt-1 w-5 h-5 p-0 rounded-full transition-colors duration-200 flex-shrink-0 ${
              isCompleted
                ? "bg-emerald-500 border-2 border-emerald-500 hover:bg-emerald-600"
                : "border-2 border-slate-300 hover:border-emerald-500 hover:bg-emerald-50"
            }`}
          >
            <Check
              className={`h-3 w-3 transition-opacity duration-200 ${
                isCompleted
                  ? "text-white opacity-100"
                  : "text-emerald-500 opacity-0 group-hover:opacity-100"
              }`}
            />
          </Button>
          <div className="flex-1 min-w-0">
            <h3
              className={`text-lg font-medium text-slate-800 mb-2 ${
                isCompleted ? "line-through" : ""
              }`}
            >
              {reminder.title}
            </h3>
            <p
              className={`text-slate-600 mb-3 ${
                isCompleted ? "line-through" : ""
              }`}
            >
              {reminder.description || "No description"}
            </p>
            <div className="flex items-center space-x-4 text-sm">
              <span className={`flex items-center ${timeClass}`}>
                <TimeIcon className="mr-1 h-4 w-4" />
                <span>{timeDisplay}</span>
              </span>
              <span className="flex items-center text-slate-500">
                <Calendar className="mr-1 h-4 w-4" />
                <span>{new Date(reminder.date).toLocaleDateString()}</span>
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-2 ml-4">
          {!isCompleted && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onEdit}
              className="p-2 text-slate-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors duration-200"
            >
              <Edit2 className="h-4 w-4" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={onDelete}
            className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors duration-200"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
}
