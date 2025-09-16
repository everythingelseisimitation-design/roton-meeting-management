import { useState, useEffect } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { insertMeetingSchema, type Meeting } from "@shared/schema";
import { format } from "date-fns";

interface EditMeetingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  meeting: Meeting | null;
  meetingId: string | null;
}

const meetingTemplates = {
  marketing: {
    title: 'Marketing Meeting',
    agenda: [
      'Quick round of priorities',
      'Active songs (press, social, radio, content, video)',
      'New tasks assignment',
      'Weekly calendar review',
      'Final summary and assignments'
    ],
    duration: '60'
  },
  focus_songs_update: {
    title: 'Focus Songs Update Meeting',
    agenda: [
      'Focus songs updates (15 min per song)',
      'Last week\'s actions and results',
      'This week\'s plan',
      'Back catalog song selection (mandatory)',
      'Confirm tasks per department'
    ],
    duration: '90'
  },
  focus_songs_strategy: {
    title: 'Focus Songs Strategy Meeting',
    agenda: [
      'Follow-up on last week\'s proposals',
      'Analyze each song current status',
      'New ideas and strategies',
      'Clear actions and responsibilities',
      'Recap of assignments and deadlines'
    ],
    duration: '120'
  },
  weekly_recap: {
    title: 'Weekly Recap Meeting',
    agenda: [
      'Quick round of accomplishments',
      'Obstacles and challenges',
      'Progress recap on focus songs',
      'Notes for next week',
      'Action items review'
    ],
    duration: '45'
  }
};

