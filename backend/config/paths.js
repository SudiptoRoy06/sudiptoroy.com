import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const backendDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export const frontendDist = path.resolve(backendDir, '../frontend/dist');
