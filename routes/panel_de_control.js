var express = require('express');
var router = express.Router();

const { getLastInteraction, notificationAtControlPanel } = require('../models/consulta');

const get = async (req, res) => {
	//me agarra las ultimas 3 interacciones cargadas en el sistema. No se basa en el valor del campo proximo_contacto.
	const ultimasConsultas = await getLastInteraction();
	const habilitado = true;
	const status = true;
	//Me tira las 3 notificaciones mas urgentes
	const prox_contacto = await notificationAtControlPanel(habilitado, status);

	//console.log("proximo contacto: ", prox_contacto);

	res.render('panel_de_control', { ultimasConsultas, prox_contacto });

}

router.get('/', get);

module.exports = router;



