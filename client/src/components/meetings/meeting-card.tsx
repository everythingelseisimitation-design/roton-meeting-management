import { format } from "date-fns";
import { Clock, Users, MoreVertical, Edit, Trash2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useState } from "react";

interface MeetingCardProps {
  meeting: any;
  onClick?: () => void;
  onEditMeeting: (meeting: any) => void;
  onDeleteMeeting: (meetingId: string) => void;
  isUpdating?: boolean;
}

export default function MeetingCard({ meeting, onClick, onEditMeeting, onDeleteMeeting, isUpdating }: MeetingCardProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
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
        return 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300';
      case 'focus_songs_update':
        return 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300';
      case 'focus_songs_strategy':
        return 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300';
      case 'weekly_recap':
        return 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300';
      default:
        return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300';
    }
  };

  const getDayAbbreviation = (date: string) => {
    return format(new Date(date), 'EEE').toUpperCase();
  };

  const getStatusBadge = (date: string, time: string) => {
    const meetingDate = new Date(`${date}T${time}`);
    const now = new Date();
    
    if (meetingDate > now) {
      return <Badge className="bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300">Scheduled</Badge>;
    } else {
      return <Badge className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">Completed</Badge>;
    }
  };

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEditMeeting(meeting);
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowDeleteDialog(true);
  };

  const handleConfirmDelete = () => {
    setShowDeleteDialog(false);
    onDeleteMeeting(meeting.id);
  };

  const handleCardClick = () => {
    if (onClick) {
      onClick();
    }
  };

  return (
    <>
      <Card 
        className="meeting-card cursor-pointer transition-all hover:shadow-md" 
        onClick={handleCardClick}
        data-testid={`meeting-card-${meeting.id}`}
      >
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-secondary rounded-lg flex items-center justify-center">
              <span className="text-sm font-medium text-secondary-foreground">
                {getDayAbbreviation(meeting.date)}
              </span>
            </div>
            <div>
              <h4 className="font-medium text-foreground" data-testid={`meeting-title-${meeting.id}`}>
                {meeting.title}
              </h4>
              <p className="text-sm text-muted-foreground" data-testid={`meeting-description-${meeting.id}`}>
                {meeting.description || getMeetingTypeName(meeting.type)}
              </p>
              <div className="flex items-center mt-1 space-x-4">
                <div className="flex items-center space-x-1">
                  <Clock className="w-3 h-3 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground" data-testid={`meeting-time-${meeting.id}`}>
                    {format(new Date(`2000-01-01T${meeting.time}`), 'h:mm a')}
                  </span>
                </div>
                <span className="text-xs text-muted-foreground">•</span>
                <div className="flex items-center space-x-1">
                  <Users className="w-3 h-3 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground" data-testid={`meeting-participants-${meeting.id}`}>
                    {meeting.participants?.length ? `${meeting.participants.length} participants` : 'Full Team'}
                  </span>
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Badge className={getMeetingTypeColor(meeting.type)} data-testid={`meeting-type-${meeting.id}`}>
              {getMeetingTypeName(meeting.type)}
            </Badge>
            {getStatusBadge(meeting.date, meeting.time)}
            
            {/* 3-dot Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8 text-muted-foreground hover:text-foreground"
                  disabled={isUpdating}
                  data-testid={`meeting-menu-${meeting.id}`}
                >
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuSeparator />
                
                <DropdownMenuItem onClick={handleEditClick} data-testid={`edit-meeting-${meeting.id}`}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Meeting
                </DropdownMenuItem>
                
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={handleDeleteClick}
                  className="text-red-600 focus:text-red-600 dark:text-red-400 dark:focus:text-red-400"
                  data-testid={`delete-meeting-${meeting.id}`}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Meeting
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardContent>
    </Card>

    <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Meeting</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete "{meeting.title}"? This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel data-testid="cancel-delete-meeting">Cancel</AlertDialogCancel>
          <AlertDialogAction 
            onClick={handleConfirmDelete}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            data-testid="confirm-delete-meeting"
          >
            Delete Meeting
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
    </>
  );
}