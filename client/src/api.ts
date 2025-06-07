import axios from 'axios';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

const api = axios.create({
  baseURL: 'http://localhost:3000/api',
});

export interface Subject {
  id: number;
  name: string;
  milestones: Milestone[];
}

export interface Milestone {
  id: number;
  title: string;
  subjectId: number;
  activities: Activity[];
}

export interface Activity {
  id: number;
  title: string;
  milestoneId: number;
  completedAt?: string | null;
}

export const useSubjects = () =>
  useQuery<Subject[]>(['subjects'], async () => (await api.get('/subjects')).data);

export const useSubject = (id: number) =>
  useQuery<Subject>(['subject', id], async () => (await api.get(`/subjects/${id}`)).data);

export const useMilestone = (id: number) =>
  useQuery<Milestone>(['milestone', id], async () => (await api.get(`/milestones/${id}`)).data);

export const useCreateSubject = () => {
  const qc = useQueryClient();
  return useMutation((data: { name: string }) => api.post('/subjects', data), {
    onSuccess: () => {
      qc.invalidateQueries(['subjects']);
      toast.success('Subject created');
    },
  });
};

export const useCreateMilestone = () => {
  const qc = useQueryClient();
  return useMutation(
    (data: { title: string; subjectId: number }) => api.post('/milestones', data),
    {
      onSuccess: (_res, vars) => {
        qc.invalidateQueries(['subject', vars.subjectId]);
        toast.success('Milestone created');
      },
    },
  );
};

export const useCreateActivity = () => {
  const qc = useQueryClient();
  return useMutation(
    (data: { title: string; milestoneId: number }) => api.post('/activities', data),
    {
      onSuccess: (_res, vars) => {
        qc.invalidateQueries(['milestone', vars.milestoneId]);
        toast.success('Activity created');
      },
    },
  );
};
