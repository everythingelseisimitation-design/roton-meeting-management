import { useQuery, useMutation } from "@tanstack/react-query";
import { Plus, Music, Youtube, Users, Radio, ListMusic, MoreVertical, TrendingUp, Calendar, Edit, Trash2, BarChart3, Search, Filter, Eye, ArrowUpRight, ArrowDownRight, ExternalLink } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar } from "recharts";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useForm } from "react-hook-form";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { FocusSong, TeamMember, DailyMetrics } from "@shared/schema";

export default function FocusSongs() {
  const [isNewSongOpen, setIsNewSongOpen] = useState(false);
  const [isMetricsOpen, setIsMetricsOpen] = useState(false);
  const [isEditSongOpen, setIsEditSongOpen] = useState(false);
  const [isDetailViewOpen, setIsDetailViewOpen] = useState(false);
  const [selectedSongId, setSelectedSongId] = useState<string | null>(null);
  const [selectedSong, setSelectedSong] = useState<FocusSong | null>(null);
  const [activeTab, setActiveTab] = useState<"active_focus" | "back_catalog">("active_focus");
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const { toast } = useToast();

  // Fetch focus songs
  const { data: allFocusSongs, isLoading: songsLoading } = useQuery<FocusSong[]>({
    queryKey: ['/api/focus-songs'],
  });

  // Filter songs by category
  const activeFocusSongs = allFocusSongs?.filter((song) => song.category === 'active_focus') || [];
  const backCatalogSongs = allFocusSongs?.filter((song) => song.category === 'back_catalog') || [];
  const activeLoading = songsLoading;
  const backCatalogLoading = songsLoading;

  // Fetch team members for assignment
  const { data: teamMembers } = useQuery<TeamMember[]>({
    queryKey: ['/api/team-members'],
  });

  // Fetch daily metrics for selected song
  const { data: dailyMetrics } = useQuery<DailyMetrics[]>({
    queryKey: ['/api/daily-metrics', selectedSongId],
    enabled: !!selectedSongId,
  });

  // Filter daily metrics by date if date filter is applied (after dailyMetrics is declared)
  const filteredDailyMetrics = dailyMetrics?.filter((metric) => {
    if (!dateFilter) return true;
    return metric.date === dateFilter;
  }) || [];

  const form = useForm({
    defaultValues: {
      title: '',
      artist: '',
      status: 'active',
      category: 'active_focus',
      releaseDate: '',
      youtubeProgress: '',
      socialMediaProgress: '',
      spotifyProgress: '',
      radioProgress: '',
      pressProgress: '',
      youtubeResponsible: '',
      socialMediaResponsible: '',
      spotifyResponsible: '',
      radioResponsible: '',
      pressResponsible: '',
      notes: '',
    }
  });

  const metricsForm = useForm({
    defaultValues: {
      date: new Date().toISOString().split('T')[0],
      channel: 'youtube',
      youtubeViews: '',
      youtubeAdViews: '',
      youtubeAvgTime: '',
      spotifyStreams: '',
      spotifyPlaylistEntries: '',
      instagramViews: '',
      tiktokViews: '',
      tiktokVideosPerSound: '',
      // Enhanced Social Media Tracking
      tiktokPostLink: '',
      tiktokPostViews: '',
      tiktokPostShares: '',
      tiktokPostLikes: '',
      tiktokPostSaves: '',
      instagramPostLink: '',
      instagramPostViews: '',
      instagramPostLikes: '',
      instagramVideosUsingSound: '',
      tiktokVideosUsingSound: '',
      pressReleasePickups: '',
      radioStationsPlaying: '',
      radioTotalPlays: '',
      notes: '',
    }
  });

  const createSongMutation = useMutation({
    mutationFn: async (data: any) => {
      await apiRequest('POST', '/api/focus-songs', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        predicate: (query) => Boolean(query.queryKey[0]?.toString().startsWith('/api/focus-songs'))
      });
      setIsNewSongOpen(false);
      form.reset();
      toast({
        title: "Success",
        description: "Focus track added successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to add focus track",
        variant: "destructive",
      });
    },
  });

  const updateSongMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      await apiRequest('PATCH', `/api/focus-songs/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        predicate: (query) => Boolean(query.queryKey[0]?.toString().startsWith('/api/focus-songs'))
      });
      setIsEditSongOpen(false);
      form.reset();
      toast({
        title: "Success",
        description: "Focus track updated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update focus track",
        variant: "destructive",
      });
    },
  });

  const deleteSongMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest('DELETE', `/api/focus-songs/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        predicate: (query) => Boolean(query.queryKey[0]?.toString().startsWith('/api/focus-songs'))
      });
      toast({
        title: "Success",
        description: "Focus track deleted successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete focus track",
        variant: "destructive",
      });
    },
  });

  const createMetricsMutation = useMutation({
    mutationFn: async (data: any) => {
      await apiRequest('POST', '/api/daily-metrics', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/daily-metrics', selectedSongId] });
      setIsMetricsOpen(false);
      metricsForm.reset();
      toast({
        title: "Success",
        description: "Daily metrics recorded successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to record metrics",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: any) => {
    createSongMutation.mutate(data);
  };

  const onMetricsSubmit = (data: any) => {
    createMetricsMutation.mutate({
      ...data,
      focusSongId: selectedSongId,
    });
  };

  const handleEditSong = (song: FocusSong) => {
    // Convert nullable fields to strings for form
    form.reset({
      title: song.title || '',
      artist: song.artist || '',
      status: song.status || 'active',
      category: song.category || 'active_focus',
      releaseDate: song.releaseDate || '',
      youtubeProgress: song.youtubeProgress || '',
      socialMediaProgress: song.socialMediaProgress || '',
      spotifyProgress: song.spotifyProgress || '',
      radioProgress: song.radioProgress || '',
      pressProgress: song.pressProgress || '',
      youtubeResponsible: song.youtubeResponsible || '',
      socialMediaResponsible: song.socialMediaResponsible || '',
      spotifyResponsible: song.spotifyResponsible || '',
      radioResponsible: song.radioResponsible || '',
      pressResponsible: song.pressResponsible || '',
      notes: song.notes || '',
    });
    setSelectedSongId(song.id);
    setIsEditSongOpen(true);
  };

  const onEditSubmit = (data: any) => {
    if (selectedSongId) {
      updateSongMutation.mutate({ id: selectedSongId, data });
    }
  };

  const handleDeleteSong = (id: string) => {
    if (confirm('Are you sure you want to delete this focus track?')) {
      deleteSongMutation.mutate(id);
    }
  };

  const handleViewMetrics = (songId: string) => {
    setSelectedSongId(songId);
    setIsMetricsOpen(true);
  };

  const handleViewDetails = (song: FocusSong) => {
    setSelectedSong(song);
    setSelectedSongId(song.id);
    setIsDetailViewOpen(true);
  };

  const currentSongs = activeTab === "active_focus" ? activeFocusSongs : backCatalogSongs;
  const isLoading = activeTab === "active_focus" ? activeLoading : backCatalogLoading;

  const filteredSongs = currentSongs?.filter((song) => {
    const matchesSearch = !searchTerm || 
      song.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      song.artist?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  }) || [];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'promoted': return 'bg-blue-500';
      case 'planning': return 'bg-yellow-500';
      case 'paused': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  // Robust numeric parsing function to handle comma-separated values
  const toNum = (value: any) => Number(String(value ?? '').replace(/[,\s]/g, '')) || 0;

  // Helper function to format numbers for display
  const formatNumber = (value: any) => {
    if (!value || value === '' || value === null || value === undefined) return '-';
    const num = toNum(value);
    if (num === 0) return '-';
    return num.toLocaleString();
  };

  // Helper function to render clickable social media links
  const renderSocialLink = (url: string, fallback: string = '-') => {
    if (!url || url === '' || url === null || url === undefined) return fallback;
    return (
      <a 
        href={url} 
        target="_blank" 
        rel="noopener noreferrer" 
        className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 hover:underline"
        onClick={(e) => e.stopPropagation()}
      >
        View Post
        <ExternalLink className="h-3 w-3" />
      </a>
    );
  };

  // Chart data preparation - use filtered metrics if date filter is applied
  const metricsToUse = dateFilter ? filteredDailyMetrics : dailyMetrics;
  const chartData = metricsToUse?.map((metric: any, index: number) => ({
    date: metric.date,
    youtubeViews: toNum(metric.youtubeViews),
    spotifyStreams: toNum(metric.spotifyStreams),
    instagramViews: toNum(metric.instagramViews),
    tiktokViews: toNum(metric.tiktokViews),
  })) || [];

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

  // Helper functions for calculating channel metrics
  const getLatestMetrics = () => {
    const metricsData = metricsToUse || [];
    if (!metricsData || metricsData.length === 0) return null;
    const latest = metricsData[metricsData.length - 1];
    const previous = metricsData.length > 1 ? metricsData[metricsData.length - 2] : null;
    
    return {
      latest,
      previous,
      youtube: {
        current: toNum(latest.youtubeViews),
        previous: previous ? toNum(previous.youtubeViews) : 0,
        growth: previous ? ((toNum(latest.youtubeViews) - toNum(previous.youtubeViews)) / Math.max(toNum(previous.youtubeViews), 1)) * 100 : 0
      },
      spotify: {
        current: toNum(latest.spotifyStreams),
        previous: previous ? toNum(previous.spotifyStreams) : 0,
        growth: previous ? ((toNum(latest.spotifyStreams) - toNum(previous.spotifyStreams)) / Math.max(toNum(previous.spotifyStreams), 1)) * 100 : 0
      },
      socialMedia: {
        currentTikTok: toNum(latest.tiktokViews),
        currentInstagram: toNum(latest.instagramViews),
        totalCurrent: toNum(latest.tiktokViews) + toNum(latest.instagramViews),
        totalPrevious: previous ? toNum(previous.tiktokViews) + toNum(previous.instagramViews) : 0,
        growth: previous ? (((toNum(latest.tiktokViews) + toNum(latest.instagramViews)) - (toNum(previous.tiktokViews) + toNum(previous.instagramViews))) / Math.max((toNum(previous.tiktokViews) + toNum(previous.instagramViews)), 1)) * 100 : 0,
        engagementRate: (toNum(latest.tiktokPostLikes) + toNum(latest.instagramPostLikes)) / Math.max((toNum(latest.tiktokViews) + toNum(latest.instagramViews)), 1) * 100
      },
      radio: {
        currentStations: toNum(latest.radioStationsPlaying),
        currentPlays: toNum(latest.radioTotalPlays),
        previousStations: previous ? toNum(previous.radioStationsPlaying) : 0,
        previousPlays: previous ? toNum(previous.radioTotalPlays) : 0,
        stationsGrowth: previous ? ((toNum(latest.radioStationsPlaying) - toNum(previous.radioStationsPlaying)) / Math.max(toNum(previous.radioStationsPlaying), 1)) * 100 : 0,
        playsGrowth: previous ? ((toNum(latest.radioTotalPlays) - toNum(previous.radioTotalPlays)) / Math.max(toNum(previous.radioTotalPlays), 1)) * 100 : 0
      }
    };
  };

  const renderTrendIndicator = (growth: number) => {
    if (growth === 0) return null;
    const isPositive = growth > 0;
    const color = isPositive ? 'text-green-600' : 'text-red-600';
    const Icon = isPositive ? ArrowUpRight : ArrowDownRight;
    
    return (
      <div className={`inline-flex items-center gap-1 ${color} text-xs font-medium`}>
        <Icon className="h-3 w-3" />
        {Math.abs(growth).toFixed(1)}%
      </div>
    );
  };

  const metrics = getLatestMetrics();

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Focus Tracks</h1>
          <p className="text-muted-foreground">Track and manage song performance across all channels</p>
        </div>
        <div className="flex items-center space-x-4">
          {/* Search and Filter */}
          <div className="flex items-center space-x-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search songs or artists..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-64"
                data-testid="input-search-songs"
              />
            </div>
            <div className="relative">
              <Input
                type="date"
                placeholder="Filter by date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="w-40"
                data-testid="input-date-filter"
              />
            </div>
          </div>
          <Dialog open={isNewSongOpen} onOpenChange={setIsNewSongOpen}>
            <DialogTrigger asChild>
              <Button data-testid="button-add-focus-track">
                <Plus className="h-4 w-4 mr-2" />
                Add Focus Track
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col">
              <DialogHeader className="flex-shrink-0">
                <DialogTitle>Add New Focus Track</DialogTitle>
              </DialogHeader>
              <div className="flex-1 overflow-y-auto pr-2">
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Song Title</FormLabel>
                          <FormControl>
                            <Input {...field} data-testid="input-song-title" />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="artist"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Artist</FormLabel>
                          <FormControl>
                            <Input {...field} data-testid="input-artist" />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <FormField
                      control={form.control}
                      name="category"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Category</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-category">
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="active_focus">Active Focus Song</SelectItem>
                              <SelectItem value="back_catalog">Back Catalog</SelectItem>
                            </SelectContent>
                          </Select>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="status"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Status</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-status">
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="active">Active</SelectItem>
                              <SelectItem value="promoted">Promoted</SelectItem>
                              <SelectItem value="planning">Planning</SelectItem>
                              <SelectItem value="paused">Paused</SelectItem>
                            </SelectContent>
                          </Select>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="releaseDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Release Date</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} data-testid="input-release-date" />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Channel Progress and Responsibilities */}
                  <div className="space-y-4">
                    <h4 className="font-medium">Channel Progress & Responsibilities</h4>
                    
                    {/* YouTube */}
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="youtubeProgress"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center gap-2">
                              <Youtube className="h-4 w-4" />
                              YouTube Progress
                            </FormLabel>
                            <FormControl>
                              <Textarea {...field} placeholder="Current YouTube status and metrics" />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="youtubeResponsible"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>YouTube Responsible</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select team member" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {teamMembers?.map((member: any) => (
                                  <SelectItem key={member.id} value={member.name}>
                                    {member.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Spotify */}
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="spotifyProgress"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center gap-2">
                              <ListMusic className="h-4 w-4" />
                              Spotify Progress
                            </FormLabel>
                            <FormControl>
                              <Textarea {...field} placeholder="Current Spotify status and metrics" />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="spotifyResponsible"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Spotify Responsible</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select team member" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {teamMembers?.map((member: any) => (
                                  <SelectItem key={member.id} value={member.name}>
                                    {member.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Social Media */}
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="socialMediaProgress"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center gap-2">
                              <Users className="h-4 w-4" />
                              Social Media Progress
                            </FormLabel>
                            <FormControl>
                              <Textarea {...field} placeholder="Current social media status and metrics" />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="socialMediaResponsible"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Social Media Responsible</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select team member" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {teamMembers?.map((member: any) => (
                                  <SelectItem key={member.id} value={member.name}>
                                    {member.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Radio */}
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="radioProgress"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center gap-2">
                              <Radio className="h-4 w-4" />
                              Radio Progress
                            </FormLabel>
                            <FormControl>
                              <Textarea {...field} placeholder="Current radio status and metrics" />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="radioResponsible"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Radio Responsible</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select team member" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {teamMembers?.map((member: any) => (
                                  <SelectItem key={member.id} value={member.name}>
                                    {member.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Notes</FormLabel>
                        <FormControl>
                          <Textarea {...field} placeholder="Additional notes and strategy details" />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <div className="flex justify-end space-x-2 pt-4 border-t bg-background sticky bottom-0">
                    <Button type="button" variant="outline" onClick={() => setIsNewSongOpen(false)}>
                      Cancel
                    </Button>
                    <Button 
                      type="submit" 
                      disabled={createSongMutation.isPending}
                      data-testid="button-create-song"
                    >
                      {createSongMutation.isPending ? 'Creating...' : 'Add Focus Track'}
                    </Button>
                  </div>
                </form>
              </Form>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Tabs for Active Focus vs Back Catalog */}
      <Tabs value={activeTab} onValueChange={(value: any) => setActiveTab(value)}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="active_focus" data-testid="tab-active-focus">
            Active Focus Songs
          </TabsTrigger>
          <TabsTrigger value="back_catalog" data-testid="tab-back-catalog">
            Back Catalog
          </TabsTrigger>
        </TabsList>

        <TabsContent value="active_focus" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {isLoading ? (
              <div className="col-span-full text-center py-8">Loading...</div>
            ) : !Array.isArray(filteredSongs) || filteredSongs.length === 0 ? (
              <div className="col-span-full text-center py-8">
                <Music className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">
                  {searchTerm ? `No tracks found matching "${searchTerm}"` : "No active focus tracks yet"}
                </p>
                <p className="text-sm text-muted-foreground">
                  {searchTerm ? "Try adjusting your search terms" : "Add your first track to get started"}
                </p>
              </div>
            ) : (
              filteredSongs.map((song: any) => (
                <Card key={song.id} className="relative cursor-pointer hover:shadow-lg transition-shadow" data-testid={`song-card-${song.id}`} onClick={() => handleViewDetails(song)}>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg">{song.title}</CardTitle>
                        <p className="text-sm text-muted-foreground">{song.artist}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge className={`${getStatusColor(song.status)} text-white`}>
                          {song.status}
                        </Badge>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" data-testid={`menu-song-${song.id}`} onClick={(e) => e.stopPropagation()}>
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleViewDetails(song); }}>
                              <Eye className="h-4 w-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleEditSong(song); }}>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit Track
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleViewMetrics(song.id); }}>
                              <BarChart3 className="h-4 w-4 mr-2" />
                              Add Daily Metrics
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={(e) => { e.stopPropagation(); handleDeleteSong(song.id); }}
                              className="text-red-600"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete Track
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {/* Channel Progress Indicators */}
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="flex items-center gap-1">
                        <Youtube className="h-3 w-3 text-red-500" />
                        <span className="truncate">{song.youtubeProgress || 'Not started'}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <ListMusic className="h-3 w-3 text-green-500" />
                        <span className="truncate">{song.spotifyProgress || 'Not started'}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="h-3 w-3 text-blue-500" />
                        <span className="truncate">{song.socialMediaProgress || 'Not started'}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Radio className="h-3 w-3 text-purple-500" />
                        <span className="truncate">{song.radioProgress || 'Not started'}</span>
                      </div>
                    </div>

                    {song.notes && (
                      <div className="pt-2 border-t">
                        <p className="text-xs text-muted-foreground">{song.notes}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="back_catalog" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {isLoading ? (
              <div className="col-span-full text-center py-8">Loading...</div>
            ) : !Array.isArray(filteredSongs) || filteredSongs.length === 0 ? (
              <div className="col-span-full text-center py-8">
                <Music className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">
                  {searchTerm ? `No tracks found matching "${searchTerm}"` : "No back catalog tracks yet"}
                </p>
                <p className="text-sm text-muted-foreground">
                  {searchTerm ? "Try adjusting your search terms" : "Add tracks to your back catalog"}
                </p>
              </div>
            ) : (
              filteredSongs.map((song: any) => (
                <Card key={song.id} className="relative cursor-pointer hover:shadow-lg transition-shadow" data-testid={`song-card-${song.id}`} onClick={() => handleViewDetails(song)}>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg">{song.title}</CardTitle>
                        <p className="text-sm text-muted-foreground">{song.artist}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge className={`${getStatusColor(song.status)} text-white`}>
                          {song.status}
                        </Badge>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" data-testid={`menu-song-${song.id}`} onClick={(e) => e.stopPropagation()}>
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleViewDetails(song); }}>
                              <Eye className="h-4 w-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleEditSong(song); }}>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit Track
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleViewMetrics(song.id); }}>
                              <BarChart3 className="h-4 w-4 mr-2" />
                              Add Daily Metrics
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={(e) => { e.stopPropagation(); handleDeleteSong(song.id); }}
                              className="text-red-600"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete Track
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {/* Same content structure as active focus songs */}
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="flex items-center gap-1">
                        <Youtube className="h-3 w-3 text-red-500" />
                        <span className="truncate">{song.youtubeProgress || 'Not started'}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <ListMusic className="h-3 w-3 text-green-500" />
                        <span className="truncate">{song.spotifyProgress || 'Not started'}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="h-3 w-3 text-blue-500" />
                        <span className="truncate">{song.socialMediaProgress || 'Not started'}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Radio className="h-3 w-3 text-purple-500" />
                        <span className="truncate">{song.radioProgress || 'Not started'}</span>
                      </div>
                    </div>

                    {song.notes && (
                      <div className="pt-2 border-t">
                        <p className="text-xs text-muted-foreground">{song.notes}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Detailed Song View Dialog */}
      <Dialog open={isDetailViewOpen} onOpenChange={setIsDetailViewOpen}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Music className="h-5 w-5" />
              <span>{selectedSong?.title} by {selectedSong?.artist}</span>
              <Badge className={`${getStatusColor(selectedSong?.status || 'active')} text-white ml-2`}>
                {selectedSong?.status || 'active'}
              </Badge>
            </DialogTitle>
          </DialogHeader>
          
          {selectedSong && (
            <div className="space-y-6">
              {/* Song Info and Quick Actions */}
              <div className="flex justify-between items-start">
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Release Date: {selectedSong.releaseDate}</p>
                  <p className="text-sm text-muted-foreground">Category: {selectedSong.category === 'active_focus' ? 'Active Focus Song' : 'Back Catalog'}</p>
                </div>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm" onClick={() => handleEditSong(selectedSong)}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Track
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleViewMetrics(selectedSong.id)}>
                    <BarChart3 className="h-4 w-4 mr-2" />
                    Add Metrics
                  </Button>
                </div>
              </div>

              {/* Performance Charts */}
              {chartData.length > 0 ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Line Chart - Trends over time */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <TrendingUp className="h-4 w-4" />
                        <span>Performance Trends</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={chartData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="date" />
                          <YAxis />
                          <Tooltip />
                          <Line type="monotone" dataKey="youtubeViews" stroke="#FF0000" name="YouTube Views" />
                          <Line type="monotone" dataKey="spotifyStreams" stroke="#1DB954" name="Spotify Streams" />
                          <Line type="monotone" dataKey="instagramViews" stroke="#E4405F" name="Instagram Views" />
                          <Line type="monotone" dataKey="tiktokViews" stroke="#000000" name="TikTok Views" />
                        </LineChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>

                  {/* Bar Chart - Latest metrics comparison */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Latest Performance Snapshot</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={chartData.slice(-1)}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="date" />
                          <YAxis />
                          <Tooltip />
                          <Bar dataKey="youtubeViews" fill="#FF0000" name="YouTube Views" />
                          <Bar dataKey="spotifyStreams" fill="#1DB954" name="Spotify Streams" />
                          <Bar dataKey="instagramViews" fill="#E4405F" name="Instagram Views" />
                          <Bar dataKey="tiktokViews" fill="#000000" name="TikTok Views" />
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </div>
              ) : (
                <Card>
                  <CardContent className="text-center py-8">
                    <BarChart3 className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground">No performance data yet</p>
                    <p className="text-sm text-muted-foreground">Add daily metrics to see performance trends</p>
                    <Button className="mt-4" onClick={() => handleViewMetrics(selectedSong.id)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add First Metrics
                    </Button>
                  </CardContent>
                </Card>
              )}

              {/* Channel Progress Details */}
              <Card>
                <CardHeader>
                  <CardTitle>Channel Progress & Responsibilities</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      {/* YouTube Section */}
                      <div className="flex items-start space-x-3">
                        <Youtube className="h-5 w-5 text-red-500 mt-1" />
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium">YouTube</h4>
                            {metrics && renderTrendIndicator(metrics.youtube.growth)}
                          </div>
                          {metrics ? (
                            <div className="space-y-1">
                              <p className="text-sm text-muted-foreground">
                                <span className="font-medium text-foreground">
                                  {formatNumber(metrics.youtube.current)} views
                                </span>
                                {metrics.youtube.previous > 0 && (
                                  <span className="text-xs ml-2">
                                    (prev: {formatNumber(metrics.youtube.previous)})
                                  </span>
                                )}
                              </p>
                              {selectedSong.youtubeProgress && (
                                <p className="text-xs text-muted-foreground italic">
                                  {selectedSong.youtubeProgress}
                                </p>
                              )}
                            </div>
                          ) : (
                            <p className="text-sm text-muted-foreground">
                              {selectedSong.youtubeProgress || 'No data yet'}
                            </p>
                          )}
                          {selectedSong.youtubeResponsible && (
                            <Badge variant="outline" className="mt-1">{selectedSong.youtubeResponsible}</Badge>
                          )}
                        </div>
                      </div>
                      
                      {/* Spotify Section */}
                      <div className="flex items-start space-x-3">
                        <ListMusic className="h-5 w-5 text-green-500 mt-1" />
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium">Spotify</h4>
                            {metrics && renderTrendIndicator(metrics.spotify.growth)}
                          </div>
                          {metrics ? (
                            <div className="space-y-1">
                              <p className="text-sm text-muted-foreground">
                                <span className="font-medium text-foreground">
                                  {formatNumber(metrics.spotify.current)} streams
                                </span>
                                {metrics.spotify.previous > 0 && (
                                  <span className="text-xs ml-2">
                                    (prev: {formatNumber(metrics.spotify.previous)})
                                  </span>
                                )}
                              </p>
                              {selectedSong.spotifyProgress && (
                                <p className="text-xs text-muted-foreground italic">
                                  {selectedSong.spotifyProgress}
                                </p>
                              )}
                            </div>
                          ) : (
                            <p className="text-sm text-muted-foreground">
                              {selectedSong.spotifyProgress || 'No data yet'}
                            </p>
                          )}
                          {selectedSong.spotifyResponsible && (
                            <Badge variant="outline" className="mt-1">{selectedSong.spotifyResponsible}</Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      {/* Social Media Section */}
                      <div className="flex items-start space-x-3">
                        <Users className="h-5 w-5 text-blue-500 mt-1" />
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium">Social Media</h4>
                            {metrics && renderTrendIndicator(metrics.socialMedia.growth)}
                          </div>
                          {metrics ? (
                            <div className="space-y-1">
                              <p className="text-sm text-muted-foreground">
                                <span className="font-medium text-foreground">
                                  {formatNumber(metrics.socialMedia.totalCurrent)} total views
                                </span>
                                {metrics.socialMedia.totalPrevious > 0 && (
                                  <span className="text-xs ml-2">
                                    (prev: {formatNumber(metrics.socialMedia.totalPrevious)})
                                  </span>
                                )}
                              </p>
                              <div className="flex gap-4 text-xs text-muted-foreground">
                                <span>TikTok: {formatNumber(metrics.socialMedia.currentTikTok)}</span>
                                <span>Instagram: {formatNumber(metrics.socialMedia.currentInstagram)}</span>
                              </div>
                              {metrics.socialMedia.engagementRate > 0 && (
                                <p className="text-xs text-muted-foreground">
                                  Engagement: {metrics.socialMedia.engagementRate.toFixed(2)}%
                                </p>
                              )}
                              {selectedSong.socialMediaProgress && (
                                <p className="text-xs text-muted-foreground italic">
                                  {selectedSong.socialMediaProgress}
                                </p>
                              )}
                            </div>
                          ) : (
                            <p className="text-sm text-muted-foreground">
                              {selectedSong.socialMediaProgress || 'No data yet'}
                            </p>
                          )}
                          {selectedSong.socialMediaResponsible && (
                            <Badge variant="outline" className="mt-1">{selectedSong.socialMediaResponsible}</Badge>
                          )}
                        </div>
                      </div>
                      
                      {/* Radio Section */}
                      <div className="flex items-start space-x-3">
                        <Radio className="h-5 w-5 text-purple-500 mt-1" />
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium">Radio</h4>
                            {metrics && renderTrendIndicator(Math.max(metrics.radio.stationsGrowth, metrics.radio.playsGrowth))}
                          </div>
                          {metrics && (metrics.radio.currentStations > 0 || metrics.radio.currentPlays > 0) ? (
                            <div className="space-y-1">
                              <div className="flex gap-4 text-sm text-muted-foreground">
                                {metrics.radio.currentStations > 0 && (
                                  <span className="font-medium text-foreground">
                                    {formatNumber(metrics.radio.currentStations)} stations
                                  </span>
                                )}
                                {metrics.radio.currentPlays > 0 && (
                                  <span className="font-medium text-foreground">
                                    {formatNumber(metrics.radio.currentPlays)} plays
                                  </span>
                                )}
                              </div>
                              {selectedSong.radioProgress && (
                                <p className="text-xs text-muted-foreground italic">
                                  {selectedSong.radioProgress}
                                </p>
                              )}
                            </div>
                          ) : (
                            <p className="text-sm text-muted-foreground">
                              {selectedSong.radioProgress || 'No data yet'}
                            </p>
                          )}
                          {selectedSong.radioResponsible && (
                            <Badge variant="outline" className="mt-1">{selectedSong.radioResponsible}</Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Enhanced Historical Metrics Table */}
              {dailyMetrics && dailyMetrics.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Historical Metrics</CardTitle>
                    <p className="text-sm text-muted-foreground">Comprehensive tracking across all channels and social media platforms</p>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left p-3 font-semibold">Date</th>
                            <th className="text-left p-3 font-semibold">YouTube Views</th>
                            <th className="text-left p-3 font-semibold">Spotify Streams</th>
                            
                            {/* TikTok Section */}
                            <th className="text-left p-3 font-semibold bg-gray-50 dark:bg-gray-800">TikTok Views</th>
                            <th className="text-left p-3 font-semibold bg-gray-50 dark:bg-gray-800">TikTok Post Link</th>
                            <th className="text-left p-3 font-semibold bg-gray-50 dark:bg-gray-800">TikTok Post Views</th>
                            <th className="text-left p-3 font-semibold bg-gray-50 dark:bg-gray-800">TikTok Post Shares</th>
                            <th className="text-left p-3 font-semibold bg-gray-50 dark:bg-gray-800">TikTok Post Likes</th>
                            <th className="text-left p-3 font-semibold bg-gray-50 dark:bg-gray-800">TikTok Post Saves</th>
                            <th className="text-left p-3 font-semibold bg-gray-50 dark:bg-gray-800">TikTok Videos Using Sound</th>
                            
                            {/* Instagram Section */}
                            <th className="text-left p-3 font-semibold bg-blue-50 dark:bg-blue-900/20">Instagram Views</th>
                            <th className="text-left p-3 font-semibold bg-blue-50 dark:bg-blue-900/20">Instagram Post Link</th>
                            <th className="text-left p-3 font-semibold bg-blue-50 dark:bg-blue-900/20">Instagram Post Views</th>
                            <th className="text-left p-3 font-semibold bg-blue-50 dark:bg-blue-900/20">Instagram Post Likes</th>
                            <th className="text-left p-3 font-semibold bg-blue-50 dark:bg-blue-900/20">Instagram Videos Using Sound</th>
                            
                            {/* Other Metrics */}
                            <th className="text-left p-3 font-semibold">Press Release Pickups</th>
                            <th className="text-left p-3 font-semibold">Radio Stations Playing</th>
                            <th className="text-left p-3 font-semibold">Radio Total Plays</th>
                          </tr>
                        </thead>
                        <tbody>
                          {dailyMetrics.map((metric: any, index: number) => (
                            <tr key={index} className="border-b hover:bg-gray-50 dark:hover:bg-gray-800/50">
                              <td className="p-3 font-medium">{metric.date}</td>
                              <td className="p-3">{formatNumber(metric.youtubeViews)}</td>
                              <td className="p-3">{formatNumber(metric.spotifyStreams)}</td>
                              
                              {/* TikTok Section */}
                              <td className="p-3 bg-gray-50 dark:bg-gray-800">{formatNumber(metric.tiktokViews)}</td>
                              <td className="p-3 bg-gray-50 dark:bg-gray-800">{renderSocialLink(metric.tiktokPostLink)}</td>
                              <td className="p-3 bg-gray-50 dark:bg-gray-800">{formatNumber(metric.tiktokPostViews)}</td>
                              <td className="p-3 bg-gray-50 dark:bg-gray-800">{formatNumber(metric.tiktokPostShares)}</td>
                              <td className="p-3 bg-gray-50 dark:bg-gray-800">{formatNumber(metric.tiktokPostLikes)}</td>
                              <td className="p-3 bg-gray-50 dark:bg-gray-800">{formatNumber(metric.tiktokPostSaves)}</td>
                              <td className="p-3 bg-gray-50 dark:bg-gray-800">{formatNumber(metric.tiktokVideosUsingSound)}</td>
                              
                              {/* Instagram Section */}
                              <td className="p-3 bg-blue-50 dark:bg-blue-900/20">{formatNumber(metric.instagramViews)}</td>
                              <td className="p-3 bg-blue-50 dark:bg-blue-900/20">{renderSocialLink(metric.instagramPostLink)}</td>
                              <td className="p-3 bg-blue-50 dark:bg-blue-900/20">{formatNumber(metric.instagramPostViews)}</td>
                              <td className="p-3 bg-blue-50 dark:bg-blue-900/20">{formatNumber(metric.instagramPostLikes)}</td>
                              <td className="p-3 bg-blue-50 dark:bg-blue-900/20">{formatNumber(metric.instagramVideosUsingSound)}</td>
                              
                              {/* Other Metrics */}
                              <td className="p-3">{formatNumber(metric.pressReleasePickups)}</td>
                              <td className="p-3">{formatNumber(metric.radioStationsPlaying)}</td>
                              <td className="p-3">{formatNumber(metric.radioTotalPlays)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              )}

              {selectedSong.notes && (
                <Card>
                  <CardHeader>
                    <CardTitle>Notes</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">{selectedSong.notes}</p>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Daily Metrics Dialog */}
      <Dialog open={isMetricsOpen} onOpenChange={setIsMetricsOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add Daily Metrics</DialogTitle>
          </DialogHeader>
          <Form {...metricsForm}>
            <form onSubmit={metricsForm.handleSubmit(onMetricsSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={metricsForm.control}
                  name="date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={metricsForm.control}
                  name="channel"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Channel</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="youtube">YouTube</SelectItem>
                          <SelectItem value="spotify">Spotify</SelectItem>
                          <SelectItem value="social_media">Social Media</SelectItem>
                          <SelectItem value="press">Press</SelectItem>
                          <SelectItem value="radio">Radio</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />
              </div>

              {/* YouTube Metrics */}
              <div className="space-y-2">
                <h4 className="font-medium flex items-center gap-2">
                  <Youtube className="h-4 w-4" />
                  YouTube Metrics
                </h4>
                <div className="grid grid-cols-3 gap-4">
                  <FormField
                    control={metricsForm.control}
                    name="youtubeViews"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Total Views</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="e.g., 125,000" />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={metricsForm.control}
                    name="youtubeAdViews"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Views from Ads</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="e.g., 15,000" />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={metricsForm.control}
                    name="youtubeAvgTime"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Avg Watch Time</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="e.g., 2:45" />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Spotify Metrics */}
              <div className="space-y-2">
                <h4 className="font-medium flex items-center gap-2">
                  <ListMusic className="h-4 w-4" />
                  Spotify Metrics
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={metricsForm.control}
                    name="spotifyStreams"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Streams</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="e.g., 50,000" />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={metricsForm.control}
                    name="spotifyPlaylistEntries"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Playlist Entries</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="e.g., 12" />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Social Media Metrics */}
              <div className="space-y-4">
                <h4 className="font-medium flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Enhanced Social Media Metrics
                </h4>
                
                {/* TikTok Post Tracking */}
                <div className="space-y-3">
                  <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300">TikTok Post Performance</h5>
                  <div className="grid grid-cols-1 gap-2">
                    <FormField
                      control={metricsForm.control}
                      name="tiktokPostLink"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>TikTok Link</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="https://www.tiktok.com/@username/video/..." data-testid="input-tiktok-link" />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="grid grid-cols-4 gap-4">
                    <FormField
                      control={metricsForm.control}
                      name="tiktokPostViews"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Views</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="e.g., 1,200,000" data-testid="input-tiktok-views" />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={metricsForm.control}
                      name="tiktokPostShares"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Shares</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="e.g., 15,000" data-testid="input-tiktok-shares" />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={metricsForm.control}
                      name="tiktokPostLikes"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Likes</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="e.g., 85,000" data-testid="input-tiktok-likes" />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={metricsForm.control}
                      name="tiktokPostSaves"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Saves</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="e.g., 8,500" data-testid="input-tiktok-saves" />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* Instagram Post Tracking */}
                <div className="space-y-3">
                  <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300">Instagram Post Performance</h5>
                  <div className="grid grid-cols-1 gap-2">
                    <FormField
                      control={metricsForm.control}
                      name="instagramPostLink"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Instagram Link</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="https://www.instagram.com/p/..." data-testid="input-instagram-link" />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={metricsForm.control}
                      name="instagramPostViews"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Views</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="e.g., 450,000" data-testid="input-instagram-views" />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={metricsForm.control}
                      name="instagramPostLikes"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Likes</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="e.g., 25,000" data-testid="input-instagram-likes" />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* User Generated Content Tracking */}
                <div className="space-y-3">
                  <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300">User Generated Content</h5>
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={metricsForm.control}
                      name="instagramVideosUsingSound"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Instagram Videos Using Sound</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="e.g., 250" data-testid="input-instagram-ugc-count" />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={metricsForm.control}
                      name="tiktokVideosUsingSound"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>TikTok Videos Using Sound</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="e.g., 1,500" data-testid="input-tiktok-ugc-count" />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* Legacy Fields for Backward Compatibility */}
                <div className="space-y-3">
                  <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300">General Social Media Metrics</h5>
                  <div className="grid grid-cols-3 gap-4">
                    <FormField
                      control={metricsForm.control}
                      name="instagramViews"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Total Instagram Views</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="e.g., 25,000" />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={metricsForm.control}
                      name="tiktokViews"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Total TikTok Views</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="e.g., 100,000" />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={metricsForm.control}
                      name="tiktokVideosPerSound"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>TikTok Videos (Legacy)</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="e.g., 150" />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </div>

              <FormField
                control={metricsForm.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes</FormLabel>
                    <FormControl>
                      <Textarea {...field} placeholder="Additional insights and observations" />
                    </FormControl>
                  </FormItem>
                )}
              />

              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsMetricsOpen(false)}>
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={createMetricsMutation.isPending}
                  data-testid="button-save-metrics"
                >
                  {createMetricsMutation.isPending ? 'Saving...' : 'Save Metrics'}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Edit Song Dialog */}
      <Dialog open={isEditSongOpen} onOpenChange={setIsEditSongOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Focus Track</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onEditSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Song Title</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="artist"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Artist</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="active_focus">Active Focus Song</SelectItem>
                          <SelectItem value="back_catalog">Back Catalog</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="promoted">Promoted</SelectItem>
                          <SelectItem value="planning">Planning</SelectItem>
                          <SelectItem value="paused">Paused</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="releaseDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Release Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>

              {/* Channel Progress and Responsibilities */}
              <div className="space-y-4">
                <h4 className="font-medium">Channel Progress & Responsibilities</h4>
                
                {/* YouTube */}
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="youtubeProgress"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <Youtube className="h-4 w-4" />
                          YouTube Progress
                        </FormLabel>
                        <FormControl>
                          <Textarea {...field} placeholder="Current YouTube status and metrics" />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="youtubeResponsible"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>YouTube Responsible</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select team member" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {teamMembers?.map((member: any) => (
                              <SelectItem key={member.id} value={member.name}>
                                {member.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                  />
                </div>

                {/* Spotify */}
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="spotifyProgress"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <ListMusic className="h-4 w-4" />
                          Spotify Progress
                        </FormLabel>
                        <FormControl>
                          <Textarea {...field} placeholder="Current Spotify status and metrics" />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="spotifyResponsible"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Spotify Responsible</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select team member" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {teamMembers?.map((member: any) => (
                              <SelectItem key={member.id} value={member.name}>
                                {member.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                  />
                </div>

                {/* Social Media */}
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="socialMediaProgress"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <Users className="h-4 w-4" />
                          Social Media Progress
                        </FormLabel>
                        <FormControl>
                          <Textarea {...field} placeholder="Current social media status and metrics" />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="socialMediaResponsible"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Social Media Responsible</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select team member" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {teamMembers?.map((member: any) => (
                              <SelectItem key={member.id} value={member.name}>
                                {member.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                  />
                </div>

                {/* Radio */}
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="radioProgress"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <Radio className="h-4 w-4" />
                          Radio Progress
                        </FormLabel>
                        <FormControl>
                          <Textarea {...field} placeholder="Current radio status and metrics" />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="radioResponsible"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Radio Responsible</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select team member" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {teamMembers?.map((member: any) => (
                              <SelectItem key={member.id} value={member.name}>
                                {member.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes</FormLabel>
                    <FormControl>
                      <Textarea {...field} placeholder="Additional notes and strategy details" />
                    </FormControl>
                  </FormItem>
                )}
              />

              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsEditSongOpen(false)}>
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={updateSongMutation.isPending}
                  data-testid="button-update-song"
                >
                  {updateSongMutation.isPending ? 'Updating...' : 'Update Track'}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}