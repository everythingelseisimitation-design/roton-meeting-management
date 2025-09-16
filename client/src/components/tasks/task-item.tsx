import { format, isPast } from "date-fns";
import { CheckCircle, Clock, AlertCircle, User, MoreVertical, Edit, Trash2, Play, Pause, X, RotateCcw } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

interface TaskItemProps {
  task: any;
  onStatusChange: (taskId: string, status: string) => void;
  onEditTask: (task: any) => void;
  onDeleteTask: (taskId: string) => void;
  isUpdating?: boolean;
}

export default function TaskItem({ task, onStatusChange, onEditTask, onDeleteTask, isUpdating }: TaskItemProps) {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300';
      case 'medium':
        return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300';
      case 'low':
        return 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300';
      default:
        return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'done':
        return 'bg-green-500 text-white';
      case 'in_progress':
        return 'bg-blue-500 text-white';
      case 'paused':
        return 'bg-yellow-500 text-white';
      case 'not_done':
        return 'bg-red-500 text-white';
      case 'cancelled':
        return 'bg-gray-500 text-white';
      case 'todo':
      default:
        return 'bg-gray-300 text-gray-700';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'done':
        return <CheckCircle className="w-3 h-3" />;
      case 'in_progress':
        return <Play className="w-3 h-3" />;
      case 'paused':
        return <Pause className="w-3 h-3" />;
      case 'not_done':
        return <X className="w-3 h-3" />;
      case 'cancelled':
        return <RotateCcw className="w-3 h-3" />;
      case 'todo':
      default:
        return <Clock className="w-3 h-3" />;
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
      default:
        return '📋';
    }
  };

  const formatStatus = (status: string) => {
    switch (status) {
      case 'todo':
        return 'To Do';
      case 'in_progress':
        return 'In Progress';
      case 'not_done':
        return 'Not Done';
      default:
        return status.charAt(0).toUpperCase() + status.slice(1);
    }
  };

  const handleStatusChange = (newStatus: string) => {
    onStatusChange(task.id, newStatus);
  };

  const handleEditClick = () => {
    onEditTask(task);
  };

  const handleDeleteClick = () => {
    if (confirm('Are you sure you want to delete this task?')) {
      onDeleteTask(task.id);
    }
  };

  const isOverdue = task.deadline && isPast(new Date(task.deadline)) && !['done', 'cancelled'].includes(task.status);

  return (
    <Card className={`transition-colors ${task.status === 'done' ? 'opacity-75' : ''} ${isOverdue ? 'border-red-300' : ''}`} data-testid={`task-item-${task.id}`}>
      <CardContent className="p-4">
        <div className="flex items-start space-x-4">
          <div className="mt-1">
            {task.status === 'done' ? (
              <div className="w-5 h-5 bg-green-500 border-2 border-green-500 rounded flex items-center justify-center">
                <CheckCircle className="w-3 h-3 text-white" />
              </div>
            ) : (
              <Checkbox
                checked={false}
                onCheckedChange={() => handleStatusChange('done')}
                disabled={isUpdating}
                data-testid={`task-checkbox-${task.id}`}
              />
            )}
          </div>
          
          <div className="flex-1">
            <div className="flex items-start justify-between">
              <div className="space-y-1 flex-1">
                <div className="flex items-center justify-between">
                  <h4 
                    className={`font-medium ${task.status === 'done' ? 'line-through text-muted-foreground' : 'text-foreground'}`}
                    data-testid={`task-title-${task.id}`}
                  >
                    {task.title}
                  </h4>
                  <div className="flex items-center gap-2">
                    {/* Status Badge */}
                    <Badge className={`${getStatusColor(task.status)} text-xs flex items-center gap-1`}>
                      {getStatusIcon(task.status)}
                      {formatStatus(task.status)}
                    </Badge>
                    
                    {/* Priority Badge */}
                    <Badge className={`${getPriorityColor(task.priority)} text-xs`}>
                      {task.priority}
                    </Badge>

                    {/* 3-dot Menu */}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-8 w-8 p-0"
                          data-testid={`task-menu-${task.id}`}
                        >
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        
                        <DropdownMenuItem onClick={handleEditClick} data-testid={`edit-task-${task.id}`}>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit Task
                        </DropdownMenuItem>
                        
                        <DropdownMenuSeparator />
                        <DropdownMenuLabel>Change Status</DropdownMenuLabel>
                        
                        <DropdownMenuItem 
                          onClick={() => handleStatusChange('todo')}
                          disabled={task.status === 'todo'}
                          data-testid={`status-todo-${task.id}`}
                        >
                          <Clock className="h-4 w-4 mr-2" />
                          To Do
                        </DropdownMenuItem>
                        
                        <DropdownMenuItem 
                          onClick={() => handleStatusChange('in_progress')}
                          disabled={task.status === 'in_progress'}
                          data-testid={`status-in-progress-${task.id}`}
                        >
                          <Play className="h-4 w-4 mr-2" />
                          In Progress
                        </DropdownMenuItem>
                        
                        <DropdownMenuItem 
                          onClick={() => handleStatusChange('done')}
                          disabled={task.status === 'done'}
                          data-testid={`status-done-${task.id}`}
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Done
                        </DropdownMenuItem>
                        
                        <DropdownMenuItem 
                          onClick={() => handleStatusChange('paused')}
                          disabled={task.status === 'paused'}
                          data-testid={`status-paused-${task.id}`}
                        >
                          <Pause className="h-4 w-4 mr-2" />
                          Paused
                        </DropdownMenuItem>
                        
                        <DropdownMenuItem 
                          onClick={() => handleStatusChange('not_done')}
                          disabled={task.status === 'not_done'}
                          data-testid={`status-not-done-${task.id}`}
                        >
                          <X className="h-4 w-4 mr-2" />
                          Not Done
                        </DropdownMenuItem>
                        
                        <DropdownMenuItem 
                          onClick={() => handleStatusChange('cancelled')}
                          disabled={task.status === 'cancelled'}
                          data-testid={`status-cancelled-${task.id}`}
                        >
                          <RotateCcw className="h-4 w-4 mr-2" />
                          Cancelled
                        </DropdownMenuItem>
                        
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          onClick={handleDeleteClick}
                          className="text-red-600 focus:text-red-600"
                          data-testid={`delete-task-${task.id}`}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete Task
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
                
                {task.description && (
                  <p className={`text-sm ${task.status === 'done' ? 'text-muted-foreground' : 'text-muted-foreground'}`}>
                    {task.description}
                  </p>
                )}
                
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  {task.channel && (
                    <div className="flex items-center gap-1">
                      <span>{getChannelIcon(task.channel)}</span>
                      <span className="capitalize">{task.channel.replace('_', ' ')}</span>
                    </div>
                  )}
                  
                  {task.assignedToName && (
                    <div className="flex items-center gap-1">
                      <User className="w-3 h-3" />
                      <span>{task.assignedToName}</span>
                    </div>
                  )}
                  
                  {task.deadline && (
                    <div className={`flex items-center gap-1 ${isOverdue ? 'text-red-600 font-medium' : ''}`}>
                      {isOverdue ? <AlertCircle className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                      <span>{format(new Date(task.deadline), 'MMM d, yyyy')}</span>
                      {isOverdue && <span className="text-red-600 font-medium">(Overdue)</span>}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}