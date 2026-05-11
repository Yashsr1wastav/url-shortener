const queryLog = [];

export function logQuery({ type, table, duration = 0, message = '' }) {
  try {
    const entry = { type, table, duration: Math.round(duration), message, timestamp: Date.now() };
    queryLog.push(entry);
    // keep max 20 entries
    if (queryLog.length > 20) queryLog.splice(0, queryLog.length - 20);
  } catch (err) {
    // noop
    console.error('logQuery error', err);
  }
}

export function getRecentQueries() {
  // return last 10, newest first
  return queryLog.slice(-10).reverse();
}

export default { logQuery, getRecentQueries };
