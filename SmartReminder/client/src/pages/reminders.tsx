import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { reminderApi } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Bell, Plus } from "lucide-react";
import type { Reminder } from "@shared/schema";
import ReminderCard from "@/components/reminder-card";
import ReminderForm from "@/components/reminder-form";
import DeleteConfirmation from "@/components/delete-confirmation";

type FilterType = "all" | "active" | "completed";

export default function RemindersPage() {
  const [currentFilter, setCurrentFilter] = useState<FilterType>("all");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingReminder, setEditingReminder] = useState<Reminder | null>(null);
  const [deleteReminderId, setDeleteReminderId] = useState<number | null>(null);
  const { toast } = useToast();

  const { data: reminders = [], isLoading } = useQuery({
    queryKey: ["/api/reminders"],
    queryFn: reminderApi.getAll,
  });

  const createMutation = useMutation({
    mutationFn: reminderApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/reminders"] });
      setIsCreateModalOpen(false);
      toast({
        title: "Success",
        description: "Reminder created successfully!",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create reminder",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, ...data }: { id: number } & any) =>
      reminderApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/reminders"] });
      setEditingReminder(null);
      toast({
        title: "Success",
        description: "Reminder updated successfully!",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update reminder",
        variant: "destructive",
      });
    },
  });

  const toggleMutation = useMutation({
    mutationFn: reminderApi.toggleComplete,
    onSuccess: (updatedReminder) => {
      queryClient.invalidateQueries({ queryKey: ["/api/reminders"] });
      toast({
        title: "Success",
        description: updatedReminder.completed
          ? "Reminder marked as complete!"
          : "Reminder marked as active!",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update reminder",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: reminderApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/reminders"] });
      setDeleteReminderId(null);
      toast({
        title: "Success",
        description: "Reminder deleted successfully!",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete reminder",
        variant: "destructive",
      });
    },
  });

  const filteredReminders = reminders.filter((reminder) => {
    if (currentFilter === "active") return !reminder.completed;
    if (currentFilter === "completed") return reminder.completed;
    return true;
  });

  const allCount = reminders.length;
  const activeCount = reminders.filter((r) => !r.completed).length;
  const completedCount = reminders.filter((r) => r.completed).length;

  const handleCreateReminder = (data: any) => {
    createMutation.mutate(data);
  };

  const handleUpdateReminder = (data: any) => {
    if (editingReminder) {
      updateMutation.mutate({ id: editingReminder.id, ...data });
    }
  };

  const handleToggleComplete = (id: number) => {
    toggleMutation.mutate(id);
  };

  const handleDeleteReminder = () => {
    if (deleteReminderId) {
      deleteMutation.mutate(deleteReminderId);
    }
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "n") {
        e.preventDefault();
        setIsCreateModalOpen(true);
      }
      if (e.key === "Escape") {
        setIsCreateModalOpen(false);
        setEditingReminder(null);
        setDeleteReminderId(null);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div className="bg-slate-50 min-h-screen">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <div className="bg-blue-500 p-2 rounded-lg">
                <Bell className="text-white h-5 w-5" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-slate-800">Reminders</h1>
                <p className="text-sm text-slate-500">
                  {activeCount} active reminder{activeCount !== 1 ? "s" : ""}
                </p>
              </div>
            </div>
            <Button
              onClick={() => setIsCreateModalOpen(true)}
              className="bg-blue-500 hover:bg-blue-600 flex items-center space-x-2"
            >
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Add Reminder</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Filter Tabs */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <div className="flex space-x-1 bg-slate-100 p-1 rounded-lg w-fit">
          {[
            { key: "all", label: "All", count: allCount },
            { key: "active", label: "Active", count: activeCount },
            { key: "completed", label: "Completed", count: completedCount },
          ].map(({ key, label, count }) => (
            <Button
              key={key}
              variant="ghost"
              onClick={() => setCurrentFilter(key as FilterType)}
              className={`px-4 py-2 rounded-md font-medium text-sm transition-all duration-200 ${
                currentFilter === key
                  ? "bg-white text-slate-600 shadow-sm"
                  : "text-slate-500 hover:text-slate-700 hover:bg-white/50"
              }`}
            >
              {label}
              <Badge
                variant="secondary"
                className={`ml-2 text-xs px-2 py-0.5 ${
                  key === "active"
                    ? "bg-amber-500 text-white hover:bg-amber-500"
                    : key === "completed"
                    ? "bg-emerald-500 text-white hover:bg-emerald-500"
                    : "bg-slate-600 text-white hover:bg-slate-600"
                }`}
              >
                {count}
              </Badge>
            </Button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl border border-slate-200 p-6 animate-pulse">
                <div className="flex items-start space-x-4">
                  <div className="w-5 h-5 bg-slate-200 rounded-full"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-6 bg-slate-200 rounded w-1/3"></div>
                    <div className="h-4 bg-slate-200 rounded w-2/3"></div>
                    <div className="h-4 bg-slate-200 rounded w-1/4"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredReminders.length === 0 ? (
          <div className="text-center py-12">
            <div className="bg-slate-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Bell className="text-slate-400 h-8 w-8" />
            </div>
            <h3 className="text-lg font-medium text-slate-800 mb-2">No reminders found</h3>
            <p className="text-slate-500 mb-6">
              {currentFilter === "all"
                ? "Create your first reminder to get started with organizing your tasks."
                : `No ${currentFilter} reminders available.`}
            </p>
            {currentFilter === "all" && (
              <Button
                onClick={() => setIsCreateModalOpen(true)}
                className="bg-blue-500 hover:bg-blue-600"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Reminder
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredReminders.map((reminder) => (
              <ReminderCard
                key={reminder.id}
                reminder={reminder}
                onToggleComplete={() => handleToggleComplete(reminder.id)}
                onEdit={() => setEditingReminder(reminder)}
                onDelete={() => setDeleteReminderId(reminder.id)}
              />
            ))}
          </div>
        )}
      </main>

      {/* Create/Edit Modal */}
      <Dialog open={isCreateModalOpen || !!editingReminder} onOpenChange={(open) => {
        if (!open) {
          setIsCreateModalOpen(false);
          setEditingReminder(null);
        }
      }}>
        <DialogContent className="sm:max-w-md">
          <ReminderForm
            reminder={editingReminder}
            onSubmit={editingReminder ? handleUpdateReminder : handleCreateReminder}
            onCancel={() => {
              setIsCreateModalOpen(false);
              setEditingReminder(null);
            }}
            isLoading={createMutation.isPending || updateMutation.isPending}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <DeleteConfirmation
        open={!!deleteReminderId}
        onConfirm={handleDeleteReminder}
        onCancel={() => setDeleteReminderId(null)}
        isLoading={deleteMutation.isPending}
      />

      {/* Floating Action Button (Mobile) */}
      <Button
        onClick={() => setIsCreateModalOpen(true)}
        size="lg"
        className="fixed bottom-6 right-6 w-14 h-14 bg-blue-500 hover:bg-blue-600 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 md:hidden"
      >
        <Plus className="h-6 w-6" />
      </Button>
    </div>
  );
}
