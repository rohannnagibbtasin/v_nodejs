const express = require('express');
const mongoose = require('mongoose');
const tohandler = require('./routeHandler/toHandler');

const app = express();
app.use(express.json());

mongoose
    .connect('mongodb://localhost/todos', { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        console.log('connection seccessfull');
    })
    .catch((err) => {
        console.log(err);
    });

app.use('/todo', tohandler);

function error(err, req, res, next) {
    if (res.headerSent) {
        return next(err);
    }
    res.status(500).json({ error: err });
}
app.listen(3300, () => {
    console.log('listening on port 3300');
});
