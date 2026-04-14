require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const db = require('./db');

const app = express();
const port = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

// Serve static files from React build
app.use(express.static(path.join(__dirname, '../client/dist')));

// 1. Galleries List
app.get('/api/galleries', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM galleries ORDER BY name ASC');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch galleries' });
  }
});

// 2. Posts List (per gallery)
app.get('/api/galleries/:slug/posts', async (req, res) => {
  const { slug } = req.params;
  const { page = 1, limit = 30 } = req.query;
  const offset = (page - 1) * limit;

  try {
    const galleryRes = await db.query('SELECT id FROM galleries WHERE slug = $1', [slug]);
    if (galleryRes.rows.length === 0) return res.status(404).json({ error: 'Gallery not found' });
    const galleryId = galleryRes.rows[0].id;

    const postsRes = await db.query(
      'SELECT * FROM posts WHERE gallery_id = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3',
      [galleryId, limit, offset]
    );
    res.json(postsRes.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch posts' });
  }
});

// 3. Post Detail
app.get('/api/posts/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const postRes = await db.query('SELECT * FROM posts WHERE id = $1', [id]);
    if (postRes.rows.length === 0) return res.status(404).json({ error: 'Post not found' });
    
    // Update views
    await db.query('UPDATE posts SET views = views + 1 WHERE id = $1', [id]);
    
    res.json(postRes.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch post' });
  }
});

// 4. Create Post
app.post('/api/posts', async (req, res) => {
  const { gallery_id, title, content, author_name, password, author_ip } = req.body;
  try {
    const result = await db.query(
      'INSERT INTO posts (gallery_id, title, content, author_name, password, author_ip) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id',
      [gallery_id, title, content, author_name, password, author_ip]
    );
    res.json({ success: true, postId: result.rows[0].id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create post' });
  }
});

// Serve frontend for any other routes
app.get('(.*)', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/dist/index.html'));
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
