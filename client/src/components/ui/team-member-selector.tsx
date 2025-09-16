import { useState } from "react";
import { Check, ChevronsUpDown, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useTeamMembers, TeamMemberOption } from "@/hooks/use-team-members";

interface TeamMemberSelectorProps {
  value?: string | string[];
  onValueChange: (value: string | string[]) => void;
  placeholder?: string;
  multiple?: boolean;
  context?: 'youtube' | 'social_media' | 'spotify' | 'radio' | 'press' | 'meeting' | 'task';
  suggestByRole?: 'marketing' | 'digital' | 'ar_international';
  className?: string;
  disabled?: boolean;
  'data-testid'?: string;
}

export function TeamMemberSelector({
  value,
  onValueChange,
  placeholder = "Select team member...",
  multiple = false,
  context,
  suggestByRole,
  className,
  disabled = false,
  'data-testid': testId,
}: TeamMemberSelectorProps) {
  const [open, setOpen] = useState(false);
  const { allMembers, getSuggestedMembers, isLoading } = useTeamMembers({ suggestByRole });

  const selectedValues = Array.isArray(value) ? value : value ? [value] : [];
  const selectedMembers = selectedValues.map(id => allMembers.find(m => m.id === id)).filter(Boolean) as TeamMemberOption[];

  const suggestedMembers = context ? getSuggestedMembers(context) : [];
  const remainingMembers = allMembers.filter(member => 
    !suggestedMembers.some(suggested => suggested.id === member.id)
  );

  const handleSelect = (memberId: string) => {
    if (multiple) {
      const newSelection = selectedValues.includes(memberId)
        ? selectedValues.filter(id => id !== memberId)
        : [...selectedValues, memberId];
      onValueChange(newSelection);
    } else {
      onValueChange(selectedValues.includes(memberId) ? '' : memberId);
      setOpen(false);
    }
  };

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

  const renderMemberItem = (member: TeamMemberOption, isSuggested = false) => (
    <CommandItem
      key={member.id}
      value={member.id}
      onSelect={() => handleSelect(member.id)}
      className="flex items-center space-x-3 p-3"
      data-testid={`${testId}-option-${member.id}`}
    >
      <div className={cn(
        "w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium",
        getDepartmentColor(member.department)
      )}>
        {member.initials}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center space-x-2">
          <span className="font-medium">{member.name}</span>
          {isSuggested && (
            <Badge variant="secondary" className="text-xs">
              Suggested
            </Badge>
          )}
        </div>
        <div className="text-sm text-muted-foreground">
          {member.jobTitle} • {member.department.replace('_', ' & ').replace(/\b\w/g, l => l.toUpperCase())}
        </div>
      </div>
      <Check
        className={cn(
          "w-4 h-4",
          selectedValues.includes(member.id) ? "opacity-100" : "opacity-0"
        )}
      />
    </CommandItem>
  );

  if (isLoading) {
    return (
      <Button
        variant="outline"
        className={cn("justify-between", className)}
        disabled
        data-testid={testId}
      >
        Loading team members...
        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
      </Button>
    );
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("justify-between", className)}
          disabled={disabled}
          data-testid={testId}
        >
          {selectedMembers.length === 0 ? (
            <span className="text-muted-foreground">{placeholder}</span>
          ) : multiple ? (
            <div className="flex items-center space-x-1 flex-wrap">
              {selectedMembers.slice(0, 2).map(member => (
                <Badge key={member.id} variant="secondary" className="text-xs">
                  {member.name}
                </Badge>
              ))}
              {selectedMembers.length > 2 && (
                <Badge variant="secondary" className="text-xs">
                  +{selectedMembers.length - 2} more
                </Badge>
              )}
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <div className={cn(
                "w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-medium",
                getDepartmentColor(selectedMembers[0].department)
              )}>
                {selectedMembers[0].initials}
              </div>
              <span>{selectedMembers[0].name}</span>
            </div>
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" data-testid={`${testId}-popover`}>
        <Command>
          <CommandInput placeholder="Search team members..." />
          <CommandList>
            <CommandEmpty>No team member found.</CommandEmpty>
            
            {suggestedMembers.length > 0 && (
              <CommandGroup heading="Suggested for this role">
                {suggestedMembers.map(member => renderMemberItem(member, true))}
              </CommandGroup>
            )}
            
            {remainingMembers.length > 0 && (
              <CommandGroup heading={suggestedMembers.length > 0 ? "All Members" : "Team Members"}>
                {remainingMembers.map(member => renderMemberItem(member))}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}