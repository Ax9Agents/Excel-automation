import { existsSync } from 'fs';

export function getPuppeteerConfig() {
  const isDev = process.env.NODE_ENV === 'development';
  
  if (isDev) {
    // Development: use local Chrome
    return {
      executablePath: [
        '/usr/bin/google-chrome-stable', 
        '/usr/bin/chromium-browser', 
        'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
      ].find(path => existsSync(path)),
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    };
  }
  
  // Production: will be set dynamically
  return {
    args: [],
    executablePath: ''
  };
}
