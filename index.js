var crypto = require('node:crypto')

function unitdb() {
  var data = []

  function norm(v) {
    if (v instanceof Date) return v.getTime()
    if (typeof v === 'string') {
      var t = Date.parse(v)
      return isNaN(t) ? v : t
    }
    return v
  }

  function isUnsafeKey(k) {
    return k === '__proto__' || k === 'constructor' || k === 'prototype'
  }

  function equals(a, b) {
    return norm(a) === norm(b)
  }

  function matches(doc, query) {
    for (var k in query) {
      if (isUnsafeKey(k)) continue

      var condition = query[k]
      var value = doc[k]

      if (
        typeof condition === 'object' &&
        condition !== null &&
        !Array.isArray(condition) &&
        !(condition instanceof RegExp)
      ) {
        var v = norm(value)

        for (var op in condition) {
          var target = condition[op]

          if (op === '$regex') {
            var re = target

            if (!(re instanceof RegExp)) {
              if (typeof re !== 'string') return false
              try {
                re = new RegExp(re)
              } catch {
                return false
              }
            }

            if (typeof value !== 'string' || !re.test(value)) return false
            continue
          }

          if (op === '$in') {
            var ok = false
            for (var i = 0; i < target.length; i++) {
              if (equals(value, target[i])) {
                ok = true
                break
              }
            }
            if (!ok) return false
            continue
          }

          if (op === '$nin') {
            for (var i = 0; i < target.length; i++) {
              if (equals(value, target[i])) return false
            }
            continue
          }

          var t = norm(target)

          if (op === '$gt' && !(v > t)) return false
          if (op === '$lt' && !(v < t)) return false
          if (op === '$gte' && !(v >= t)) return false
          if (op === '$lte' && !(v <= t)) return false
          if (op === '$ne' && v === t) return false
        }
      } else {
        if (!equals(value, condition)) return false
      }
    }
    return true
  }

  return {
    get(query, options) {
      var limit = (options && options.limit) || Infinity
      var skip = (options && options.skip) || 0
      var sort = options && options.sort
      var results = []

      if (
        !query ||
        typeof query !== 'object' ||
        Object.keys(query).length === 0
      ) {
        results = data.slice()
      } else {
        for (var i = 0; i < data.length; i++)
          if (matches(data[i], query)) results.push(data[i])
      }

      if (sort) {
        var keys = Object.keys(sort)
        results.sort(function (a, b) {
          for (var i = 0; i < keys.length; i++) {
            var k = keys[i]
            var d = sort[k]
            if (a[k] === b[k]) continue
            return d === -1 ? (a[k] < b[k] ? 1 : -1) : a[k] > b[k] ? 1 : -1
          }
          return 0
        })
      }

      return results.slice(skip, skip + limit)
    },

    set(query, values) {
      var id

      if (values === undefined) {
        values = query
        values.id = values.id || crypto.randomUUID()
        id = values.id
        data.push(values)
      } else if (values === null) {
        data = data.filter(function (d) {
          return !matches(d, query)
        })
      } else {
        for (var i = 0; i < data.length; i++)
          if (matches(data[i], query)) Object.assign(data[i], values)
      }

      return id
    }
  }
}

module.exports = unitdb
