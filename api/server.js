const express =require('express');
const app=express();
const mysql=require('mysql2');
const cors=require('cors');
const dotenv=require('dotenv');
const bcrypt=require('bcrypt');
const path=require('path');
const { table } = require('console');

app.use(cors());
app.use(express.json());
dotenv.config();

//  app.get('/home',(req,res)=>{
//   res.sendFile(path.join(__dirname,'src/login.html'));
// }   
// );

// //database connection
const db=mysql.createConnection({
    user:process.env.DB_USER,
    host:process.env.DB_HOST,
    password:process.env.DB_PASSWORD
});


//test connection
db.connect((err)=>{
    //if connection does not work
    if(err){
        console.log(`error connecting to mysql: ${err}`);
    }
    else{
        console.log('Mysql Connected',db.threadId);
    }

    db.query(`CREATE DATABASE IF NOT EXISTS expenseTrace`, (err,result)=>{
        //error creating db
        if(err){
            console.log(`error creating database: ${err}`);
        }else{
            console.log('expensesTrace Database created successfully');
        }

        //use the database
        db.changeUser({database:"expenseTrace"},(err,result)=>{

            //if error changing db
            if(err){
                console.log(`error changing database: ${err}`);
            }else
            {
                console.log('Database changed to expense_tracker');
            }

            //create table
            const createTable=`CREATE TABLE IF NOT EXISTS users(
                id int auto_increment primary key,
                email varchar(100) not null unique ,
                username varchar(100) not null,
                password varchar(255)  not null)`;
            db.query(createTable,(err,result)=>{
                if(err){
                    console.log(`error creating table: ${err}`);
                }else{
                    console.log(' users Table created successfully');
                }
            });
            // create table for expenses
            const createExpensesTable=`CREATE TABLE IF NOT EXISTS expenses(
                id int auto_increment primary key,
                expenseName varchar(100) not null,
                expenseAmount int not null,
                expenseDate date not null)`;
                db.query(createExpensesTable,(err,result)=>{
                    if(err){
                        console.log(`error creating table: ${err}`);
                    }else{
                        console.log('Expenses Table created successfully');
                    }
                });
        });
});
});

//register user
app.post("/api/register", async(req,res)=>{
    try {
        const { email, username, password } = req.body;

        const users=`SELECT * FROM users WHERE email=?`;
        db.query(users,[email],(err,result)=>{
            //if email exists
            if(result.length>0) return res.status(400).json("User already exists");
               //if no email exists 
               //password hashing
               const salt=bcrypt.genSaltSync(10);
               const hashedPassword=bcrypt.hashSync(password,salt);
                //create new user
            const registerUser=`INSERT INTO users(email,username,password) VALUES(?)`
                value=[req.body.email,req.body.username,hashedPassword];
                db.query(registerUser,[value],(err,result)=>{
                    if(err) return res.status(400).json("Something went wrong");
                    //if insert user works successfully

                    else{
                        return res.status(200).json("User registered successfully");
                    }
                });
            
        });

    } catch (err) {
        res.status(500).json("Internal Server Error");
    }

});


//login user

app.post("/api/login", async(req,res)=>{
    try {
        const users=`SELECT * FROM users WHERE email=?`;
        db.query(users,[req.body.email],(err,result)=>{

            if(err) return res.status(400).json("Something went wrong");
            //if email does not exist
            if(result.length===0) return res.status(404).json("Invalid email or password");

            //if email exists
            //compare password
            const isPasswordValid= bcrypt.compareSync(req.body.password,result[0].password);
                //passowrd not valid
            if(!isPasswordValid) return res.status(400).json("Invalid email or password");
            res.status(200).json("Login successfull");

            // bcrypt.compare(req.body.password,result[0].password,(err,match)=>{
            //     if(err) return res.status(400).json("Invalid email or password");
            //     if(!match) return res.status(400).json("Invalid email or password");
            //     return res.status(200).json("Login successfull");
            // });
        });
    } catch (err) {
        res.status(500).json("Internal Server Error");
    
        
    }
});


//add expenses
app.post("/api/add-expense", async(req,res)=>{
    try {
        const { expenseName, expenseAmount, expenseDate } = req.body;

        const addExpense=`INSERT INTO expenses(expenseName,expenseAmount,expenseDate) VALUES(?)`
        value=[req.body.expenseName,req.body.expenseAmount,req.body.expenseDate];
        db.query(addExpense,[value],(err,result)=>{
            if(err) return res.status(400).json("Something went wrong");
            //if insert expense works successfully
            else{
                return res.status(200).json("Expense added successfully");
            }
        });
    } catch (err) {
        res.status(500).json("Internal Server Error");
    }

  
});

//summing expenses
app.get("/api/sum-expenses", async(req,res)=>{
    try {
        const sumExpenses=`SELECT SUM(expenseAmount) FROM expenses`;
        db.query(sumExpenses,(err,result)=>{
            if(err) return res.status(400).json("Something went wrong");
            //if sum works successfully
            else{
                return res.status(200).json(result);
            }
        });
    } catch (err) {
        res.status(500).json("Internal Server Error");
    }
});
// displaying data from the expenses table
app.get('/expenses',(req,res)=>{
    db.query('SELECT * FROM expenses',(err,result)=>{
            if(err){
                console.log(`error fetching data: ${err}`);
            }else{
                console.log("Data fetched successfully");
                res.json(result);   
            }
    });
}); 
//running server
app.listen(5000,()=>{
    console.log('Server is running on port 5000');
});