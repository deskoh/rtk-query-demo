import { setupWorker } from 'msw/browser'
import { handlers } from './handlers'
import './socketServer';

export const worker = setupWorker(...handlers)
