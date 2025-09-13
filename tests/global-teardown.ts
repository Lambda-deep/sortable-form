import { FullConfig } from '@playwright/test';

async function globalTeardown(config: FullConfig) {
  console.log('🧹 Global teardown: Cleaning up test environment...');
  
  // Force kill any remaining processes
  if (process.platform === 'win32') {
    try {
      const { exec } = await import('child_process');
      exec('taskkill /F /IM node.exe /T', () => {});
    } catch (error) {
      // Ignore errors in cleanup
    }
  }
  
  console.log('✅ Global teardown completed');
}

export default globalTeardown;