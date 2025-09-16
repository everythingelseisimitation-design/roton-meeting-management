import { useQuery, useMutation } from "@tanstack/react-query";
import { Plus, Users, Mail, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import TeamMember from "@/components/team/team-member";

export default function Team() {
  const [isNewMemberOpen, setIsNewMemberOpen] = useState(false);
  const [isEditMemberOpen, setIsEditMemberOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<any>(null);
  const { toast } = useToast();

  const { data: teamMembers, isLoading } = useQuery({
    queryKey: ['/api/team-members'],
  });

  const form = useForm({
    defaultValues: {
      name: '',
      email: '',
      department: '',
      jobTitle: '',
      responsibilities: '',
    }
  });

  const editForm = useForm({
    defaultValues: {
      name: '',
      email: '',
      department: '',
      jobTitle: '',
      responsibilities: '',
    }
  });

  const createMemberMutation = useMutation({
    mutationFn: async (data: any) => {
      await apiRequest('POST', '/api/team-members', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/team-members'] });
      setIsNewMemberOpen(false);
      form.reset();
      toast({
        title: "Success",
        description: "Team member added successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to add team member",
        variant: "destructive",
      });
    },
  });

  const deleteMemberMutation = useMutation({
    mutationFn: async (memberId: string) => {
      await apiRequest('DELETE', `/api/team-members/${memberId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/team-members'] });
      setIsDeleteDialogOpen(false);
      setSelectedMember(null);
      toast({
        title: "Success",
        description: "Team member deleted successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete team member",
        variant: "destructive",
      });
    },
  });

  const updateMemberMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      await apiRequest('PATCH', `/api/team-members/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/team-members'] });
      setIsEditMemberOpen(false);
      setSelectedMember(null);
      editForm.reset();
      toast({
        title: "Success",
        description: "Team member updated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update team member",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: any) => {
    createMemberMutation.mutate(data);
  };

  const onEditSubmit = (data: any) => {
    if (selectedMember) {
      updateMemberMutation.mutate({ id: selectedMember.id, data });
    }
  };

  const handleEdit = (member: any) => {
    setSelectedMember(member);
    editForm.reset({
      name: member.name,
      email: member.email,
      department: member.department,
      jobTitle: member.jobTitle,
      responsibilities: member.responsibilities,
    });
    setIsEditMemberOpen(true);
  };

  const handleDelete = (member: any) => {
    setSelectedMember(member);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (selectedMember) {
      deleteMemberMutation.mutate(selectedMember.id);
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

  const filterByDepartment = (department: string) => {
    return Array.isArray(teamMembers) ? teamMembers.filter((member: any) => member.department === department) : [];
  };

  const marketingTeam = filterByDepartment('marketing');
  const digitalTeam = filterByDepartment('digital');
  const arTeam = filterByDepartment('ar_international');

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Team Management</h2>
          <p className="text-sm text-muted-foreground">Manage team members across Marketing, Digital, and A&R departments</p>
        </div>
        <Dialog open={isNewMemberOpen} onOpenChange={setIsNewMemberOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-add-member" className="bg-primary text-primary-foreground hover:bg-primary/90">
              <Plus className="w-4 h-4 mr-2" />
              Add Team Member
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add New Team Member</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name</FormLabel>
                        <FormControl>
                          <Input {...field} data-testid="input-member-name" />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input type="email" {...field} data-testid="input-member-email" />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="department"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Department</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-department">
                              <SelectValue placeholder="Select department" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="marketing">Marketing</SelectItem>
                            <SelectItem value="digital">Digital</SelectItem>
                            <SelectItem value="ar_international">A&R & International</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="jobTitle"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Job Title</FormLabel>
                        <FormControl>
                          <Input {...field} data-testid="input-job-title" />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="responsibilities"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Responsibilities</FormLabel>
                      <FormControl>
                        <Textarea {...field} data-testid="textarea-responsibilities" />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => setIsNewMemberOpen(false)}>
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={createMemberMutation.isPending}
                    data-testid="button-create-member"
                  >
                    {createMemberMutation.isPending ? 'Adding...' : 'Add Member'}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>

        {/* Edit Member Dialog */}
        <Dialog open={isEditMemberOpen} onOpenChange={setIsEditMemberOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit Team Member</DialogTitle>
            </DialogHeader>
            <Form {...editForm}>
              <form onSubmit={editForm.handleSubmit(onEditSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={editForm.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name</FormLabel>
                        <FormControl>
                          <Input {...field} data-testid="input-edit-member-name" />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={editForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input type="email" {...field} data-testid="input-edit-member-email" />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={editForm.control}
                    name="department"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Department</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-edit-department">
                              <SelectValue placeholder="Select department" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="marketing">Marketing</SelectItem>
                            <SelectItem value="digital">Digital</SelectItem>
                            <SelectItem value="ar_international">A&R & International</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={editForm.control}
                    name="jobTitle"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Job Title</FormLabel>
                        <FormControl>
                          <Input {...field} data-testid="input-edit-job-title" />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={editForm.control}
                  name="responsibilities"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Responsibilities</FormLabel>
                      <FormControl>
                        <Textarea {...field} data-testid="textarea-edit-responsibilities" />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => setIsEditMemberOpen(false)}>
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={updateMemberMutation.isPending}
                    data-testid="button-update-member"
                  >
                    {updateMemberMutation.isPending ? 'Updating...' : 'Update Member'}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogContent data-testid="delete-member-dialog">
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Team Member</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete <strong>{selectedMember?.name}</strong>? This action cannot be undone and will remove all associated data.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel data-testid="button-cancel-delete">Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={confirmDelete}
                disabled={deleteMemberMutation.isPending}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                data-testid="button-confirm-delete"
              >
                {deleteMemberMutation.isPending ? 'Deleting...' : 'Delete'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      {/* Team Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card data-testid="stat-total-members">
          <CardContent className="p-6 text-center">
            <div className="text-2xl font-bold text-foreground">{Array.isArray(teamMembers) ? teamMembers.length : 0}</div>
            <p className="text-sm text-muted-foreground">Total Members</p>
          </CardContent>
        </Card>
        
        <Card data-testid="stat-marketing-members">
          <CardContent className="p-6 text-center">
            <div className="text-2xl font-bold text-green-600">{marketingTeam.length}</div>
            <p className="text-sm text-muted-foreground">Marketing</p>
          </CardContent>
        </Card>
        
        <Card data-testid="stat-digital-members">
          <CardContent className="p-6 text-center">
            <div className="text-2xl font-bold text-blue-600">{digitalTeam.length}</div>
            <p className="text-sm text-muted-foreground">Digital</p>
          </CardContent>
        </Card>
        
        <Card data-testid="stat-ar-members">
          <CardContent className="p-6 text-center">
            <div className="text-2xl font-bold text-purple-600">{arTeam.length}</div>
            <p className="text-sm text-muted-foreground">A&R & International</p>
          </CardContent>
        </Card>
      </div>

      {/* Team Tabs */}
      <Tabs defaultValue="all" className="space-y-6">
        <TabsList>
          <TabsTrigger value="all" data-testid="tab-all-members">All Members</TabsTrigger>
          <TabsTrigger value="marketing" data-testid="tab-marketing">Marketing ({marketingTeam.length})</TabsTrigger>
          <TabsTrigger value="digital" data-testid="tab-digital">Digital ({digitalTeam.length})</TabsTrigger>
          <TabsTrigger value="ar" data-testid="tab-ar">A&R & International ({arTeam.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-6">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-48 bg-muted animate-pulse rounded-lg"></div>
              ))}
            </div>
          ) : !Array.isArray(teamMembers) || teamMembers.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Users className="w-16 h-16 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">No Team Members</h3>
                <p className="text-muted-foreground text-center mb-4">
                  Start building your team by adding your first team member.
                </p>
                <Button onClick={() => setIsNewMemberOpen(true)} data-testid="button-add-first-member">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Team Member
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" data-testid="all-members-grid">
              {Array.isArray(teamMembers) && teamMembers.map((member: any) => (
                <TeamMember 
                  key={member.id} 
                  member={member} 
                  onEdit={() => handleEdit(member)}
                  onDelete={() => handleDelete(member)}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="marketing" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-sm">M</span>
                </div>
                <div>
                  <h3 className="text-lg">Marketing Department</h3>
                  <p className="text-sm text-muted-foreground">Press, social media, radio, content, and video production</p>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {marketingTeam.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No marketing team members yet</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4" data-testid="marketing-members-grid">
                  {marketingTeam.map((member: any) => (
                    <TeamMember 
                      key={member.id} 
                      member={member} 
                      onEdit={() => handleEdit(member)}
                      onDelete={() => handleDelete(member)}
                    />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="digital" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-sm">D</span>
                </div>
                <div>
                  <h3 className="text-lg">Digital Department</h3>
                  <p className="text-sm text-muted-foreground">YouTube, digital strategy, Spotify, and platform optimization</p>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {digitalTeam.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No digital team members yet</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4" data-testid="digital-members-grid">
                  {digitalTeam.map((member: any) => (
                    <TeamMember 
                      key={member.id} 
                      member={member} 
                      onEdit={() => handleEdit(member)}
                      onDelete={() => handleDelete(member)}
                    />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ar" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-sm">A</span>
                </div>
                <div>
                  <h3 className="text-lg">A&R & International Department</h3>
                  <p className="text-sm text-muted-foreground">Artist development, international partnerships, and global radio</p>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {arTeam.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No A&R & International team members yet</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4" data-testid="ar-members-grid">
                  {arTeam.map((member: any) => (
                    <TeamMember 
                      key={member.id} 
                      member={member} 
                      onEdit={() => handleEdit(member)}
                      onDelete={() => handleDelete(member)}
                    />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
