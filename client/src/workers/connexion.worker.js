import { expose } from 'comlink'
import * as ConnexionClient from '@dugrema/millegrilles.reactjs/src/connexionClient'
// import { hacheurs } from '@dugrema/millegrilles.reactjs'
// import { setHacheurs } from '@dugrema/millegrilles.utiljs'

// setHacheurs(hacheurs)

const CONST_DOMAINE_DOCUMENTS = 'Documents'

function getCategoriesUsager(requete) {
  requete = requete || {}
  return ConnexionClient.emitBlocking(
    'getCategoriesUsager', 
    requete, 
    {
      domaine: CONST_DOMAINE_DOCUMENTS, 
      action: 'getCategoriesUsager', 
      ajouterCertificat: true,
    }
  )
}

function sauvegarderCategorieUsager(categorie) {
  return ConnexionClient.emitBlocking(
    'sauvegarderCategorieUsager', 
    categorie, 
    {
      domaine: CONST_DOMAINE_DOCUMENTS, 
      action: 'sauvegarderCategorieUsager', 
      ajouterCertificat: true,
    }
  )
}

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
    getCategoriesUsager,
    sauvegarderCategorieUsager,

    // Event listeners proteges

})
