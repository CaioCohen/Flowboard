import { config } from 'dotenv';
import { resolve } from 'node:path';

const ROOT_ENV_FILE = resolve(__dirname, '../../../../.env');

export function loadEnvironmentFile(environmentFile = ROOT_ENV_FILE): void {
  config({ path: environmentFile });
}
