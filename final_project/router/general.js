const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();
const axios = require('axios');

public_users.post("/register", (req, res) => {
    const { username, password } = req.body;
  
    // Check if both fields are provided
    if (!username || !password) {
      return res.status(400).json({ message: "Username and password are required." });
    }
  
    // Check if username already exists
    if (isValid(username)) {
      return res.status(409).json({ message: "Username already exists." });
    }
  
    // Save new user
    users.push({ username, password });
    return res.status(201).json({ message: "User registered successfully." });
  });
  

// Get the book list available in the shop
public_users.get('/',function (req, res) {
  
    return res.status(200).send(JSON.stringify(books, null, 4));
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn', function (req, res) {
    const isbn = req.params.isbn;
    const book = books[isbn];
  
    if (book) {
      return res.status(200).json(book);
    } else {
      return res.status(404).json({ message: "Book not found" });
    }
  });
  
  
// Get book details based on author
public_users.get('/author/:author',function (req, res) {
  const author =  req.params.author.toLowerCase();
  const results = Object.values(books).filter(book => book.author.toLowerCase() === author);

  if (results.length > 0) {
    return res.status(200).json(results);
  }else {
    return res.status(404).json({message: "no Books found for this author"})
  }
});

// Get all books based on title
public_users.get('/title/:title',function (req, res) {
  const title = req.params.title.toLowerCase();
  const results = Object.values(books).filter(book => book.title.toLowerCase() === title);

  if (results.length > 0){
  return res.status(200).json(results);
  } else {
    return res.status(404).json({message: "no books with this title"});
  }
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
    const isbn = req.params.isbn;
    const book = books[isbn];

    if (book) {
        return res.status(200).json(book.reviews || {});
    } else {
        return res.status(404).json({message: "Book not found"});
    }
});

public_users.get('/async-books', async (req, res) => {
    try {
      const booksData = await new Promise((resolve) => {
        resolve(books);
      });
  
      res.status(200).json(booksData);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch books." });
    }
  });
  
  public_users.get('/async-isbn/:isbn', async (req, res) => {
    const isbn = req.params.isbn;
    try {
      const bookData = await new Promise((resolve, reject) => {
        if (books[isbn]) {
          resolve(books[isbn]);
        } else {
          reject("Book not found");
        }
      });
  
      res.status(200).json(bookData);
    } catch (error) {
      res.status(404).json({ message: error });
    }
  });
  
  public_users.get('/async-author/:author', async (req, res) => {
    const author = req.params.author.toLowerCase();
    try {
        const filteredBooks = await new Promise((resolve) => {
            const results = Object.values(books).filter(book => book.author.toLowerCase() === author);
            resolve(results);
        });

        if (filteredBooks.length === 0) throw "mo Books found for this author";
        res.status(200).json(filteredBooks);
    } catch(error) {
        res.status(404).json({message: error});
    }
  });

  public_users.get('/async-title/:title', async (req, res) => {
    const title = req.params.title.toLowerCase();
    try {
        const filteredBooks = await new Promise((resolve) => {
            const results = Object.values(books).filter(book => book.title.toLowerCase() === title);
            resolve(results);
        });

        if(filteredBooks.length === 0) throw "no Books found with this title";
        res.status(200).json(filteredBooks);
    } catch (error) {
        res.status(404).json({message: error})
    }
  });
module.exports.general = public_users;
