export default defineEventHandler((event) => {
  const db = useDB();
  
  // Prepare statements (better-sqlite3 caches them automatically if defined outside, 
  // but inside handler is safe for simplicity given auto-caching)
  const increment = db.prepare('UPDATE visitors SET count = count + 1 WHERE id = 1');
  const get = db.prepare('SELECT count FROM visitors WHERE id = 1');

  // Transaction for consistency
  const updateAndGet = db.transaction(() => {
    increment.run();
    return get.get() as { count: number };
  });

  try {
    const result = updateAndGet();
    return { count: result.count };
  } catch (error) {
    console.error('DB Error:', error);
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal Server Error'
    });
  }
});
