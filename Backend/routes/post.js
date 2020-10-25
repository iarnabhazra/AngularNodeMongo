const express = require("express");
const multer = require('multer')

const Post = require('../models/post');

const routes = express.Router();
const MIME_TYPE_MAP = {
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/jpg': 'jpg'
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    //console.log(file.mimetype)
    const inValid = MIME_TYPE_MAP[file.mimetype];
    let error = new Error("Invalid Mime Type");
    if (inValid)
      error = null;
    cb(error, "Backend/images")
  },
  filename: (req, file, cb) => {
    const name = file.originalname.toLowerCase().split(' ').join('-');
    const ext = MIME_TYPE_MAP[file.mimetype];
    cb(null, name + '-' + Date.now() + '.' + ext);
  }
})

routes.post("", multer({ storage: storage }).single("image"), (req, res, next) => {
  const url = req.protocol + '://' + req.get('host');

  const post = Post({
    title: req.body.title,
    content: req.body.content,
    imagePath: url + '/images/' + req.file.filename
  });
  post.save().then((createdPOst) => {
      res.status(201).json({
        message: 'Post added successfully',
        post:{
          ...createdPOst,
          id : createdPOst._id
        }

      });
    });

});

routes.get("/:id", (req, res, next) => {
  Post.findById(req.params.id)
    .then((post) => {
      if (post) {
        res.status(200).json(post)
      } else {
        res.status(404).json({
          message: "Post Not found"
        })
      }

    })
})

routes.put("/:id", multer({ storage: storage}).single('image') ,(req, res, next) => {
  let imagePath = req.body.imagePath;
  if(req.file){
    const url = req.protocol +  "://" + req.get('host');
    imagePath = url + '/images/' + req.file.filename;
  } 
  const post = {
    _id: req.body.id,
    title: req.body.title,
    content: req.body.content
  }
  Post.updateOne({ _id: req.params.id }, post)
    .then((result) => {
      console.log(result);
      res.status(200).json({
        message: "Update Successful"
      })
    })
})

routes.get("", (req, res, next) => {
  Post.find()
    .then((document) => {

      res.status(200).json({
        message: "Posts fetched successfully!",
        posts: document
      });
    })

});

routes.delete("/:id", (req, res, next) => {
  //console.log(req.params.id);
  Post.deleteOne({
    _id: req.params.id
  })
    .then(() => {
      res.status(200).json({
        message: 'deletion Successful',
      });
    })

})

module.exports = routes;
