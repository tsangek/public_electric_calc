// const {Router} = require('express');
// const router = Router();

// router.get('/login', async(req, res) => {
//   res.render("auth/login",{
//       title:"АВторизация",
//       isLogin: true
//   });
// });

// // router.post()
// // router.post('/register',login.register);
// // router.post('/login',login.login)

// module.exports = router;


var authController = require('../controllers/authController.js');
 
module.exports = function(app) {
 
    app.get('/signup', authController.signup);
    app.get('/signin', authController.signin);
 
}