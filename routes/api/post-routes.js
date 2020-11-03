const router = require('express').Router();
const {
    Post,
    User,
    Vote,
    Comment
} = require('../../models');
const sequelize = require('../../config/connection');


// get all users
router.get('/', (req, res) => {
    console.log('======================');
    Post.findAll({
        order: [
            ['created_at', 'DESC']
        ],
        // attributes: ['id', 'post_url', 'title', 'created_at'],
        // update the `.findAll()` method's attributes to look like this
        attributes: [
            'id',
            'post_url',
            'title',
            'created_at',
            [sequelize.literal('(SELECT COUNT(*) FROM vote WHERE post.id = vote.post_id)'), 'vote_count']
        ],
        // In the next step, we'll include the JOIN to the User table. We do this by adding the property include, as shown in the following code:
        include: [
            // include the Comment model here:
            {
                model: Comment,
                attributes: ['id', 'comment_text', 'post_id', 'user_id', 'created_at'],
                include: {
                    model: User,
                    attributes: ['username']
                }
            },
            {
                model: User,
                attributes: ['username']
            }
        ]
        // Notice that the include property is expressed as an array of objects. To define this object, we need a reference to the model and attributes. 
    })
        .then(dbPostData => res.json(dbPostData))
        .catch(err => {
            console.log(err);
            res.status(500).json(err);
        });

});

router.get('/:id', (req, res) => {
    Post.findOne({
        where: {
            id: req.params.id
        },
        attributes: [
            'id',
            'post_url',
            'title',
            'created_at',
            [sequelize.literal('(SELECT COUNT(*) FROM vote WHERE post.id = vote.post_id)'), 'vote_count']
        ],
        include: [
            {
                model: Comment,
                attributes: ['id', 'comment_text', 'post_id', 'user_id', 'created_at'],
                include: {
                    model: User,
                    attributes: ['username']
                }
            },
            {
                model: User,
                attributes: ['username']
            }]
    })
        .then(dbPostData => {
            if (!dbPostData) {
                res.status(404).json({
                    message: 'No post found with this id'
                });
                return;
            }
            res.json(dbPostData);
        })
        .catch(err => {
            console.log(err);
            res.status(500).json(err);
        });
});

router.post('/', (req, res) => {
    // expects {title: 'Taskmaster goes public!', post_url: 'https://taskmaster.com/press', user_id: 1}
    Post.create({
        title: req.body.title,
        post_url: req.body.post_url,
        user_id: req.body.user_id
    })
        .then(dbPostData => res.json(dbPostData))
        .catch(err => {
            console.log(err);
            res.status(500).json(err);
        });
});

// PUT /api/posts/upvote. Make sure this PUT route is defined before the /:id PUT route, though. Otherwise, Express.js will think the word "upvote" is a valid parameter for /:id. An upvote request will differ somewhat from the PUT requests we've created before. It will involve two queries: first, using the Vote model to create a vote, then querying on that post to get an updated vote count.


// router.put('/upvote', (req, res) => {
//    // create the vote
// Vote.create({
//     user_id: req.body.user_id,
//     post_id: req.body.post_id
//   }).then(() => {
//     // then find the post we just voted on
//     return Post.findOne({
//       where: {
//         id: req.body.post_id
//       },
//       // We just updated the route to query on the post we voted on after the vote was created. As we do so, we want to tally up the total number of votes that post has. Under some circumstances, built-in Sequelize methods can do just that—specifically one called .findAndCountAll(). Unfortunately, because we're counting an associated table's data and not the post itself, that method won't work here.
//       attributes: [
//         'id',
//         'post_url',
//         'title',
//         'created_at',
//         // use raw MySQL aggregate function query to get a count of how many votes the post has and return it under the name `vote_count`
//         [
//           sequelize.literal('(SELECT COUNT(*) FROM vote WHERE post.id = vote.post_id)'),
//           'vote_count'
//         ]
//       ]
//     })
//     .then(dbPostData => res.json(dbPostData))
//     .catch(err => {
//       console.log(err);
//       res.status(400).json(err);
//     });
// });
// });

router.put('/upvote', (req, res) => {
    // custom static method created in models/Post.js
    Post.upvote(req.body, {
        Vote
    })
        .then(updatedPostData => res.json(updatedPostData))
        .catch(err => {
            console.log(err);
            res.status(400).json(err);
        });
});


router.put('/:id', (req, res) => {
    Post.update({
        title: req.body.title
    }, {
        where: {
            id: req.params.id
        }
    })
        .then(dbPostData => {
            if (!dbPostData) {
                res.status(404).json({
                    message: 'No post found with this id'
                });
                return;
            }
            res.json(dbPostData);
        })
        .catch(err => {
            console.log(err);
            res.status(500).json(err);
        });
});

router.delete('/:id', (req, res) => {
    Post.destroy({
        where: {
            id: req.params.id
        }
    })
        .then(dbPostData => {
            if (!dbPostData) {
                res.status(404).json({
                    message: 'No post found with this id'
                });
                return;
            }
            res.json(dbPostData);
        })
        .catch(err => {
            console.log(err);
            res.status(500).json(err);
        });
});


module.exports = router;