export default function EditMeetingDialog({ open, onOpenChange, meeting, meetingId }: EditMeetingDialogProps) {
  const [selectedParticipants, setSelectedParticipants] = useState<string[]>([]);
  const { toast } = useToast();

  const { data: teamMembers } = useQuery({
    queryKey: ['/api/team-members'],
  });

  const form = useForm({
    resolver: zodResolver(insertMeetingSchema.extend({
      title: insertMeetingSchema.shape.title.min(1, "Meeting title is required"),
      date: insertMeetingSchema.shape.date.refine(val => val !== "", "Date is required"),
      time: insertMeetingSchema.shape.time.refine(val => val !== "", "Time is required"),
    })),
    defaultValues: {
      title: '',
      type: '',
      description: '',
      date: '',
      time: '',
      duration: '60',
      agenda: [] as string[],
      participants: [] as string[],
      createdBy: '',
      status: 'scheduled',
    }
  });

  const updateMeetingMutation = useMutation({
    mutationFn: async (data: any) => {
      if (!meetingId) throw new Error('Meeting ID is required');
      await apiRequest('PATCH', `/api/meetings/${meetingId}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/meetings'] });
      onOpenChange(false);
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

  // Initialize form with meeting data when meeting changes
  useEffect(() => {
    if (meeting && open) {
      // Format date for input field
      const formattedDate = meeting.date ? format(new Date(meeting.date), 'yyyy-MM-dd') : '';
      
      form.reset({
        title: meeting.title || '',
        type: meeting.type || '',
        description: meeting.description || '',
        date: formattedDate,
        time: meeting.time || '',
        duration: meeting.duration || '60',
        agenda: meeting.agenda || [],
        participants: meeting.participants || [],
        createdBy: meeting.createdBy || '',
        status: meeting.status || 'scheduled',
      });

      // Map participants to team member IDs
      if (meeting.participants && Array.isArray(teamMembers)) {
        const participantIds = meeting.participants.map(participantEmail => {
          const member = teamMembers.find((m: any) => 
            m.email === participantEmail || m.name === participantEmail
          );
          return member?.id;
        }).filter(Boolean);
        setSelectedParticipants(participantIds);
      }
    }
  }, [meeting, open, teamMembers, form]);

  const onSubmit = (data: any) => {
    const participantEmails = selectedParticipants.map(id => {
      const member = Array.isArray(teamMembers) ? teamMembers.find((m: any) => m.id === id) : undefined;
      return member?.email || member?.name;
    }).filter(Boolean);

    updateMeetingMutation.mutate({
      ...data,
      participants: participantEmails,
    });
  };

  const handleMeetingTypeChange = (type: string) => {
    const template = meetingTemplates[type as keyof typeof meetingTemplates];
    if (template) {
      form.setValue('title', template.title);
      form.setValue('duration', template.duration);
      form.setValue('agenda', template.agenda);
    }
  };

  const handleParticipantToggle = (memberId: string) => {
    setSelectedParticipants(prev => 
      prev.includes(memberId)
        ? prev.filter(id => id !== memberId)
        : [...prev, memberId]
    );
  };

  const removeParticipant = (memberId: string) => {
    setSelectedParticipants(prev => prev.filter(id => id !== memberId));
  };

  const addAgendaItem = () => {
    const currentAgenda = form.getValues('agenda') || [];
    form.setValue('agenda', [...currentAgenda, '']);
  };

  const removeAgendaItem = (index: number) => {
    const currentAgenda = form.getValues('agenda') || [];
    form.setValue('agenda', currentAgenda.filter((_, i) => i !== index));
  };

  const updateAgendaItem = (index: number, value: string) => {
    const currentAgenda = form.getValues('agenda') || [];
    const newAgenda = [...currentAgenda];
    newAgenda[index] = value;
    form.setValue('agenda', newAgenda);
  };

  if (!meeting) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Meeting</DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Meeting Type and Basic Info */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Meeting Type</FormLabel>
                    <Select 
                      onValueChange={(value) => {
                        field.onChange(value);
                        handleMeetingTypeChange(value);
                      }} 
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger data-testid="select-edit-meeting-type">
                          <SelectValue placeholder="Select meeting type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="marketing">Marketing Meeting</SelectItem>
                        <SelectItem value="focus_songs_update">Focus Songs Update</SelectItem>
                        <SelectItem value="focus_songs_strategy">Focus Songs Strategy</SelectItem>
                        <SelectItem value="weekly_recap">Weekly Recap</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Meeting Title</FormLabel>
                    <FormControl>
                      <Input {...field} data-testid="input-edit-meeting-title" />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea {...field} data-testid="textarea-edit-meeting-description" />
                  </FormControl>
                </FormItem>
              )}
            />

            {/* Date and Time */}
            <div className="grid grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} data-testid="input-edit-meeting-date" />
                    </FormControl>
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="time"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Time</FormLabel>
                    <FormControl>
                      <Input type="time" {...field} data-testid="input-edit-meeting-time" />
                    </FormControl>
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="duration"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Duration (minutes)</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} data-testid="input-edit-meeting-duration" />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            {/* Participants */}
            <div className="space-y-3">
              <FormLabel>Participants</FormLabel>
              
              {/* Selected Participants */}
              {selectedParticipants.length > 0 && (
                <div className="flex flex-wrap gap-2 p-3 border rounded-md bg-muted/30">
                  {selectedParticipants.map(memberId => {
                    const member = Array.isArray(teamMembers) ? teamMembers.find((m: any) => m.id === memberId) : undefined;
                    return member ? (
                      <Badge key={memberId} variant="secondary" className="pr-1">
                        {member.name}
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="ml-1 h-4 w-4 p-0"
                          onClick={() => removeParticipant(memberId)}
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </Badge>
                    ) : null;
                  })}
                </div>
              )}
              
              {/* Available Participants */}
              <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto border rounded-md p-3">
                {Array.isArray(teamMembers) && teamMembers.map((member: any) => (
                  <label
                    key={member.id}
                    className="flex items-center space-x-2 cursor-pointer hover:bg-muted/50 p-2 rounded"
                  >
                    <input
                      type="checkbox"
                      checked={selectedParticipants.includes(member.id)}
                      onChange={() => handleParticipantToggle(member.id)}
                      className="rounded border-border"
                    />
                    <div className="flex-1">
                      <div className="text-sm font-medium">{member.name}</div>
                      <div className="text-xs text-muted-foreground">{member.jobTitle}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Agenda */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <FormLabel>Agenda</FormLabel>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addAgendaItem}
                  data-testid="button-add-edit-agenda-item"
                >
                  Add Item
                </Button>
              </div>
              
              <div className="space-y-2">
                {(form.watch('agenda') || []).map((item: string, index: number) => (
                  <div key={index} className="flex items-center space-x-2">
                    <Input
                      value={item}
                      onChange={(e) => updateAgendaItem(index, e.target.value)}
                      placeholder={`Agenda item ${index + 1}`}
                      data-testid={`input-edit-agenda-item-${index}`}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => removeAgendaItem(index)}
                      data-testid={`button-remove-edit-agenda-item-${index}`}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-4 border-t">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={updateMeetingMutation.isPending}
                data-testid="button-update-meeting"
                className="bg-primary text-primary-foreground hover:bg-primary/90"
              >
                {updateMeetingMutation.isPending ? 'Updating...' : 'Update Meeting'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}