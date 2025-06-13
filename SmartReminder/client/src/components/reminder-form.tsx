import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertReminderSchema, type InsertReminder, type Reminder } from "@shared/schema";
import { DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";

interface ReminderFormProps {
  reminder?: Reminder | null;
  onSubmit: (data: InsertReminder) => void;
  onCancel: () => void;
  isLoading: boolean;
}

export default function ReminderForm({
  reminder,
  onSubmit,
  onCancel,
  isLoading,
}: ReminderFormProps) {
  const isEditing = !!reminder;

  const form = useForm<InsertReminder>({
    resolver: zodResolver(insertReminderSchema.refine(
      (data) => {
        const reminderDateTime = new Date(`${data.date}T${data.time}`);
        return reminderDateTime > new Date();
      },
      {
        message: "Please select a future date and time",
        path: ["date"],
      }
    )),
    defaultValues: {
      title: reminder?.title || "",
      description: reminder?.description || "",
      date: reminder?.date || "",
      time: reminder?.time || "",
    },
  });

  const handleSubmit = (data: InsertReminder) => {
    onSubmit(data);
  };

  // Set minimum date to today
  const today = new Date().toISOString().split("T")[0];

  return (
    <>
      <DialogHeader>
        <DialogTitle>
          {isEditing ? "Edit Reminder" : "Create New Reminder"}
        </DialogTitle>
      </DialogHeader>

      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <div>
          <Label htmlFor="title">Title</Label>
          <Input
            id="title"
            {...form.register("title")}
            placeholder="Enter reminder title..."
            maxLength={100}
            className="mt-2"
          />
          {form.formState.errors.title && (
            <p className="text-red-500 text-sm mt-1">
              {form.formState.errors.title.message}
            </p>
          )}
        </div>

        <div>
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            {...form.register("description")}
            placeholder="Add details about your reminder..."
            maxLength={500}
            rows={3}
            className="mt-2 resize-none"
          />
          {form.formState.errors.description && (
            <p className="text-red-500 text-sm mt-1">
              {form.formState.errors.description.message}
            </p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="date">Date</Label>
            <Input
              id="date"
              type="date"
              {...form.register("date")}
              min={today}
              className="mt-2"
            />
            {form.formState.errors.date && (
              <p className="text-red-500 text-sm mt-1">
                {form.formState.errors.date.message}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="time">Time</Label>
            <Input
              id="time"
              type="time"
              {...form.register("time")}
              className="mt-2"
            />
            {form.formState.errors.time && (
              <p className="text-red-500 text-sm mt-1">
                {form.formState.errors.time.message}
              </p>
            )}
          </div>
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          <Button
            type="button"
            variant="ghost"
            onClick={onCancel}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isLoading}
            className="bg-blue-500 hover:bg-blue-600"
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isEditing ? "Update Reminder" : "Create Reminder"}
          </Button>
        </div>
      </form>
    </>
  );
}
