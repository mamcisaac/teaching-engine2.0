/**
 * TeamList Component
 * Displays and manages user's teams
 */

import React from 'react';
import { Plus, Users, Settings, ExternalLink } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useNavigate } from 'react-router-dom';

interface Team {
  id: string;
  name: string;
  description?: string;
  grade?: number;
  subject?: string;
  schoolName?: string;
  isPublic: boolean;
  teamCode: string;
  owner: {
    id: number;
    name: string;
  };
  _count: {
    members: number;
  };
}

interface TeamListProps {
  onCreateTeam: () => void;
}

export function TeamList({ onCreateTeam }: TeamListProps) {
  const navigate = useNavigate();

  // Fetch user's teams
  const { data: teams = [], isLoading } = useQuery<Team[]>({
    queryKey: ['teams'],
    queryFn: () => api.get('/api/teams').then(res => res.data),
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="p-6 animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-1/3 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          </Card>
        ))}
      </div>
    );
  }

  if (teams.length === 0) {
    return (
      <Card className="p-8 text-center">
        <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">No teams yet</h3>
        <p className="text-gray-600 mb-4 max-w-md mx-auto">
          Join or create a team to collaborate with other teachers, share lesson plans, and coordinate curriculum.
        </p>
        <div className="flex gap-3 justify-center">
          <Button onClick={onCreateTeam}>
            <Plus className="w-4 h-4 mr-2" />
            Create Team
          </Button>
          <Button variant="outline" onClick={() => navigate('/teams/discover')}>
            <Users className="w-4 h-4 mr-2" />
            Discover Teams
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">My Teams</h2>
        <Button onClick={onCreateTeam} size="sm">
          <Plus className="w-4 h-4 mr-2" />
          New Team
        </Button>
      </div>

      {teams.map((team) => (
        <Card
          key={team.id}
          className="p-6 hover:shadow-lg transition-shadow cursor-pointer"
          onClick={() => navigate(`/teams/${team.id}`)}
        >
          <div className="flex justify-between items-start mb-3">
            <div>
              <h3 className="text-lg font-semibold flex items-center gap-2">
                {team.name}
                {team.isPublic && (
                  <Badge variant="secondary" className="text-xs">
                    Public
                  </Badge>
                )}
              </h3>
              <div className="flex gap-4 text-sm text-gray-600 mt-1">
                {team.grade && <span>Grade {team.grade}</span>}
                {team.subject && <span>{team.subject}</span>}
                {team.schoolName && <span>{team.schoolName}</span>}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline">
                <Users className="w-3 h-3 mr-1" />
                {team._count.members} members
              </Badge>
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/teams/${team.id}/settings`);
                }}
              >
                <Settings className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {team.description && (
            <p className="text-gray-600 text-sm mb-3 line-clamp-2">
              {team.description}
            </p>
          )}

          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">
              Created by {team.owner.name}
            </span>
            <button
              className="text-blue-600 hover:text-blue-700 flex items-center gap-1"
              onClick={(e) => {
                e.stopPropagation();
                navigator.clipboard.writeText(team.teamCode);
              }}
            >
              <ExternalLink className="w-3 h-3" />
              Share invite code
            </button>
          </div>
        </Card>
      ))}
    </div>
  );
}