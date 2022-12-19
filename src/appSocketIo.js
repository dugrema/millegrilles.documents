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
      {eventName: 'getGroupesUsager', callback: (params, cb) => traiter(socket, mqdao.getGroupesUsager, {params, cb}) },
      {eventName: 'getDocumentsGroupe', callback: (params, cb) => traiter(socket, mqdao.getDocumentsGroupe, {params, cb}) },
      {eventName: 'sauvegarderCategorieUsager', callback: (params, cb) => traiter(socket, mqdao.sauvegarderCategorieUsager, {params, cb}) },
      {eventName: 'sauvegarderGroupeUsager', callback: (params, cb) => traiter(socket, mqdao.sauvegarderGroupeUsager, {params, cb}) },
      {eventName: 'sauvegarderDocument', callback: (params, cb) => traiter(socket, mqdao.sauvegarderDocument, {params, cb}) },
      {eventName: 'getClesGroupes', callback: (params, cb) => traiter(socket, mqdao.getClesGroupes, {params, cb}) },

      // Listeners
      {eventName: 'ecouterEvenementsCategoriesUsager', callback: (_, cb) => {mqdao.ecouterEvenementsCategoriesUsager(socket, cb)}},
      {eventName: 'retirerEvenementsCategoriesUsager', callback: (_, cb) => {mqdao.retirerEvenementsCategoriesUsager(socket, cb)}},
      {eventName: 'ecouterEvenementsGroupesUsager', callback: (_, cb) => {mqdao.ecouterEvenementsGroupesUsager(socket, cb)}},
      {eventName: 'retirerEvenementsGroupesUsager', callback: (_, cb) => {mqdao.retirerEvenementsGroupesUsager(socket, cb)}},
      {eventName: 'ecouterEvenementsDocumentsUsager', callback: (_, cb) => {mqdao.ecouterEvenementsDocumentsUsager(socket, cb)}},
      {eventName: 'retirerEvenementsDocumentsUsager', callback: (_, cb) => {mqdao.retirerEvenementsDocumentsUsager(socket, cb)}},
    ]
  }

  return configurationEvenements
}

async function traiter(socket, methode, {params, cb}) {
  const reponse = await methode(socket, params)
  if(cb) cb(reponse)
}
