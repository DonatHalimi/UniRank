import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const npm = process.platform === 'win32' ? 'npm.cmd' : 'npm';

function install(label, args) {
  return new Promise((resolve, reject) => {
    console.log(`\n[${label}] Installing dependencies...`);
    const child = spawn(npm, args, {
      cwd: root, stdio: 'inherit', shell: process.platform === 'win32', env: process.env,
    });
    child.once('error', reject);
    child.once('close', (code) => code === 0 ? resolve() : reject(new Error(`${label} install exited with code ${code}`)));
  });
}

try {
  await Promise.all([
    install('ROOT', ['install']),
    install('FRONTEND', ['install', '--prefix', path.join(root, 'frontend')]),
    install('BACKEND', ['install', '--prefix', path.join(root, 'backend')]),
  ]);
  console.log('\nAll UniRank dependencies are ready.');
} catch (error) {
  console.error(`Dependency installation failed: ${error.message}`);
  process.exitCode = 1;
}
