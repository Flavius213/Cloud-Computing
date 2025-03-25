import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './App.css';

function App() {

  //Tema1
  const [books, setBooks] = useState([]);
  const [booksPage, setBooksPage] = useState(1);
  const booksLimit = 10;
  const [hasMoreBooks, setHasMoreBooks] = useState(true);

  const [newTitle, setNewTitle] = useState('');
  const [newAuthor, setNewAuthor] = useState('');
  const [editBookId, setEditBookId] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editAuthor, setEditAuthor] = useState('');
  // -----------------------------

  //JSONPlaceholder
  const [posts, setPosts] = useState([]);
  const [postsPage, setPostsPage] = useState(1);
  const postsLimit = 10;
  const [hasMorePosts, setHasMorePosts] = useState(true);

  const [newPostTitle, setNewPostTitle] = useState('');
  const [newPostBody, setNewPostBody] = useState('');
  const [newPostUserId, setNewPostUserId] = useState('');
  const [editPostId, setEditPostId] = useState(null);
  const [editPostTitle, setEditPostTitle] = useState('');
  const [editPostBody, setEditPostBody] = useState('');
  const [editPostUserId, setEditPostUserId] = useState('');
  // -----------------------------

  const [weather, setWeather] = useState(null);

  const fetchBooks = async (page = 1) => {
    try {
      const res = await axios.get(`http://localhost:8000/api/books?page=${page}&limit=${booksLimit}`);
      if (res.data && res.data.length > 0) {
        setBooks(prev => [...prev, ...res.data]);
      } else {
        setHasMoreBooks(false);
      }
    } catch (err) {
      console.error('Eroare la preluarea cartilor:', err);
      setHasMoreBooks(false);
    }
  };

  const fetchPosts = async (page = 1) => {
    try {
      const res = await axios.get(`http://localhost:8000/api/jsonposts?page=${page}&limit=${postsLimit}`);
      if (res.data && res.data.length > 0) {
        setPosts(prev => [...prev, ...res.data]);
      } else {
        setHasMorePosts(false);
      }
    } catch (err) {
      console.error('Eroare la preluarea postarilor:', err);
      setHasMorePosts(false);
    }
  };

  const fetchWeather = async () => {
    try {
      const res = await axios.get('http://localhost:8000/api/weather');
      setWeather(res.data);
    } catch (err) {
      console.error('Eroare la preluarea datelor meteo:', err);
    }
  };

  const handleAddBook = async (e) => {
    e.preventDefault();
    if (!newTitle || !newAuthor) {
      alert('Completeaza Title si Author pentru carte!');
      return;
    }
    try {
      await axios.post('http://localhost:8000/api/books', {
        title: newTitle,
        author: newAuthor
      });
      setNewTitle('');
      setNewAuthor('');
      setBooks([]);
      setBooksPage(1);
      setHasMoreBooks(true);
      fetchBooks(1);
    } catch (err) {
      console.error('Eroare la adaugarea cartii:', err);
    }
  };

  const handleEditBook = (book) => {
    setEditBookId(book.id);
    setEditTitle(book.title);
    setEditAuthor(book.author);
  };

  const handleUpdateBook = async (e) => {
    e.preventDefault();
    if (!editTitle || !editAuthor) {
      alert('Completeaza Title si Author pentru actualizare!');
      return;
    }
    try {
      await axios.put(`http://localhost:8000/api/books/${editBookId}`, {
        title: editTitle,
        author: editAuthor
      });
      setEditBookId(null);
      setEditTitle('');
      setEditAuthor('');
      setBooks([]);
      setBooksPage(1);
      setHasMoreBooks(true);
      fetchBooks(1);
    } catch (err) {
      console.error('Eroare la actualizarea cartii:', err);
    }
  };

  const handleCancelEditBook = () => {
    setEditBookId(null);
    setEditTitle('');
    setEditAuthor('');
  };

  const handleDeleteBook = async (id) => {
    try {
      await axios.delete(`http://localhost:8000/api/books/${id}`);
      setBooks([]);
      setBooksPage(1);
      setHasMoreBooks(true);
      fetchBooks(1);
    } catch (err) {
      console.error('Eroare la stergerea cartii:', err);
    }
  };

  const hideMoreBooks = () => {
    if (booksPage > 1) {
      setBooks(prev => prev.slice(0, prev.length - booksLimit));
      setBooksPage(prev => prev - 1);
      setHasMoreBooks(true);
    }
  };

  const loadMoreBooks = () => {
    const nextPage = booksPage + 1;
    setBooksPage(nextPage);
    fetchBooks(nextPage);
  };

  const handleAddPost = async (e) => {
    e.preventDefault();
    if (!newPostTitle || !newPostBody || !newPostUserId) {
      alert('Completeaza title, body si userId pentru postare!');
      return;
    }
    try {
      await axios.post('http://localhost:8000/api/jsonposts', {
        title: newPostTitle,
        body: newPostBody,
        userId: parseInt(newPostUserId, 10)
      });
      setNewPostTitle('');
      setNewPostBody('');
      setNewPostUserId('');
      setPosts([]);
      setPostsPage(1);
      setHasMorePosts(true);
      fetchPosts(1);
    } catch (err) {
      console.error('Eroare la adaugarea postarii:', err);
    }
  };

  const handleEditPost = (post) => {
    setEditPostId(post.id);
    setEditPostTitle(post.title);
    setEditPostBody(post.body);
    setEditPostUserId(post.userId);
  };

  const handleUpdatePost = async (e) => {
    e.preventDefault();
    if (!editPostTitle || !editPostBody || !editPostUserId) {
      alert('Completeaza toate campurile pentru PUT (title, body, userId)!');
      return;
    }
    try {
      await axios.put(`http://localhost:8000/api/jsonposts/${editPostId}`, {
        title: editPostTitle,
        body: editPostBody,
        userId: parseInt(editPostUserId, 10)
      });
      setEditPostId(null);
      setEditPostTitle('');
      setEditPostBody('');
      setEditPostUserId('');
      setPosts([]);
      setPostsPage(1);
      setHasMorePosts(true);
      fetchPosts(1);
    } catch (err) {
      console.error('Eroare la actualizarea postarii (PUT):', err);
    }
  };

  const handlePatchPost = async (postId, partialData) => {
    try {
      await axios.patch(`http://localhost:8000/api/jsonposts/${postId}`, partialData);
      setPosts([]);
      setPostsPage(1);
      setHasMorePosts(true);
      fetchPosts(1);
    } catch (err) {
      console.error('Eroare la actualizarea partiala (PATCH):', err);
    }
  };

  const handleCancelEditPost = () => {
    setEditPostId(null);
    setEditPostTitle('');
    setEditPostBody('');
    setEditPostUserId('');
  };

  const handleDeletePost = async (id) => {
    try {
      await axios.delete(`http://localhost:8000/api/jsonposts/${id}`);
      setPosts([]);
      setPostsPage(1);
      setHasMorePosts(true);
      fetchPosts(1);
    } catch (err) {
      console.error('Eroare la stergerea postarii:', err);
    }
  };

  //ascunde ultimele 10 postari
  const hideMorePosts = () => {
    if (postsPage > 1) {
      setPosts(prev => prev.slice(0, prev.length - postsLimit));
      setPostsPage(prev => prev - 1);
      setHasMorePosts(true);
    }
  };

  const loadMorePosts = () => {
    const nextPage = postsPage + 1;
    setPostsPage(nextPage);
    fetchPosts(nextPage);
  };

  useEffect(() => {
    fetchBooks(1);
    fetchPosts(1);
    fetchWeather();
  }, []);

  return (
    <div className="App">
      <h1>Aplicatie Full-Stack</h1>

      {/* ----------------- Sectiunea Carti ----------------- */}
      <section className="section">
        <h2>Gestionare Carti (CRUD)</h2>
        {/* Formular de adaugare carte */}
        <div style={{ marginBottom: '1rem' }}>
          <h3>Adauga carte noua</h3>
          <form onSubmit={handleAddBook}>
            <input
              type="text"
              placeholder="Title"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
            />
            <input
              type="text"
              placeholder="Author"
              value={newAuthor}
              onChange={(e) => setNewAuthor(e.target.value)}
            />
            <button type="submit">Adauga</button>
          </form>
        </div>
        {/* Lista de carti */}
        <h3>Lista de carti</h3>
        <ul>
          {books.map((book) => (
            <li key={book.id} style={{ marginBottom: '0.5rem' }}>
              {editBookId === book.id ? (
                <div>
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                  />
                  <input
                    type="text"
                    value={editAuthor}
                    onChange={(e) => setEditAuthor(e.target.value)}
                  />
                  <button onClick={handleUpdateBook}>Salveaza</button>
                  <button onClick={handleCancelEditBook}>Anuleaza</button>
                </div>
              ) : (
                <div>
                  <strong>{book.title}</strong> — {book.author}
                  <button style={{ marginLeft: '1rem' }} onClick={() => handleEditBook(book)}>
                    Editeaza
                  </button>
                  <button style={{ marginLeft: '1rem' }} onClick={() => handleDeleteBook(book.id)}>
                    Sterge
                  </button>
                </div>
              )}
            </li>
          ))}
        </ul>
        {/*Load More si Hide Last 10 */}
        <div style={{ marginTop: '1rem' }}>
          {hasMoreBooks && (
            <button onClick={loadMoreBooks}>Incarca inca 10 carti</button>
          )}
          {booksPage > 1 && (
            <button onClick={hideMoreBooks} style={{ marginLeft: '1rem' }}>
              Ascunde ultimele 10 carti
            </button>
          )}
        </div>
      </section>

      {/* ----------------- Sectiunea Postari----------------- */}
      <section className="section">
        <h2>Gestionare Postari (JSONPlaceholder)</h2>
        {/* Formular de adaugare postare */}
        <div style={{ marginBottom: '1rem' }}>
          <h3>Adauga postare noua</h3>
          <form onSubmit={handleAddPost}>
            <input
              type="text"
              placeholder="Titlu"
              value={newPostTitle}
              onChange={(e) => setNewPostTitle(e.target.value)}
            />
            <input
              type="text"
              placeholder="Body"
              value={newPostBody}
              onChange={(e) => setNewPostBody(e.target.value)}
            />
            <input
              type="number"
              placeholder="User ID"
              value={newPostUserId}
              onChange={(e) => setNewPostUserId(e.target.value)}
            />
            <button type="submit">Creeaza</button>
          </form>
        </div>
        {/* Lista de postari */}
        <h3>Lista de postari</h3>
        <ul>
          {posts.map((post) => (
            <li key={post.id} style={{ marginBottom: '0.5rem' }}>
              {editPostId === post.id ? (
                <div>
                  <input
                    type="text"
                    value={editPostTitle}
                    onChange={(e) => setEditPostTitle(e.target.value)}
                  />
                  <input
                    type="text"
                    value={editPostBody}
                    onChange={(e) => setEditPostBody(e.target.value)}
                  />
                  <input
                    type="number"
                    value={editPostUserId}
                    onChange={(e) => setEditPostUserId(e.target.value)}
                  />
                  <button onClick={handleUpdatePost}>Salveaza (PUT)</button>
                  <button onClick={handleCancelEditPost}>Anuleaza</button>
                </div>
              ) : (
                <div>
                  <strong>{post.title}</strong> — {post.body} (User: {post.userId})
                  <button style={{ marginLeft: '1rem' }} onClick={() => handleEditPost(post)}>
                    Editeaza
                  </button>
                  <button
                    style={{ marginLeft: '1rem' }}
                    onClick={() => handlePatchPost(post.id, { title: 'PATCH Title' })}
                  >
                    Patch Title
                  </button>
                  <button style={{ marginLeft: '1rem' }} onClick={() => handleDeletePost(post.id)}>
                    Sterge
                  </button>
                </div>
              )}
            </li>
          ))}
        </ul>
        {/*Load More si Hide Last 10 */}
        <div style={{ marginTop: '1rem' }}>
          {hasMorePosts && (
            <button onClick={loadMorePosts}>Incarca inca 10 postari</button>
          )}
          {postsPage > 1 && (
            <button onClick={hideMorePosts} style={{ marginLeft: '1rem' }}>
              Ascunde ultimele 10 postari
            </button>
          )}
        </div>
      </section>

      {/* ----------------- Sectiunea Weather----------------- */}
      <section className="section">
        <h2>Vreme curenta (Open-Meteo)</h2>
        <button onClick={fetchWeather}>Reimprospateaza datele meteo</button>
        {weather && weather.current_weather ? (
          <div style={{ marginTop: '1rem' }}>
            <p>Temperatura: {weather.current_weather.temperature} °C</p>
            <p>Viteza vantului: {weather.current_weather.windspeed} km/h</p>
            <p>Cod vreme: {weather.current_weather.weathercode}</p>
          </div>
        ) : (
          <p>Datele meteo nu sunt disponibile.</p>
        )}
      </section>
    </div>
  );
}

export default App;
