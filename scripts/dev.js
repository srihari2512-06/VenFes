import { spawn, execSync } from 'child_process';
import process from 'process';
import { freePorts } from './free-ports.js';

console.log('\x1b[36m====================================================\x1b[0m');
console.log('\x1b[36m   Starting Venfes Marketplace (Server + Client)    \x1b[0m');
console.log('\x1b[36m====================================================\x1b[0m');
console.log('• Backend API:  http://localhost:5000');
console.log('• Frontend SPA: http://localhost:5173');
console.log('Press Ctrl+C to stop both services.\n');

// Clean up any stale processes occupying our ports before starting
freePorts();

const isWin = process.platform === 'win32';
const npmCmd = isWin ? 'npm.cmd' : 'npm';

const server = spawn(npmCmd, ['run', 'dev', '--prefix', 'server'], {
  stdio: 'inherit',
  shell: isWin
});

const client = spawn(npmCmd, ['run', 'dev', '--prefix', 'client'], {
  stdio: 'inherit',
  shell: isWin
});

function cleanup() {
  console.log('\n\x1b[33mShutting down Venfes server and client...\x1b[0m');
  if (isWin) {
    if (server.pid) {
      try { execSync(`taskkill /pid ${server.pid} /T /F`, { stdio: 'ignore' }); } catch {}
    }
    if (client.pid) {
      try { execSync(`taskkill /pid ${client.pid} /T /F`, { stdio: 'ignore' }); } catch {}
    }
    freePorts();
  } else {
    try { server.kill('SIGINT'); } catch {}
    try { client.kill('SIGINT'); } catch {}
  }
  process.exit(0);
}

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);
