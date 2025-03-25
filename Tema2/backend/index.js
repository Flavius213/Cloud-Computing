const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
const port = 8000;

app.use(cors());
app.use(express.json());

// pt get-uri: verifica daca datele primite sunt goale
const isEmptyData = (data) => {
  if (Array.isArray(data)) {
    return data.length === 0;
  }
  if (typeof data === 'object' && data !== null) {
    return Object.keys(data).length === 0;
  }
  return !data;
};

//-------------------
// start tema1 (Books API)
app.get('/api/books', async (req, res) => {
  try {
    const response = await axios.get('http://localhost:8001/books');
    if (response.status === 200) {
      if (isEmptyData(response.data)) {
        res.status(404).json({ error: 'Nu s-au gasit carti.' });
      } else {
        res.status(200).json(response.data);
      }
    } else if (response.status === 404) {
      res.status(404).json({ error: 'Carti nu au fost gasite.' });
    } else if (response.status === 409) {
      res.status(409).json({ error: 'Conflict la preluarea cartilor din API Python.' });
    } else {
      res.status(500).json({ error: 'Eroare neasteptata la API-ul Python.' });
    }
  } catch (error) {
    if (error.response && error.response.status) {
      if (error.response.status === 404) {
        res.status(404).json({ error: error.response.data.error || 'Carti nu au fost gasite (external API).' });
      } else if (error.response.status === 409) {
        res.status(409).json({ error: error.response.data.error || 'Conflict la API-ul Python.' });
      } else {
        res.status(500).json({ error: error.response.data.error || 'Eroare interna la apelul API Python.' });
      }
    } else {
      console.error('Eroare la apel API Python:', error.message);
      res.status(500).json({ error: 'Eroare interna la apelul API Python.' });
    }
  }
});

app.post('/api/books', async (req, res) => {
  try {
    const { title, author } = req.body;
    if (!title || !author) {
      return res.status(400).json({ error: 'Title si author sunt necesare.' });
    }

    const response = await axios.post('http://localhost:8001/books', { title, author });

    if (response.status === 201) {
      res.status(201).json(response.data);
    } else if (response.status === 409) {
      res.status(409).json({ error: 'Conflict la crearea cartii in API Python.' });
    } else {
      res.status(500).json({ error: 'Eroare neasteptata la crearea cartii.' });
    }
  } catch (error) {
    if (error.response && error.response.status) {
      if (error.response.status === 409) {
        res.status(409).json({ error: error.response.data.error || 'Conflict la API-ul Python (POST).' });
      } else {
        res.status(error.response.status).json({ error: error.response.data.error || 'Eroare la API-ul Python (POST).' });
      }
    } else {
      console.error('Eroare POST la API Python:', error.message);
      res.status(500).json({ error: 'Eroare interna la apelul API Python (POST).' });
    }
  }
});

app.put('/api/books/:id', async (req, res) => {
  try {
    const bookId = req.params.id;
    const { title, author } = req.body;

    if (!title && !author) {
      return res.status(400).json({ error: 'Lipsește title sau author pentru actualizare.' });
    }

    const response = await axios.put(`http://localhost:8001/books/${bookId}`, { title, author });

    if (response.status === 200) {
      res.status(200).json(response.data);
    } else if (response.status === 404) {
      res.status(404).json({ error: 'Cartea nu a fost gasita pentru actualizare.' });
    } else if (response.status === 409) {
      res.status(409).json({ error: 'Conflict la actualizarea cartii in API Python.' });
    } else {
      res.status(500).json({ error: 'Eroare neasteptata la actualizarea cartii.' });
    }
  } catch (error) {
    if (error.response && error.response.status) {
      if (error.response.status === 404) {
        res.status(404).json({ error: error.response.data.error || 'Cartea nu a fost gasita (PUT).' });
      } else if (error.response.status === 409) {
        res.status(409).json({ error: error.response.data.error || 'Conflict la API-ul Python (PUT).' });
      } else {
        res.status(error.response.status).json({ error: error.response.data.error || 'Eroare la API-ul Python (PUT).' });
      }
    } else {
      console.error('Eroare PUT la API Python:', error.message);
      res.status(500).json({ error: 'Eroare interna la apelul API Python (PUT).' });
    }
  }
});

