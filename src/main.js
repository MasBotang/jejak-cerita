import router from './routes/router.js';
import AddView from './views/addView.js'; 

const safeStopCamera = () => {
  if (AddView && typeof AddView.stopCamera === 'function') {
    AddView.stopCamera();
    console.log('[SPA] Kamera dimatikan otomatis saat pindah halaman.');
  }
};

const VAPID_PUBLIC_KEY = 'BCCs2eonMI-6H2ctvFaWg-UYdDv387Vno_bzUzALpB442r21CnsHmtrx8biyPi_E-1fSGABK_Qs_G1vPoJJqxbk';
const STORY_API_BASE_URL = 'https://story-api.dicoding.dev/v1';

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  return Uint8Array.from([...rawData].map(char => char.charCodeAt(0)));
}

export async function subscribeUserForPush() { 
  if (!('serviceWorker' in navigator && 'PushManager' in window)) {
    console.warn('Browser tidak mendukung Service Worker atau Push Messaging.');
    return;
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    let pushSubscription = await registration.pushManager.getSubscription();

    if (!pushSubscription) {
      console.log('Belum ada Push Subscription, membuat yang baru...');
      pushSubscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
      });
      console.log('Push Subscription baru berhasil dibuat:', pushSubscription);
    } else {
      console.log('Push Subscription sudah ada:', pushSubscription);
    }

    const authToken = sessionStorage.getItem('authToken');
    console.log('Token yang ditemukan:', authToken);  

    if (!authToken) {
      console.warn('Tidak ada token otorisasi ditemukan. Push Subscription tidak akan dikirim.');
      return;
    }

    const subscriptionJSON = pushSubscription.toJSON(); 

    const subscriptionData = {
      endpoint: subscriptionJSON.endpoint, 
      keys: {
        p256dh: subscriptionJSON.keys.p256dh,
        auth: subscriptionJSON.keys.auth,
      }
    };

    const response = await fetch(`${STORY_API_BASE_URL}/notifications/subscribe`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`,
      },
      body: JSON.stringify(subscriptionData),
    });

    if (response.ok) {
      console.log('Push Subscription berhasil dikirim ke server!');
    } else {
      const errorData = await response.json();
      console.error('Gagal mengirim Push Subscription ke server:', errorData);
    }
  } catch (error) {
    console.error('Gagal mendaftar atau mengirim push subscription:', error);
    if (Notification.permission === 'denied') {
      console.warn('Pengguna menolak izin notifikasi.');
    }
  }
}

window.addEventListener('load', () => {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js')
      .then(registration => {
        console.log('Service Worker terdaftar dengan scope:', registration.scope);
        
        const authToken = sessionStorage.getItem('authToken');
        if (authToken) {
          subscribeUserForPush();  
        } else {
          console.warn('Token belum tersedia, Push Subscription akan ditunda.');
        }
      })
      .catch(error => {
        console.error('Pendaftaran Service Worker gagal:', error);
      });
  } else {
    console.warn('Browser tidak mendukung Service Worker.');
  }

    // Redirect ke login jika belum ada hash
  if (location.hash === '' || location.hash === '#/') {
    location.hash = '#/login';
  }

  router();
});

// Menambahkan event listener untuk login
window.addEventListener('loginSuccess', () => {
  const authToken = sessionStorage.getItem('authToken');
  console.log('Token yang ditemukan:', authToken); 
  if (authToken) {
    subscribeUserForPush();
  } else {
    console.warn('Token belum tersedia setelah login, Push Subscription tidak dilakukan.');
  }
});

window.addEventListener('hashchange', () => {
  const hash = location.hash.slice(1);
  if (!router.routes?.[hash] && !document.getElementById(hash)) return;
  safeStopCamera();
  router();
});

document.addEventListener('DOMContentLoaded', () => {
  document.querySelector('a[href="#app"]')?.addEventListener('click', function (event) {
    event.preventDefault();
    const mainElement = document.getElementById('app');
    if (mainElement) {
      this.blur();
      mainElement.setAttribute('tabindex', '-1');
      mainElement.focus({ preventScroll: true });
      mainElement.scrollIntoView({ behavior: 'smooth' });
    }
  });
});

// Menghapus duplikasi event listener untuk tombol subscribe/unsubscribe
// Karena sudah ditangani di homeView.js

async function initPushNotification() {
  if ('Notification' in window && 'serviceWorker' in navigator) {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      console.log('Izin notifikasi diberikan');
      await subscribeUserForPush(); // baru lanjut push subscription
    } else {
      console.warn('Izin notifikasi tidak diberikan');
    }
  }
}