// Gestion evenements socket.io pour /millegrilles
import debugLib from 'debug'
import * as mqdao from './mqdao.js'

const debug = debugLib('documents:appSocketIo')

export function configurerEvenements(socket) {
  const configurationEvenements = {
    listenersPublics: [
      { eventName: 'challenge', callback: (params, cb) => traiter(socket, mqdao.challenge, {params, cb}) },
    ],
    listenersPrives: [
    ],
    listenersProteges: [
      // {eventName: 'getAppareilsUsager', callback: (params, cb) => traiter(socket, mqdao.getAppareilsUsager, {params, cb}) },
      {eventName: 'getCategoriesUsager', callback: (params, cb) => traiter(socket, mqdao.getCategoriesUsager, {params, cb}) },
      {eventName: 'sauvegarderCategorieUsager', callback: (params, cb) => traiter(socket, mqdao.sauvegarderCategorieUsager, {params, cb}) },

      // Listeners
      // {eventName: 'ecouterEvenementsAppareilsUsager', callback: (_, cb) => {mqdao.ecouterEvenementsAppareilsUsager(socket, cb)}},
    ]
  }

  return configurationEvenements
}

async function traiter(socket, methode, {params, cb}) {
  const reponse = await methode(socket, params)
  if(cb) cb(reponse)
}
