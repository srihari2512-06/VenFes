import { execSync } from 'child_process';
import process from 'process';

const PORTS = [5000, 5173, 5174];

export function freePorts() {
  const pids = new Set();

  if (process.platform === 'win32') {
    try {
      const netstatOutput = execSync('netstat -ano', { encoding: 'utf8', stdio: ['pipe', 'pipe', 'ignore'] });
      const lines = netstatOutput.split(/\r?\n/);

      for (const line of lines) {
        if (!line.includes('LISTENING')) continue;
        for (const port of PORTS) {
          // match :5000 or :5173 followed by whitespace
          const regex = new RegExp(`:${port}\\s+`);
          if (regex.test(line)) {
            const tokens = line.trim().split(/\s+/);
            const pid = tokens[tokens.length - 1];
            if (pid && !isNaN(pid) && pid !== '0' && Number(pid) !== process.pid) {
              pids.add(Number(pid));
            }
          }
        }
      }
    } catch {}

    for (const pid of pids) {
      try {
        console.log(`[CLEANUP] Freeing occupied port by terminating process PID ${pid}...`);
        execSync(`taskkill /F /PID ${pid}`, { stdio: 'ignore' });
      } catch {}
    }
  } else {
    for (const port of PORTS) {
      try {
        execSync(`fuser -k ${port}/tcp`, { stdio: 'ignore' });
      } catch {}
    }
  }
}

freePorts();
console.log('[CLEANUP] Ports 5000, 5173, 5174 verified free.');
