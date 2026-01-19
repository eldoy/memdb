## UnitDB

A lightweight, **in-memory JSON database** for Node.js designed for speed and simplicity. Intended for **single-process environments only**.

`unitdb` keeps all data strictly in memory. There is **no persistence**.

---

### Features

* **Mongo-style Queries:** `$gt`, `$lt`, `$gte`, `$lte`, `$ne`, `$in`, `$nin`, `$regex`
* **In-memory Only:** All reads and writes operate on live memory
* **Date Support:** Automatic normalization and comparison of `Date` values
* **Sorting:** Multi-key ascending / descending sort
* **Pagination:** Built-in `limit` and `skip`
* **Minimal API:** Only `get()` and `set()`
* **Synchronous Writes:** `set()` is fully synchronous

---

### Installation

```sh
npm i unitdb
```

---

### Usage

```js
var unitdb = require('unitdb')

// Single in-memory collection
var db = unitdb()

db.set({ type: 'user', name: 'Alice' })
db.set({ type: 'user', name: 'Bob' })

var users = db.get({ type: 'user' })
```

---

### Usage Examples

#### 1. Inserting Data

Passing a single object inserts a new document. A UUID `id` is generated automatically if missing.

```js
db.set({
  name: 'Project Alpha',
  status: 'pending',
  priority: 1,
  createdAt: new Date()
})
```

---

#### 2. Querying with Operators

```js
// Numeric and inequality operators
var tasks = db.get({
  priority: { $gte: 5 },
  status: { $ne: 'archived' }
})

// Regex and array operators
var results = db.get({
  name: { $regex: /^Project/i },
  tags: { $in: ['urgent', 'active'] }
})
```

---

#### 3. Updating Data

```js
// Update all pending tasks
db.set({ status: 'pending' }, { status: 'active' })

// Update by ID
db.set({ id: 'some-uuid' }, { progress: 100 })
```

---

#### 4. Deleting Data

```js
// Delete a single record
db.set({ id: 'some-uuid' }, null)

// Delete all completed tasks
db.set({ status: 'completed' }, null)

// Clear entire database
db.set({}, null)
```

---

#### 5. Pagination and Sorting

```js
var page = db.get(
  { type: 'log' },
  { sort: { createdAt: -1 }, limit: 10, skip: 10 }
)
```

---

### API Reference

| Method                  | Description                                                   |
| ----------------------- | ------------------------------------------------------------- |
| `get(query, [options])` | Returns matching documents. Supports `{ limit, skip, sort }`. |
| `set(query, [values])`  | Insert, update, or delete documents.                          |

---

### Execution Model

* All data lives in memory
* No filesystem access
* No async behavior
* No background work
* Process exit discards all data

---

### Limitations

* Single process only
* No persistence
* No transactions
* No indexes
* Linear scan queries

Designed for embedded, ephemeral, test, cache, and control-plane use cases.

---

### License

ISC.

---

### Acknowledgements

Created by [Vidar Eldøy](https://eldoy.com)
