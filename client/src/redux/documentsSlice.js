import { createSlice, isAnyOf, createListenerMiddleware } from '@reduxjs/toolkit'

const SLICE_NAME = 'documents'

const initialState = {
    liste: null,                        // Liste triee
    sortKeys: {key: 'nom', ordre: 1},   // Ordre de tri
    mergeVersion: 0,                    // Utilise pour flagger les changements

    userId: null,
    groupeId: null,                     // Groupe de documents actif (pour navigation)
    docId: null,                   // Identificateur actif
}

// Actions
function setUserIdAction(state, action) {
    state.userId = action.payload
}

function setGroupeIdAction(state, action) {
    state.groupeId = action.payload
}

function setSortKeysAction(state, action) {
    const sortKeys = action.payload
    state.sortKeys = sortKeys
    if(state.liste) state.liste.sort(genererTriListe(sortKeys))
}

function pushItemsAction(state, action) {
    const mergeVersion = state.mergeVersion
    state.mergeVersion++

    let {liste: payload, clear} = action.payload
    if(clear === true) state.liste = []  // Reset liste

    let liste = state.liste || []
    if( Array.isArray(payload) ) {
        const ajouts = payload.map(item=>{return {...item, '_mergeVersion': mergeVersion}})
        liste = liste.concat(ajouts)
    } else {
        const ajout = {...payload, '_mergeVersion': mergeVersion}
        liste.push(ajout)
    }

    // Trier
    liste.sort(genererTriListe(state.sortKeys))

    state.liste = liste
}

function clearAction(state) {
    state.liste = null
}

// payload {uuid_appareil, ...data}
function mergeItemsAction(state, action) {
    return mergeItemsInnerAction(state, action)
}

function mergeItemsInnerAction(state, action) {
    const mergeVersion = state.mergeVersion
    state.mergeVersion++

    let payload = action.payload
    if(!Array.isArray(payload)) {
        payload = [payload]
    }

    for (const payloadItem of payload) {
        let { doc_id } = payloadItem

        // Ajout flag _mergeVersion pour rafraichissement ecran
        const data = {...(payloadItem || {})}
        data['_mergeVersion'] = mergeVersion

        const liste = state.liste || []
        
        let peutAppend = false
        if(data.supprime === true) {
            // false
        } else {
            peutAppend = true
        }

        // Trouver un fichier correspondant
        let dataCourant = liste.filter(item=>item.doc_id === doc_id).pop()

        // Copier donnees vers state
        if(dataCourant) {
            if(data) {
                const copie = {...data}
                Object.assign(dataCourant, copie)
            }

            let retirer = false
            if(dataCourant.supprime === true) {
                // Le document est supprime
                retirer = true
            }

            if(retirer) state.liste = liste.filter(item=>item.doc_id !== doc_id)

        } else if(peutAppend === true) {
            liste.push(data)
            state.liste = liste
        }
    }

    // Trier
    state.liste.sort(genererTriListe(state.sortKeys))
}

function setDocIdAction(state, action) {
    state.docId = action.payload
}

const documentsSlice = createSlice({
    name: SLICE_NAME,
    initialState,
    reducers: {
        setUserId: setUserIdAction,
        setGroupeId: setGroupeIdAction,
        setDocId: setDocIdAction,
        pushItems: pushItemsAction, 
        mergeItems: mergeItemsAction,
        mergeItemsInner: mergeItemsInnerAction,
        clearItems: clearAction,
        setSortKeys: setSortKeysAction,
    }
})

export const { 
    setUserId, setGroupeId, setDocId, pushItems, mergeItems, clearItems, setSortKeys,
} = documentsSlice.actions

export default documentsSlice.reducer

