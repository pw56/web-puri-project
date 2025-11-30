!function() {
let isNotificationGranted = false;
Notification.requestPermission().then(() => {
  isNotificationGranted = true;
});

function sendNotification(type, text) {
  let displayType = '',
      iconPath = '/web-puri-project/tests/debug/assets/';
  switch (type) {
    case 'log': {
      displayType = 'ログ';
      iconPath += 'log.svg';
      break;
    }

    case 'warn': {
      displayType = '警告';
      iconPath += 'warn.svg';
      break;
    }

    case 'error': {
      displayType = 'エラー';
      iconPath += 'error.svg';
      break;
    }
  }
  const options = {
    body: text,
    icon: iconPath
  };
  new Notification(displayType, options);
}

console.log = (text) => { sendNotification('log', text); };
console.warn = (text) => { sendNotification('warn', text); };
console.error = (text) => { sendNotification('error', text) };
}();