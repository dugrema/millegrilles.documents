import { expose } from 'comlink'
// import * as ConnexionClient from '@dugrema/millegrilles.reactjs/src/connexionClient'
import ConnexionClient from '@dugrema/millegrilles.reactjs/src/connexionClientV2'
import { MESSAGE_KINDS } from '@dugrema/millegrilles.utiljs/src/constantes'

const CONST_DOMAINE_DOCUMENTS = 'Documents'

function getCategoriesUsager(requete) {
  requete = requete || {}
  return ConnexionClient.emitWithAck(
    'getCategoriesUsager', 
    requete, 
    {
      kind: MESSAGE_KINDS.KIND_REQUETE, 
      domaine: CONST_DOMAINE_DOCUMENTS, 
      action: 'getCategoriesUsager', 
      ajouterCertificat: true,
    }
  )
}

function getGroupesUsager(requete) {
  requete = requete || {}
  return ConnexionClient.emitWithAck(
    'getGroupesUsager', 
    requete, 
    {
      kind: MESSAGE_KINDS.KIND_REQUETE, 
      domaine: CONST_DOMAINE_DOCUMENTS, 
      action: 'getGroupesUsager', 
      ajouterCertificat: true,
    }
  )
}

async function getClesGroupes(cleIds) {

  const params = {
    cle_ids: cleIds,
    domaine: CONST_DOMAINE_DOCUMENTS,
  }

  return ConnexionClient.emitWithAck(
    'getClesGroupes', 
    params, 
    {kind: MESSAGE_KINDS.KIND_REQUETE, domaine: CONST_DOMAINE_DOCUMENTS, action: 'getClesGroupes', ajouterCertificat: true}
  )
}

async function getDocumentsGroupe(groupe_id) {

  const params = {
    groupe_id,
  }

  return ConnexionClient.emitWithAck(
    'getDocumentsGroupe', 
    params, 
    {kind: MESSAGE_KINDS.KIND_REQUETE, domaine: CONST_DOMAINE_DOCUMENTS, action: 'getDocumentsGroupe', ajouterCertificat: true}
  )
}

function sauvegarderCategorieUsager(categorie) {
  return ConnexionClient.emitWithAck(
    'sauvegarderCategorieUsager', 
    categorie, 
    {
      kind: MESSAGE_KINDS.KIND_COMMANDE, 
      domaine: CONST_DOMAINE_DOCUMENTS, 
      action: 'sauvegarderCategorieUsager', 
      ajouterCertificat: true,
    }
  )
}

function sauvegarderGroupeUsager(commande, commandeMaitrecles) {

  return ConnexionClient.emitWithAck(
    'sauvegarderGroupeUsager', 
    commande,
    {
      kind: MESSAGE_KINDS.KIND_COMMANDE, 
      domaine: CONST_DOMAINE_DOCUMENTS, 
      action: 'sauvegarderGroupeUsager', 
      ajouterCertificat: true,
      attachements: {cle: commandeMaitrecles}
    }
  )
}

function sauvegarderDocument(doc) {
  return ConnexionClient.emitWithAck(
    'sauvegarderDocument', 
    doc,
    {kind: MESSAGE_KINDS.KIND_COMMANDE, domaine: CONST_DOMAINE_DOCUMENTS, action: 'sauvegarderDocument', ajouterCertificat: true}
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

async function ecouterEvenementsDocumentsUsager(cb) {
  return ConnexionClient.subscribe('ecouterEvenementsDocumentsUsager', cb, {}) 
}

async function retirerEvenementsDocumentsUsager(cb) {
  return ConnexionClient.unsubscribe('retirerEvenementsDocumentsUsager', cb, {}) 
}


// Exposer methodes du Worker
expose({
    ...ConnexionClient, 

    // Requetes et commandes privees
    getCategoriesUsager, getGroupesUsager,
    sauvegarderCategorieUsager, sauvegarderGroupeUsager, sauvegarderDocument,
    getDocumentsGroupe, getClesGroupes,

    // Event listeners proteges
    ecouterEvenementsCategoriesUsager, retirerEvenementsCategoriesUsager,
    ecouterEvenementsGroupesUsager, retirerEvenementsGroupesUsager,
    ecouterEvenementsDocumentsUsager, retirerEvenementsDocumentsUsager,
})
