const express = require('express');
const mongoose = require('mongoose');
const todoSchema = require('../schemas/todoSchema');
const userSchema = require('../schemas/userSchema');

const checkLogin = require('../middlewares/checkLogin');

const Todo = new mongoose.model('Todo', todoSchema);
const User = new mongoose.model('User', userSchema);
const router = express.Router();
router.get('/', checkLogin, (req, res) => {
    Todo.find({})
        .populate('user', 'name username -_id')
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
router.post('/', checkLogin, async (req, res) => {
    const newTodo = new Todo({
        ...req.body,
        user: req.userId,
    });
    try {
        const todo = await newTodo.save();
        await User.updateOne(
            {
                _id: req.userId,
            },
            {
                $push: {
                    todos: todo._id,
                },
            }
        );
        res.status(200).json({
            message: 'Todo was inserted successfully',
        });
    } catch (err) {
        console.log(err);
        res.status(500).json({
            error: 'There was a server side error',
        });
    }
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
