// Simple cache utility for localStorage
// TTL is in milliseconds (default: 10 minutes)
export function setCache(key, data, ttl = 600000) {
  const record = { data, timestamp: Date.now(), ttl };
  localStorage.setItem(key, JSON.stringify(record));
}

export function getCache(key) {
  const record = JSON.parse(localStorage.getItem(key));
  if (!record) return null;
  if (Date.now() - record.timestamp > record.ttl) {
    localStorage.removeItem(key);
    return null;
  }
  return record.data;
}
