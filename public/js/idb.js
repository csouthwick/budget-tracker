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
  if (navigator.onLine) {
    uploadRecords();
  }
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

function uploadRecords() {
  const transaction = db.transaction(['records'], 'readwrite');
  const records = transaction.objectStore('records');
  const getAll = records.getAll();

  getAll.onsuccess = function () {
    // If there are pending budget transactions, send to the server
    if (getAll.result.length > 0) {
      fetch('/api/transaction', {
        method: 'POST',
        body: JSON.stringify(getAll.result),
        headers: {
          Accept: 'application/json, text/plain, */*',
          'Content-Type': 'application/json'
        }
      })
        .then(response => response.json())
        .then(serverResponse => {
          if (serverResponse.message) {
            throw new Error(serverResponse);
          }

          // if saving to server worked, clear pending records
          const transaction = db.transaction(['records'], 'readwrite');
          const records = transaction.objectStore('records');
          records.clear();
        })
        .catch(err => {
          console.log(err);
        });
    }
  };
};

// listen for online status
window.addEventListener('online', uploadRecords);
