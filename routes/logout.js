var express = require('express');
var router = express.Router();
/**
 * It sets the user property of the session object to null, and then redirects the user to the login
 * page
 * @param req - The request object represents the HTTP request and has properties for the request query
 * string, parameters, body, HTTP headers, and so on.
 * @param res - the response object
 */


const logOut = (req, res) => {

    req.session.user = null;

    res.redirect('/login');
}

router.get('/', logOut)
module.exports = router;
