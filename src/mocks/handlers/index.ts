import { authHandlers } from './auth';
import { taskHandlers } from './tasks';

export const handlers = [...authHandlers, ...taskHandlers];
