var express = require('express');
var router = express.Router();
var ObjectId = require('mongoose').Types.ObjectId;

var Post = require('../models/post');

//Creates a new post object.
router.post('/', function(req, res, next) {
    Post.find({title: req.body.title}, function(err, post){
        if(err){
            return res.status(409).json({
                message: 'Post was not saved', 'error': err
            });
        }
        if(post.length >= 1){
            return res.status(409).json({
                message: 'There is already a post with this title'
            });
        }else{
            var dateNow = new Date();
            var newPost = new Post({
                title: req.body.title,
                text: req.body.text || '',
                date: req.body.date || dateNow.getDate(),
                author: req.body.author
            });
        }
        newPost.save(function(err, post) {
            if (err) { return next(err); }
            res.status(201).json(post);
        });
    });
});

//Get a list of all posts with pagination.
router.get('/', function(req, res, next) {     
    Post.find(function(err, posts) {         
        if (err) { return next(err); }         
        const pageNumber = req.query.pageNumber;         
        const limit = req.query.limit;         
        if(pageNumber && limit){             
            let startIndex  = (pageNumber - 1) * limit;             
            let endIndex = pageNumber * limit;             
            res.json(posts.slice(startIndex, endIndex));         
        }else {             
            res.json({'posts': posts });         
        }     
    }); 
});

//Get a specific post by id.
router.get('/:id', function(req, res) {
    var id = req.params.id;
    Post.findById(id, function(err, post) {
        if (err) { 
            return res.status(404).json({
                message: 'Post not found!' , 'error': err
            });
        }
        if (post === null) {
            return res.status(404).json({'message': 'Post not found!'});
        }
        res.json(post);
    });
});

//Replaces a post by id.
router.put('/:id', function(req, res) {
    var id = req.params.id;
    Post.findById(id, function(err, post) {
        if (err) {       return res.status(409).json({
            message: 'Post not updated!', 'error': err
        });}
        if (post === null) {
            return res.status(404).json({'message': 'Post not found'});
        }
        if(ObjectId.isValid(req.body.author)){
            post.title = req.body.title;
            post.text = req.body.text;
            post.author = req.body.author;
            post.date = req.body.date;
            post.save();
            res.json(post);
        }
        else{
            res.status(409).json({'message': 'Autor is not found'});
        }

    });
});

//Updates a post by id.
router.patch('/:id', function(req, res) {
    var id = req.params.id;
    Post.findById(id, function(err, post) {
        if (err) {       return res.status(409).json({
            message: 'Post not updated!', 'error': err
        });}
        if (post === null) {
            return res.status(404).json({'message': 'Post not found'});
        }
        post.title = req.body.title || post.title;
        post.text = req.body.text || post.text;
        post.author = req.body.author || post.author;
        post.date = req.body.date || post.date;
        post.save();
        res.json(post);
    });
});

//Deletes a post by id.
router.delete('/:id', function(req, res) {
    var id = req.params.id;
    Post.findOneAndDelete({_id: id}, function(err, post) {
        if (err) {       return res.status(409).json({
            message: 'Post not updated!', 'error': err
        }); }
        if (post === null) {
            return res.status(404).json({'message': 'Post not found'});
        }
        res.json(post);
    });
});


module.exports = router;