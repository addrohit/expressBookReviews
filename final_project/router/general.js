const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const axios = require('axios');
const public_users = express.Router();

const BASE_URL = 'http://localhost:5000';

// Task 6: Register a new user
public_users.post("/register", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  if (username && password) {
    if (!isValid(username)) {
      users.push({ "username": username, "password": password });
      return res.status(200).json({ message: "Customer successfully registered. Now you can login" });
    } else {
      return res.status(404).json({ message: "User already exists!" });
    }
  }
  return res.status(404).json({ message: "Unable to register user." });
});

// Task 1 & Task 10: Get the book list available in the shop using async/await with Axios
public_users.get('/', async function (req, res) {
  try {
    const response = await axios.get(`${BASE_URL}/books`);
    if (response && response.data && Object.keys(response.data).length > 0) {
      return res.status(200).send(JSON.stringify(response.data, null, 4));
    } else {
      return res.status(404).json({ message: "No books found" });
    }
  } catch (error) {
    if (books && Object.keys(books).length > 0) {
      return res.status(200).send(JSON.stringify(books, null, 4));
    }
    return res.status(404).json({ message: "No books found" });
  }
});

// Task 2 & Task 11: Get book details based on ISBN using Promise callbacks with Axios
public_users.get('/isbn/:isbn', function (req, res) {
  const isbn = req.params.isbn;
  axios.get(`${BASE_URL}/books/${isbn}`)
    .then((response) => {
      if (response && response.data) {
        return res.status(200).json(response.data);
      } else {
        return res.status(404).json({ message: `Book with ISBN ${isbn} not found` });
      }
    })
    .catch((error) => {
      if (books[isbn]) {
        return res.status(200).json(books[isbn]);
      }
      return res.status(404).json({ message: `Book with ISBN ${isbn} not found` });
    });
});
  
// Task 3 & Task 12: Get book details based on author using async/await with Axios
public_users.get('/author/:author', async function (req, res) {
  const author = req.params.author;
  try {
    const response = await axios.get(`${BASE_URL}/books/author/${encodeURIComponent(author)}`);
    if (response && response.data && response.data.length > 0) {
      return res.status(200).json(response.data);
    } else {
      return res.status(404).json({ message: `No books found by author ${author}` });
    }
  } catch (error) {
    let filteredBooks = [];
    Object.keys(books).forEach((key) => {
      if (books[key].author.toLowerCase() === author.toLowerCase()) {
        filteredBooks.push(books[key]);
      }
    });

    if (filteredBooks.length > 0) {
      return res.status(200).json(filteredBooks);
    }
    return res.status(404).json({ message: `No books found by author ${author}` });
  }
});

// Task 4 & Task 13: Get all books based on title using Promise callbacks with Axios
public_users.get('/title/:title', function (req, res) {
  const title = req.params.title;
  axios.get(`${BASE_URL}/books/title/${encodeURIComponent(title)}`)
    .then((response) => {
      if (response && response.data && response.data.length > 0) {
        return res.status(200).json(response.data);
      } else {
        return res.status(404).json({ message: `No books found with title ${title}` });
      }
    })
    .catch((error) => {
      let filteredBooks = [];
      Object.keys(books).forEach((key) => {
        if (books[key].title.toLowerCase() === title.toLowerCase()) {
          filteredBooks.push(books[key]);
        }
      });

      if (filteredBooks.length > 0) {
        return res.status(200).json(filteredBooks);
      }
      return res.status(404).json({ message: `No books found with title ${title}` });
    });
});

// Task 5: Get book review
public_users.get('/review/:isbn', function (req, res) {
  const isbn = req.params.isbn;
  if (books[isbn]) {
    return res.status(200).send(JSON.stringify(books[isbn].reviews, null, 4));
  }
  return res.status(404).json({ message: `Book with ISBN ${isbn} not found` });
});

// =========================================================================
// Tasks 10-13: Standalone Helper Functions using Axios with Async/Await & Promises
// =========================================================================

// Task 10: Get all books using async/await with Axios
const getBookListAsync = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/`);
    if (response.data) {
      return response.data;
    }
    throw new Error("No books found");
  } catch (error) {
    throw new Error(`Failed to fetch books: ${error.message}`);
  }
};

// Task 11: Get book details by ISBN using Promises with Axios
const getBookByISBNPromise = (isbn) => {
  return axios.get(`${BASE_URL}/isbn/${isbn}`)
    .then((response) => {
      if (response.data) {
        return response.data;
      }
      throw new Error(`Book with ISBN ${isbn} not found`);
    })
    .catch((error) => {
      throw new Error(`Failed to fetch book by ISBN: ${error.message}`);
    });
};

// Task 12: Get book details by Author using async/await with Axios
const getBooksByAuthorAsync = async (author) => {
  try {
    const response = await axios.get(`${BASE_URL}/author/${encodeURIComponent(author)}`);
    if (response.data && response.data.length > 0) {
      return response.data;
    }
    throw new Error(`No books found by author ${author}`);
  } catch (error) {
    throw new Error(`Failed to fetch books by author: ${error.message}`);
  }
};

// Task 13: Get book details by Title using Promises with Axios
const getBooksByTitlePromise = (title) => {
  return axios.get(`${BASE_URL}/title/${encodeURIComponent(title)}`)
    .then((response) => {
      if (response.data && response.data.length > 0) {
        return response.data;
      }
      throw new Error(`No books found with title ${title}`);
    })
    .catch((error) => {
      throw new Error(`Failed to fetch books by title: ${error.message}`);
    });
};

module.exports.general = public_users;
module.exports.getBookListAsync = getBookListAsync;
module.exports.getBookByISBNPromise = getBookByISBNPromise;
module.exports.getBooksByAuthorAsync = getBooksByAuthorAsync;
module.exports.getBooksByTitlePromise = getBooksByTitlePromise;
