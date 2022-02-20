const express = require('express');
const mongoose = require('mongoose');
const todoSchema = require('../schemas/todoSchema');

const Todo = new mongoose.model('Todo', todoSchema);
const router = express.Router();

router.get('/', async (req, res) => {
    await Todo.find({})
        .select({
            _id: 0,
            __v: 0,
        })
        .limit(2)
        .exec((err, data) => {
            if (err) {
                res.status(500).json({
                    error: 'There was a server side error',
                });
            } else {
                res.status(200).json({
                    result: data,
                    message: 'Todo was inserted successfully',
                });
            }
        });
});
router.get('/:id', async (req, res) => {
    await Todo.find({ _id: req.params.id }, (err, data) => {
        if (err) {
            res.status(500).json({
                error: 'There was a server side error',
            });
        } else {
            res.status(200).json({
                result: data,
                message: 'Todo was inserted successfully',
            });
        }
    });
});
router.post('/', async (req, res) => {
    const newTodo = new Todo(req.body);
    await newTodo.save((err) => {
        if (err) {
            res.status(500).json({
                error: 'There was a server side error',
            });
        } else {
            res.status(200).json({
                message: 'Todo was inserted successfully',
            });
        }
    });
});
router.post('/all', async (req, res) => {
    await Todo.insertMany(req.body, (err) => {
        if (err) {
            res.status(500).json({
                error: 'There was a server side error',
            });
        } else {
            res.status(200).json({
                message: 'Todo was inserted successfully',
            });
        }
    });
});
router.put('/:id', async (req, res) => {
    const result = await Todo.findByIdAndUpdate(
        { _id: req.params.id },
        {
            $set: {
                status: 'active',
            },
        },
        {
            new: true,
            useFindAndModify: false,
        },
        (err) => {
            if (err) {
                res.status(500).json({
                    error: 'There was a server side error',
                });
            } else {
                res.status(200).json({
                    message: 'Todo was updated successfully',
                });
            }
        }
    );
    console.log(result);
});
router.delete('/:id', async (req, res) => {
    await Todo.deleteOne({ _id: req.params.id }, (err) => {
        if (err) {
            res.status(500).json({
                error: 'There was a server side error',
            });
        } else {
            res.status(200).json({
                message: 'Todo was deleted successfully',
            });
        }
    });
});

module.exports = router;
