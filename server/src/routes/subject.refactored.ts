import { createCrudRoutes } from '../utils/routeFactory';
import { Subject } from '@teaching-engine/database';
import { subjectSchema } from '../validation';

const subjectRoutes = createCrudRoutes<Subject>({
  modelName: 'subject',
  includeRelations: {
    milestones: {
      include: { activities: true },
    },
  },
  customValidation: (data) => {
    try {
      subjectSchema.parse(data);
      return true;
    } catch {
      return false;
    }
  },
});

export default subjectRoutes;