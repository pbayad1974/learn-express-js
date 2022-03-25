#Server setup and initialization
npm init -y
npm i express
npm i nodemon --save-dev
Inside scripts object in package.json, add "devStart": "nodemon server.js"
Auto restarts server on changes

    Make sure app.listen(3000) is at end of file; 3000 is port number NO "" marks

#Basics of response (routing) & sending data(.send, json, download)
// setup home path
app.get('/',(req,res)=> {}) // give path & function with request & response param

    // For testing purpose, do res.send('Hi') will print hi on screen but not useful
    //response is what the user gets when accessing the path
    res.sendStatus(500)

    // Sending status with json or normal text using .send chained to status
    res.status(200).json({message:'hi'}) // with status, you can attach json or .send to send text

    // Sending downloadable file so popup opens for user
    res.download('server.js')

#Rendering html as a response to a path
// render files must be inside 'views' folder
app.set('view engine', 'ejs')
app.get("/", (req, res) => {res.render("index", {text: 'Hello world'})}

    // Access variables in ejs file using <%= varName %> to output text
    // Don't put = sign if you don't want the between thing to be visible
    // No need to just be variable inside <> but can be any js for calculation

    <%= locals.varName || 'default text' %>
    // If variable is not defined, set default in ejs file like above

    1. Install a view engine (used to generate frontend from backend info)
    ejs & pug are popular, ejs is similar to html so use that
    npm i ejs
    // Tell app to use ejs; app.set takes the setting name, then the value
    app.set('view engine', 'ejs')

    2. Put all your render files in 'views' folder in root so app can detect
    Extension as .ejs instead of .html
    Use EJS language support vscode plugin

    3. In 2nd param, you pass object with variables you want to use in the rendered file

    4. Access variables in ejs file using <% varName %>
    Use <%= varName %> if you want this to be visible in source code to client
    Without =, output won't be visible but just run
    When using forEach loop for an array, you don't want it to be shown to client, instead just want the output so that time don't use = sign
    You can run any code inside <% 2+2 %> for eg, use = when you want to render it

    5. That object passes is referred as 'locals' & always defined even if variable doesn't match
    To default if variable isn't passed, in ejs write
    <%= locals.varName || 'default text' %>
    locals is defined but varName may not be there so set default

#Routes (using separate files for common endpoints or groups)
Eg: All /users endpoints
Inside 'routes' folder, create users.js

    const express = require("express");
    const router = express.Router();

    // instead of app.get, use router.get ; router everywhere just like app
    // No need to use /users always because it's common; see below on how to set the base
    router.get("/", (req, res) => {res.send("Users List")});

    // At end, export the router
    module.exports = router

    // Importing router in main server.js
    const userRouter = require('./routes/users')
    // Linking route to a path; Define the path(don't put / at end), mention the router you imported
    app.use('/users', userRouter)

    // Dynamic parameters in url, use colon :
    // Eg, get a user with some id passed
    router.get('/:id', (req,res)=> {res.send(`Get user with id ${req.params.id}`)})

    // Here :id is any code, you can name is whatever you want, only for accessing, you need to use this
    // Access that dynamic variable using req.params.varName ; Its from REQUEST NOT RES

    ** IMP, Express reads top to bottom
    '/:id' doesn't care what's passed, so if you have another static route '/new'
    it'll show the code for '/:id'
    DEFINE STATIC ROUTES BEFORE DYNAMIC ONES

    // There are multiple types of requests to same endpoint, like delete, create, update has same '/:id'
    // Use route method to chain multiple requests
    router.route('/:id').get((req,res)=> {res.send(`The is is ${req.params.id}`)}).put((req,res)=>{res.send('put request')})

    // Param is a middleware, so run next() to move it to next thing
    // Going to run anytime it finds a param (id) that matches the name you pass in

    const users = [{name: 'punit'}, {name: 'latesh'}]
    router.param("id", (req,res,next, id)=> {
        req.user = users[id] // In url we do '/users/1' so id is 1, so index of array is 1
        next()
    })
    // Set any variable in req; You can use req.user variable anywhere you have the request object

#Middleware (happens between (after) request & (before) response)
That's why it'll keep loading infinitely, use next function to end the middleware and go to next middleware or request if there isn't any

    app.use(logger)

    function logger(req,res,next) {
        console.log(req.originalUrl)
        next()
    }

    Put the app.use(middlewareFunctionName) at top if you want everything below it to use it
    Or you can call it just for a particular request, put as many as you want, event the same ones, but MAKE SURE TO CALL next() in middleware

    app.get('/',logger, logger, logger1,(req,res)=>{res.send('hello user')})

    // Serving static files using middleware
    // Put all static html, etc files in 'public' folder
    app.use(express.static("public"))
    // Can access tt.html using 'http://localhost:3000/tt.html' extension remains
    // Only index.html is on homepage

#Parsing form & jSON data from frontend
Eg user creation form on '/users/new'
Inside views folder > users folder > new.ejs file; input name field has attribute name="firstName"
Access using req.body.firstName (whatever the name attribute of that element is)

    // To access form body, use this code for middleware at top
    app.use(express.urlencoded({extended: true}))

    // Real usecase
    // To deal with valid & invalid responses, have a boolean variable, use if condition, do the thing
    eg: for users, const isValid = true
    if(isValid) {users.push({name: firstName} res.redirect(`/users/${users.length - 1`}) )}
    else {res.render('users/new', {firstName: req.body.firstName})}
    // If failed then going back to form with form filled using the object passed in value="<%= locals.firstName %>"

    // To access json, use middleware
    app.use(express.json())

    // To access query parameters res.query.keyName
    // Eg: /users/new?name='punit'
    app.get('/new',(req,res)=> {console.log(res.query.name)})

#Using env file
npm install dotenv --save-dev
Create .env file in root folder, add to .gitignore
In .env define variable directly without spaces enven around = sign
STRIPE_SECRET_KEY=test // example

    Then in server.js file at top, add this to only allow .env varialbes to be loaded when in development environment
    if (process.env.NODE_ENV !== 'production') {
        require('dotenv').load()
    }

#General
When you want to provide public api key from backend, add it to the render object
Then in head tag, add script tag, and define variable like this
<script> var stripePublicKey = <%= stripePublicKey %> </script>

#Create baisc Node server code
// In app.js file
const http = require("http");
const port = 3000;
const fs = require("fs");

    const server = http.createServer((req, res) => {
    res.writeHead(200, { "Content-Type": "text/html" });
    fs.readFile("index.html", (error, data) => {
        if (error) {
        res.writeHead(400);
        res.write("Error: File Not Found");
        } else {
        res.write(data);
        }
        res.end;
    });
    });

    server.listen(port, (error) => {
    if (error) {
        console.log("Something went wrong", error);
    } else {
        console.log("Server is listening on port " + port);
    }
    });

#Reading a file like product json database
app.get("/store", (req, res) => {
fs.readFile("items.json", (error, data) => {
// If reading error, then status 500 and tell the writing ended
if (error) {
res.status(500).end();
} else {
// Else render the store.ejs, and an object with values from the read file
res.render("store.ejs", {
items: JSON.parse(data),
});
}
});
});
