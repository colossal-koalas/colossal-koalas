var jwt = require('jsonwebtoken');
var secret = process.env.TOKEN_SECRET;

var fs = require('fs');
var db = require('./database/interface');
var router = require('express').Router();
var app = require('./server'); //required server so we could have access to the secret set in server.js

//verify token
function verifyToken(req, res, next) {
  //check post parameters or header or url parameters for token
  var token = req.headers['x-access-token'];

  console.log(token);

  //decode token
  if (token) {
    //verify secret and check expression 
    jwt.verify(token, secret, function(err, decoded) {
      if (err) {
        return res.json({ success: false, message: 'Failed to authenticate token.'});
      } else {
        //if token is verified sucessfully, save to request for use in other routes
        req.decoded = decoded;
        next();
      }
    });
  } else {

    //if there is no token, return an error
    return res.status(403).send({
      success: false,
      message: 'No token provided.'
    });
  }
}

// All of these endpoints will be mounted onto `/api/users`
var pathHandlers = {

  // Sign up new user to api/users
  '': {
    post: function(req, res, next) {
      var username = req.body.username;
      var password = req.body.password;
      // Check to see if a user with this name already exists.
      db.User.find( {where: { name: username }} )
        .then(function(user) {
          // If a user with this name is found, reject the post request.
          if (user) {
            res.status(409).end('User already exists');
          } else {
            // Else, we initiate creating the user and pass the promise out to the chain.
            return db.User.create({ name: username, password: password });
          }
        })
        .then(function(user) {
          // The next branch of the chain will fulfill with the user.
          // We create a jwt and store it in token variable with 24 hour expiration date.
          // This token is send back to the client with username as payload.
          var token = jwt.sign(username, secret, {
            expiresInMinutes: 1440 //expires in 24 hours
          });

          res.status(201).json({
            success: true,
            token: token
          });
          
        })
        .catch(function(err) {
          console.error(err);
          res.sendStatus(500);
        });
    }
  },

  '/signin': {
    
    post:function(req, res, next) {
      var username = req.body.username;
      var password = req.body.password;

      db.User.find( {where: { name: username }} )
        .then(function(user) {
          if (!user) {
            res.status(404).end('User not found.');
          } else {
            return user.comparePassword(password)
              .then(function (foundUser) {
                if (foundUser) {
                  // Token is send back to the client with username as payload.
                  var token = jwt.sign(username, secret, {
                    expiresInMinutes: 1440 //expires in 24 hours
                  });
                  res.status(200).json({
                    success: true,
                    token: token
                  });
                } else {
                  res.status(404).end('Invalid password.');
                }
              });
          }
        })
        .catch(function(err) {
          console.error(err);
          res.sendStatus(500);
        });
    }
  },

  '/:username/entries': {

    get: function(req, res) {
      // Create variable to hold dynamic options for db query.
      var options;
      // Variable `lastSeen` supports the infinite scrolling of the journal page.
      // If it's undefined, we just roll from the top; otherwise, we constrain to
      // entries older than the `lastSeen` timestamp.
      var lastSeen = req.headers['x-last-seen'];
      console.log(lastSeen);

      if (!lastSeen) {
        options = {limit: 20, order:[['createdAt', 'DESC']]};
      } else {
        options = {where: {createdAt: {$lt: lastSeen}}, limit: 20, order: [['createdAt', 'DESC']]};
      }

      db.User.findOne({where: {name: req.params.username}})
        .then(function(user) {
          return user.getEntries(options);
        })
        .then(function(entries) {
          res.json(entries);
        })
        .catch(function(err) {
          console.error(err);
          res.sendStatus(500);
        });
    },

    post: function(req, res) {
      db.User.findOne({ where: { name: req.params.username } })
        .then(function(user) {
          if (!user) {
            res.sendStatus(404);
          } else {

            // toQueue object stages the information to be written to the queue directory
            var toQueue = {
              userId: user.id,
              text: req.body.text,
              emotion: req.body.emotion
            };

            // queue directory is used to make calls to Alchemy API on separate worker
            fs.writeFile('./queue/' + Date.now(), JSON.stringify(toQueue));

            db.Entry.create({
              emotion: req.body.emotion,
              text: req.body.text,
              userId: user.id
            })
            .then(function(entry) {
              res.json(entry);
            });
          }
        })
        .catch(function(err) {
          console.error(err);
          res.sendStatus(500);
        });
    }
  },

  '/:username/entries/:entryid': {

    get: function(req, res) {
      db.Entry.findOne({ where: { id: req.params.entryid } })
        .then(function(entry) {
          if (!entry) {
            res.sendStatus(404);
          } else {
            res.json(entry);
          }
        })
        .catch(function(err) {
          console.error(err);
          res.sendStatus(500);
        });
    },

    put: function(req, res) {
      db.Entry.update(req.body, {where: {id: req.params.entryid}})
        .then(function() {
          res.sendStatus(200);
        })
        .catch(function(err) {
          console.error(err);
          res.status(400).send(err);
        });
    },

    delete: function(req, res) {
      db.Entry.destroy({where: {id: req.params.entryid}})
        .then(function() {
          res.sendStatus(200);
        })
        .catch(function(err) {
          console.error(err);
          res.status(400).send(err);
        });
    }
  },

  '/:username/words/:emotion': {

    get: function(req, res) {
      // db.Word.findAll( 
      //   include: [{
      //     model: User,
      //     where: { username: req.params.username, emotion: req.params.emotion }
      //   }]
      // )
      db.User.findOne( { where: {
        username: req.params.username
        }
      })
      .then(function(user) {
        if (user) {

          db.Word.findAll( { where:
            { emotion: req.params.emotion,
              userId: user.id
            },
            order: [['frequency', 'DESC']],
            attributes: ['word', 'frequency', 'averageSentiment']
          })
          .then(function(words) {
            if (words) {
              res.status(200).send(words);
            } else {
              res.sendStatus(400);
            }
          })
          .catch(function(error) {
            res.status(400).send(error);

          });

        } else {
          res.sendStatus(400);
        }
      })
      .catch(function(error) {
        res.status(400).send(error);
      });

    }

  }

};

var path, routePath, method;

for (path in pathHandlers) {

  routePath = router.route(path);

  for (method in pathHandlers[path]) {
    if (path === '' || path === '/signin') {
      routePath[method]( pathHandlers[path][method] );
    } else {
      routePath[method]( verifyToken, pathHandlers[path][method] );
    }
  }

}


module.exports = router;
