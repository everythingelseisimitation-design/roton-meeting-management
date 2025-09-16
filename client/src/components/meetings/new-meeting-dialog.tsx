import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { TeamMemberSelector } from "@/components/ui/team-member-selector";
import { X } from "lucide-react";
import { useForm } from "react-hook-form";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAssignmentHelpers } from "@/hooks/use-team-members";

interface NewMeetingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
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

export default function NewMeetingDialog({ open, onOpenChange }: NewMeetingDialogProps) {
  const [selectedParticipants, setSelectedParticipants] = useState<string[]>([]);
  const { toast } = useToast();

  const { getParticipantData } = useAssignmentHelpers();

  const form = useForm({
    defaultValues: {
      title: '',
      type: '',
      description: '',
      date: '',
      time: '',
      duration: '60',
      agenda: [] as string[],
    }
  });

  const createMeetingMutation = useMutation({
    mutationFn: async (data: any) => {
      await apiRequest('POST', '/api/meetings', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/meetings'] });
      onOpenChange(false);
      form.reset();
      setSelectedParticipants([]);
      toast({
        title: "Success",
        description: "Meeting created successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create meeting",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: any) => {
    const participantEmails = getParticipantData(selectedParticipants);

    createMeetingMutation.mutate({
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

  const handleParticipantsChange = (participantIds: string | string[]) => {
    setSelectedParticipants(Array.isArray(participantIds) ? participantIds : [participantIds]);
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Meeting</DialogTitle>
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
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger data-testid="select-meeting-type">
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
                      <Input {...field} data-testid="input-meeting-title" />
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
                    <Textarea {...field} data-testid="textarea-meeting-description" />
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
                      <Input type="date" {...field} data-testid="input-meeting-date" />
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
                      <Input type="time" {...field} data-testid="input-meeting-time" />
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
                      <Input type="number" {...field} data-testid="input-meeting-duration" />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            {/* Participants */}
            <FormField
              control={form.control}
              name="participants"
              render={() => (
                <FormItem>
                  <FormLabel>Participants</FormLabel>
                  <FormControl>
                    <TeamMemberSelector
                      value={selectedParticipants}
                      onValueChange={handleParticipantsChange}
                      placeholder="Select participants..."
                      multiple={true}
                      context="meeting"
                      className="w-full"
                      data-testid="input-participants"
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            {/* Agenda */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <FormLabel>Agenda</FormLabel>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addAgendaItem}
                  data-testid="button-add-agenda-item"
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
                      data-testid={`input-agenda-item-${index}`}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => removeAgendaItem(index)}
                      data-testid={`button-remove-agenda-item-${index}`}
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
                disabled={createMeetingMutation.isPending}
                data-testid="button-create-meeting"
                className="bg-primary text-primary-foreground hover:bg-primary/90"
              >
                {createMeetingMutation.isPending ? 'Creating...' : 'Create Meeting'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
