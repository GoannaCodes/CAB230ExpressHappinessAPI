var express = require('express');
var router = express.Router();
const jwt = require('jsonwebtoken');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'The World Happiness API' });
});

router.get('/rankings', function(req, res, next){
  let filter = {};

  if ((!req.query.year && !req.query.country) && req.query == {}){
    res.status(400).json({error: true, message: "Invalid query provided."})
  }

  if (req.query.year){
    filter.year = req.query.year;
  }

  if (req.query.country){
    filter.country = req.query.country;
  }

  req.db.from('rankings').select('rank', 'country', 'score', 'year').where(filter).orderBy('year', 'desc')
  .then((rows)=>{
    if (rows == ""){
      res.status(400).json({error: true, message: 'Invalid country or year given.'})
    }
    res.status(200).json(rows)
  }).catch((err)=>{
    console.log(err);
    res.json({error: true, message: 'Error retrieving records'})
  })

})

router.get('/countries', function(req, res, next){
  if (req.query.year || req.query.country){
    res.status(400).json({error: true, message: 'Invalid query parameters. Query parameters are not permitted.'})
  }

  req.db.from('rankings').distinct('country').orderBy('country', 'asc')
  .then((rows)=>{
    let countryNames = rows.map(function(row){
      return row['country']
    })
    res.status(200).json(countryNames);
  })
})

const authorize = (req, res, next) =>{
  const authorization = req.headers.authorization;
  let token = null;
  let secretKey = "secret key"
  //Retrieve token
  if (authorization && authorization.split(" ").length === 2){
    token = authorization.split(" ")[1];
    // res.status(200);
  } else {
    res.status(401).json({error: true, message: "Unauthorized"})
    return
  }

  // Verify JWT and check expiration date
  try{
    const decoded = jwt.verify(token, secretKey);

    if (decoded.exp < Date.now()){
      res.status(401).json({error: true, message: 'Token has expired'});
      return
    }

    // Permit user to advance to route
    next()
  } catch(err){

    console.log("Token is not valid:", err);
  }
}

router.get('/factors/:year', authorize, function(req, res){
  let filter = {};
  filter.year = req.params.year;

  if ((!req.query.limit && !req.query.country) && req.query == {}){
    res.status(400).json({error: true, message: "Invalid query provided."})
  }

  if (req.query.limit < 1){
    res.status(400).json({error: true, message: 'Limit cannot be negative.'})
  } 

  if (req.query.country){
    filter.country = req.query.country;
  }

  req.db.from('rankings').select('rank', 'country', 'score', 'year', 'economy', 'family', 'health', 'freedom', 'generosity', 'trust').where(filter).limit(req.query.limit)
  .then((rows)=>{
    if (rows == ""){
      res.status(400).json({error: true, message: 'Invalid country or year given.'})
    }
    res.json(rows)
  }).catch((err)=>{
    console.log(err)
    res.json({error: true, message: 'Error retrieving records'})
  })
})
module.exports = router;