app.delete('/api/books/:id', async (req, res) => {
  try {
    const bookId = req.params.id;
    const response = await axios.delete(`http://localhost:8001/books/${bookId}`);

    if (response.status === 204) {
      res.sendStatus(204);
    } else if (response.status === 404) {
      res.status(404).json({ error: 'Cartea nu a fost gasita pentru stergere.' });
    } else if (response.status === 409) {
      res.status(409).json({ error: 'Conflict la stergerea cartii in API Python.' });
    } else {
      res.status(500).json({ error: 'Eroare neasteptata la stergerea cartii.' });
    }
  } catch (error) {
    if (error.response && error.response.status) {
      if (error.response.status === 404) {
        res.status(404).json({ error: error.response.data.error || 'Cartea nu a fost gasita (DELETE).' });
      } else if (error.response.status === 409) {
        res.status(409).json({ error: error.response.data.error || 'Conflict la API-ul Python (DELETE).' });
      } else {
        res.status(error.response.status).json({ error: error.response.data.error || 'Eroare la API-ul Python (DELETE).' });
      }
    } else {
      console.error('Eroare DELETE la API Python:', error.message);
      res.status(500).json({ error: 'Eroare interna la apelul API Python (DELETE).' });
    }
  }
});
// end tema1

//-------------------
// start jsonAPI (JSONPlaceholder Posts)
app.get('/api/jsonposts', async (req, res) => {
  const { page = 1, limit = 10 } = req.query; 
  // page = pagina curenta, limit = nr. de postari pe pagina

  try {
    const response = await axios.get(
      `https://jsonplaceholder.typicode.com/posts?_page=${page}&_limit=${limit}`
    );
    
    if (response.status === 200) {
      if (!response.data || response.data.length === 0) {
        return res.status(404).json({ error: 'Nu mai exista postari de incarcat.' });
      }
      return res.status(200).json(response.data);
    } else {
      return res.status(response.status).json({ error: 'Eroare neasteptata la JSONPlaceholder.' });
    }
  } catch (error) {
    console.error('Eroare la GET JSONPlaceholder /posts:', error.message);
    if (error.response) {
      return res.status(error.response.status).json({ error: 'Eroare la JSONPlaceholder (GET /posts).' });
    }
    return res.status(500).json({ error: 'Eroare interna la apelul JSONPlaceholder (GET /posts).' });
  }
});  

app.get('/api/jsonposts/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const response = await axios.get(`https://jsonplaceholder.typicode.com/posts/${id}`);
    if (response.status === 200) {
      if (isEmptyData(response.data)) {
        return res.status(404).json({ error: `Nu s-a gasit postarea cu id=${id}.` });
      }
      return res.status(200).json(response.data);
    } else if (response.status === 404) {
      return res.status(404).json({ error: 'Postare inexistenta (404).' });
    } else if (response.status === 409) {
      return res.status(409).json({ error: 'Conflict la preluarea postarii.' });
    } else {
      return res.status(500).json({ error: 'Eroare neasteptata la JSONPlaceholder (GET /posts/:id).' });
    }
  } catch (error) {
    console.error(`Eroare la GET JSONPlaceholder /posts/${id}:`, error.message);
    if (error.response) {
      return res.status(error.response.status).json({ error: error.response.data.error || 'Eroare la JSONPlaceholder (GET /posts/:id).' });
    }
    return res.status(500).json({ error: 'Eroare interna la apelul JSONPlaceholder (GET /posts/:id).' });
  }
});

app.post('/api/jsonposts', async (req, res) => {
  try {
    const { title, body, userId } = req.body;
    if (!title || !body || !userId) {
      return res.status(400).json({ error: 'title, body si userId sunt necesare pentru crearea unei postari.' });
    }

    const response = await axios.post('https://jsonplaceholder.typicode.com/posts', {
      title,
      body,
      userId
    });

    if (response.status === 201) {
      return res.status(201).json(response.data);
    } else if (response.status === 409) {
      return res.status(409).json({ error: 'Conflict la crearea postarii.' });
    } else {
      return res.status(500).json({ error: 'Eroare neasteptata la crearea postarii.' });
    }
  } catch (error) {
    console.error('Eroare la POST JSONPlaceholder /posts:', error.message);
    if (error.response) {
      return res.status(error.response.status).json({ error: error.response.data.error || 'Eroare la JSONPlaceholder (POST /posts).' });
    }
    return res.status(500).json({ error: 'Eroare interna la apelul JSONPlaceholder (POST /posts).' });
  }
});

app.put('/api/jsonposts/:id', async (req, res) => {
  const { id } = req.params;
  const { title, body, userId } = req.body;

  if (!title || !body || !userId) {
    return res.status(400).json({ error: 'title, body si userId sunt necesare pentru PUT.' });
  }

  try {
    const response = await axios.put(`https://jsonplaceholder.typicode.com/posts/${id}`, {
      title,
      body,
      userId
    });

    if (response.status === 200) {
      if (isEmptyData(response.data)) {
        return res.status(404).json({ error: `Postarea cu id=${id} nu a fost gasita (PUT).` });
      }
      return res.status(200).json(response.data);
    } else if (response.status === 404) {
      return res.status(404).json({ error: 'Postarea nu a fost gasita (404) la PUT.' });
    } else if (response.status === 409) {
      return res.status(409).json({ error: 'Conflict la actualizarea postarii (PUT).' });
    } else {
      return res.status(500).json({ error: 'Eroare neasteptata la JSONPlaceholder (PUT /posts/:id).' });
    }
  } catch (error) {
    console.error(`Eroare la PUT JSONPlaceholder /posts/${id}:`, error.message);
    if (error.response) {
      return res.status(error.response.status).json({ error: error.response.data.error || 'Eroare la JSONPlaceholder (PUT).' });
    }
    return res.status(500).json({ error: 'Eroare interna la apelul JSONPlaceholder (PUT).' });
  }
});

