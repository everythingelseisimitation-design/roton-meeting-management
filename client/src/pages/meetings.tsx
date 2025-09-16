import { useQuery, useMutation } from "@tanstack/react-query";
import { Plus, Calendar, Clock, Users, FileText, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";
import { format, isToday, isFuture, isPast } from "date-fns";
import MeetingCard from "@/components/meetings/meeting-card";
import NewMeetingDialog from "@/components/meetings/new-meeting-dialog";
import EditMeetingDialog from "@/components/meetings/edit-meeting-dialog";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogDescription 
} from "@/components/ui/dialog";

export default function Meetings() {
  const [isNewMeetingOpen, setIsNewMeetingOpen] = useState(false);
  const [isEditMeetingOpen, setIsEditMeetingOpen] = useState(false);
  const [selectedMeeting, setSelectedMeeting] = useState<any>(null);
  const [selectedMeetingId, setSelectedMeetingId] = useState<string | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const { toast } = useToast();

  const { data: meetings, isLoading } = useQuery({
    queryKey: ['/api/meetings'],
  });

  const updateMeetingMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      await apiRequest('PATCH', `/api/meetings/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/meetings'] });
      setIsEditMeetingOpen(false);
      setSelectedMeeting(null);
      setSelectedMeetingId(null);
      toast({
        title: "Success",
        description: "Meeting updated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update meeting",
        variant: "destructive",
      });
    },
  });

  const deleteMeetingMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest('DELETE', `/api/meetings/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/meetings'] });
      setIsDetailsOpen(false);
      setSelectedMeeting(null);
      toast({
        title: "Success",
        description: "Meeting deleted successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete meeting",
        variant: "destructive",
      });
    },
  });

  const getMeetingTypeName = (type: string) => {
    switch (type) {
      case 'marketing':
        return 'Marketing Meeting';
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

  const filterMeetings = (filter: 'all' | 'upcoming' | 'today' | 'past') => {
    if (!Array.isArray(meetings)) return [];
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    switch (filter) {
      case 'upcoming':
        return meetings.filter((meeting: any) => {
          const meetingDate = new Date(meeting.date);
          meetingDate.setHours(0, 0, 0, 0);
          return meetingDate > today;
        });
      case 'today':
        return meetings.filter((meeting: any) => {
          const meetingDate = new Date(meeting.date);
          meetingDate.setHours(0, 0, 0, 0);
          return meetingDate.getTime() === today.getTime();
        });
      case 'past':
        return meetings.filter((meeting: any) => {
          const meetingDate = new Date(meeting.date);
          meetingDate.setHours(0, 0, 0, 0);
          return meetingDate < today;
        });
      default:
        return meetings;
    }
  };

  const upcomingMeetings = filterMeetings('upcoming');
  const todayMeetings = filterMeetings('today');
  const pastMeetings = filterMeetings('past');

  const handleMeetingClick = (meeting: any) => {
    setSelectedMeeting(meeting);
    setIsDetailsOpen(true);
  };

  const handleEditMeeting = (meeting: any) => {
    setSelectedMeeting(meeting);
    setSelectedMeetingId(meeting.id);
    setIsEditMeetingOpen(true);
  };

  const handleDeleteMeeting = (meetingId: string) => {
    deleteMeetingMutation.mutate(meetingId);
  };

  const handleDeleteFromModal = () => {
    if (selectedMeeting) {
      deleteMeetingMutation.mutate(selectedMeeting.id);
    }
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Meetings</h2>
          <p className="text-sm text-muted-foreground">Manage team meetings and agendas</p>
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

      {/* Meeting Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card data-testid="stat-total-meetings">
          <CardContent className="p-6 text-center">
            <div className="text-2xl font-bold text-foreground">{Array.isArray(meetings) ? meetings.length : 0}</div>
            <p className="text-sm text-muted-foreground">Total Meetings</p>
          </CardContent>
        </Card>
        
        <Card data-testid="stat-today-meetings">
          <CardContent className="p-6 text-center">
            <div className="text-2xl font-bold text-blue-600">{todayMeetings.length}</div>
            <p className="text-sm text-muted-foreground">Today</p>
          </CardContent>
        </Card>
        
        <Card data-testid="stat-upcoming-meetings">
          <CardContent className="p-6 text-center">
            <div className="text-2xl font-bold text-green-600">{upcomingMeetings.length}</div>
            <p className="text-sm text-muted-foreground">Upcoming</p>
          </CardContent>
        </Card>
        
        <Card data-testid="stat-past-meetings">
          <CardContent className="p-6 text-center">
            <div className="text-2xl font-bold text-gray-600">{pastMeetings.length}</div>
            <p className="text-sm text-muted-foreground">Past</p>
          </CardContent>
        </Card>
      </div>

      {/* Meeting Tabs */}
      <Tabs defaultValue="all" className="space-y-6">
        <TabsList>
          <TabsTrigger value="all" data-testid="tab-all-meetings">All Meetings</TabsTrigger>
          <TabsTrigger value="today" data-testid="tab-today">Today ({todayMeetings.length})</TabsTrigger>
          <TabsTrigger value="upcoming" data-testid="tab-upcoming">Upcoming ({upcomingMeetings.length})</TabsTrigger>
          <TabsTrigger value="past" data-testid="tab-past">Past ({pastMeetings.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-24 bg-muted animate-pulse rounded-lg"></div>
              ))}
            </div>
          ) : !Array.isArray(meetings) || meetings.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Calendar className="w-16 h-16 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">No Meetings Scheduled</h3>
                <p className="text-muted-foreground text-center mb-4">
                  Start organizing your team by scheduling your first meeting.
                </p>
                <Button onClick={() => setIsNewMeetingOpen(true)} data-testid="button-add-first-meeting">
                  <Plus className="w-4 h-4 mr-2" />
                  Schedule Meeting
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div data-testid="all-meetings-list" className="space-y-4">
              {Array.isArray(meetings) && meetings.map((meeting: any) => (
                <MeetingCard 
                  key={meeting.id} 
                  meeting={meeting} 
                  onClick={() => handleMeetingClick(meeting)}
                  onEditMeeting={handleEditMeeting}
                  onDeleteMeeting={handleDeleteMeeting}
                  isUpdating={updateMeetingMutation.isPending || deleteMeetingMutation.isPending}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="today" className="space-y-4">
          {todayMeetings.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Clock className="w-16 h-16 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">No Meetings Today</h3>
                <p className="text-muted-foreground">No meetings scheduled for today</p>
              </CardContent>
            </Card>
          ) : (
            <div data-testid="today-meetings-list" className="space-y-4">
              {todayMeetings.map((meeting: any) => (
                <MeetingCard 
                  key={meeting.id} 
                  meeting={meeting} 
                  onClick={() => handleMeetingClick(meeting)}
                  onEditMeeting={handleEditMeeting}
                  onDeleteMeeting={handleDeleteMeeting}
                  isUpdating={updateMeetingMutation.isPending || deleteMeetingMutation.isPending}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="upcoming" className="space-y-4">
          {upcomingMeetings.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Calendar className="w-16 h-16 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">No Upcoming Meetings</h3>
                <p className="text-muted-foreground">No meetings scheduled for the future</p>
              </CardContent>
            </Card>
          ) : (
            <div data-testid="upcoming-meetings-list" className="space-y-4">
              {upcomingMeetings.map((meeting: any) => (
                <MeetingCard 
                  key={meeting.id} 
                  meeting={meeting} 
                  onClick={() => handleMeetingClick(meeting)}
                  onEditMeeting={handleEditMeeting}
                  onDeleteMeeting={handleDeleteMeeting}
                  isUpdating={updateMeetingMutation.isPending || deleteMeetingMutation.isPending}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="past" className="space-y-4">
          {pastMeetings.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <FileText className="w-16 h-16 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">No Past Meetings</h3>
                <p className="text-muted-foreground">Past meetings will appear here</p>
              </CardContent>
            </Card>
          ) : (
            <div data-testid="past-meetings-list" className="space-y-4">
              {pastMeetings.map((meeting: any) => (
                <MeetingCard 
                  key={meeting.id} 
                  meeting={meeting} 
                  onClick={() => handleMeetingClick(meeting)}
                  onEditMeeting={handleEditMeeting}
                  onDeleteMeeting={handleDeleteMeeting}
                  isUpdating={updateMeetingMutation.isPending || deleteMeetingMutation.isPending}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Meeting Details Dialog */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="max-w-2xl">
          {selectedMeeting && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center justify-between">
                  <span>{selectedMeeting.title}</span>
                  <Badge className={getMeetingTypeColor(selectedMeeting.type)}>
                    {getMeetingTypeName(selectedMeeting.type)}
                  </Badge>
                </DialogTitle>
                <DialogDescription>
                  {format(new Date(selectedMeeting.date), 'EEEE, MMMM d, yyyy')} at {format(new Date(`2000-01-01T${selectedMeeting.time}`), 'h:mm a')}
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-6">
                {selectedMeeting.description && (
                  <div>
                    <h4 className="font-medium mb-2">Description</h4>
                    <p className="text-sm text-muted-foreground">{selectedMeeting.description}</p>
                  </div>
                )}

                {selectedMeeting.participants && selectedMeeting.participants.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2">Participants</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedMeeting.participants.map((participant: string, index: number) => (
                        <Badge key={index} variant="secondary">{participant}</Badge>
                      ))}
                    </div>
                  </div>
                )}

                {selectedMeeting.agenda && selectedMeeting.agenda.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2">Agenda</h4>
                    <ul className="list-disc list-inside space-y-1">
                      {selectedMeeting.agenda.map((item: string, index: number) => (
                        <li key={index} className="text-sm text-muted-foreground">{item}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    Duration: {selectedMeeting.duration || 60} minutes
                  </span>
                </div>
              </div>

              <div className="flex justify-between pt-6 border-t">
                <Button
                  variant="destructive"
                  onClick={handleDeleteFromModal}
                  disabled={deleteMeetingMutation.isPending}
                  data-testid="button-delete-meeting"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  {deleteMeetingMutation.isPending ? 'Deleting...' : 'Delete Meeting'}
                </Button>
                
                <div className="space-x-2">
                  <Button variant="outline" onClick={() => setIsDetailsOpen(false)}>
                    Close
                  </Button>
                  <Button 
                    onClick={() => {
                      setIsDetailsOpen(false);
                      handleEditMeeting(selectedMeeting);
                    }}
                    data-testid="button-edit-meeting"
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Meeting
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

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
