var express = require('express');
var router = express.Router();
var parser = require('body-parser');
var user_controller = require('../controllers/userController');

const {check, validationResult} = require('express-validator/check');
//var temp = {"email" : "234@gmail.com"};

/* GET users. */
router.get('/', 
	check('user_email').isEmail(),
	function(req, res){
		console.log(req.param('user_email'));
		const errors = validationResult(req);
		if (!errors.isEmpty()){
			return res.status(400).json({"error": "Invalid user name."});
		}
		user_controller.user_info_get(req.param('user_email'), res);
	});

router.put('/', /*user_controller.user_info_put*/(req,res)=>{
	/*
	if (req.body.has('user_id'))
		check('user_id').isNumeric();
	if (req.body.has('user_name'))
		check('user_name').isLength({max:50});
	const errors = validationResult(req);
	if (!errors.isEmpty()){
		return res.status(400).json({"error": "Invalid info to update."});
	}*/
	console.log(req.param);
	user_controller.user_info_put(req.param, res);
	console.log("put works");
	res.send('put works in send');

});

router.post('/', user_controller.user_id_post);
router.delete('/', user_controller.user_delete);

module.exports = router;
