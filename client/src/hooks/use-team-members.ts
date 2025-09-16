import { useQuery } from "@tanstack/react-query";
import { TeamMember } from "@shared/schema";

export interface TeamMemberOption {
  id: string;
  name: string;
  email: string;
  department: string;
  jobTitle: string;
  initials: string;
}

export interface UseTeamMembersOptions {
  filterByDepartment?: string;
  suggestByRole?: 'marketing' | 'digital' | 'ar_international';
}

export function useTeamMembers(options: UseTeamMembersOptions = {}) {
  const { data: teamMembers, isLoading, error } = useQuery({
    queryKey: ['/api/team-members'],
  });

  // Transform team members to standardized options
  const memberOptions: TeamMemberOption[] = Array.isArray(teamMembers) 
    ? teamMembers.map((member: any) => ({
        id: member.id,
        name: member.name,
        email: member.email || '',
        department: member.department,
        jobTitle: member.jobTitle || '',
        initials: getInitials(member.name),
      }))
    : [];

  // Filter by department if specified
  const filteredMembers = options.filterByDepartment
    ? memberOptions.filter(member => member.department === options.filterByDepartment)
    : memberOptions;

  // Get suggested members based on role/department
  const getSuggestedMembers = (context: 'youtube' | 'social_media' | 'spotify' | 'radio' | 'press' | 'meeting' | 'task') => {
    const suggestions: TeamMemberOption[] = [];
    
    switch (context) {
      case 'youtube':
      case 'social_media':
        suggestions.push(...memberOptions.filter(m => m.department === 'marketing' || m.department === 'digital'));
        break;
      case 'spotify':
      case 'radio':
      case 'press':
        suggestions.push(...memberOptions.filter(m => m.department === 'ar_international' || m.department === 'marketing'));
        break;
      case 'meeting':
        // For meetings, suggest all relevant department members
        suggestions.push(...memberOptions);
        break;
      case 'task':
        // For tasks, suggest based on the requesting department context
        if (options.suggestByRole) {
          suggestions.push(...memberOptions.filter(m => m.department === options.suggestByRole));
        } else {
          suggestions.push(...memberOptions);
        }
        break;
    }
    
    return suggestions.slice(0, 5); // Limit to top 5 suggestions
  };

  // Get member by ID
  const getMemberById = (id: string): TeamMemberOption | undefined => {
    return memberOptions.find(member => member.id === id);
  };

  // Get member by name or email
  const getMemberByNameOrEmail = (nameOrEmail: string): TeamMemberOption | undefined => {
    return memberOptions.find(member => 
      member.name === nameOrEmail || member.email === nameOrEmail
    );
  };

  // Convert member list to ID-name mapping for backward compatibility
  const getMemberMapping = (): Record<string, string> => {
    return memberOptions.reduce((acc, member) => {
      acc[member.id] = member.name;
      return acc;
    }, {} as Record<string, string>);
  };

  // Get department members
  const getDepartmentMembers = (department: string): TeamMemberOption[] => {
    return memberOptions.filter(member => member.department === department);
  };

  return {
    teamMembers: filteredMembers,
    allMembers: memberOptions,
    isLoading,
    error,
    getSuggestedMembers,
    getMemberById,
    getMemberByNameOrEmail,
    getMemberMapping,
    getDepartmentMembers,
    
    // Department shortcuts
    marketingMembers: getDepartmentMembers('marketing'),
    digitalMembers: getDepartmentMembers('digital'),
    arMembers: getDepartmentMembers('ar_international'),
  };
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map(part => part.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

// Helper hook for assignment handling
export function useAssignmentHelpers() {
  const { getMemberById, getMemberByNameOrEmail } = useTeamMembers();

  const getAssignmentData = (memberId: string) => {
    const member = getMemberById(memberId);
    return member ? {
      assignedTo: member.id,
      assignedToName: member.name,
    } : {
      assignedTo: '',
      assignedToName: '',
    };
  };

  const getParticipantData = (participantIds: string[]) => {
    return participantIds.map(id => {
      const member = getMemberById(id);
      return member?.email || member?.name || '';
    }).filter(Boolean);
  };

  return {
    getAssignmentData,
    getParticipantData,
  };
}