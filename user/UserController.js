const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
const config = require('../config.js');
const jwt = require('jsonwebtoken');

router.use(bodyParser.urlencoded({ extended: true }));
router.use(bodyParser.json());
const User = require('./User');
const Product = require('./Product');

// var myobj = { ID:2, product:"Phone", type:"Mobile", price:20000 };
// Product.insertMany(myobj)


// GETS A SINGLE USER FROM THE DATABASE
router.get('/shopping', function (req, res) {
        const token = req.cookies.token || null
        // console.log(req.cookies)
        if (!token) {
            res.redirect('/')
        }
        jwt.verify(token, config.supersecret, function(err, isadmin){
            if(err){
                jwt.verify(token, config.secret, function(err, decoded) {
                if (err) {
                    res.redirect('/')
                }
                    User.findById(decoded.id, { password: 0 }, function (err, user) {
                        if (err) {res.redirect('/')}
                        if (!user) {res.redirect('/')}
                        Product.find({},(err,products)=>{
                            if (err) res.status(500).send('Error on the server.');
                            if (!products) res.status(500).send('Error on the server.');
                            res.render('shopping.ejs',{user , products})
                        })
                        
                    })
                })
            }
            else{
                User.findById(isadmin.id, { password: 0 }, function (err, user) {
                    if (err) {res.redirect('/')}
                    if (!user) {res.redirect('/')}
                    Product.find({},(err,products)=>{
                        if (err) res.status(500).send('Error on the server.');
                        if (!products) res.status(500).send('Error on the server.');
                        res.render('shopping.ejs',{user , products})
                    })
                    
                })
            }
        })
    })


router.get('/signup',  (req, res) => {
    res.render('signup.ejs')
 });

 router.get('/logout', (req,res) => {
    res.clearCookie("token");
    res.redirect('/');
 })


 router.get('/userlist', function (req, res) {
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
                if (!user) {res.status(401).send('Not Authorized')}
                User.find({}, { password: 0 },(err,users)=>{
                    if (err) res.status(500).send('Error on the server.');
                    else if (!users) res.status(500).send('Error on the server.');
                    res.render('userlist.ejs',{user , users})
                })
                
            })
        }
        })
    }
})




module.exports = router;