var unitdb = require('../../index.js')
var db

beforeEach(function () {
  db = unitdb()
})

test('get() basic and numeric operators', function ({ t }) {
  db.set({ name: 'a', val: 10 })
  db.set({ name: 'a', val: 20 })

  t.equal(db.get({ name: 'a' }).length, 2)
  t.equal(db.get({ val: { $gt: 15 } }).length, 1)
  t.equal(db.get({ val: { $lte: 10 } }).length, 1)
})

test('get() with multi-key sorting', function ({ t }) {
  db.set({ name: 'Charlie', age: 30 })
  db.set({ name: 'Alice', age: 25 })
  db.set({ name: 'Bob', age: 25 })

  var res = db.get({}, { sort: { age: 1, name: 1 } })
  t.equal(res[0].name, 'Alice')
  t.equal(res[1].name, 'Bob')
  t.equal(res[2].name, 'Charlie')

  var resDesc = db.get({}, { sort: { age: -1 } })
  t.equal(resDesc[0].name, 'Charlie')
})

test('set() create, update, remove', function ({ t }) {
  var id = db.set({ type: 'job', name: 'a' })
  t.ok(id)

  db.set({ id: id }, { name: 'b' })
  t.equal(db.get({ name: 'b' })[0].id, id)

  db.set({ id: id }, null)
  t.equal(db.get({ id: id }).length, 0)
})

test('pagination (limit and skip) with sort', function ({ t }) {
  db.set({ n: 1 })
  db.set({ n: 2 })
  db.set({ n: 3 })
  db.set({ n: 4 })
  db.set({ n: 5 })

  var res = db.get({}, { sort: { n: -1 }, skip: 2, limit: 2 })
  t.equal(res.length, 2)
  t.equal(res[0].n, 3)
  t.equal(res[1].n, 2)
})

test('get() array and regex operators', function ({ t }) {
  db.set({ tag: 'a', name: 'Apple' })
  db.set({ tag: 'b', name: 'Banana' })

  t.equal(db.get({ tag: { $in: ['a', 'c'] } }).length, 1)
  t.equal(db.get({ tag: { $nin: ['a'] } }).length, 1)
  t.equal(db.get({ name: { $regex: /^Ap/ } }).length, 1)
})

test('date handling', function ({ t }) {
  var myDate = new Date('2025-05-05')
  db.set({ id: 'dt', time: myDate })

  t.equal(db.get({ time: { $gt: new Date('2025-01-01') } }).length, 1)
})

test('missing keys and nulls', function ({ t }) {
  db.set({ name: 'a', meta: null })

  t.equal(db.get({ nonExistent: 'foo' }).length, 0)
  t.equal(db.get({ meta: null }).length, 1)
  t.equal(db.get({ meta: { $ne: 'something' } }).length, 1)
})

test('regex safety with numbers', function ({ t }) {
  db.set({ name: 123 })

  t.doesNotThrow(function () {
    var res = db.get({ name: { $regex: /abc/ } })
    t.equal(res.length, 0)
  })
})
