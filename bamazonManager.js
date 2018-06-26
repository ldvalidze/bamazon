const inquirer = require('inquirer');
const mysql = require('mysql');
const { table } = require('table');
// create the connection information for the sql database
const connection = mysql.createConnection({
    host: "localhost",

    // Your port; if not 3306
    port: 3306,

    // Your username
    user: "root",

    // Your password
    password: "",
    database: "bamazon"
});

var productName;
var newProductName;
var productNameArray = [];
var newDepartment;
var newPrice;
var newQuantity;

function options() {
    inquirer.prompt([
        {
            type: "list",
            name: "command",
            message: "Welcome, oh the great Manager! What would you like to do?",
            choices: [
                "View Products for Sale",
                "View Low Inventory",
                "Add to Inventory",
                "Add New Product"
            ]
        }
    ]).then(function (answers) {
        var command = answers.command;
        if (command === "View Products for Sale") {
            forSale();
        }
        else if (command === "View Low Inventory") {
            lowInventory();
        }
        else if (command === "Add to Inventory") {
            addInventory();
        }
        else if (command === "Add New Product") {
            addProduct();
        }
        else {
            return console.log("error occured. Please try to re-run the program.");
        }
    });
}

options();

function forSale() {
    connection.query('SELECT * FROM `products`', function (error, results, fields) {

        //use table to display products to customer
        let config,
            data,
            output;

        //table array
        data = [];

        //column titles array to push into table array
        var columnTitles = [fields[0].name, fields[1].name, fields[3].name, fields[4].name];
        data.push(columnTitles);
        results.forEach(function (row) {
            //cells array to push into table array
            var cells = [row.item_id, row.product_name, row.price, row.stock_quantity];
            data.push(cells);
        })

        //display the table
        output = table(data, config);
        console.log(output);
        connection.end();
    });
}

function lowInventory() {
    connection.query('SELECT * FROM `products` WHERE stock_quantity<5', function (error, results, fields) {

        //use table to display products to customer
        let config,
            data,
            output;

        //table array
        data = [];

        //column titles array to push into table array
        var columnTitles = [fields[0].name, fields[1].name, fields[3].name, fields[4].name];
        data.push(columnTitles);
        results.forEach(function (row) {
            //cells array to push into table array
            var cells = [row.item_id, row.product_name, row.price, row.stock_quantity];
            data.push(cells);
        })

        //display the table
        output = table(data, config);
        console.log(output);
        connection.end();
    });
}

function addInventory() {
    inquirer.prompt([
        {
            type: "input",
            name: "id",
            message: "Enter the ID of the product you would like to add.",
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
            message: "Enter the quantity you would like to add.",
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
        stockProduct = answers.id;
        addQuantity = parseInt(answers.quantity);
        addInventoryItems();
    });
}

//checks if there is sufficient product in stock
function addInventoryItems() {
    connection.query('SELECT * FROM `products` WHERE `item_id`=?', [stockProduct], function (error, results, fields) {
        var stockQuantity = results[0].stock_quantity;
        var productName = results[0].product_name;
        //if not enough product in stock
        connection.query(
            "UPDATE products SET ? WHERE ?",
            [
                {
                    //decrease stock by order quantity
                    stock_quantity: stockQuantity + addQuantity
                },
                {
                    item_id: stockProduct
                }
            ],
            function (error) {
                if (error) throw error;
                stockQuantity = stockQuantity + addQuantity;
                console.log(`Item added successfully. Total number of "${productName}" in stock now is: ${stockQuantity}`);
                connection.end();
            }
        );
    });
}

function addProduct() {
    inquirer.prompt([
        {
            type: "input",
            name: "name",
            message: "Enter product name."
        },
        {
            type: "input",
            name: "department",
            message: "Enter department name."
        },
        {
            type: "input",
            name: "price",
            message: "Enter price.",
            validate: function (input) {
                // Declare function as asynchronous, and save the done callback
                var done = this.async();
                input = parseFloat(input);
                // Do async stuff
                setTimeout(function () {
                    if (isNaN(input)) {
                        // Pass the return value in the done callback
                        done('You need to provide the price as a number. Try again.');
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
            message: "Enter the quantity you would like to add.",
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
        newProductName = answers.name;
        newDepartment = answers.department;
        newPrice = parseFloat(answers.price);
        newQuantity = parseInt(answers.quantity);
        addProductItems();
    });
}

function addProductItems() {
    //Check if this product already exists
    connection.query('SELECT `product_name` FROM `products`', function (error, results, fields) {
        results.forEach(function (row) {
            //cells array to push into table array
            productName = row.product_name;
            productNameArray.push(productName);
        });
        console.log(productNameArray);

        //log an error if product already exists
        if (productNameArray.includes(newProductName)) {
            connection.end();
            return console.log('Error: this product already exists. Add to existing inventory or add a new product');
            
        }
        
        //add to database if product does not exist
        else {
            addToDB();
        }
    });
    function addToDB() {
        connection.query(
            `INSERT INTO products (product_name, department_name, price, stock_quantity) VALUES ('${newProductName}','${newDepartment}',${newPrice},${newQuantity})`, function (error, results, fields) {
                if (error) throw error;
                console.log(`New Product "${newProductName}" added successfully. into department "${newDepartment}" with quantity of ${newQuantity} and a price of ${newPrice} per item.`);
                connection.end();
            });
    }
}