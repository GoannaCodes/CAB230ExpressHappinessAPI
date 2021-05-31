var express = require('express');
var router = express.Router();

const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

router.post('/register', function(req, res, next){
  const email = req.body.email;
  const password = req.body.password;

  if (!email || !password){
    res.status(400).json({error: true, message: 'Request body incomplete - email and password needed'})
    return
  }

  const queryUsers = req.db.from('users').select('*').where('email','=', email);
  queryUsers.then((users)=>{
    if (users.length > 0){
      res.status(409).json({
        error: true,
        message: 'User already exists'
      })
      return;
    }
    const saltRounds = 10;
    const hash = bcrypt.hashSync(password, saltRounds);
    return req.db.from('users').insert({email: email, hash: hash})
  }).then(()=>{
    res.status(201).json({message: "User created"})
  })


})

router.post('/login', function(req, res, next){
  const email = req.body.email;
  const password = req.body.password;

  if (!email || !password){
    res.status(400).json({error: true, message: 'Request body incomplete - email and password needed'})
    return
  }

  const queryUsers = req.db.from('users').select('*').where('email', '=', email)
  queryUsers.then((users)=>{
    if (users.length === 0){
      res.status(401).json({
        error: true,
        message: 'Incorrect email or password'
      })
    }
    const user = users[0]
    return bcrypt.compare(password, user.hash)
  })
  .then((match)=>{
    if (!match){
      res.status(401).json({
        error: true,
        message: 'Incorrect email or password'
      })
      return
    }
      const secretKey = 'secret key'
      const expires_in = 60 * 60 * 24
      const exp = Date.now() + expires_in * 1000
      const token = jwt.sign({email, exp}, secretKey)
      res.status(200).json({token_type: 'Bearer', token, expires_in})
  })
})

router.put('/user/:email/profile', function(req, res){
  
})

router.get('/user/:email/profile', function(req, res){
  
})
module.exports = router;
