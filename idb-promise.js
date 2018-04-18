(function(){

  window.indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;

  if(!window.indexedDB) {
    console.log('indexedDB not supported...');
    return;
  }

  const STORE = function(db, storeName) {
    let self = this;
    self.get_store = function(){
      var transaction = db.transaction([storeName]);
      return transaction.objectStore(storeName);
    }
    self.get_all = function() {
      return new Promise(function(resolve, reject){
        var transaction = db.transaction([storeName]);
        var objectStore = transaction.objectStore(storeName);
        var request = objectStore.getAll();
        request.error = function(event) { return reject(event); }
        request.onsuccess = function(event) { return resolve(event.target.result); }
      });
    }
    self.get_all_keys = function() {
      return new Promise(function(resolve, reject){
        var transaction = db.transaction([storeName]);
        var objectStore = transaction.objectStore(storeName);
        var request = objectStore.getAllKeys();
        request.error = function(event) { return reject(event); }
        request.onsuccess = function(event) { return resolve(event.target.result); }
      });
    }
    // CRUD
    self.create = function(data) {
      return new Promise(function(resolve, reject){
        var uniqueValue = function() {
          return String(Date.now()) +
      	    Math.random().toString(36).substr(2, 34) +
      	    Math.random().toString(36).substr(2, 34) +
      	    Math.random().toString(36).substr(2, 34)
        }

        var transaction = db.transaction([storeName], "readwrite");
        var objectStore = transaction.objectStore(storeName);
        transaction.onerror = function(event) {
          console.log(event);
          return reject('could not create', event);
        };
        transaction.oncomplete = function(event) {
          return resolve();
        };
        if(!data.uniqueValue || data.uniqueValue.constructor !== String || data.uniqueValue.constructor !== Number) { data.uniqueValue = uniqueValue() }
        var request = objectStore.add(data);
        request.onsuccess = function(event) {};
      });
    }
    self.read = function(key) {
      return new Promise(function(resolve, reject){
        var transaction = db.transaction([storeName]);
        var objectStore = transaction.objectStore(storeName);
        var request = objectStore.get(key);
        request.error = function(event) { return reject(event); }
        request.onsuccess = function(event) { return resolve(event.target.result); }
      });
    }
    self.update = function(key, data) {
      return new Promise(function(resolve, reject){
        var transaction = db.transaction([storeName], "readwrite");
        var objectStore = transaction.objectStore(storeName);
        var request = objectStore.get(key);
        request.error = function(event) { return reject(event); }
        request.onsuccess = function(event) {
          if(data.uniqueValue) { delete data.uniqueValue }
          var updates = Object.assign({}, event.target.result, data);
          var requestUpdate = objectStore.put(updates);
          requestUpdate.onerror = function(event) {
            return reject(event);
          };
          requestUpdate.onsuccess = function(event) {
            return resolve(event);
          };
        }
      });
    }
    self.destroy = function(key) {
      return new Promise(function(resolve, reject){
        var transaction = db.transaction([storeName], "readwrite");
        var objectStore = transaction.objectStore(storeName);
        var request = objectStore.delete(key);
        request.error = function(event) { return reject(event); }
        request.onsuccess = function(event) { return resolve(); }
      });
    }
    //
    self.clear = function(key) {
      return new Promise(function(resolve, reject){
        var transaction = db.transaction([storeName], "readwrite");
        var objectStore = transaction.objectStore(storeName);
        var request = objectStore.clear();
        request.error = function(event) { return reject(event); }
        request.onsuccess = function(event) { return resolve(); }
      });
    }
    self.count = function(key) {
      return new Promise(function(resolve, reject){
        var transaction = db.transaction([storeName], "readwrite");
        var objectStore = transaction.objectStore(storeName);
        var request = objectStore.count();
        request.error = function(event) { return reject(event); }
        request.onsuccess = function(event) { return resolve(request.result); }
      });
    }
  }

  const DB = function(db) {
    let self = this;
    self.get_db = function(){ return db; }
    self.stores = function(storeName) {
      if(!self.get_db().objectStoreNames.contains(storeName)) {
        let error_msg = 'this store does not exist in current database version: ' + storeName;
        console.log(error_msg);
        throw new Error(error_msg);
        return;
      }
      return new STORE(self.get_db(), storeName);
    }
  }

  //

  window.IDB = function(db_name, version, callback){
    let self = this;
    return new Promise(function(resolve, reject){
      let resolved = false;
      self.request = window.indexedDB.open(db_name, version);
      self.request.onupgradeneeded = function(event) {
        var db = event.target.result;
        if(callback && callback.constructor === Function) { callback(event) }
        if(resolved == true) { return; }
        resolved = true;
        resolve(new DB(db));
      };
      self.request.onerror = function(event) {
        reject(event);
      };
      request.onsuccess = function(event) {
        var db = event.target.result;
        if(resolved == true) { return; }
        resolved = true;
        resolve(new DB(db));
      };
    });
  }
})()