app.patch('/api/jsonposts/:id', async (req, res) => {
  const { id } = req.params;
  const { title, body, userId } = req.body;

  if (!title && !body && !userId) {
    return res.status(400).json({ error: 'Cel putin un camp (title, body, userId) este necesar pentru PATCH.' });
  }

  try {
    const response = await axios.patch(`https://jsonplaceholder.typicode.com/posts/${id}`, {
      ...(title && { title }),
      ...(body && { body }),
      ...(userId && { userId })
    });

    if (response.status === 200) {
      if (isEmptyData(response.data)) {
        return res.status(404).json({ error: `Postarea cu id=${id} nu a fost gasita (PATCH).` });
      }
      return res.status(200).json(response.data);
    } else if (response.status === 404) {
      return res.status(404).json({ error: 'Postarea nu a fost gasita (404) la PATCH.' });
    } else if (response.status === 409) {
      return res.status(409).json({ error: 'Conflict la actualizarea postarii (PATCH).' });
    } else {
      return res.status(500).json({ error: 'Eroare neasteptata la JSONPlaceholder (PATCH /posts/:id).' });
    }
  } catch (error) {
    console.error(`Eroare la PATCH JSONPlaceholder /posts/${id}:`, error.message);
    if (error.response) {
      return res.status(error.response.status).json({ error: error.response.data.error || 'Eroare la JSONPlaceholder (PATCH).' });
    }
    return res.status(500).json({ error: 'Eroare interna la apelul JSONPlaceholder (PATCH).' });
  }
});

app.delete('/api/jsonposts/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const response = await axios.delete(`https://jsonplaceholder.typicode.com/posts/${id}`);

    if (response.status === 200) {
      return res.sendStatus(200); // OK
    } else if (response.status === 404) {
      return res.status(404).json({ error: 'Postarea nu a fost gasita (DELETE).' });
    } else if (response.status === 409) {
      return res.status(409).json({ error: 'Conflict la stergerea postarii.' });
    } else {
      return res.status(500).json({ error: 'Eroare neasteptata la JSONPlaceholder (DELETE /posts/:id).' });
    }
  } catch (error) {
    console.error(`Eroare la DELETE JSONPlaceholder /posts/${id}:`, error.message);
    if (error.response) {
      return res.status(error.response.status).json({ error: error.response.data.error || 'Eroare la JSONPlaceholder (DELETE).' });
    }
    return res.status(500).json({ error: 'Eroare interna la apelul JSONPlaceholder (DELETE).' });
  }
});
// end jsonAPI
//-------------------
// Meteo
app.get('/api/weather', async (req, res) => {
  try {
    const response = await axios.get(
      'https://api.open-meteo.com/v1/forecast?latitude=44.43&longitude=26.11&current_weather=true'
    );
    if (response.status === 200) {
      if (response.data && response.data.current_weather) {
        res.status(200).json(response.data);
      } else {
        res.status(404).json({ error: 'Datele meteo nu au fost gasite.' });
      }
    } else if (response.status === 404) {
      res.status(404).json({ error: 'Datele meteo nu au fost gasite.' });
    } else if (response.status === 409) {
      res.status(409).json({ error: 'Conflict la preluarea datelor meteo.' });
    } else {
      res.status(500).json({ error: 'Eroare neasteptata la preluarea datelor meteo.' });
    }
  } catch (error) {
    if (error.response && error.response.status) {
      if (error.response.status === 404) {
        res.status(404).json({ error: error.response.data.error || 'Datele meteo nu au fost gasite (external API).' });
      } else if (error.response.status === 409) {
        res.status(409).json({ error: error.response.data.error || 'Conflict la API-ul Open-Meteo.' });
      } else {
        res.status(500).json({ error: error.response.data.error || 'Eroare interna la apelul API Open-Meteo.' });
      }
    } else {
      console.error('Eroare la apel Open-Meteo:', error.message);
      res.status(500).json({ error: 'Eroare interna la apelul API Open-Meteo.' });
    }
  }
});
// end Meteo
//-------------------
app.listen(port, () => {
  console.log(`Server pornit la http://localhost:${port}`);
});
