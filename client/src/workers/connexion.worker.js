import { expose } from 'comlink'
import * as ConnexionClient from '@dugrema/millegrilles.reactjs/src/connexionClient'
// import { hacheurs } from '@dugrema/millegrilles.reactjs'
// import { setHacheurs } from '@dugrema/millegrilles.utiljs'

// setHacheurs(hacheurs)

const CONST_DOMAINE_DOCUMENTS = 'Documents'

// function getListeSenseursNoeud(instance_id, opts) {
//   opts = opts || {}
//   const partition = opts.partition || instance_id
//   console.debug("getListeSenseursNoeud, instance_id: %s", instance_id)
//   return ConnexionClient.emitBlocking(
//     'getListeSenseursNoeud', 
//     {instance_id}, 
//     {
//       domaine: CONST_DOMAINE_DOCUMENTS, 
//       action: 'listeSenseursPourNoeud', 
//       ajouterCertificat: true,
//       partition,
//     }
//   )
// }


// Evenements

// async function ecouterEvenementsAppareilsUsager(cb) {
//   // console.debug("ecouterEvenementsAppareilsUsager cb")
//   // ConnexionClient.socketOn('evenement.SenseursPassifs.lectureConfirmee', cb)
//   // const resultat = await ConnexionClient.emitBlocking('ecouterEvenementsAppareilsUsager', {}, {noformat: true})
//   // if(!resultat) {
//   //   throw new Error("Erreur ecouterEvenementsAppareilsUsager")
//   // }
//   return ConnexionClient.subscribe('ecouterEvenementsAppareilsUsager', cb, {}) 
// }

// async function retirerEvenementsAppareilsUsager(cb) {
//   // ConnexionClient.socketOff('evenement.SenseursPassifs.lectureConfirmee')
//   // const resultat = await ConnexionClient.emitBlocking('retirerEvenementsAppareilsUsager', {}, {noformat: true})
//   // if(!resultat) {
//   //   throw new Error("Erreur retirerEvenementsAppareilsUsager")
//   // }
//   return ConnexionClient.unsubscribe('retirerEvenementsAppareilsUsager', cb, {}) 
// }

// Exposer methodes du Worker
expose({
    ...ConnexionClient, 

    // Requetes et commandes privees

    // Event listeners proteges

})
