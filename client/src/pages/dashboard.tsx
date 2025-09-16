import { useQuery, useMutation } from "@tanstack/react-query";
import { Calendar, Music, Users, CheckCircle, Plus, Bell, Square, CheckSquare, Clock, User, TrendingUp, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import MeetingCard from "@/components/meetings/meeting-card";
import NewMeetingDialog from "@/components/meetings/new-meeting-dialog";
import EditMeetingDialog from "@/components/meetings/edit-meeting-dialog";
import { useState } from "react";
import { format, startOfWeek, endOfWeek } from "date-fns";
import { CalendarAction, type Meeting } from "@shared/schema";
import { useLocation } from "wouter";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function Dashboard() {
  const [isNewMeetingOpen, setIsNewMeetingOpen] = useState(false);
  const [isEditMeetingOpen, setIsEditMeetingOpen] = useState(false);
  const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(null);
  const [selectedMeetingId, setSelectedMeetingId] = useState<string | null>(null);
  const [deletingMeetingId, setDeletingMeetingId] = useState<string | null>(null);
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const today = new Date();
  const weekStart = format(startOfWeek(today), 'yyyy-MM-dd');
  const weekEnd = format(endOfWeek(today), 'yyyy-MM-dd');

  const { data: weeklyMeetings, isLoading: meetingsLoading } = useQuery({
    queryKey: ['/api/meetings', { startDate: weekStart, endDate: weekEnd }],
  });

  const { data: focusSongs, isLoading: songsLoading } = useQuery({
    queryKey: ['/api/focus-songs', { active: 'true' }],
  });

  const { data: teamMembers, isLoading: teamLoading } = useQuery({
    queryKey: ['/api/team-members'],
  });

  const { data: calendarActions, isLoading: actionsLoading } = useQuery({
    queryKey: ['/api/calendar-actions'],
  });

  const { data: allTasks, isLoading: tasksLoading } = useQuery({
    queryKey: ['/api/tasks'],
  });

  // Delete meeting mutation
  const deleteMeetingMutation = useMutation({
    mutationFn: async (meetingId: string) => {
      await apiRequest('DELETE', `/api/meetings/${meetingId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/meetings'] });
      setDeletingMeetingId(null);
      toast({
        title: "Success",
        description: "Meeting deleted successfully",
      });
    },
    onError: (error) => {
      setDeletingMeetingId(null);
      toast({
        title: "Error",
        description: "Failed to delete meeting",
        variant: "destructive",
      });
    },
  });

  // Handler functions
  const handleEditMeeting = (meeting: Meeting) => {
    setSelectedMeeting(meeting);
    setSelectedMeetingId(meeting.id);
    setIsEditMeetingOpen(true);
  };

  const handleDeleteMeeting = (meetingId: string) => {
    setDeletingMeetingId(meetingId);
    deleteMeetingMutation.mutate(meetingId);
  };

  // Filter tasks client-side instead of multiple API calls
  const pendingTasks = Array.isArray(allTasks) ? allTasks.filter((task: any) => task.status === 'todo') : [];
  const completedTasks = Array.isArray(allTasks) ? allTasks.filter((task: any) => task.status === 'done') : [];
  const inProgressTasks = Array.isArray(allTasks) ? allTasks.filter((task: any) => task.status === 'in_progress') : [];
  
  // Enhanced stats with calendar actions
  const pendingActions = Array.isArray(calendarActions) ? calendarActions.filter((action: CalendarAction) => !action.isCompleted) : [];
  const completedActions = Array.isArray(calendarActions) ? calendarActions.filter((action: CalendarAction) => action.isCompleted) : [];
  
  const stats = {
    focusSongs: Array.isArray(focusSongs) ? focusSongs.length : 0,
    pendingTasks: pendingTasks.length,
    weeklyMeetings: Array.isArray(weeklyMeetings) ? weeklyMeetings.length : 0,
    teamMembers: Array.isArray(teamMembers) ? teamMembers.length : 0,
    pendingActions: pendingActions.length,
    completedActions: completedActions.length,
    totalActions: Array.isArray(calendarActions) ? calendarActions.length : 0,
    completedTasks: completedTasks.length,
    inProgressTasks: inProgressTasks.length,
    totalTasks: Array.isArray(allTasks) ? allTasks.length : 0,
  };
  
  // Calculate completion rates
  const actionCompletionRate = stats.totalActions > 0 ? Math.round((stats.completedActions / stats.totalActions) * 100) : 0;
  const taskCompletionRate = stats.totalTasks > 0 ? Math.round((stats.completedTasks / stats.totalTasks) * 100) : 0;

  const departmentCounts = Array.isArray(teamMembers) ? teamMembers.reduce((acc: any, member: any) => {
    acc[member.department] = (acc[member.department] || 0) + 1;
    return acc;
  }, {}) : {};

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Dashboard</h2>
          <p className="text-sm text-muted-foreground">Comprehensive overview of meetings, tasks, focus songs, and action items</p>
        </div>
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost" 
            size="icon"
            data-testid="button-notifications"
            className="relative text-muted-foreground hover:text-foreground"
          >
            <Bell className="w-6 h-6" />
            <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-400"></span>
          </Button>
          <Button 
            onClick={() => setIsNewMeetingOpen(true)}
            data-testid="button-new-meeting"
            className="bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Meeting
          </Button>
        </div>
      </div>

      {/* Dashboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Week Overview */}
        <div className="lg:col-span-2">
          <Card data-testid="card-week-overview">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold">This Week's Meetings</h3>
                <span className="text-sm text-muted-foreground">
                  {format(startOfWeek(today), 'MMM d')} - {format(endOfWeek(today), 'MMM d, yyyy')}
                </span>
              </div>

              {meetingsLoading ? (
                <div className="space-y-4">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="h-20 bg-muted animate-pulse rounded-lg"></div>
                  ))}
                </div>
              ) : !Array.isArray(weeklyMeetings) || weeklyMeetings.length === 0 ? (
                <div className="text-center py-8">
                  <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No meetings scheduled for this week</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {Array.isArray(weeklyMeetings) && weeklyMeetings.map((meeting: any) => (
                    <MeetingCard 
                      key={meeting.id} 
                      meeting={meeting} 
                      onEditMeeting={handleEditMeeting} 
                      onDeleteMeeting={handleDeleteMeeting} 
                      isUpdating={deletingMeetingId === meeting.id}
                    />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Stats */}
        <div className="space-y-6">
          <Card data-testid="card-quick-stats">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4">Quick Stats</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Active Focus Songs</span>
                  <span className="text-lg font-semibold" data-testid="stat-focus-songs">{stats.focusSongs}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Pending Tasks</span>
                  <span className="text-lg font-semibold" data-testid="stat-pending-tasks">{stats.pendingTasks}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">This Week's Meetings</span>
                  <span className="text-lg font-semibold" data-testid="stat-weekly-meetings">{stats.weeklyMeetings}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Pending Actions</span>
                  <span className="text-lg font-semibold" data-testid="stat-pending-actions">{stats.pendingActions}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Team Members</span>
                  <span className="text-lg font-semibold" data-testid="stat-team-members">{stats.teamMembers}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card data-testid="card-completion-overview">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4">Completion Overview</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">Actions Progress</span>
                    <span className="text-sm font-medium">{actionCompletionRate}%</span>
                  </div>
                  <Progress value={actionCompletionRate} className="h-2" data-testid="progress-actions" />
                  <div className="flex items-center justify-between mt-1 text-xs text-muted-foreground">
                    <span>{stats.completedActions} completed</span>
                    <span>{stats.pendingActions} pending</span>
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">Tasks Progress</span>
                    <span className="text-sm font-medium">{taskCompletionRate}%</span>
                  </div>
                  <Progress value={taskCompletionRate} className="h-2" data-testid="progress-tasks" />
                  <div className="flex items-center justify-between mt-1 text-xs text-muted-foreground">
                    <span>{stats.completedTasks} completed</span>
                    <span>{stats.pendingTasks + stats.inProgressTasks} active</span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="w-4 h-4 text-green-500" />
                    <div>
                      <div className="text-sm font-medium">{stats.completedActions + stats.completedTasks}</div>
                      <div className="text-xs text-muted-foreground">Total Completed</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <AlertCircle className="w-4 h-4 text-amber-500" />
                    <div>
                      <div className="text-sm font-medium">{stats.pendingActions + stats.pendingTasks}</div>
                      <div className="text-xs text-muted-foreground">Needs Attention</div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Things We Said We Gonna Do Section */}
      <Card className="mb-8" data-testid="card-things-we-said">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <CheckSquare className="w-5 h-5" />
            <span>Things We Said We Gonna Do</span>
            <Badge variant="secondary" className="ml-2">
              {stats.pendingActions} pending
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {actionsLoading ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-20 bg-muted animate-pulse rounded-lg"></div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Pending Actions */}
              <div>
                <h4 className="font-medium mb-3 flex items-center">
                  <Square className="w-4 h-4 mr-2 text-amber-500" />
                  Pending ({stats.pendingActions})
                </h4>
                <div className="space-y-3">
                  {pendingActions.length === 0 ? (
                    <div className="text-center py-6 text-muted-foreground">
                      <CheckSquare className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">All caught up!</p>
                    </div>
                  ) : (
                    pendingActions.slice(0, 5).map((action: CalendarAction) => (
                      <div
                        key={action.id}
                        className="flex items-start space-x-3 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg"
                        data-testid={`dashboard-pending-action-${action.id}`}
                      >
                        <Square className="w-4 h-4 mt-0.5 text-amber-600" />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-amber-800 dark:text-amber-200 truncate">{action.title}</p>
                          <div className="flex items-center space-x-3 mt-1 text-xs text-amber-600 dark:text-amber-400">
                            <span className="flex items-center">
                              <Clock className="w-3 h-3 mr-1" />
                              {format(new Date(action.date), 'MMM d')}
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
                    ))
                  )}
                  {pendingActions.length > 5 && (
                    <div className="text-center">
                      <Button variant="ghost" size="sm" data-testid="button-view-all-pending-actions">
                        View {pendingActions.length - 5} more
                      </Button>
                    </div>
                  )}
                </div>
              </div>

              {/* Recently Completed Actions */}
              <div>
                <h4 className="font-medium mb-3 flex items-center">
                  <CheckSquare className="w-4 h-4 mr-2 text-green-500" />
                  Recently Completed ({stats.completedActions})
                </h4>
                <div className="space-y-3">
                  {completedActions.length === 0 ? (
                    <div className="text-center py-6 text-muted-foreground">
                      <Square className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">No completed actions yet</p>
                    </div>
                  ) : (
                    completedActions.slice(0, 5).map((action: CalendarAction) => (
                      <div
                        key={action.id}
                        className="flex items-start space-x-3 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg opacity-75"
                        data-testid={`dashboard-completed-action-${action.id}`}
                      >
                        <CheckSquare className="w-4 h-4 mt-0.5 text-green-600" />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-green-800 dark:text-green-200 line-through truncate">{action.title}</p>
                          <div className="flex items-center space-x-3 mt-1 text-xs text-green-600 dark:text-green-400">
                            <span className="flex items-center">
                              <Clock className="w-3 h-3 mr-1" />
                              Completed {action.completedDate ? format(new Date(action.completedDate), 'MMM d') : 'recently'}
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
                    ))
                  )}
                  {completedActions.length > 5 && (
                    <div className="text-center">
                      <Button variant="ghost" size="sm" data-testid="button-view-all-completed-actions">
                        View {completedActions.length - 5} more
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Focus Songs and Recent Tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card data-testid="card-active-focus-songs">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold">Active Focus Songs</h3>
              <Button 
                variant="ghost" 
                size="sm" 
                data-testid="button-view-all-songs"
                onClick={() => setLocation('/focus-songs')}
              >
                View All
              </Button>
            </div>

            {songsLoading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-16 bg-muted animate-pulse rounded-lg"></div>
                ))}
              </div>
            ) : !Array.isArray(focusSongs) || focusSongs.length === 0 ? (
              <div className="text-center py-8">
                <Music className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No active focus songs</p>
              </div>
            ) : (
              <div className="space-y-4">
                {Array.isArray(focusSongs) && focusSongs.slice(0, 3).map((song: any) => (
                  <div key={song.id} className="flex items-center justify-between p-4 border border-border rounded-lg" data-testid={`song-card-${song.id}`}>
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-secondary rounded-lg flex items-center justify-center">
                        <Music className="w-6 h-6 text-secondary-foreground" />
                      </div>
                      <div>
                        <h4 className="font-medium" data-testid={`song-title-${song.id}`}>{song.title}</h4>
                        <p className="text-sm text-muted-foreground" data-testid={`song-artist-${song.id}`}>{song.artist}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        song.status === 'active' ? 'bg-blue-100 text-blue-700' :
                        song.status === 'promoted' ? 'bg-green-100 text-green-700' :
                        'bg-yellow-100 text-yellow-700'
                      }`} data-testid={`song-status-${song.id}`}>
                        {song.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card data-testid="card-recent-tasks">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold">Recent Tasks</h3>
              <Button 
                variant="ghost" 
                size="sm" 
                data-testid="button-view-all-tasks"
                onClick={() => setLocation('/tasks')}
              >
                View All
              </Button>
            </div>

            {tasksLoading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-20 bg-muted animate-pulse rounded-lg"></div>
                ))}
              </div>
            ) : !Array.isArray(pendingTasks) || pendingTasks.length === 0 ? (
              <div className="text-center py-8">
                <CheckCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No pending tasks</p>
              </div>
            ) : (
              <div className="space-y-4">
                {Array.isArray(pendingTasks) && pendingTasks.slice(0, 3).map((task: any) => (
                  <div key={task.id} className="flex items-start space-x-4 p-4 border border-border rounded-lg" data-testid={`task-item-${task.id}`}>
                    <div className="w-5 h-5 border-2 border-gray-300 rounded mt-0.5"></div>
                    <div className="flex-1">
                      <h4 className="font-medium" data-testid={`task-title-${task.id}`}>{task.title}</h4>
                      <p className="text-sm text-muted-foreground mt-1" data-testid={`task-assignee-${task.id}`}>
                        Assigned to {task.assignedToName || 'Unassigned'}
                      </p>
                      <div className="flex items-center mt-2 space-x-4">
                        {task.deadline && (
                          <span className="text-xs text-muted-foreground" data-testid={`task-deadline-${task.id}`}>
                            Due: {format(new Date(task.deadline), 'MMM d')}
                          </span>
                        )}
                        <span className={`px-2 py-1 text-xs rounded-full status-${task.status}`} data-testid={`task-status-${task.id}`}>
                          {task.status.replace('_', ' ')}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Team Overview */}
      <Card data-testid="card-team-overview">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold">Team Overview</h3>
            <Button 
              variant="ghost" 
              size="sm" 
              data-testid="button-manage-team"
              onClick={() => setLocation('/team')}
            >
              Manage Team
            </Button>
          </div>

          {teamLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-32 bg-muted animate-pulse rounded-lg"></div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Marketing Department */}
              <div className="space-y-4" data-testid="department-marketing-overview">
                <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">Marketing</h4>
                <div className="space-y-3">
                  {Array.isArray(teamMembers) && teamMembers.filter((member: any) => member.department === 'marketing').slice(0, 5).map((member: any) => (
                    <div key={member.id} className="flex items-center space-x-3" data-testid={`team-member-${member.id}`}>
                      <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                        <span>{member.name.split(' ').map((n: string) => n[0]).join('')}</span>
                      </div>
                      <div>
                        <p className="text-sm font-medium">{member.name}</p>
                        <p className="text-xs text-muted-foreground">{member.jobTitle}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Digital Department */}
              <div className="space-y-4" data-testid="department-digital-overview">
                <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">Digital</h4>
                <div className="space-y-3">
                  {Array.isArray(teamMembers) && teamMembers.filter((member: any) => member.department === 'digital').slice(0, 5).map((member: any) => (
                    <div key={member.id} className="flex items-center space-x-3" data-testid={`team-member-${member.id}`}>
                      <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                        <span>{member.name.split(' ').map((n: string) => n[0]).join('')}</span>
                      </div>
                      <div>
                        <p className="text-sm font-medium">{member.name}</p>
                        <p className="text-xs text-muted-foreground">{member.jobTitle}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* A&R & International Department */}
              <div className="space-y-4" data-testid="department-ar-overview">
                <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">A&R & International</h4>
                <div className="space-y-3">
                  {Array.isArray(teamMembers) && teamMembers.filter((member: any) => member.department === 'ar_international').slice(0, 5).map((member: any) => (
                    <div key={member.id} className="flex items-center space-x-3" data-testid={`team-member-${member.id}`}>
                      <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                        <span>{member.name.split(' ').map((n: string) => n[0]).join('')}</span>
                      </div>
                      <div>
                        <p className="text-sm font-medium">{member.name}</p>
                        <p className="text-xs text-muted-foreground">{member.jobTitle}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <NewMeetingDialog open={isNewMeetingOpen} onOpenChange={setIsNewMeetingOpen} />
      <EditMeetingDialog 
        open={isEditMeetingOpen} 
        onOpenChange={setIsEditMeetingOpen}
        meeting={selectedMeeting}
        meetingId={selectedMeetingId}
      />
    </div>
  );
}
