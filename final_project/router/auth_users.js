const express = require('express');
const jwt = require('jsonwebtoken');
let { books, bookCache } = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

// Helper function to check if a username is valid
const isValid = (username) => {
    try {
        // Check if the username already exists in the users array
        return !users.some(user => user.username === username);
    } catch (error) {
        console.error("Error in isValid function:", error.message);
        return false; // Default to invalid in case of an error
    }
};

// Helper function to authenticate user credentials
const authenticatedUser = async (username, password) => {
    try {
        // Simulated async operation (e.g., database query)
        return users.some(user => user.username === username && user.password === password);
    } catch (error) {
        console.error("Error in authenticatedUser function:", error.message);
        return false; // Default to failed authentication in case of an error
    }
};

// User login
regd_users.post("/login", async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ message: "Username and password are required." });
        }

        if (await authenticatedUser(username, password)) {
            // Generate JWT token
            const accessToken = jwt.sign({ username }, "access", { expiresIn: "1h" });

            // Store authorization details in session
            req.session.authorization = { accessToken, username };

            return res.status(200).json({ message: "User successfully logged in", accessToken });
        } else {
            return res.status(401).json({ message: "Invalid login. Check username and password." });
        }
    } catch (error) {
        console.error("Error during login:", error.message);
        return res.status(500).json({ message: "An error occurred during login." });
    }
});

// Add or update a book review
regd_users.put("/auth/review/:isbn", async (req, res) => {
    try {
        const { isbn } = req.params;
        const { review } = req.body;
        const { username } = req.session.authorization;

        if (!isbn || !review) {
            return res.status(400).json({ message: "ISBN and review are required." });
        }

        let book = books[isbn];
        if (book) {
            // Update the review directly
            book.reviews[username] = review;
            books[isbn]=book;
            // Update the cache with the new book data
            bookCache.set("books", books);
            return res.status(200).json({ message: "Book review updated successfully." });
        } else {
            return res.status(404).json({ message: `Book with ISBN ${isbn} not found.` });
        }
    } catch (error) {
        console.error("Error updating book review:", error.message);
        return res.status(500).json({ message: "An error occurred while updating the review." });
    }
});

// Delete a user's review
regd_users.delete("/auth/review/:isbn", async (req, res) => {
    try {
        const { isbn } = req.params;
        const { username } = req.session.authorization;

        const book = books[isbn];
        if (book) {
            if (book.reviews[username]) {
                // Delete the user's review
                delete book.reviews[username];
                books[isbn]=book;
                bookCache.set("books", books);
                return res.status(200).json({ message: "Review deleted successfully." });
            } else {
                return res.status(404).json({ message: "Review not found." });
            }
        } else {
            return res.status(404).json({ message: `Book with ISBN ${isbn} not found.` });
        }
    } catch (error) {
        console.error("Error deleting review:", error.message);
        return res.status(500).json({ message: "An error occurred while deleting the review." });
    }
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;

/*
const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];//"username": username, "password": password, "comment": {}

const isValid = (username)=>{ //returns boolean
//write code to check is the username is valid
  let userswithsamename = users.filter((user) => {
        return user.username === username;
    });
    // Return true if any user with the same username is found, otherwise false
    if (userswithsamename.length > 0) {
        return false;
    } else {
        return true;
    }
}

const authenticatedUser = (username,password)=>{ //returns boolean
//write code to check if username and password match the one we have in records.
  // Filter the users array for any user with the same username and password
    let validusers = users.filter((user) => {
        return (user.username === username && user.password === password);
    });
    // Return true if any valid user is found, otherwise false
    if (validusers.length > 0) {
        return true;
    } else {
        return false;
    }
}

//only registered users can login
regd_users.post("/login", (req,res) => {
  //Write your code here
    const username = req.body.username;
    const password = req.body.password;

    // Check if username or password is missing
    if (!username || !password) {
        return res.status(404).json({ message: "Error logging in" });
    }

    // Authenticate user
    if (authenticatedUser(username, password)) {
        // Generate JWT access token
        let accessToken = jwt.sign({
            data: password
        }, 'access', { expiresIn: 60 * 60 });

        // Store access token and username in session
        req.session.authorization = {
            accessToken, username
        }
        return res.status(200).send("User successfully logged in");
    } else {
        return res.status(208).json({ message: "Invalid Login. Check username and password" });
    }
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  let book = books[isbn];//book details

  // Check if the user is authenticated
  const { username } = req.session.authorization;

  if (book) {
    let newReview = req.body.review;
    if (newReview) {
      // Update the reviews
      book.reviews[username] = newReview;
      books[isbn] = book;
      return res.status(200).json({ message: "Book review updated successfully" });
    } else {
      return res.status(400).json({ message: "No reviews provided." });
    }
  } else {
    return res.status(404).json({ message: `Cannot find the book with ISBN: ${isbn}.` });
  }
});

book.reviews: This refers to the existing reviews of the book. It is an object containing any existing review entries.
reviews: This is the new set of reviews that you want to add or update. It is also expected to be an object.
*/
/*
// Delete a user's review
regd_users.delete("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  let book = books[isbn];
// Check if the user is authenticated
  const { username } = req.session.authorization;
  if (book) {
    if (book.reviews && book.reviews[username]) {
      // Delete the review
      delete book.reviews[username];
      return res.status(200).json({ message: "Review deleted successfully." });
    } else {
      return res.status(404).json({ message: `Review not found.` });
    }
  } else {
    return res.status(404).json({ message: `Cannot find the book with ISBN: ${isbn}.` });
  }
});
module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;

*/