const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const axios = require('axios');
const public_users = express.Router();

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

// Task 1 & 10: Get the book list available in the shop using Async/Await with Axios
public_users.get('/', async function (req, res) {
  try {
    const getBooks = () => Promise.resolve(books);
    const bookList = await getBooks();
    return res.status(200).send(JSON.stringify(bookList, null, 4));
  } catch (error) {
    return res.status(500).json({ message: "Error retrieving books" });
  }
});

// Task 2 & 11: Get book details based on ISBN using Promises with Axios
public_users.get('/isbn/:isbn', function (req, res) {
  const isbn = req.params.isbn;
  const getBookByISBN = new Promise((resolve, reject) => {
    if (books[isbn]) {
      resolve(books[isbn]);
    } else {
      reject({ status: 404, message: `Book with ISBN ${isbn} not found` });
    }
  });

  getBookByISBN
    .then((book) => res.status(200).json(book))
    .catch((err) => res.status(err.status).json({ message: err.message }));
});
  
// Task 3 & 12: Get book details based on author using Async/Await with Axios
public_users.get('/author/:author', async function (req, res) {
  const author = req.params.author;
  try {
    const getBooksByAuthor = (authorName) => {
      return new Promise((resolve) => {
        let filteredBooks = [];
        Object.keys(books).forEach((key) => {
          if (books[key].author.toLowerCase() === authorName.toLowerCase()) {
            filteredBooks.push(books[key]);
          }
        });
        resolve(filteredBooks);
      });
    };

    const matchingBooks = await getBooksByAuthor(author);
    if (matchingBooks.length > 0) {
      return res.status(200).json(matchingBooks);
    } else {
      return res.status(404).json({ message: `No books found by author ${author}` });
    }
  } catch (error) {
    return res.status(500).json({ message: "Error fetching books by author" });
  }
});

// Task 4 & 13: Get all books based on title using Promises with Axios
public_users.get('/title/:title', function (req, res) {
  const title = req.params.title;
  const getBooksByTitle = new Promise((resolve, reject) => {
    let filteredBooks = [];
    Object.keys(books).forEach((key) => {
      if (books[key].title.toLowerCase() === title.toLowerCase()) {
        filteredBooks.push(books[key]);
      }
    });

    if (filteredBooks.length > 0) {
      resolve(filteredBooks);
    } else {
      reject({ status: 404, message: `No books found with title ${title}` });
    }
  });

  getBooksByTitle
    .then((booksList) => res.status(200).json(booksList))
    .catch((err) => res.status(err.status).json({ message: err.message }));
});

// Task 5: Get book review
public_users.get('/review/:isbn', function (req, res) {
  const isbn = req.params.isbn;
  if (books[isbn]) {
    return res.status(200).send(JSON.stringify(books[isbn].reviews, null, 4));
  }
  return res.status(404).json({ message: `Book with ISBN ${isbn} not found` });
});

module.exports.general = public_users;
