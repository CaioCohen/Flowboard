import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { loadEnvironmentFile } from './environment-file';

describe('loadEnvironmentFile', () => {
  const variableName = 'FLOWBOARD_ENV_FILE_TEST';

  afterEach(() => {
    delete process.env[variableName];
  });

  it('loads values from the supplied environment file', () => {
    const directory = mkdtempSync(join(tmpdir(), 'flowboard-env-'));
    const environmentFile = join(directory, '.env');
    writeFileSync(environmentFile, `${variableName}=loaded\n`);

    loadEnvironmentFile(environmentFile);

    expect(process.env[variableName]).toBe('loaded');
    rmSync(directory, { recursive: true, force: true });
  });
});
