var express = require('express');
var router = express.Router();
const { auth } = require('./../models/consulta');
var { compare } = require('bcryptjs');


//para agarrar el form del login
const get = (req, res) => {

  res.render('login');

}

const login = async (req, res) => {

  /* Getting the email from the form. */
  const correo = req.body.correo_electronico;

  //le paso el parametro habilitado en true porque quiero que se loguen solo los habilitaedos
  const habilitado = true;

  //me devulve todos los datos del usuario con dicho correo electonico.
  const result = await auth(correo, habilitado);



  if (result.length == 0) {
    res.send('El correo electronico no existe')
  } else {
    //esto me devuelve un string y no un objeto. lO CUAL ES BUENO.
    const [{ contraseña }] = result;

    /* Getting the password from the form. */
    const passwordFromForm = req.body.contraseña;

    /* Comparing the password from the form with the password from the database. */
    const chequeoPassword = await compare(passwordFromForm, contraseña);

    /* Checking if the password from the form is the same as the password from the database. */
    if (chequeoPassword) {

      /* Destructuring the result. */
      const [{ id, correo_electronico, rol_de_usuario }] = result;

      /**
       * req genera variables globales. Gracias a la libreria express-session
       * Entonces tenemos al id, al email y al rol como variables globales.
       * Esto significa que podemos acceder a esos valores desde cualquier parte del sistema... desde cualquier modulo/archivo
       */

      /* Creating global variables. */
      req.session.user = id;

      req.session.email = correo_electronico;

      req.session.rol = rol_de_usuario;

      /* Checking if the user is an admin. If it is, it redirects to the admin panel. */
      if (req.session.rol == 1) {
        res.redirect('/panel_de_control')

        /* Redirecting the user to the page where he can upload the interactions. */
      } else {
        res.redirect('/carga_interacciones')
      }
    } else {
      res.send('la password es incorrecta')
    }

  }

}

router.get('/', get);

router.post('/create', login);

module.exports = router;