function creerThunks(actions) {

    // Action creators are generated for each case reducer function
    const { 
        setGroupeId, setDocId, pushItems, mergeItems, clearItems, setSortKeys,
        mergeItemsInner,
    } = actions

    function recevoirDocument(workers, doc) {
        return (dispatch, getState) => traiterRecevoirDocument(workers, doc, dispatch, getState)
    }

    async function traiterRecevoirDocument(workers, doc, dispatch, getState) {
        console.debug('traiterRecevoirDocument')
        const { documentsDao } = workers
    
        const state = getState().documents
        const { userId } = state
    
        const documentMaj = {...doc, user_id: userId}
        await documentsDao.updateDocument(documentMaj)

        dispatch(mergeItems(documentMaj))
    }

    function rafraichirDocuments(workers) {
        return (dispatch, getState) => traiterRafraichirDocuments(workers, dispatch, getState)
    }

    async function traiterRafraichirDocuments(workers, dispatch, getState) {
        console.debug('traiterRafraichirDocuments')
        const { documentsDao } = workers
    
        const state = getState().documents
        const { userId, groupeId } = state
    
        // Nettoyer la liste
        dispatch(clearItems())
    
        const docsGroupe = await documentsDao.getParGroupeId(userId, groupeId)
        console.debug("Chargement documents locaux : ", docsGroupe)

        // Pre-charger le contenu de la liste de fichiers avec ce qu'on a deja dans idb
        if(docsGroupe.documents) {
            dispatch(pushItems({liste: docsGroupe.documents}))
        }
    
        const reponseDocs = await workers.connexion.getDocumentsGroupe(groupeId)
        console.debug("Chargement docs serveur : ", reponseDocs)
        const documentsRecus = reponseDocs.documents
        if(documentsRecus) {
            documentsDao.syncDocuments(documentsRecus, {userId})
                .catch(err=>console.error("Erreur sauvegarder documents dans IDB : ", err))
            dispatch(mergeItems(documentsRecus))
        }        
    }    

    function dechiffrerDocuments(workers) {
        return (dispatch, getState) => traiterDechiffrerDocuments(workers, dispatch, getState)
    }
    
    async function traiterDechiffrerDocuments(workers, dispatch, getState) {
    
        const state = getState().documents
        const groupes = getState().groupes.liste
        const { userId} = state

        const { clesDao, documentsDao } = workers
        
        const documentsChiffres = await documentsDao.getDocumentsChiffres(userId)
        console.debug("Documents chiffres : ", documentsChiffres)

        // Detecter les cles requises
        try {
            // Identifier ref_hachages_bytes des cles
            const groupesParId = groupes.reduce((acc, item)=>{
                acc[item.groupe_id] = item.ref_hachage_bytes
                return acc
            }, {})
            let refHachageBytesRequis = documentsChiffres.reduce((acc, item)=>{
                const ref_hachage_bytes = groupesParId[item.groupe_id]
                if(ref_hachage_bytes) acc[ref_hachage_bytes] = true
                return acc
            }, {})
            const liste_hachage_bytes = Object.keys(refHachageBytesRequis)

            const cles = await clesDao.getCles(liste_hachage_bytes)
            console.debug("Cles recues : ", cles)

            for await (const docDocument of documentsChiffres) {
                const ref_hachage_bytes = groupesParId[docDocument.groupe_id]
                let cleMetadata = cles[ref_hachage_bytes]
                if(cleMetadata) {
                    try {
                        const metaDechiffree = await workers.chiffrage.chiffrage.dechiffrerChampsChiffres(docDocument, cleMetadata)
                        console.debug("Meta dechiffree : ", metaDechiffree)
                        const groupeMaj = {
                            ...metaDechiffree, 
                            doc_id: docDocument.doc_id,
                            groupe_id: docDocument.groupe_id, 
                            user_id: userId,
                        }
                        await documentsDao.updateDocument(groupeMaj, {dechiffre: true})
                        dispatch(mergeItemsInner(groupeMaj))
                    } catch(err) {
                        console.warn("Erreur dechiffrage doc %s : %O", docDocument.doc_id, err)
                    }
                } else {
                    console.warn("Cle manquante pour doc %s", docDocument.doc_id)
                }
            }
    
        } catch(err) {
            console.error("Erreur chargement cles %O", err)
        }

    }

    // Async actions
    const thunks = { 
        recevoirDocument, rafraichirDocuments, dechiffrerDocuments,
    }

    return thunks
}

export const thunks = creerThunks(documentsSlice.actions)

// Middleware
export function middlewareSetup(workers) {
    const middleware = createListenerMiddleware()
    
    middleware.startListening({
        matcher: isAnyOf(setGroupeId, pushItems, mergeItems),
        effect: (action, listenerApi) => middlewareListener(workers, action, listenerApi)
    }) 
    
    return middleware
}

async function middlewareListener(workers, action, listenerApi) {
    console.debug("middlewareListener running effect, action : %O", action)

    await listenerApi.unsubscribe()
    try {
        listenerApi.dispatch(thunks.dechiffrerDocuments(workers))
        console.debug("middlewareListener Sequence terminee")
    } finally {
        await listenerApi.subscribe()
    }
}

function genererTriListe(sortKeys) {
    
    const key = sortKeys.key || 'nom',
          ordre = sortKeys.ordre || 1

    return (a, b) => {
        if(a === b) return 0
        if(!a) return 1
        if(!b) return -1

        // Fallback, nom/tuuid du fichier
        const { doc_id: document_idA } = a,
              { doc_id: document_idB } = b

        const labelA = a[key] || document_idA,
              labelB = b[key] || document_idB

        const compLabel = labelA.localeCompare(labelB)
        if(!!compLabel) return compLabel * ordre

        // Fallback, tuuid (doit toujours etre different)
        return document_idA.localeCompare(document_idB) * ordre
    }
}
