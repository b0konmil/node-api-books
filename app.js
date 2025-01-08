import express from 'express'
import bodyParser  from 'body-parser';
import db from 'database';
import swaggerUi from 'swagger-ui-express';
import swaggerJsDoc from 'swagger-jsdoc';

const app = express();
app.use(bodyParser.json());

const swaggerOptions = {
  swaggerDefinition: {
    openapi: '3.0.0',
    info: {
      title: 'books API',
      version: '1.0.0',
    },
    servers: [
      {
        url: 'http://localhost:3000',
      },
    ],
  },
  apis: ['./app.js'],
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

/**
 * @swagger
 * /books:
 *   get:
 *     responses:
 *       200:
 *         description: List of all books
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Book'
 */

app.get('/books', (req, res) => {
  db.all('SELECT * FROM books', [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.json(rows);
    }
  });
});

/**
 * @swagger
 * /books:
 *   post:
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/BookInput'
 *     responses:
 *       201:
 *         description: Book created successfully
 */

app.post('/books', (req, res) => {
  const { title, author, description, year } = req.body;
  const sql = 'INSERT INTO books (title, author, description, year) VALUES (?, ?, ?, ?)';
  const params = [title, author, description, year];

  db.run(sql, params, function (err) {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.status(201).json({ id: this.lastID });
    }
  });
});

/**
 * @swagger
 * /books/{id}:
 *   get:
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Book ID
 *     responses:
 *       200:
 *         description: Book details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Book'
 *       404:
 *         description: Book not found
 */

app.get('/books/:id', (req, res) => {
  const sql = 'SELECT * FROM books WHERE id = ?';
  const params = [req.params.id];

  db.get(sql, params, (err, row) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else if (!row) {
      res.status(404).json({ error: 'Book not found' });
    } else {
      res.json(row);
    }
  });
});

/**
 * @swagger
 * /books/{id}:
 *   put:
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Book ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/BookInput'
 *     responses:
 *       200:
 *         description: Book updated successfully
 *       404:
 *         description: Book not found
 */

app.put('/books/:id', (req, res) => {
  const { title, author, description, year } = req.body;
  const sql = `
    UPDATE books
    SET title = ?, author = ?, description = ?, year = ?
    WHERE id = ?
  `;
  const params = [title, author, description, year, req.params.id];

  db.run(sql, params, function (err) {
    if (err) {
      res.status(500).json({ error: err.message });
    } else if (this.changes === 0) {
      res.status(404).json({ error: 'Book not found' });
    } else {
      res.json({ message: 'Book updated successfully' });
    }
  });
});

/**
 * @swagger
 * /books/{id}:
 *   delete:
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Book ID
 *     responses:
 *       200:
 *         description: Book deleted successfully
 *       404:
 *         description: Book not found
 */

app.delete('/books/:id', (req, res) => {
  const sql = 'DELETE FROM books WHERE id = ?';
  const params = [req.params.id];

  db.run(sql, params, function (err) {
    if (err) {
      res.status(500).json({ error: err.message });
    } else if (this.changes === 0) {
      res.status(404).json({ error: 'Book not found' });
    } else {
      res.json({ message: 'Book deleted successfully' });
    }
  });
});


/**
 * @swagger
 * components:
 *   schemas:
 *     Book:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: Unique book ID
 *         title:
 *           type: string
 *           description: Book name
 *         author:
 *           type: string
 *           description: Book author
 *         description:
 *           type: string
 *           description: Book description
 *         year:
 *           type: number
 *           description: Year of release
 *     BookInput:
 *       type: object
 *       properties:
 *         title:
 *           type: string
 *           description: Book name
 *         author:
 *           type: string
 *           description: Book author
 *         description:
 *           type: string
 *           description: Book description
 *         year:
 *           type: number
 *           description: Year of release
 *       required:
 *         - name
 *         - year
 */

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}/docs`);
});