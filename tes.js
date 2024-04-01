const express = require("express");
const exphbs = require("express-handlebars");
const bodyParser = require("body-parser");
const mysql = require("mysql2");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 3000;

// Middlewares
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Static files
app.use(express.static("public"));

// Template engine
const handleBars = exphbs.create({ extname: ".hbs" });
app.engine("hbs", handleBars.engine);
app.set("view engine", "hbs");

// MySql connection
const conn = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "Rashmi",
  database: "customers", // Change to your database name for customers
});

// Check database connection
conn.getConnection((err,connection) => {
  if (err) throw err;
  console.log("MySql connected successfully");
});

// Routers

// View all customers
app.get('/',(req,res)=>{
    conn.getConnection((err,connection)=>{
        if(err) throw err;
        connection.query("select * from customers",(err,rows)=>{
            connection.release();
            if(!err){
                res.render("home",{rows})
            }else{
                console.log("Error in listening data "+err);
            }
        })
    })
});

// Add Customer
app.get('/addCustomer', (req, res) => {
  res.render("addCustomer")
})

app.post("/addCustomer", (req, res) => {
  conn.getConnection((err, connection) => {
    if (err) throw err;
    const { name, email, phone, address } = req.body;
    connection.query(
      "INSERT INTO customers (name, email, phone, address) VALUES (?, ?, ?, ?)",
      [name, email, phone, address],
      (err, rows) => {
        connection.release();
        if (!err) {
          res.render("addCustomer", {
            msg: "Customer details added successfully",
          });
        } else {
          console.log("Error in adding data " + err);
        }
      }
    );
  });
});

// Update Customer
app.get("/editCustomer/:id", (req, res) => {
  conn.getConnection((err, connection) => {
    if (err) throw err;
    let { id } = req.params;
    connection.query(
      "SELECT * FROM customers WHERE ID = ?",
      [id],
      (err, rows) => {
        connection.release();
        if (!err) {
          res.render("editCustomer", { rows });
        } else {
          console.log("Error in fetching data " + err);
        }
      }
    );
  });
});

app.post("/editCustomer/:id", (req, res) => {
  conn.getConnection((err, connection) => {
    if (err) throw err;
    let { id } = req.params;
    const { name, email, phone, address } = req.body;
    connection.query(
      "UPDATE customers SET NAME = ?, EMAIL = ?, PHONE = ?, ADDRESS = ? WHERE ID = ?",
      [name, email, phone, address, id],
      (err, rows) => {
        connection.release();
        if (!err) {
          res.render("editCustomer", {
            msg: "Customer details updated successfully",
          });
        } else {
          console.log("Error in updating data " + err);
        }
      }
    );
  });
});

// Delete Customer
app.get("/deleteCustomer/:id", (req, res) => {
  conn.getConnection((err, connection) => {
    if (err) throw err;
    let { id } = req.params;
    connection.query(
      "DELETE FROM customers WHERE id = ?",
      [id],
      (err,rows) => {
        connection.release();
        if (!err) {
          res.redirect("/");
        } else {
          console.log("Error in deleting data " + err);
        }
      }
    )
  })
})

app.listen(port, () => {
  console.log("Server running on localhost " + port);
});
