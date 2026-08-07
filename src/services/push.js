const API = 'https://barber-saas-1-fpjl.onrender.com/api'
const VAPID_PUBLIC_KEY = 'BDzFVsvKnbz_9y6ASDk8yL7eqmDe9XSTvETDYu_rVy2jCJZtYvfL3-Ah_0qe0v0lDs90gj5r5aAGxg6Z7HkE8YM'

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = window.atob(base64)
  return Uint8Array.from([...rawData].map((c) => c.charCodeAt(0)))
}

export async function enablePushNotifications() {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    alert('Seu navegador não suporta notificações.')
    return false
  }

  const permission = await Notification.requestPermission()
  if (permission !== 'granted') return false

  const registration = await navigator.serviceWorker.register('/service-worker.js')

  const subscription = await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
  })

  const token = localStorage.getItem('token')
  await fetch(`${API}/push/subscribe`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(subscription),
  })

  return true
}

export function isPushEnabled() {
  return localStorage.getItem('push_enabled') === 'true'
}