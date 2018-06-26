const inquirer = require('inquirer');
const mysql = require('mysql');
const { table } = require('table');

// create the connection information for the sql database
var connection = mysql.createConnection({
    host: "localhost",

    // Your port; if not 3306
    port: 3306,

    // Your username
    user: "root",

    // Your password
    password: "",
    database: "bamazon"
});

var customerProduct;
var customerQuantity;
var customerPrice;
var customerCost;

// connect to the mysql server and sql database
connection.connect(function (err) {
    if (err) throw err;
    displayProducts();
});

function displayProducts() {
    connection.query('SELECT * FROM `products`', function (error, results, fields) {

        //use table to display products to customer
        let config,
            data,
            output;

        //table array
        data = [];

        //column titles array to push into table array
        var columnTitles = [fields[0].name,fields[1].name,fields[3].name];
        data.push(columnTitles);
        results.forEach(function (row) {
            //cells array to push into table array
            var cells = [row.item_id,row.product_name,row.price];
            data.push(cells);
        })

        //display the table
        output = table(data, config);
        console.log(output);

        //run function to ask questions with inquirer
        ask();
    });
}

//gets user input with inquirer
function ask() {
    inquirer.prompt([
        {
            type: "input",
            name: "id",
            message: "Enter the ID of the product you would like to buy.",
            validate: function (input) {
                // Declare function as asynchronous, and save the done callback
                var done = this.async();
                input = parseInt(input);
                // Do async stuff
                setTimeout(function () {
                    if (isNaN(input)) {
                        // Pass the return value in the done callback
                        done('You need to provide a number. Try again.');
                        return;
                    }
                    // Pass the return value in the done callback
                    done(null, true);
                }, 500);
            }
        },
        {
            type: "input",
            name: "quantity",
            message: "Enter the quantity you would like to buy.",
            validate: function (input) {
                // Declare function as asynchronous, and save the done callback
                var done = this.async();
                input = parseInt(input);
                // Do async stuff
                setTimeout(function () {
                    if (isNaN(input)) {
                        // Pass the return value in the done callback
                        done('You need to provide a number. Try again.');
                        return;
                    }
                    // Pass the return value in the done callback
                    done(null, true);
                }, 500);
            }
        }
    ]).then(function (answers) {
        customerProduct = answers.id;
        customerQuantity = parseInt(answers.quantity);
        checkProduct();
    });
}

//checks if there is sufficient product in stock
function checkProduct() {
    connection.query('SELECT * FROM `products` WHERE `item_id`=?', [customerProduct], function (error, results, fields) {
        var stockQuantity = results[0].stock_quantity;
        customerPrice = results[0].price;
        //if not enough product in stock
        if (stockQuantity < customerQuantity) {
            connection.end();
            return console.log('Insufficient quantity!');
        }
        //if enough product in stock, place the order
        else {
            connection.query(
                "UPDATE products SET ? WHERE ?",
                [
                    {
                        //decrease stock by order quantity
                        stock_quantity: stockQuantity - customerQuantity
                    },
                    {
                        item_id: customerProduct
                    }
                ],
                function (error) {
                    if (error) throw error;
                    customerCost = customerQuantity * customerPrice;
                    console.log(`Order placed successfully. Your total cost is: ${customerCost}`);
                    connection.end();
                }
            );
        }
    });
}