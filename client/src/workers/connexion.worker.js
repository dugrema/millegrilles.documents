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

async function ecouterEvenementsCategoriesUsager(cb) {
  return ConnexionClient.subscribe('ecouterEvenementsCategoriesUsager', cb, {}) 
}

async function retirerEvenementsCategoriesUsager(cb) {
  return ConnexionClient.unsubscribe('retirerEvenementsCategoriesUsager', cb, {}) 
}

// Exposer methodes du Worker
expose({
    ...ConnexionClient, 

    // Requetes et commandes privees
    getCategoriesUsager,
    sauvegarderCategorieUsager,

    // Event listeners proteges
    ecouterEvenementsCategoriesUsager, retirerEvenementsCategoriesUsager,

})
