import axios from 'axios';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

const base = import.meta.env.VITE_API_BASE_URL;
const api = axios.create({
  baseURL: base ? `${base.replace(/\/$/, '')}/api` : '/api',
});

export const getWeekStartISO = (date: Date): string => {
  const d = new Date(date);
  d.setUTCHours(0, 0, 0, 0);
  return d.toISOString().split('T')[0];
};

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

export interface Resource {
  id: number;
  filename: string;
  url: string;
  type: string;
  size: number;
  activityId?: number | null;
  createdAt: string;
}

export interface MaterialList {
  id: number;
  weekStart: string;
  items: string[];
  prepared: boolean;
}

export interface WeeklyScheduleItem {
  id: number;
  day: number;
  slotId: number;
  activityId: number;
  activity: Activity;
  slot?: TimetableSlot;
}

export interface LessonPlan {
  id: number;
  weekStart: string;
  schedule: WeeklyScheduleItem[];
}

export const useSubjects = () =>
  useQuery<Subject[]>({
    queryKey: ['subjects'],
    queryFn: async () => (await api.get('/subjects')).data,
  });

export const useSubject = (id: number) =>
  useQuery<Subject>({
    queryKey: ['subject', id],
    queryFn: async () => (await api.get(`/subjects/${id}`)).data,
  });

export const useMilestone = (id: number) =>
  useQuery<Milestone>({
    queryKey: ['milestone', id],
    queryFn: async () => (await api.get(`/milestones/${id}`)).data,
  });

export const useCreateSubject = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { name: string }) => api.post('/subjects', data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['subjects'] });
      toast.success('Subject created');
    },
  });
};

export const useCreateMilestone = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { title: string; subjectId: number }) => api.post('/milestones', data),
    onSuccess: (_res, vars) => {
      qc.invalidateQueries({ queryKey: ['subject', vars.subjectId] });
      toast.success('Milestone created');
    },
  });
};

export const useCreateActivity = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { title: string; milestoneId: number }) => api.post('/activities', data),
    onSuccess: (_res, vars) => {
      qc.invalidateQueries({ queryKey: ['milestone', vars.milestoneId] });
      toast.success('Activity created');
    },
  });
};

export const useUpdateActivity = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      id: number;
      milestoneId: number;
      subjectId?: number;
      title?: string;
      completedAt?: string | null;
    }) => api.put(`/activities/${data.id}`, { title: data.title, completedAt: data.completedAt }),
    onSuccess: (_res, vars) => {
      qc.invalidateQueries({ queryKey: ['milestone', vars.milestoneId] });
      if (vars.subjectId) qc.invalidateQueries({ queryKey: ['subject', vars.subjectId] });
      qc.invalidateQueries({ queryKey: ['subjects'] });
    },
  });
};

export const useDeleteActivity = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { id: number; milestoneId: number; subjectId?: number }) =>
      api.delete(`/activities/${data.id}`),
    onSuccess: (_res, vars) => {
      qc.invalidateQueries({ queryKey: ['milestone', vars.milestoneId] });
      if (vars.subjectId) qc.invalidateQueries({ queryKey: ['subject', vars.subjectId] });
      qc.invalidateQueries({ queryKey: ['subjects'] });
      toast.success('Activity deleted');
    },
  });
};

export const useUpdateSubject = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { id: number; name: string }) =>
      api.put(`/subjects/${data.id}`, { name: data.name }),
    onSuccess: (_res, vars) => {
      qc.invalidateQueries({ queryKey: ['subjects'] });
      qc.invalidateQueries({ queryKey: ['subject', vars.id] });
      toast.success('Subject updated');
    },
  });
};

export const useDeleteSubject = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => api.delete(`/subjects/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['subjects'] });
      toast.success('Subject deleted');
    },
  });
};

export const useUpdateMilestone = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { id: number; title: string; subjectId: number }) =>
      api.put(`/milestones/${data.id}`, { title: data.title }),
    onSuccess: (_res, vars) => {
      qc.invalidateQueries({ queryKey: ['milestone', vars.id] });
      qc.invalidateQueries({ queryKey: ['subject', vars.subjectId] });
      qc.invalidateQueries({ queryKey: ['subjects'] });
      toast.success('Milestone updated');
    },
  });
};

export const useDeleteMilestone = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { id: number; subjectId: number }) => api.delete(`/milestones/${data.id}`),
    onSuccess: (_res, vars) => {
      qc.invalidateQueries({ queryKey: ['subject', vars.subjectId] });
      qc.invalidateQueries({ queryKey: ['subjects'] });
      toast.success('Milestone deleted');
    },
  });
};

export const useGeneratePlan = () =>
  useMutation((weekStart: string) => {
    const isoWeekStart = getWeekStartISO(new Date(weekStart));
    return api
      .post('/lesson-plans/generate', { weekStart: isoWeekStart })
      .then((res) => res.data as LessonPlan);
  });

export const useLessonPlan = (weekStart: string) =>
  useQuery<LessonPlan | undefined>({
    queryKey: ['lessonPlan', getWeekStartISO(new Date(weekStart))],
    queryFn: async () => {
      const isoDate = getWeekStartISO(new Date(weekStart));
      try {
        const res = await api.get(`/lesson-plans/${isoDate}`);
        return res.data as LessonPlan;
      } catch (err) {
        if (axios.isAxiosError(err) && err.response?.status === 404) {
          return undefined;
        }
        throw err;
      }
    },
    enabled: !!weekStart,
  });

export const useSavePreferences = () =>
  useMutation((data: { teachingStyles: string[]; pacePreference: string; prepTime: number }) =>
    api.post('/preferences', data),
  );

export const useUploadResource = () =>
  useMutation(
    (data: { filename: string; file: File; type: string; size: number; activityId?: number }) => {
      return new Promise<Resource>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = async () => {
          try {
            const res = await api.post('/resources', {
              filename: data.filename,
              type: data.type,
              size: data.size,
              activityId: data.activityId,
              data: (reader.result as string).split(',')[1],
            });
            resolve(res.data as Resource);
          } catch (err) {
            reject(err);
          }
        };
        reader.onerror = reject;
        reader.readAsDataURL(data.file);
      });
    },
  );

export const useResource = (id: number) =>
  useQuery<Resource>({
    queryKey: ['resource', id],
    queryFn: async () => (await api.get(`/resources/${id}`)).data,
    enabled: !!id,
  });

export const useResourcesByActivity = (activityId: number) =>
  useQuery<Resource[]>({
    queryKey: ['resources', 'activity', activityId],
    queryFn: async () => (await api.get(`/resources/activity/${activityId}`)).data,
    enabled: !!activityId,
  });

export const useDeleteResource = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => api.delete(`/resources/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['resources'] });
      qc.invalidateQueries({ queryKey: ['resource'] });
    },
  });
};

