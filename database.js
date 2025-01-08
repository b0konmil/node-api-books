import sqlite3 from 'sqlite3'

const db = new sqlite3.Database('./books.db', (err) => {
  if (err) {
    console.error('Failed to connect to database:', err);
  } 
});

db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS books (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT,
      author TEXT,
      description TEXT,
      year INTEGER NOT NULL
    )
  `);
});

module.exports = db;