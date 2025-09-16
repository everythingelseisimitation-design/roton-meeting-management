import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, isToday } from "date-fns";
import { ChevronLeft, ChevronRight, Plus, CheckSquare, Square, Clock, User, MoreHorizontal, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { insertCalendarActionSchema, CalendarAction, TeamMember } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import NewMeetingDialog from "@/components/meetings/new-meeting-dialog";

const calendarActionFormSchema = insertCalendarActionSchema.omit({
  createdBy: true,
}).extend({
  date: z.string().min(1, "Date is required"),
});

type CalendarActionFormData = z.infer<typeof calendarActionFormSchema>;

export default function Calendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isNewMeetingOpen, setIsNewMeetingOpen] = useState(false);
  const [isNewActionOpen, setIsNewActionOpen] = useState(false);
  const [isEditActionOpen, setIsEditActionOpen] = useState(false);
  const [selectedAction, setSelectedAction] = useState<CalendarAction | null>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const startDate = format(monthStart, 'yyyy-MM-dd');
  const endDate = format(monthEnd, 'yyyy-MM-dd');

  const { data: meetings, isLoading } = useQuery({
    queryKey: ['/api/meetings', { startDate, endDate }],
  });

  const { data: calendarActions, isLoading: isActionsLoading } = useQuery({
    queryKey: ['/api/calendar-actions', { startDate, endDate }],
  });

  const { data: teamMembers } = useQuery({
    queryKey: ['/api/team-members'],
  });

  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Calendar actions mutations
  const createActionMutation = useMutation({
    mutationFn: (data: CalendarActionFormData) => apiRequest('POST', '/api/calendar-actions', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/calendar-actions'] });
      setIsNewActionOpen(false);
      toast({ title: "Action created successfully" });
    },
    onError: () => {
      toast({ title: "Failed to create action", variant: "destructive" });
    },
  });

  const updateActionMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CalendarActionFormData> }) => 
      apiRequest('PATCH', `/api/calendar-actions/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/calendar-actions'] });
      setIsEditActionOpen(false);
      setSelectedAction(null);
      toast({ title: "Action updated successfully" });
    },
    onError: () => {
      toast({ title: "Failed to update action", variant: "destructive" });
    },
  });

  const deleteActionMutation = useMutation({
    mutationFn: (id: string) => apiRequest('DELETE', `/api/calendar-actions/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/calendar-actions'] });
      toast({ title: "Action deleted successfully" });
    },
    onError: () => {
      toast({ title: "Failed to delete action", variant: "destructive" });
    },
  });

  const getMeetingsForDate = (date: Date) => {
    if (!Array.isArray(meetings)) return [];
    return meetings.filter((meeting: any) => 
      isSameDay(new Date(meeting.date), date)
    );
  };

  const getCalendarActionsForDate = (date: Date) => {
    if (!Array.isArray(calendarActions)) return [];
    return calendarActions.filter((action: CalendarAction) => 
      isSameDay(new Date(action.date), date)
    );
  };

  const getPendingActions = () => {
    if (!Array.isArray(calendarActions)) return [];
    return calendarActions.filter((action: CalendarAction) => !action.isCompleted);
  };

  const getCompletedActions = () => {
    if (!Array.isArray(calendarActions)) return [];
    return calendarActions.filter((action: CalendarAction) => action.isCompleted);
  };

  const getMeetingTypeColor = (type: string) => {
    switch (type) {
      case 'marketing':
        return 'bg-green-100 text-green-700';
      case 'focus_songs_update':
        return 'bg-blue-100 text-blue-700';
      case 'focus_songs_strategy':
        return 'bg-purple-100 text-purple-700';
      case 'weekly_recap':
        return 'bg-orange-100 text-orange-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getMeetingTypeName = (type: string) => {
    switch (type) {
      case 'marketing':
        return 'Marketing';
      case 'focus_songs_update':
        return 'Focus Songs Update';
      case 'focus_songs_strategy':
        return 'Focus Songs Strategy';
      case 'weekly_recap':
        return 'Weekly Recap';
      default:
        return type;
    }
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(newDate.getMonth() - 1);
      } else {
        newDate.setMonth(newDate.getMonth() + 1);
      }
      return newDate;
    });
  };

  const handleCreateAction = (data: CalendarActionFormData) => {
    createActionMutation.mutate(data);
  };

  const handleUpdateAction = (data: CalendarActionFormData) => {
    if (selectedAction) {
      updateActionMutation.mutate({ id: selectedAction.id, data });
    }
  };

  const handleDeleteAction = (id: string) => {
    deleteActionMutation.mutate(id);
  };

  const handleToggleComplete = (action: CalendarAction) => {
    const updates = {
      isCompleted: !action.isCompleted,
      completedDate: !action.isCompleted ? format(new Date(), 'yyyy-MM-dd') : null,
    };
    updateActionMutation.mutate({ id: action.id, data: updates });
  };

  const handleEditAction = (action: CalendarAction) => {
    setSelectedAction(action);
    setIsEditActionOpen(true);
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Calendar</h2>
          <p className="text-sm text-muted-foreground">Weekly meeting schedule and planning</p>
        </div>
        <Button 
          onClick={() => setIsNewMeetingOpen(true)}
          data-testid="button-new-meeting"
          className="bg-primary text-primary-foreground hover:bg-primary/90"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Meeting
        </Button>
      </div>

      {/* Calendar Navigation */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold">
              {format(currentDate, 'MMMM yyyy')}
            </h3>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => navigateMonth('prev')}
                data-testid="button-prev-month"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                onClick={() => setCurrentDate(new Date())}
                data-testid="button-today"
              >
                Today
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => navigateMonth('next')}
                data-testid="button-next-month"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1 mb-4">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="p-3 text-center text-sm font-medium text-muted-foreground">
                {day}
              </div>
            ))}
          </div>

          {isLoading ? (
            <div className="grid grid-cols-7 gap-1">
              {[...Array(35)].map((_, i) => (
                <div key={i} className="h-24 bg-muted animate-pulse rounded"></div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-7 gap-1">
              {days.map(day => {
                const dayMeetings = getMeetingsForDate(day);
                const isCurrentMonth = isSameMonth(day, currentDate);
                const isDayToday = isToday(day);

                return (
                  <div
                    key={day.toISOString()}
                    className={`min-h-[120px] p-2 border rounded transition-colors ${
                      isCurrentMonth 
                        ? 'bg-background hover:bg-muted/50' 
                        : 'bg-muted/30'
                    } ${isDayToday ? 'ring-2 ring-primary' : ''}`}
                    data-testid={`calendar-day-${format(day, 'yyyy-MM-dd')}`}
                  >
                    <div className={`text-sm font-medium mb-1 ${
                      isCurrentMonth ? 'text-foreground' : 'text-muted-foreground'
                    } ${isDayToday ? 'text-primary font-bold' : ''}`}>
                      {format(day, 'd')}
                    </div>
                    
                    <div className="flex flex-col gap-1">
                      {/* Enhanced Meeting Display */}
                      {dayMeetings.map((meeting: any) => (
                        <div
                          key={meeting.id}
                          className={`group relative text-xs p-2 rounded-md border-l-2 cursor-pointer transition-all hover:ring-1 hover:ring-current overflow-hidden leading-tight ${getMeetingTypeColor(meeting.type)} dark:bg-opacity-80`}
                          title={`${meeting.title} at ${meeting.time}`}
                          data-testid={`meeting-${meeting.id}`}
                        >
                          <div className="flex items-center justify-between gap-2 min-w-0">
                            <div className="flex items-center gap-1 shrink-0">
                              <Clock className="w-3 h-3" />
                              <span className="font-semibold tabular-nums">{format(new Date(`2000-01-01T${meeting.time}`), 'HH:mm')}</span>
                            </div>
                            <Badge variant="secondary" className="text-xs px-1 py-0 h-4 shrink-0 whitespace-nowrap max-w-[60%] truncate hidden sm:inline-flex">
                              {getMeetingTypeName(meeting.type)}
                            </Badge>
                          </div>
                          <div className="mt-1 font-medium line-clamp-2">{meeting.title}</div>
                          {meeting.participants && meeting.participants.length > 0 && (
                            <div className="flex items-center mt-1 text-[11px] opacity-75 gap-1 truncate">
                              <User className="w-3 h-3" />
                              <span>{meeting.participants.length} members</span>
                            </div>
                          )}
                        </div>
                      ))}
                      
                      {/* Calendar Actions for this day */}
                      {getCalendarActionsForDate(day).map((action: CalendarAction) => (
                        <div
                          key={action.id}
                          className={`group relative text-xs p-2 rounded-md border-l-2 border-amber-400 cursor-pointer transition-all hover:ring-1 hover:ring-current overflow-hidden leading-tight ${
                            action.isCompleted 
                              ? 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-300' 
                              : 'bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-300'
                          }`}
                          title={action.description || action.title}
                          data-testid={`calendar-action-${action.id}`}
                        >
                          <div className="flex items-center justify-between gap-2 min-w-0">
                            <div className="flex items-center gap-1 shrink-0 min-w-0">
                              {action.isCompleted ? <CheckSquare className="w-3 h-3" /> : <Square className="w-3 h-3" />}
                              <span className={`font-medium truncate ${action.isCompleted ? 'line-through' : ''}`}>
                                {action.title}
                              </span>
                            </div>
                            <Badge variant="outline" className="text-xs px-1 py-0 h-4 shrink-0 whitespace-nowrap hidden sm:inline-flex">
                              Action
                            </Badge>
                          </div>
                          {action.assignedToName && (
                            <div className="flex items-center mt-1 text-[11px] opacity-75 gap-1 truncate">
                              <User className="w-3 h-3" />
                              <span>{action.assignedToName}</span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Meeting Types Legend */}
      <Card>
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold mb-4">Meeting Types</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="flex items-center space-x-3">
              <Badge className="bg-green-100 text-green-700" data-testid="legend-marketing">Marketing</Badge>
              <div className="text-sm text-muted-foreground">
                <div>Monday</div>
                <div>Marketing Team Only</div>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <Badge className="bg-blue-100 text-blue-700" data-testid="legend-focus-update">Focus Songs Update</Badge>
              <div className="text-sm text-muted-foreground">
                <div>Tuesday</div>
                <div>Full Team</div>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <Badge className="bg-purple-100 text-purple-700" data-testid="legend-focus-strategy">Focus Songs Strategy</Badge>
              <div className="text-sm text-muted-foreground">
                <div>Wednesday</div>
                <div>Full Team</div>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <Badge className="bg-orange-100 text-orange-700" data-testid="legend-weekly-recap">Weekly Recap</Badge>
              <div className="text-sm text-muted-foreground">
                <div>Friday</div>
                <div>Full Team</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Things We Said We Gonna Do Section */}
      <Card className="mt-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg font-semibold">Things We Said We Gonna Do</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Track commitments and action items across all meetings
              </p>
            </div>
            <Button 
              onClick={() => setIsNewActionOpen(true)}
              data-testid="button-new-action"
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              <Plus className="w-4 h-4 mr-2" />
              New Action
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {isActionsLoading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-16 bg-muted animate-pulse rounded"></div>
              ))}
            </div>
          ) : (
            <>
              {/* Pending Actions */}
              <div>
                <h4 className="font-medium mb-3 flex items-center">
                  <Square className="w-4 h-4 mr-2" />
                  Pending ({getPendingActions().length})
                </h4>
                <div className="space-y-2">
                  {getPendingActions().length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Square className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p>No pending actions</p>
                      <p className="text-xs">Create an action to track commitments</p>
                    </div>
                  ) : (
                    getPendingActions().map((action: CalendarAction) => (
                      <div
                        key={action.id}
                        className="group flex items-center justify-between p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg hover:bg-amber-100 dark:hover:bg-amber-900/30 transition-colors"
                        data-testid={`pending-action-${action.id}`}
                      >
                        <div className="flex items-center space-x-3 flex-1">
                          <Checkbox
                            checked={false}
                            onCheckedChange={() => handleToggleComplete(action)}
                            data-testid={`checkbox-action-${action.id}`}
                          />
                          <div className="flex-1">
                            <div className="font-medium text-amber-800 dark:text-amber-200">{action.title}</div>
                            {action.description && (
                              <div className="text-sm text-amber-600 dark:text-amber-300 mt-1">
                                {action.description}
                              </div>
                            )}
                            <div className="flex items-center space-x-4 mt-2 text-xs text-amber-600 dark:text-amber-400">
                              <span className="flex items-center">
                                <Clock className="w-3 h-3 mr-1" />
                                {format(new Date(action.date), 'MMM d, yyyy')}
                              </span>
                              {action.assignedToName && (
                                <span className="flex items-center">
                                  <User className="w-3 h-3 mr-1" />
                                  {action.assignedToName}
                                </span>
                              )}
                              <Badge variant="outline" className="text-xs">
                                {action.sourceType || 'manual'}
                              </Badge>
                            </div>
                          </div>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="opacity-0 group-hover:opacity-100 transition-opacity"
                              data-testid={`dropdown-action-${action.id}`}
                            >
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEditAction(action)} data-testid={`edit-action-${action.id}`}>
                              <Edit className="w-4 h-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleDeleteAction(action.id)}
                              className="text-destructive"
                              data-testid={`delete-action-${action.id}`}
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Completed Actions */}
              <div>
                <h4 className="font-medium mb-3 flex items-center">
                  <CheckSquare className="w-4 h-4 mr-2" />
                  Completed ({getCompletedActions().length})
                </h4>
                <div className="space-y-2">
                  {getCompletedActions().length === 0 ? (
                    <div className="text-center py-4 text-muted-foreground">
                      <CheckSquare className="w-6 h-6 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">No completed actions yet</p>
                    </div>
                  ) : (
                    getCompletedActions().map((action: CalendarAction) => (
                      <div
                        key={action.id}
                        className="group flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg opacity-75"
                        data-testid={`completed-action-${action.id}`}
                      >
                        <div className="flex items-center space-x-3 flex-1">
                          <Checkbox
                            checked={true}
                            onCheckedChange={() => handleToggleComplete(action)}
                            data-testid={`checkbox-completed-${action.id}`}
                          />
                          <div className="flex-1">
                            <div className="font-medium text-green-800 dark:text-green-200 line-through">{action.title}</div>
                            {action.description && (
                              <div className="text-sm text-green-600 dark:text-green-300 mt-1 line-through">
                                {action.description}
                              </div>
                            )}
                            <div className="flex items-center space-x-4 mt-2 text-xs text-green-600 dark:text-green-400">
                              <span className="flex items-center">
                                <Clock className="w-3 h-3 mr-1" />
                                Completed: {action.completedDate ? format(new Date(action.completedDate), 'MMM d, yyyy') : 'Unknown'}
                              </span>
                              {action.assignedToName && (
                                <span className="flex items-center">
                                  <User className="w-3 h-3 mr-1" />
                                  {action.assignedToName}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="opacity-0 group-hover:opacity-100 transition-opacity"
                              data-testid={`dropdown-completed-${action.id}`}
                            >
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem 
                              onClick={() => handleDeleteAction(action.id)}
                              className="text-destructive"
                              data-testid={`delete-completed-${action.id}`}
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <NewMeetingDialog open={isNewMeetingOpen} onOpenChange={setIsNewMeetingOpen} />
      
      {/* New Calendar Action Dialog */}
      <NewCalendarActionDialog 
        open={isNewActionOpen} 
        onOpenChange={setIsNewActionOpen}
        onSubmit={handleCreateAction}
        isLoading={createActionMutation.isPending}
        teamMembers={Array.isArray(teamMembers) ? teamMembers : []}
      />
      
      {/* Edit Calendar Action Dialog */}
      <EditCalendarActionDialog 
        open={isEditActionOpen}
        onOpenChange={setIsEditActionOpen}
        action={selectedAction}
        onSubmit={handleUpdateAction}
        isLoading={updateActionMutation.isPending}
        teamMembers={Array.isArray(teamMembers) ? teamMembers : []}
      />
    </div>
  );
}

// New Calendar Action Dialog Component
interface NewCalendarActionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: CalendarActionFormData) => void;
  isLoading: boolean;
  teamMembers: TeamMember[];
}

function NewCalendarActionDialog({ open, onOpenChange, onSubmit, isLoading, teamMembers }: NewCalendarActionDialogProps) {
  const form = useForm<CalendarActionFormData>({
    resolver: zodResolver(calendarActionFormSchema),
    defaultValues: {
      title: '',
      description: '',
      date: format(new Date(), 'yyyy-MM-dd'),
      sourceType: 'manual',
      assignedTo: '',
      assignedToName: '',
      isCompleted: false,
    },
  });

  const handleSubmit = (data: CalendarActionFormData) => {
    // Convert "none" to null for assignedTo
    const processedData = {
      ...data,
      assignedTo: data.assignedTo === "none" ? null : data.assignedTo,
      assignedToName: data.assignedTo === "none" ? null : data.assignedToName,
    };
    onSubmit(processedData);
    form.reset();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>New Calendar Action</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="What needs to be done?" data-testid="input-action-title" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (Optional)</FormLabel>
                  <FormControl>
                    <Textarea {...field} value={field.value || ''} placeholder="Additional details..." data-testid="textarea-action-description" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} data-testid="input-action-date" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="sourceType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Source</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-action-source">
                          <SelectValue placeholder="Select source" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="manual">Manual</SelectItem>
                        <SelectItem value="meeting">Meeting</SelectItem>
                        <SelectItem value="task">Task</SelectItem>
                        <SelectItem value="focus_song">Focus Song</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="assignedTo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Assigned To (Optional)</FormLabel>
                    <Select onValueChange={(value) => {
                      field.onChange(value);
                      const member = teamMembers.find(m => m.id === value);
                      if (member) {
                        form.setValue('assignedToName', member.name);
                      } else {
                        form.setValue('assignedToName', '');
                      }
                    }} value={field.value || ''}>
                      <FormControl>
                        <SelectTrigger data-testid="select-action-assignee">
                          <SelectValue placeholder="Select team member" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="none">None</SelectItem>
                        {teamMembers.map((member) => (
                          <SelectItem key={member.id} value={member.id}>
                            {member.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {/* Hidden field to track assignedToName */}
              <FormField
                control={form.control}
                name="assignedToName"
                render={({ field }) => (
                  <FormItem style={{ display: 'none' }}>
                    <FormControl>
                      <Input {...field} value={field.value || ''} type="hidden" />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
            
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading} data-testid="button-create-action">
                {isLoading ? 'Creating...' : 'Create Action'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

// Edit Calendar Action Dialog Component
interface EditCalendarActionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  action: CalendarAction | null;
  onSubmit: (data: CalendarActionFormData) => void;
  isLoading: boolean;
  teamMembers: TeamMember[];
}

function EditCalendarActionDialog({ open, onOpenChange, action, onSubmit, isLoading, teamMembers }: EditCalendarActionDialogProps) {
  const form = useForm<CalendarActionFormData>({
    resolver: zodResolver(calendarActionFormSchema),
    defaultValues: {
      title: '',
      description: '',
      date: '',
      sourceType: 'manual',
      assignedTo: '',
      assignedToName: '',
      isCompleted: false,
    },
  });

  // Pre-fill form when action changes
  React.useEffect(() => {
    if (action && open) {
      form.reset({
        title: action.title,
        description: action.description || '',
        date: action.date,
        sourceType: action.sourceType,
        assignedTo: action.assignedTo || '',
        assignedToName: action.assignedToName || '',
        isCompleted: action.isCompleted,
      });
    }
  }, [action, open, form]);

  const handleSubmit = (data: CalendarActionFormData) => {
    onSubmit(data);
  };

  if (!action) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Edit Calendar Action</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="What needs to be done?" data-testid="input-edit-action-title" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (Optional)</FormLabel>
                  <FormControl>
                    <Textarea {...field} value={field.value || ''} placeholder="Additional details..." data-testid="textarea-edit-action-description" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} data-testid="input-edit-action-date" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="sourceType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Source</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-edit-action-source">
                          <SelectValue placeholder="Select source" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="manual">Manual</SelectItem>
                        <SelectItem value="meeting">Meeting</SelectItem>
                        <SelectItem value="task">Task</SelectItem>
                        <SelectItem value="focus_song">Focus Song</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="assignedTo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Assigned To (Optional)</FormLabel>
                    <Select onValueChange={(value) => {
                      field.onChange(value);
                      const member = teamMembers.find(m => m.id === value);
                      if (member) {
                        form.setValue('assignedToName', member.name);
                      }
                    }} value={field.value || ''}>
                      <FormControl>
                        <SelectTrigger data-testid="select-edit-action-assignee">
                          <SelectValue placeholder="Select team member" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {teamMembers.map((member) => (
                          <SelectItem key={member.id} value={member.id}>
                            {member.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading} data-testid="button-update-action">
                {isLoading ? 'Updating...' : 'Update Action'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
