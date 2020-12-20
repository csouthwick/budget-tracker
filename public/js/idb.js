// initial setup

let db;
const request = indexedDB.open('budget', 1);

request.onupgradeneeded = function (event) {
  const db = event.target.result;
  db.createObjectStore('records', { autoIncrement: true });
};

request.onsuccess = function (e) {
  // If db was created successfully with object store, save to global variable
  db = e.target.result;

  // if online, upload any pending records
  // if (navigator.onLine) {
  //   uploadRecords();
  // }
};

request.onerror = function (event) {
  console.log(event.target.errorCode);
};


// save and upload sections

function saveRecord(record) {
  const transaction = db.transaction(['records'], 'readwrite');
  const records = transaction.objectStore('records');
  records.add(record);
}
