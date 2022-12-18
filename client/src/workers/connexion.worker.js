import { expose } from 'comlink'
import * as ConnexionClient from '@dugrema/millegrilles.reactjs/src/connexionClient'

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

function getGroupesUsager(requete) {
  requete = requete || {}
  return ConnexionClient.emitBlocking(
    'getGroupesUsager', 
    requete, 
    {
      domaine: CONST_DOMAINE_DOCUMENTS, 
      action: 'getGroupesUsager', 
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

function sauvegarderGroupeUsager(commande, commandeMaitrecles) {

  const commandeCombinee = {...commande}
  if(commandeMaitrecles) {
    commandeCombinee['_commandeMaitrecles'] = commandeMaitrecles
  }

  return ConnexionClient.emitBlocking(
    'sauvegarderGroupeUsager', 
    commandeCombinee,
    {
      domaine: CONST_DOMAINE_DOCUMENTS, 
      action: 'sauvegarderGroupeUsager', 
      ajouterCertificat: true,
    }
  )
}

// Evenements

async function ecouterEvenementsCategoriesUsager(cb) {
  return ConnexionClient.subscribe('ecouterEvenementsCategoriesUsager', cb, {}) 
}

async function retirerEvenementsCategoriesUsager(cb) {
  return ConnexionClient.unsubscribe('retirerEvenementsCategoriesUsager', cb, {}) 
}

async function ecouterEvenementsGroupesUsager(cb) {
  return ConnexionClient.subscribe('ecouterEvenementsGroupesUsager', cb, {}) 
}

async function retirerEvenementsGroupesUsager(cb) {
  return ConnexionClient.unsubscribe('retirerEvenementsGroupesUsager', cb, {}) 
}

// Exposer methodes du Worker
expose({
    ...ConnexionClient, 

    // Requetes et commandes privees
    getCategoriesUsager, getGroupesUsager,
    sauvegarderCategorieUsager, sauvegarderGroupeUsager,

    // Event listeners proteges
    ecouterEvenementsCategoriesUsager, retirerEvenementsCategoriesUsager,
    ecouterEvenementsGroupesUsager, retirerEvenementsGroupesUsager,

})
