const express = require("express");
const app = express();
const morgan = require("morgan");
const mongoose = require("mongoose");
const cors = require("cors");
const authJwt = require('./helpers/jwt');
const errorHandler = require('./helpers/error-handler');
require("dotenv/config");


app.use(cors());
app.options("*", cors());


app.use(express.json());
app.use(morgan('tiny'));
app.use(authJwt());
app.use(errorHandler);
app.use("/public/uploads", express.static(__dirname + "/public/uploads"));



//Routes
const usersRoutes = require("./routes/users");
const documentsRoutes = require("./routes/documents");
const requestsRoutes = require("./routes/requests");


const api = process.env.API_URL;


app.use(`${api}/documents`, documentsRoutes);
app.use(`${api}/users`, usersRoutes);
app.use(`${api}/requests`, requestsRoutes);


mongoose
.connect(process.env.CONNECTION_STRING, {
    useNewUrlParser: true,
    useUnifiedTopology: true,

})
.then(()=> {
    console.log("Database Connection is ready...");
   
})
.catch((err) => {
    console.log(err);
});

app.listen(4000, () => {
    console.log("server is running http://localhost:4000");
});