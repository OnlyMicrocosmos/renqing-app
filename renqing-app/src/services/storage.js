// Storage service using IndexedDB
let db;

const request = indexedDB.open('renqing-db', 1);

request.onupgradeneeded = (event) => {
  db = event.target.result;
  db.createObjectStore('events', { keyPath: 'id', autoIncrement: true });
  db.createObjectStore('contacts', { keyPath: 'id', autoIncrement: true });
};

request.onsuccess = (event) => {
  db = event.target.result;
};

request.onerror = (event) => {
  console.error('Database error: ' + event.target.errorCode);
};

export const addData = (storeName, data) => {
  const transaction = db.transaction([storeName], 'readwrite');
  const store = transaction.objectStore(storeName);
  store.add(data);
};

export const getData = (storeName) => {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([storeName], 'readonly');
    const store = transaction.objectStore(storeName);
    const request = store.getAll();
    request.onsuccess = () => {
      resolve(request.result);
    };
    request.onerror = () => {
      reject(request.error);
    };
  });
};