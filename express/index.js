const express = require('express');
const mongoose = require('mongoose');
const tohandler = require('./routeHandler/todoHandler');
const userhandler = require('./routeHandler/userHandler');

const app = express();
app.use(express.json());

mongoose
    .connect('mongodb://localhost/user', { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        console.log('connection seccessfull');
    })
    .catch((err) => {
        console.log(err);
    });

app.use('/todo', tohandler);
app.use('/user', userhandler);

const error = (err, req, res, next) => {
    if (res.headerSent) {
        return next(err);
    }
    res.status(500).json({ error: err });
};

app.use(error);

app.listen(3300, () => {
    console.log('listening on port 3300');
});
