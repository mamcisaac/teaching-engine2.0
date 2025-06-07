import axios from 'axios';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api',
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

export const useUpdateActivity = () => {
  const qc = useQueryClient();
  return useMutation(
    (data: {
      id: number;
      milestoneId: number;
      subjectId?: number;
      title?: string;
      completedAt?: string | null;
    }) => api.put(`/activities/${data.id}`, { title: data.title, completedAt: data.completedAt }),
    {
      onSuccess: (_res, vars) => {
        qc.invalidateQueries(['milestone', vars.milestoneId]);
        if (vars.subjectId) qc.invalidateQueries(['subject', vars.subjectId]);
        qc.invalidateQueries(['subjects']);
      },
    },
  );
};

export const useDeleteActivity = () => {
  const qc = useQueryClient();
  return useMutation(
    (data: { id: number; milestoneId: number; subjectId?: number }) =>
      api.delete(`/activities/${data.id}`),
    {
      onSuccess: (_res, vars) => {
        qc.invalidateQueries(['milestone', vars.milestoneId]);
        if (vars.subjectId) qc.invalidateQueries(['subject', vars.subjectId]);
        qc.invalidateQueries(['subjects']);
        toast.success('Activity deleted');
      },
    },
  );
};

export const useUpdateSubject = () => {
  const qc = useQueryClient();
  return useMutation(
    (data: { id: number; name: string }) => api.put(`/subjects/${data.id}`, { name: data.name }),
    {
      onSuccess: (_res, vars) => {
        qc.invalidateQueries(['subjects']);
        qc.invalidateQueries(['subject', vars.id]);
        toast.success('Subject updated');
      },
    },
  );
};

export const useDeleteSubject = () => {
  const qc = useQueryClient();
  return useMutation((id: number) => api.delete(`/subjects/${id}`), {
    onSuccess: () => {
      qc.invalidateQueries(['subjects']);
      toast.success('Subject deleted');
    },
  });
};

export const useUpdateMilestone = () => {
  const qc = useQueryClient();
  return useMutation(
    (data: { id: number; title: string; subjectId: number }) =>
      api.put(`/milestones/${data.id}`, { title: data.title }),
    {
      onSuccess: (_res, vars) => {
        qc.invalidateQueries(['milestone', vars.id]);
        qc.invalidateQueries(['subject', vars.subjectId]);
        qc.invalidateQueries(['subjects']);
        toast.success('Milestone updated');
      },
    },
  );
};

export const useDeleteMilestone = () => {
  const qc = useQueryClient();
  return useMutation(
    (data: { id: number; subjectId: number }) => api.delete(`/milestones/${data.id}`),
    {
      onSuccess: (_res, vars) => {
        qc.invalidateQueries(['subject', vars.subjectId]);
        qc.invalidateQueries(['subjects']);
        toast.success('Milestone deleted');
      },
    },
  );
};
