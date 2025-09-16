import { useQuery, useMutation } from "@tanstack/react-query";
import { Plus, CheckCircle, Clock, AlertCircle, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { format, isPast } from "date-fns";
import TaskItem from "@/components/tasks/task-item";

export default function Tasks() {
  const [isNewTaskOpen, setIsNewTaskOpen] = useState(false);
  const [isEditTaskOpen, setIsEditTaskOpen] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const { toast } = useToast();

  const { data: allTasks, isLoading } = useQuery({
    queryKey: ['/api/tasks'],
  });

  const { data: teamMembers } = useQuery({
    queryKey: ['/api/team-members'],
  });

  const { data: focusSongs } = useQuery({
    queryKey: ['/api/focus-songs'],
  });

  const form = useForm({
    defaultValues: {
      title: '',
      description: '',
      assignedTo: '',
      assignedToName: '',
      priority: 'medium',
      deadline: '',
      channel: 'general',
      focusSongId: 'none',
    }
  });

  const createTaskMutation = useMutation({
    mutationFn: async (data: any) => {
      await apiRequest('POST', '/api/tasks', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tasks'] });
      setIsNewTaskOpen(false);
      form.reset();
      toast({
        title: "Success",
        description: "Task created successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create task",
        variant: "destructive",
      });
    },
  });

  const updateTaskMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      await apiRequest('PATCH', `/api/tasks/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tasks'] });
      setIsEditTaskOpen(false);
      form.reset();
      toast({
        title: "Success",
        description: "Task updated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update task",
        variant: "destructive",
      });
    },
  });

  const deleteTaskMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest('DELETE', `/api/tasks/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tasks'] });
      toast({
        title: "Success",
        description: "Task deleted successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete task",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: any) => {
    const selectedMember = Array.isArray(teamMembers) ? teamMembers.find((member: any) => member.id === data.assignedTo) : undefined;
    
    createTaskMutation.mutate({
      ...data,
      assignedToName: selectedMember?.name || '',
      focusSongId: data.focusSongId === 'none' ? null : data.focusSongId,
      deadline: data.deadline === '' ? null : data.deadline,
    });
  };

  const handleStatusChange = (taskId: string, newStatus: string) => {
    updateTaskMutation.mutate({ id: taskId, data: { status: newStatus } });
  };

  const handleEditTask = (task: any) => {
    const selectedMember = Array.isArray(teamMembers) ? teamMembers.find((member: any) => member.name === task.assignedToName) : undefined;
    
    form.reset({
      title: task.title || '',
      description: task.description || '',
      assignedTo: selectedMember?.id || '',
      assignedToName: task.assignedToName || '',
      priority: task.priority || 'medium',
      deadline: task.deadline || '',
      channel: task.channel || 'general',
      focusSongId: task.focusSongId || 'none',
    });
    setSelectedTaskId(task.id);
    setIsEditTaskOpen(true);
  };

  const handleDeleteTask = (taskId: string) => {
    deleteTaskMutation.mutate(taskId);
  };

  const onEditSubmit = (data: any) => {
    if (selectedTaskId) {
      const selectedMember = Array.isArray(teamMembers) ? teamMembers.find((member: any) => member.id === data.assignedTo) : undefined;
      
      updateTaskMutation.mutate({
        id: selectedTaskId,
        data: {
          ...data,
          assignedToName: selectedMember?.name || '',
          focusSongId: data.focusSongId === 'none' ? null : data.focusSongId,
          deadline: data.deadline === '' ? null : data.deadline,
        }
      });
    }
  };

  const filterTasks = (status?: string) => {
    if (!Array.isArray(allTasks)) return [];
    if (!status) return allTasks;
    return allTasks.filter((task: any) => task.status === status);
  };

  const todoTasks = filterTasks('todo');
  const inProgressTasks = filterTasks('in_progress');
  const doneTasks = filterTasks('done');

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-700';
      case 'medium':
        return 'bg-yellow-100 text-yellow-700';
      case 'low':
        return 'bg-green-100 text-green-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getChannelIcon = (channel: string) => {
    switch (channel) {
      case 'youtube':
        return '📺';
      case 'social_media':
        return '📱';
      case 'spotify':
        return '🎵';
      case 'radio':
        return '📻';
      case 'general':
      case '':
      default:
        return '📋';
    }
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Tasks</h2>
          <p className="text-sm text-muted-foreground">Manage team assignments and deadlines</p>
        </div>
        <Dialog open={isNewTaskOpen} onOpenChange={setIsNewTaskOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-new-task" className="bg-primary text-primary-foreground hover:bg-primary/90">
              <Plus className="w-4 h-4 mr-2" />
              New Task
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Task</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Task Title</FormLabel>
                      <FormControl>
                        <Input {...field} data-testid="input-task-title" />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea {...field} data-testid="textarea-task-description" />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="assignedTo"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Assigned To</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-assignee">
                              <SelectValue placeholder="Select team member" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {Array.isArray(teamMembers) && teamMembers.map((member: any) => (
                              <SelectItem key={member.id} value={member.id}>
                                {member.name} - {member.jobTitle}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="priority"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Priority</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-priority">
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="low">Low</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="high">High</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="deadline"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Deadline</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} data-testid="input-deadline" />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="channel"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Channel</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-channel">
                              <SelectValue placeholder="Select channel" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="general">General</SelectItem>
                            <SelectItem value="youtube">YouTube</SelectItem>
                            <SelectItem value="social_media">Social Media</SelectItem>
                            <SelectItem value="spotify">Spotify</SelectItem>
                            <SelectItem value="radio">Radio</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="focusSongId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Related Focus Song (Optional)</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-focus-song">
                            <SelectValue placeholder="Select focus song" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="none">None</SelectItem>
                          {Array.isArray(focusSongs) && focusSongs.map((song: any) => (
                            <SelectItem key={song.id} value={song.id}>
                              {song.title} - {song.artist}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />

                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => setIsNewTaskOpen(false)}>
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={createTaskMutation.isPending}
                    data-testid="button-create-task"
                  >
                    {createTaskMutation.isPending ? 'Creating...' : 'Create Task'}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Task Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card data-testid="stat-total-tasks">
          <CardContent className="p-6 text-center">
            <div className="text-2xl font-bold text-foreground">{Array.isArray(allTasks) ? allTasks.length : 0}</div>
            <p className="text-sm text-muted-foreground">Total Tasks</p>
          </CardContent>
        </Card>
        
        <Card data-testid="stat-todo-tasks">
          <CardContent className="p-6 text-center">
            <div className="text-2xl font-bold text-blue-600">{todoTasks.length}</div>
            <p className="text-sm text-muted-foreground">To Do</p>
          </CardContent>
        </Card>
        
        <Card data-testid="stat-progress-tasks">
          <CardContent className="p-6 text-center">
            <div className="text-2xl font-bold text-yellow-600">{inProgressTasks.length}</div>
            <p className="text-sm text-muted-foreground">In Progress</p>
          </CardContent>
        </Card>
        
        <Card data-testid="stat-done-tasks">
          <CardContent className="p-6 text-center">
            <div className="text-2xl font-bold text-green-600">{doneTasks.length}</div>
            <p className="text-sm text-muted-foreground">Completed</p>
          </CardContent>
        </Card>
      </div>

      {/* Task Tabs */}
      <Tabs defaultValue="all" className="space-y-6">
        <TabsList>
          <TabsTrigger value="all" data-testid="tab-all-tasks">All Tasks</TabsTrigger>
          <TabsTrigger value="todo" data-testid="tab-todo">To Do ({todoTasks.length})</TabsTrigger>
          <TabsTrigger value="progress" data-testid="tab-progress">In Progress ({inProgressTasks.length})</TabsTrigger>
          <TabsTrigger value="done" data-testid="tab-done">Done ({doneTasks.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-24 bg-muted animate-pulse rounded-lg"></div>
              ))}
            </div>
          ) : !Array.isArray(allTasks) || allTasks.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <CheckCircle className="w-16 h-16 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">No Tasks Yet</h3>
                <p className="text-muted-foreground text-center mb-4">
                  Start managing your team's workload by creating your first task.
                </p>
                <Button onClick={() => setIsNewTaskOpen(true)} data-testid="button-add-first-task">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Task
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div data-testid="all-tasks-list" className="space-y-4">
              {Array.isArray(allTasks) && allTasks.map((task: any) => (
                <TaskItem 
                  key={task.id} 
                  task={task} 
                  onStatusChange={handleStatusChange}
                  onEditTask={handleEditTask}
                  onDeleteTask={handleDeleteTask}
                  isUpdating={updateTaskMutation.isPending}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="todo" className="space-y-4">
          <div data-testid="todo-tasks-list" className="space-y-4">
            {todoTasks.map((task: any) => (
              <TaskItem 
                key={task.id} 
                task={task} 
                onStatusChange={handleStatusChange}
                onEditTask={handleEditTask}
                onDeleteTask={handleDeleteTask}
                isUpdating={updateTaskMutation.isPending}
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="progress" className="space-y-4">
          <div data-testid="progress-tasks-list" className="space-y-4">
            {inProgressTasks.map((task: any) => (
              <TaskItem 
                key={task.id} 
                task={task} 
                onStatusChange={handleStatusChange}
                onEditTask={handleEditTask}
                onDeleteTask={handleDeleteTask}
                isUpdating={updateTaskMutation.isPending}
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="done" className="space-y-4">
          <div data-testid="done-tasks-list" className="space-y-4">
            {doneTasks.map((task: any) => (
              <TaskItem 
                key={task.id} 
                task={task} 
                onStatusChange={handleStatusChange}
                onEditTask={handleEditTask}
                onDeleteTask={handleDeleteTask}
                isUpdating={updateTaskMutation.isPending}
              />
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Edit Task Dialog */}
      <Dialog open={isEditTaskOpen} onOpenChange={setIsEditTaskOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Task</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onEditSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Task Title</FormLabel>
                    <FormControl>
                      <Input {...field} data-testid="input-edit-task-title" />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea {...field} data-testid="textarea-edit-task-description" />
                    </FormControl>
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="assignedTo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Assigned To</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-edit-assignee">
                            <SelectValue placeholder="Select team member" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {Array.isArray(teamMembers) && teamMembers.map((member: any) => (
                            <SelectItem key={member.id} value={member.id}>
                              {member.name} - {member.jobTitle}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="priority"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Priority</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-edit-priority">
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="deadline"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Deadline</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} data-testid="input-edit-deadline" />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="channel"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Channel</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-edit-channel">
                            <SelectValue placeholder="Select channel" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="general">General</SelectItem>
                          <SelectItem value="youtube">YouTube</SelectItem>
                          <SelectItem value="social_media">Social Media</SelectItem>
                          <SelectItem value="spotify">Spotify</SelectItem>
                          <SelectItem value="radio">Radio</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="focusSongId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Related Focus Song (Optional)</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-edit-focus-song">
                          <SelectValue placeholder="Select focus song" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="none">None</SelectItem>
                        {Array.isArray(focusSongs) && focusSongs.map((song: any) => (
                          <SelectItem key={song.id} value={song.id}>
                            {song.title} - {song.artist}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />

              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsEditTaskOpen(false)}>
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={updateTaskMutation.isPending}
                  data-testid="button-update-task"
                >
                  {updateTaskMutation.isPending ? 'Updating...' : 'Update Task'}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
