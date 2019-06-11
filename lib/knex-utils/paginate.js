const DEFAULT_COUNT = 20
const MAX_LIMIT = 100

function paginate(query, key, cfg = {}, opts = {}) {
  const {
    where: whereFn = null,
    orderBy: orderByFn = null,
    limit = MAX_LIMIT,
    column
  } = cfg

  const {
    dir = 'next',
    count = DEFAULT_COUNT
  } = opts

  if (whereFn) {
    whereFn(query, key, dir)
  } else {
    const op = dir === 'next' ? '>' : '<'
    query.where(column, op, key)
  }

  if (orderByFn) {
    orderByFn(query, dir)
  } else {
    const order = dir === 'next' ? 'asc' : 'desc'
    query.orderBy(column, order)
  }

  query.limit(Math.min(count, limit))

  return query
}

module.exports = paginate
