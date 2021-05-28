const express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'The World Happiness API' });
});

router.get('/rankings', function(req, res, next){
  let filter = {};

  if (req.query.year){
    filter.year = req.query.year   
  }

  if (req.query.country){
    filter.country = req.query.country;
  }

  req.db.from('rankings').select('rank', 'country', 'score', 'year').where(filter).orderBy('year', 'desc')
  .then((rows)=>{
    if (rows == ""){
      res.status(400).json({error: true, message: 'Invalid country or year given.'})
    }
    res.json(rows)
  }).catch((err)=>{
    res.json({error: true, message: 'Error retrieving records'})
  })

})

router.get('/countries', function(req, res, next){

})

router.get('/factors', function(req, res, next){

})
module.exports = router;
