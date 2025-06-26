/**
 * TeamsPage Component
 * Main page for team collaboration features
 */

import React, { useState } from 'react';
import { Users, Share2, MessageSquare, Calendar } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/Button';
import {
  TeamList,
  CreateTeamModal,
  SharedPlansView,
} from '@/components/collaboration';
import { useNavigate } from 'react-router-dom';

export function TeamsPage() {
  const navigate = useNavigate();
  const [isCreateTeamOpen, setIsCreateTeamOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('teams');

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Collaboration Hub</h1>
        <p className="text-gray-600">
          Work together with your teaching team to share plans, coordinate curriculum, and improve student outcomes.
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 max-w-2xl">
          <TabsTrigger value="teams" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            My Teams
          </TabsTrigger>
          <TabsTrigger value="shared" className="flex items-center gap-2">
            <Share2 className="w-4 h-4" />
            Shared Plans
          </TabsTrigger>
          <TabsTrigger value="resources" className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Resources
          </TabsTrigger>
          <TabsTrigger value="discussions" className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4" />
            Discussions
          </TabsTrigger>
        </TabsList>

        <TabsContent value="teams">
          <TeamList onCreateTeam={() => setIsCreateTeamOpen(true)} />
        </TabsContent>

        <TabsContent value="shared">
          <SharedPlansView />
        </TabsContent>

        <TabsContent value="resources">
          <Card className="p-8 text-center">
            <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Team Resources Coming Soon</h3>
            <p className="text-gray-600 mb-4 max-w-md mx-auto">
              Share teaching materials, templates, and resources with your team members.
            </p>
            <Button variant="outline" onClick={() => navigate('/resources')}>
              Browse My Resources
            </Button>
          </Card>
        </TabsContent>

        <TabsContent value="discussions">
          <Card className="p-8 text-center">
            <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Team Discussions Coming Soon</h3>
            <p className="text-gray-600 mb-4 max-w-md mx-auto">
              Start conversations, ask questions, and share ideas with your teaching team.
            </p>
            <Button variant="outline" onClick={() => setActiveTab('teams')}>
              Join a Team First
            </Button>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Modals */}
      <CreateTeamModal
        isOpen={isCreateTeamOpen}
        onClose={() => setIsCreateTeamOpen(false)}
      />
    </div>
  );
}