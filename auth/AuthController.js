const express = require('express');
const router = express.Router();
const app = express();
// For parsing form
const bodyParser = require('body-parser');
// For generating Token
const jwt = require('jsonwebtoken');
// For encrypting Password
const bcrypt = require('bcryptjs');
// For Secert Token
const config = require('../config');
// For User Schema
const User = require('../user/User');
const Product = require('../user/Product');

app.use(express.static(__dirname+'/public'));
app.set('view engine', 'ejs');
app.set('views', './views');

router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json());

// Register User
router.post('/register', function(req, res) {
  
    const hashedPassword = bcrypt.hashSync(req.body.password, 8);
    
    User.create({
      name : req.body.name,
      email : req.body.email,
      password : hashedPassword,

    },
    function (err, user) {
      if (err) return res.status(500).send("There was a problem registering the user.")
      
      const string = encodeURIComponent('Successfully Registered Please Login');
      res.redirect('/?msg=' + string);
    }); 
  });

// Login User
router.post('/login', function(req, res) {
    User.findOne({ email: req.body.email }, function (err, user) {
      if (err) return res.status(500).send('Error on the server.');
      const string = encodeURIComponent('! Please enter valid Credentials');
      if (!user) { res.redirect('/?valid=' + string);}
      else{
        const passwordIsValid = bcrypt.compareSync(req.body.password, user.password);
        const expiration = 86400
        if (!passwordIsValid) return res.status(401).send({ auth: false, token: null });
        if(user.admin == false){
          var token = jwt.sign({ id: user._id, admin: user.admin }, config.secret, {
            expiresIn: 86400 // expires in 24 hours
        });
      }
      else if(user.admin == true){
        var token = jwt.sign({ id: user._id, admin: user.admin }, config.supersecret, {
          expiresIn: 86400 // expires in 24 hours
      });
      }
        res.cookie('token', token, {
          expires: new Date(Date.now() + expiration),
          secure: false, // set to true if your using https
          httpOnly: true
        })
        // console.log("\n\nLogin Success\n\n")
        res.redirect(`/users/shopping`);
      }
    });
});


router.post('/adduser', function (req, res) {
    const token = req.cookies.token || null
    // console.log(req.cookies)
    if (!token) {
        res.status(401).send('Not Authorized')
    }
    else{
    jwt.verify(token, config.supersecret, function(err, decoded) {
        if (err) {
            res.status(401).send('Not Authorized')
        }
        else{   
            // console.log(decoded)
            if(decoded.admin==true){
            User.findById({ _id:decoded.id, admin:true}, { password: 0 }, function (err, user) {
                
                if (err) {res.status(500).send('Internal Server Error')}
                else if (!user) {res.status(401).send('Not Authorized')}
                else{
                const hashedPassword = bcrypt.hashSync(req.body.password, 8);
                
                User.create({
                  name : req.body.name,
                  email : req.body.email,
                  password : hashedPassword,
                  admin : req.body.admin
                },
                function (err, user) {
                  if (err){
                    // console.log(err)
                    const string = encodeURIComponent('There was a problem registering the user.');
                    res.redirect('/api/auth/adduser/?valid=' + string)
                  }
                  else{
                  const string = encodeURIComponent('User Created Successfully');
                  res.redirect('/api/auth/adduser/?msg=' + string)
                  }
                }); 
              }
                
            })
          }
          else{
            res.status(401).send('Not Authorized')
          }
        }
        })
    }
})

router.post('/addproduct', function (req, res) {
  const token = req.cookies.token || null
  // console.log(req.cookies)
  if (!token) {
      res.status(401).send('Not Authorized')
  }
  else{
  jwt.verify(token, config.supersecret, function(err, decoded) {
      if (err) {
          res.status(401).send('Not Authorized')
      }
      else{   
          User.findById({ _id:decoded.id, admin:true}, { password: 0 }, function (err, user) {
              
              if (err) {res.status(500).send('Internal Server Error')}
              else if (!user) {res.status(401).send('Not Authorized')}
              else{
  
              Product.create({
                ID: req.body.id,
                product: req.body.product,
                type: req.body.type,
                price: req.body.price
              },
              function (err, user) {
                if (err){
                  const string = encodeURIComponent('There was a problem creating the Product.');
                  res.redirect('/api/auth/addproduct/?valid=' + string)
                } 
                else{
                const string = encodeURIComponent('Product Created Successfully');
                res.redirect('/api/auth/addproduct/?msg=' + string)
                }
              }); 
            }
              
          })
      }
      })
  }
})

router.get('/adduser', function (req, res) {
  const token = req.cookies.token || null
  // console.log(req.cookies)
  if (!token) {
      res.status(401).send('Not Authorized')
  }
  else{
  jwt.verify(token, config.supersecret, function(err, decoded) {
      if (err) {
            res.status(401).send('Not Authorized')
      }
      else{   
          User.findById({ _id:decoded.id, admin:true}, { password: 0 }, function (err, user) {
              
              if (err) {res.status(500).send('Internal Server Error')}
              else if (!user) {res.status(401).send('Not Authorized')}
              else{
              
                res.render('adduser.ejs' , {error: req.query.valid?req.query.valid:'',
                msg: req.query.msg?req.query.msg:''} );
              
            }
              
          })
      }
      })
  }
})

router.get('/addproduct', function (req, res) {
  const token = req.cookies.token || null
  // console.log(req.cookies)
  if (!token) {
      res.status(401).send('Not Authorized')
  }
  else{
  jwt.verify(token, config.supersecret, function(err, decoded) {
      if (err) {
          res.status(401).send('Not Authorized')
      }
      else{   
          User.findById({ _id:decoded.id, admin:true}, { password: 0 }, function (err, user) {
              
              if (err) {res.status(500).send('Internal Server Error')}
              else if (!user) {res.status(401).send('Not Authorized')}
              else{
              
                res.render('addproduct.ejs' , {error: req.query.valid?req.query.valid:'',
                msg: req.query.msg?req.query.msg:''});
              
            }
              
          })
      }
      })
  }
})

  module.exports = router;