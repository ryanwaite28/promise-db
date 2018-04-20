# PromiseDB - IndexedDB Library
## Promise Enabled

<br/>

![](javascript-logo.png)
![](database-logo.png)

<br/>

> A simple layer of abstraction for using IndexedDB by implementing Promises!<br/>
> minify tool used: https://skalman.github.io/UglifyJS-online/ <br/>
> inspired by: https://www.npmjs.com/package/idb | https://github.com/jakearchibald/idb

<br/>

Example: https://ryanwaite28.github.io/promise-db/example/index.html <br/>
CDN script link: https://ryanwaite28.github.io/promise-db/idb-promise.min.js

<br/>

### MDN Web Docs
Documentation: https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API <br/>
Usage: https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API/Using_IndexedDB



### Info
This library was created for easily using the browser's database, IndexedDB.
The current API for IndexedDB is low-level and doesn't meet modern standards.
It takes a lot of code just to carry out basic tasks because the current API still uses event listeners
for async operations, like `.onsuccess` or `.onerror` methods, while having to create transactions and etc...

This library adds a Promise based layer and new interface on top of the current API that simplifies using IndexedDB!
The library is written in pure JavaScript; no dependencies! Simply include the library before your script
to start using it:

```html
<script src="path/to/idb-promise.min.js"></script>
<script src="path/to/your-script.js"></script>
```


### Setup
To create a database, call the IDB function, which is in the global scope.
The first argument is the name of the database, the second is the version number, the third
is a callback function. In this callback, this is where you create your object stores, indexes,
upgrades, etc...

If there is an upgrade needed, then an `event` object will be passed to the callback,
so error handling is needed.

For example, this create a database that stores users:

```javascript
const users_db = IDB('users_db', 1, function(event){
  if(event) {
    var db = event.target.result;
    var objectStore = db.createObjectStore('users', {keyPath: 'idb_uniqueValue'});
    objectStore.createIndex("name", "name", { unique: false });
  }
  
  // after your setup code above, you may want to call an init function like so: setTimeout(init, 2000);
  // this way, you aren't making database calls while it is being initialized/upgraded. 
  // see the script in the example page
});
```

Calling IDB also returns a `Promise`, which resolves to a db wrapper -- a function object. That Promise is stored in a `const` variable for later use.

To do upgrades, switch `event.oldVersion`, with each case being whatever changes that you want:

```javascript
const users_db = IDB('users_db', 1, function(event){
  var db = event.target.result;
  if(event && event.type === 'upgradeneeded') {
    switch(event.oldVersion) {
      case 0:
        var objectStore = db.createObjectStore('users', {keyPath: 'idb_uniqueValue'});
      case 1:
        let tx = db.transaction(['users']);
        let store = tx.objectStore('users');
        store.createIndex("name", "name", { unique: false });
    }
  }
});
```

Do not use `break` statement(s) in your switch case!
This is so that everything can be created in order.
A break statement will cause some cases to be missed,
meaning some of your code will not be executed.

### Usage

To access the db wrapper, call the `then` method on the db variable:

```javascript
users_db.then(db => { console.log(db); })
```

Since the returned Promise from the IDB call is stored in a variable, it can be used indefinitely to access that db wrapper.

To get the actual db object:

```javascript
users_db.then(db => { let database = db.get_db(); })
```

That db wrapper object will have a `stores` method,
allowing you to get the object store that you want.
You can only get the object stores that you created when you initialized/upgraded the database.

Here is how to get the users object store that was created:

```javascript
users_db.then(db => {
  db.stores('users')
})
```

That `stores` method creates and returns a wrapper for that object store,
allowing you to chain on methods of reading/modifying that object store.

Here is how you can add data:

```javascript
users_db.then(db => {
  db.stores('users').create({ name: 'John Doe' }).then(data => {
    console.log('created!', data);
  })
})
```

By default, the library will automatically add some properties, `idb_uniqueValue`, `idb_createdDate` and `idb_updatedDate` (both uses `Date.now()`), to each new item(when it is an object literal) being added to the object store.
That is why `idb_uniqueValue` was specified as the keyPath when the `users` object store was created.
You can still specify whatever keyPath that you want.

To update an entry:

```javascript
users_db.then(db => {
  db.stores('users').update(key, { real: false }).then(data => {
    console.log('updated!', data);
  })
})
```

Where the `key` argument is the value that matches the item's key in the store.

To delete an entry:

```javascript
users_db.then(db => {
  db.stores('users').delete(key).then(() => {
    console.log('deleted!');
  })
})
```

To get an entry:

```javascript
users_db.then(db => {
  db.stores('users').get(key).then(data => {
    console.log('fetched!', data);
  })
})
```

To get all entries:

```javascript
users_db.then(db => {
  db.stores('users').get_all().then(data => {
    console.log('fetched all!', data);
  })
})
```

To get all keys:

```javascript
users_db.then(db => {
  db.stores('users').get_all_keys().then(data => {
    console.log('fetched all keys!', data);
  })
})
```

To clear all entries:

```javascript
users_db.then(db => {
  db.stores('users').clear().then(() => {
    console.log('cleared!');
  })
})
```

To count all items:

```javascript
users_db.then(db => {
  db.stores('users').count().then(num => {
    console.log('fetched count!', num);
  })
})
```

To get the object store:

```javascript
users_db.then(db => {
  let store = db.stores('users').get_store();
})
```

<br/>

### Summary

This is a simple yet efficient library. If you need to use the low-level API,
simply get the actual database/store object from their wrappers and use that!

Also, one can easily take the source code and modify it to their needs!

Enjoy!

-----

# Ryan M. Waite
#### Web / Mobile Developer
