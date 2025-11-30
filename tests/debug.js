let isNotificationGranted = false;
Notification.requestPermission().then(() => {
  isNotificationGranted = true;
});

function sendNotification(type, text) {
  let displayType = '';
  switch (type) {
    case 'log': {
      displayType = 'ログ';
      break;
    }

    case 'warn': {
      displayType = '警告';
      break;
    }

    case 'error': {
      displayType = 'エラー';
      break;
    }
  }
  alert(`${displayType}: ${text}`);
}

console.log = (text) => { sendNotification('log', text); };
console.warn = (text) => { sendNotification('warn', text); };
console.error = (text) => { sendNotification('error', text) };