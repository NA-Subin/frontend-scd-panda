// importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app.js');
// importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging.js');

// // Firebase configuration
// const firebaseConfig = {
//     apiKey: "AIzaSyADfKpfQckZyxWjM7i8kxvtMjDkgh0G3O8",
//     authDomain: "scd-panda-1bc5a.firebaseapp.com",
//     databaseURL: "https://scd-panda-1bc5a-default-rtdb.asia-southeast1.firebasedatabase.app",
//     projectId: "scd-panda-1bc5a",
//     storageBucket: "scd-panda-1bc5a.firebasestorage.app",
//     messagingSenderId: "222666567078",
//     appId: "1:222666567078:web:8e8512c9ff63853b897367",
//     measurementId: "G-SGK6FNMEYT"
//   };

// // Initialize Firebase
// firebase.initializeApp(firebaseConfig);
// const messaging = firebase.messaging();

// // Background message handler
// messaging.onBackgroundMessage((payload) => {
//   console.log('[firebase-messaging-sw.js] Received background message:', payload);
//   const notificationTitle = payload.notification.title;
//   const notificationOptions = {
//     body: payload.notification.body,
//     icon: payload.notification.icon
//   };

//   self.registration.showNotification(notificationTitle, notificationOptions);
// });
