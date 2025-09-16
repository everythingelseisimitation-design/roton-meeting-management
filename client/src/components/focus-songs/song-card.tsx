import { Music, Youtube, Users, Radio, ListMusic, Edit, MoreHorizontal } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface SongCardProps {
  song: any;
  onEdit?: () => void;
}

export default function SongCard({ song, onEdit }: SongCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-blue-100 text-blue-700';
      case 'promoted':
        return 'bg-green-100 text-green-700';
      case 'planning':
        return 'bg-yellow-100 text-yellow-700';
      case 'paused':
        return 'bg-gray-100 text-gray-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <Card className="mb-4" data-testid={`song-card-${song.id}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-secondary rounded-lg flex items-center justify-center">
              <Music className="w-6 h-6 text-secondary-foreground" />
            </div>
            <div>
              <CardTitle className="text-lg" data-testid={`song-title-${song.id}`}>
                {song.title}
              </CardTitle>
              <p className="text-sm text-muted-foreground" data-testid={`song-artist-${song.id}`}>
                {song.artist}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Badge className={getStatusColor(song.status)} data-testid={`song-status-${song.id}`}>
              {song.status}
            </Badge>
            {song.category === 'back_catalog' && (
              <Badge variant="outline">Back Catalog</Badge>
            )}
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={onEdit}
              data-testid={`song-edit-${song.id}`}
            >
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* YouTube */}
          <div className="space-y-2" data-testid={`song-youtube-${song.id}`}>
            <div className="flex items-center space-x-2">
              <Youtube className="w-4 h-4 text-red-500" />
              <span className="text-sm font-medium">YouTube</span>
            </div>
            <p className="text-xs text-muted-foreground">
              {song.youtubeProgress || 'No progress logged'}
            </p>
            {song.youtubeResponsible && (
              <p className="text-xs text-primary">Responsible: {song.youtubeResponsible}</p>
            )}
          </div>

          {/* Social Media */}
          <div className="space-y-2" data-testid={`song-social-${song.id}`}>
            <div className="flex items-center space-x-2">
              <Users className="w-4 h-4 text-blue-500" />
              <span className="text-sm font-medium">Social Media</span>
            </div>
            <p className="text-xs text-muted-foreground">
              {song.socialMediaProgress || 'No progress logged'}
            </p>
            {song.socialMediaResponsible && (
              <p className="text-xs text-primary">Responsible: {song.socialMediaResponsible}</p>
            )}
          </div>

          {/* ListMusic */}
          <div className="space-y-2" data-testid={`song-spotify-${song.id}`}>
            <div className="flex items-center space-x-2">
              <ListMusic className="w-4 h-4 text-green-500" />
              <span className="text-sm font-medium">ListMusic</span>
            </div>
            <p className="text-xs text-muted-foreground">
              {song.spotifyProgress || 'No progress logged'}
            </p>
            {song.spotifyResponsible && (
              <p className="text-xs text-primary">Responsible: {song.spotifyResponsible}</p>
            )}
          </div>

          {/* Radio */}
          <div className="space-y-2" data-testid={`song-radio-${song.id}`}>
            <div className="flex items-center space-x-2">
              <Radio className="w-4 h-4 text-purple-500" />
              <span className="text-sm font-medium">Radio</span>
            </div>
            <p className="text-xs text-muted-foreground">
              {song.radioProgress || 'No progress logged'}
            </p>
            {song.radioResponsible && (
              <p className="text-xs text-primary">Responsible: {song.radioResponsible}</p>
            )}
          </div>
        </div>

        {song.notes && (
          <div className="mt-4 pt-4 border-t border-border">
            <p className="text-sm text-muted-foreground" data-testid={`song-notes-${song.id}`}>
              {song.notes}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