export const useMaterialList = (weekStart: string) =>
  useQuery<MaterialList>({
    queryKey: ['materialList', weekStart],
    queryFn: async () => {
      const res = await api.get(`/material-lists/${weekStart}`);
      const ml = res.data as MaterialList;
      ml.items = JSON.parse(ml.items as unknown as string);
      return ml;
    },
    enabled: !!weekStart,
  });

export const useCreateMaterialList = () =>
  useMutation((data: { weekStart: string; items: string[] }) =>
    api.post('/material-lists', data).then((res) => res.data as MaterialList),
  );

export interface ActivityMaterials {
  day: number;
  activityId: number;
  title: string;
  materials: string[];
}

export const useMaterialDetails = (weekStart: string) =>
  useQuery<ActivityMaterials[]>({
    queryKey: ['materialDetails', weekStart],
    queryFn: async () => (await api.get(`/material-lists/${weekStart}/details`)).data,
    enabled: !!weekStart,
  });

export const downloadPrintables = (weekStart: string) =>
  api.get(`/material-lists/${weekStart}/zip`, { responseType: 'blob' });

export interface Notification {
  id: number;
  message: string;
  read: boolean;
  createdAt: string;
}

export const useNotifications = () =>
  useQuery<Notification[]>({
    queryKey: ['notifications'],
    queryFn: async () => (await api.get('/notifications')).data,
  });

export const useMarkNotificationRead = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => api.put(`/notifications/${id}/read`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
};

export interface Newsletter {
  id: number;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export const useCreateNewsletter = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { title: string; content: string; template?: string }) =>
      api.post('/newsletters', data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['newsletters'] });
    },
  });
};

export const useNewsletters = () =>
  useQuery<Newsletter[]>({
    queryKey: ['newsletters'],
    queryFn: async () => (await api.get('/newsletters')).data,
  });

export const useGenerateNewsletter = () =>
  useMutation((data: { startDate: string; endDate: string }) =>
    api.post('/newsletters/generate', data).then((r) => r.data as Newsletter),
  );

export interface TimetableSlot {
  id: number;
  day: number;
  startMin: number;
  endMin: number;
  subjectId?: number | null;
  subject?: Subject | null;
}

export interface DailyPlanItem {
  id: number;
  startMin: number;
  endMin: number;
  slotId?: number | null;
  activityId?: number | null;
  activity?: Activity | null;
  notes?: string | null;
}

export interface DailyPlan {
  id: number;
  date: string;
  lessonPlanId: number;
  items: DailyPlanItem[];
}

export const useTimetable = () =>
  useQuery<TimetableSlot[]>({
    queryKey: ['timetable'],
    queryFn: async () => (await api.get('/timetable')).data,
  });

export const useSaveTimetable = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (slots: Omit<TimetableSlot, 'id' | 'subject'>[]) => api.put('/timetable', slots),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['timetable'] });
    },
  });
};

export const useDailyPlan = (date: string) =>
  useQuery<DailyPlan | undefined>({
    queryKey: ['dailyPlan', date],
    queryFn: async () => {
      try {
        const res = await api.get(`/daily-plans/${date}`);
        return res.data as DailyPlan;
      } catch (err) {
        if (axios.isAxiosError(err) && err.response?.status === 404) return undefined;
        throw err;
      }
    },
    enabled: !!date,
  });

export const useGenerateDailyPlan = () =>
  useMutation((date: string) =>
    api.post('/daily-plans/generate', { date }).then((r) => r.data as DailyPlan),
  );

export const useUpdateDailyPlan = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { id: number; items: Omit<DailyPlanItem, 'id'>[] }) =>
      api.put(`/daily-plans/${data.id}`, { items: data.items }),
    onSuccess: (_res, vars) => {
      qc.invalidateQueries({ queryKey: ['dailyPlan', vars.id] });
    },
  });
};
