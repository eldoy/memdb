## unitdb

A lightweight **SQLite-backed JSON document database** for Node.js with a **minimal API**, **multi-process safety**, and **zero custom persistence logic**. All correctness, locking, durability, and recovery are delegated to SQLite.

`unitdb` keeps the same simple query and mutation model as `sysdb`, but replaces in-memory state with **SQLite as the source of truth**, making it safe for **multiple processes, workers, and restarts**.

---

### Features

* **SQLite-backed:** Disk is authoritative; memory is only a cache.
* **Multi-process safe:** Concurrent readers and writers supported.
* **Crash safe:** SQLite handles journaling and recovery.
* **Mongo-style Queries:** `$gt`, `$lt`, `$gte`, `$lte`, `$ne`, `$in`, `$nin`, `$regex`.
* **JSON Documents:** Schema-less records stored as JSON.
* **Atomic Writes:** Each mutation is fully committed or rolled back.
* **Pagination:** Built-in `limit` and `skip`.
* **Zero custom WAL code:** SQLite handles all durability.

---

### Installation

```sh
npm i unitdb
```

Node.js **v22+** required (uses built-in `node:sqlite`).

---

### Usage

```js
var unitdb = require('unitdb')
var db = unitdb('./unitdb.sqlite')
```

---

### Usage Examples

#### 1. Inserting Data

Passing a single object inserts a new document. A UUID `id` is generated automatically if missing.

```js
await db.set({
  name: 'Project Alpha',
  status: 'pending',
  priority: 1,
  createdAt: new Date()
})
```

---

#### 2. Querying with Operators

```js
// Find high priority tasks
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
await db.set({ status: 'pending' }, { status: 'active' })

// Update by ID
await db.set({ id: 'some-uuid' }, { progress: 100 })
```

---

#### 4. Deleting Data

```js
// Delete one record
await db.set({ id: 'some-uuid' }, null)

// Delete all completed tasks
await db.set({ status: 'completed' }, null)
```

---

#### 5. Pagination

```js
var page = db.get({ type: 'log' }, {
  limit: 10,
  skip: 10
})
```

---

#### 6. Commits

SQLite commits each statement automatically. `commit()` is provided for API compatibility and future batching, but is currently a no-op.

```js
await db.set({ important: 'data' })
await db.commit()
```

---

#### 7. Direct Data Access

The entire dataset can be accessed as plain JavaScript objects.

```js
// Read all records
var docs = db.data

// Replace entire dataset (init or controlled usage only)
db.data = [
  { id: 'a', value: 1 },
  { id: 'b', value: 2 }
]
```

All changes are persisted immediately through SQLite.

---

### Data Model

Internally, `unitdb` uses:

* One SQLite database file
* One table:

  * `id TEXT PRIMARY KEY`
  * `json TEXT` (serialized document)

No schema migrations are required.

---

### Concurrency Model

* Multiple processes can read and write safely
* SQLite enforces locking and ordering
* Readers never see partial writes
* Writers are serialized automatically

---

### Comparison with `sysdb`

| Feature            | sysdb      | unitdb          |
| ------------------ | ---------- | --------------- |
| Source of truth    | Memory     | SQLite          |
| Multi-process safe | No         | Yes             |
| Crash recovery     | Custom WAL | SQLite          |
| Read latency       | Lower      | Slightly higher |
| Write durability   | Eventual   | Immediate       |
| Complexity         | Minimal    | Still minimal   |

---

### API Reference

| Method                  | Description                                                   |
| ----------------------- | ------------------------------------------------------------- |
| `get(query, [options])` | Returns matching documents. Supports `{ limit, skip, sort }`. |
| `set(query, [values])`  | Insert, update, or delete documents.                          |
| `commit()`              | No-op (SQLite auto-commit).                                   |
| `get data / set data`   | Full dataset access and replacement.                          |

---

### License

ISC.

---

### Acknowledgements

Created by Vidar Eldøy, Tekki AS.
