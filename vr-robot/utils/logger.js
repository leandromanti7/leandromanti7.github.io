// utils/logger.js

const logDiv = document.createElement('div');
logDiv.style.position = 'fixed';
logDiv.style.top = '0';
logDiv.style.left = '0';
logDiv.style.width = '100%';
logDiv.style.maxHeight = '200px';
logDiv.style.overflowY = 'auto';
logDiv.style.background = 'rgba(0,0,0,0.8)';
logDiv.style.color = '#0f0';
logDiv.style.fontFamily = 'monospace';
logDiv.style.fontSize = '14px';
logDiv.style.zIndex = 9999;
logDiv.style.padding = '8px';
document.body.appendChild(logDiv);

export function logStatus(msg, isError = false) {
  const line = document.createElement('div');
  line.textContent = msg;
  line.style.color = isError ? 'red' : '#0f0';
  logDiv.appendChild(line);
}
