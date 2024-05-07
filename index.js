import express from "express"; // Importing Express framework to create the server
import bodyParser from "body-parser"; // Importing body-parser to parse incoming request bodies
import pg from "pg"; // Importing pg (PostgreSQL) to connect to the PostgreSQL database

const app = express(); // Creating an instance of express
const port = 3000; // Setting the port number for the server to listen on

// Creating a new client instance to connect to the PostgreSQL database with configuration details
const db = new pg.Client({
  user: "postgres", // Database user
  host: "localhost", // Database host
  database: "permalist", // Database name
  password: "639606" // Database password
});

// Connecting to the PostgreSQL database and handling connection errors
db.connect((err) => {
  if (err) throw err; // If there is an error, throw the error
  console.log("Connected to PostgreSQL"); // Log success message
});

app.use(bodyParser.urlencoded({ extended: true })); // Using body-parser middleware to parse form data
app.use(express.static("public")); // Serving static files from the "public" directory

// Initializing an array to store items (temporary before database integration)
let items = [
  { id: 1, title: "Buy milk" }, // Example item 1
  { id: 2, title: "Finish homework" }, // Example item 2
];

// Handling GET requests to the root route
app.get("/", async (req, res) => {
  try {
    const result = await db.query("SELECT * FROM items ORDER BY id ASC"); // Querying the database for all items ordered by id
    items = result.rows; // Updating the items array with the query result
    // Rendering the index.ejs template with listTitle and listItems data
    res.render("index.ejs", {
      listTitle: "Today",
      listItems: items,
    });
  } catch (err) {
    console.log(err); // Logging any errors
  }
});

// Handling POST requests to the "/add" route
app.post("/add", async (req, res) => {
  const item = req.body.newItem; // Extracting the new item from the request body
  try{
    await db.query("INSERT INTO items (title) VALUES ($1)", [item]); // Inserting the new item into the database
    res.redirect("/"); // Redirecting to the root route after insertion
  } catch (err) {
    console.log(err); // Logging any errors
  }
  
});

// Handling POST requests to the "/edit" route
app.post("/edit", async (req, res) => {
  const updatedItemId = req.body.updatedItemId; // Extracting the id of the item to update
  const updatedItemTitle = req.body.updatedItemTitle; // Extracting the new title of the item
  try {
    // Updating the item in the database with the new title where the id matches
    await db.query("UPDATE items SET title = $1 WHERE id = $2", [
      updatedItemTitle,
      updatedItemId,
    ]);
    res.redirect("/"); // Redirecting to the root route after updating
  } catch (err) {
    console.log(err); // Logging any errors
  }
});

// Handling POST requests to the "/delete" route
app.post("/delete", async (req, res) => {
  const deletedItemId = req.body.deleteItemId; // Extracting the id of the item to delete
  try {
    await db.query("DELETE FROM items WHERE id = $1", [deletedItemId]); // Deleting the item from the database where the id matches
    res.redirect("/"); // Redirecting to the root route after deletion
  } catch (err) {
    console.log(err); // Logging any errors
  }
});

// Starting the server and listening on the specified port
app.listen(port, () => {
  console.log(`Server running on port ${port}`); // Logging the server start message
});
