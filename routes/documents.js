import debugLib from 'debug'
import express from 'express'

const debug = debugLib('documents:route');

function initialiser(amqpdao, opts) {
  if(!opts) opts = {}
  const idmg = amqpdao.pki.idmg

  debug("IDMG: %s, AMQPDAO : %s", idmg, amqpdao !== undefined)

  const route = express.Router()
  route.get('/info.json', routeInfo)
  route.get('/initSession', initSession)
  ajouterStaticRoute(route)

  debug("Route /documents de Documents est initialisee")

  // Retourner dictionnaire avec route pour server.js
  return route

}

export default initialiser

function initSession(req, res) {
  return res.sendStatus(200)
}

function ajouterStaticRoute(route) {
  var folderStatic =
    process.env.MG_SENSEURSPASSIFS_STATIC_RES ||
    process.env.MG_STATIC_RES ||
    'static/documents'

  route.use(express.static(folderStatic))
  debug("Route %s pour documents initialisee", folderStatic)
}

function routeInfo(req, res, next) {
  debug(req.headers)
  const idmg = req.idmg
  const nomUsager = req.headers['user-name']
  const userId = req.headers['user-id']
  const niveauSecurite = req.headers['user-securite']
  const host = req.headers.host

  const reponse = {idmg, nomUsager, userId, hostname: host, niveauSecurite}
  return res.send(reponse)
}
