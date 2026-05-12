// src/hooks/useSocket.js
// Cài package: npm install laravel-echo pusher-js
import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

window.Pusher = Pusher;

let echo = null;

export const getEcho = () => {
  if (!echo) {
    echo = new Echo({
      broadcaster: 'reverb',
      key:         import.meta.env.VITE_REVERB_APP_KEY,
      wsHost:      import.meta.env.VITE_REVERB_HOST ?? 'localhost',
      wsPort:      import.meta.env.VITE_REVERB_PORT ?? 8080,
      wssPort:     import.meta.env.VITE_REVERB_PORT ?? 8080,
      forceTLS:    false,
      enabledTransports: ['ws'],
    });
  }
  return echo;
};

export default getEcho;