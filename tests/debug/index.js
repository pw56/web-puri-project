let isNotificationGranted = false;
Notification.requestPermission().then(() => {
  isNotificationGranted = true;
});

function sendNotification(type, text) {
  let displayType = '',
      icon = './assets/';
  switch (type) {
    case 'log': {
      displayType = 'ログ';
      icon += 'log.svg';
      break;
    }

    case 'warn': {
      displayType = '警告';
      icon += 'warn.svg';
      break;
    }

    case 'error': {
      displayType = 'エラー';
      icon += 'error.svg';
      break;
    }
  }
  const options = {
    body: text,
    icon: icon
  };
  new Notification(displayType, options);
}

export console.log = (text) => { sendNotification('log', text); };
export console.warn = (text) => { sendNotification('warn', text); };
export console.error = (text) => { sendNotification('error', text) };