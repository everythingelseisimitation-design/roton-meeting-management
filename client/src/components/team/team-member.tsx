import { Mail, Edit, Trash2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface TeamMemberProps {
  member: any;
  onEdit?: () => void;
  onDelete?: () => void;
}

export default function TeamMember({ member, onEdit, onDelete }: TeamMemberProps) {
  const getDepartmentColor = (department: string) => {
    switch (department) {
      case 'marketing':
        return 'bg-green-500';
      case 'digital':
        return 'bg-blue-500';
      case 'ar_international':
        return 'bg-purple-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getDepartmentName = (department: string) => {
    switch (department) {
      case 'marketing':
        return 'Marketing';
      case 'digital':
        return 'Digital';
      case 'ar_international':
        return 'A&R & International';
      default:
        return department;
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Card data-testid={`team-member-card-${member.id}`}>
      <CardContent className="p-4">
        <div className="flex items-center space-x-3 mb-3">
          <div className={`w-12 h-12 ${getDepartmentColor(member.department)} rounded-full flex items-center justify-center text-white text-sm font-medium`}>
            {getInitials(member.name)}
          </div>
          <div>
            <h4 className="font-medium text-foreground" data-testid={`member-name-${member.id}`}>
              {member.name}
            </h4>
            <p className="text-sm text-muted-foreground" data-testid={`member-title-${member.id}`}>
              {member.jobTitle}
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <Badge variant="outline" data-testid={`member-department-${member.id}`}>
            {getDepartmentName(member.department)}
          </Badge>
          
          {member.email && (
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <Mail className="w-3 h-3" />
              <span data-testid={`member-email-${member.id}`}>{member.email}</span>
            </div>
          )}
          
          {member.responsibilities && (
            <p className="text-xs text-muted-foreground mt-2" data-testid={`member-responsibilities-${member.id}`}>
              {member.responsibilities}
            </p>
          )}
        </div>

        <div className="flex space-x-2 mt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={onEdit}
            data-testid={`member-edit-${member.id}`}
          >
            <Edit className="w-3 h-3 mr-1" />
            Edit
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onDelete}
            data-testid={`member-delete-${member.id}`}
          >
            <Trash2 className="w-3 h-3 mr-1" />
            Delete
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
