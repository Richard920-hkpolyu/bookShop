const express = require('express');
const axios = require('axios'); // Use axios for external API calls if needed
let { books, bookCache } = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();
// 201 for successful creation, 409 for conflict
// Register a new user
public_users.post("/register", async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required." });
    }

    if (username.length < 4 || password.length < 6) {
    return res.status(400).json({
      message: "Username must be at least 4 characters and password 6 characters" 
    });
  }

    if (!isValid(username)) {
        return res.status(409).json({ message: "User already exists!" });
    }

    // Use async operation to simulate DB insertion
    users.push({ username, password });
    return res.status(201).json({ message: "User successfully registered. Now you can login." });
});

// Get the book list available in the shop
public_users.get('/', async (req, res) => {
    try {
        const cachedBooks = bookCache.get("books");
        if (cachedBooks) {
            return res.status(200).json(cachedBooks);
        }

        // Fallback to original books object if cache is empty
        bookCache.set("books", books);
        res.status(200).json(books);
    } catch (error) {
        res.status(500).json({ message: "Error retrieving book list." });
    }
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn', async (req, res) => {
    const { isbn } = req.params;
    try {
        const book = books[isbn];
        if (book) {
            return res.status(200).json(book);
        }
        return res.status(404).json({ message: "Book not found." });
    } catch (error) {
        res.status(500).json({ message: "Error retrieving book details." });
    }
});

// Get book details based on author
public_users.get('/author/:author', async (req, res) => {
    const { author } = req.params;

    if (!author || author.trim().length < 2) {
        return res.status(400).json({ message: "Valid author name required" });
  }
    try {
      //Asynchronous Loops, replace the for loop
        const result = Object.values(books).filter(book => book.author.toLowerCase().includes(author.toLowerCase()));
        if (result.length > 0) {
            return res.status(200).json(result);
        }
        return res.status(404).json({ message: "No books found for this author." });
    } catch (error) {
        res.status(500).json({ message: "Error retrieving books by author." });
    }
});

// Get all books based on title
public_users.get('/title/:title', async (req, res) => {
    const { title } = req.params;
    if (!title || title.trim().length < 2) {
    return res.status(400).json({ message: "Valid title required" });
  }
    try {
        const result = Object.values(books).filter(book => book.title.toLowerCase().includes(title.toLowerCase()));
        if (result.length > 0) {
            return res.status(200).json(result);
        }
        return res.status(404).json({ message: "No books found with this title." });
    } catch (error) {
        res.status(500).json({ message: "Error retrieving books by title." });
    }
});


// Get book review
public_users.get('/review/:isbn', async (req, res) => {
    const { isbn } = req.params;
    try {
        const book = books[isbn];
        if (book) {
            return res.status(200).json(book.reviews);
        }
        return res.status(404).json({ message: "Book not found." });
    } catch (error) {
        res.status(500).json({ message: "Error retrieving book reviews." });
    }
});

module.exports.general = public_users;


/*

const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


public_users.post("/register", (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    // Check if both username and password are provided
    if (username && password) {
        // Check if the user does not already exist
        if (isValid(username)) {
            // Add the new user to the users array
            users.push({"username": username, "password": password});
            return res.status(200).json({message: "User successfully registered. Now you can login"});
        } else {
            return res.status(404).json({message: "User already exists!"});
        }
    }
    // Return error if username or password is missing
    return res.status(404).json({message: "Unable to register user."});
});

// Get the book list available in the shop
// Async-Await with Axios
public_users.get('/', async function (req, res) {
  try {
    res.status(200).json(books);// The res.json() method automatically handles JSON stringification.
  } catch (error) {
    res.status(500).json({ message: "Error retrieving book list." });
  }
});

// Get book details based on ISBN
// Async-Await with Axios
public_users.get('/isbn/:isbn', async function (req, res) {
  const isbn = req.params.isbn;

  // Check if the book exists
  if (books[isbn]) {
    return res.status(200).json(books[isbn]);
  } else {
    return res.status(404).json({ message: "Book not found." });
  }
});

// Get book details based on author
// Async-Await with Axios
public_users.get('/author/:author', async function (req, res) {
  const author = req.params.author;
  const result = [];

  // Loop through the books to find matches
  for (const key in books) {
    if (books[key].author.toLowerCase() === author.toLowerCase()) {
      result.push(books[key]);
    }
  }

  if (result.length > 0) {
    return res.status(200).json(result);
  } else {
    return res.status(404).json({ message: "No books found for this author." });
  }
});

// Get all books based on title
// Async-Await with Axios
public_users.get('/title/:title', async function (req, res) {
  const title = req.params.title.toLowerCase();
  const result = [];

  // Loop through the books to find matches
  for (const key in books) {
    if (books[key].title.toLowerCase().includes(title)) {
      result.push(books[key]);
    }
  }

  if (result.length > 0) {
    return res.status(200).json(result);
  } else {
    return res.status(404).json({ message: "No books found with this title." });
  }
});

// Get book review
public_users.get('/review/:isbn', async function (req, res) {
  const isbn = req.params.isbn;

  // Check if the book exists
  if (books[isbn]) {
    return res.status(200).json(books[isbn].reviews);
  } else {
    return res.status(404).json({ message: "Book not found." });
  }
});

module.exports.general = public_users;

*/