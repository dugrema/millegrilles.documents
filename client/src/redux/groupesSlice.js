import { createSlice, isAnyOf, createListenerMiddleware } from '@reduxjs/toolkit'

const SLICE_NAME = 'groupes'

const initialState = {
    liste: null,                        // Liste triee
    sortKeys: {key: 'nom', ordre: 1},   // Ordre de tri
    mergeVersion: 0,                    // Utilise pour flagger les changements

    userId: null,
    groupeId: null,                     // Identificateur actif
}

// Actions
function setUserIdAction(state, action) {
    state.userId = action.payload
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

function mergeItemsAction(state, action) {
    return mergeItemsInnerAction(state, action)
}

// payload {uuid_appareil, ...data}
function mergeItemsInnerAction(state, action) {
    const mergeVersion = state.mergeVersion
    state.mergeVersion++

    let payload = action.payload
    if(!Array.isArray(payload)) {
        payload = [payload]
    }

    for (const payloadItem of payload) {
        let { groupe_id } = payloadItem

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
        let dataCourant = liste.filter(item=>item.groupe_id === groupe_id).pop()

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

            if(retirer) state.liste = liste.filter(item=>item.groupe_id !== groupe_id)

        } else if(peutAppend === true) {
            liste.push(data)
            state.liste = liste
        }
    }

    // Trier
    state.liste.sort(genererTriListe(state.sortKeys))
}

function setGroupeIdAction(state, action) {
    state.groupeId = action.payload
}

const groupesSlice = createSlice({
    name: SLICE_NAME,
    initialState,
    reducers: {
        setUserId: setUserIdAction,
        setGroupeId: setGroupeIdAction,
        pushItems: pushItemsAction, 
        mergeItems: mergeItemsAction,
        mergeItemsInner: mergeItemsInnerAction,
        clearItems: clearAction,
        setSortKeys: setSortKeysAction,
    }
})

export const { 
    setUserId, setGroupeId, pushItems, mergeItems, clearItems, setSortKeys,
} = groupesSlice.actions

export default groupesSlice.reducer

function creerThunks(actions) {

    // Action creators are generated for each case reducer function
    const { 
        setGroupeId, pushItems, mergeItems, clearItems, setSortKeys,
        mergeItemsInner,
    } = actions

    function recevoirGroupe(workers, groupe) {
        return (dispatch, getState) => traiterRecevoirGroupe(workers, groupe, dispatch, getState)
    }

    async function traiterRecevoirGroupe(workers, groupe, dispatch, getState) {
        console.debug('traiterRecevoirGroupe')
        const { groupesDao } = workers
    
        const state = getState().groupes
        const { userId } = state
    
        const groupeMaj = {...groupe, user_id: userId}
        await groupesDao.updateGroupe(groupeMaj)

        dispatch(mergeItems(groupeMaj))
    }

    function rafraichirGroupes(workers) {
        return (dispatch, getState) => traiterRafraichirGroupes(workers, dispatch, getState)
    }

    async function traiterRafraichirGroupes(workers, dispatch, getState) {
        console.debug('traiterRafraichirGroupes')
        const { groupesDao } = workers
    
        const state = getState().groupes
        const { userId } = state
    
        // Nettoyer la liste
        dispatch(clearItems())
    
        const groupes = await groupesDao.getParUserId(userId)
        console.debug("Chargement groupes locales : ", groupes)

        // Pre-charger le contenu de la liste de fichiers avec ce qu'on a deja dans idb
        if(groupes) {
            dispatch(pushItems({liste: groupes}))
        }
    
        const reponseGroupes = await workers.connexion.getGroupesUsager()
        console.debug("Chargement groupes serveur : ", reponseGroupes)
        const groupesRecus = reponseGroupes.groupes
        if(groupesRecus) {
            groupesDao.syncGroupes(groupesRecus, {userId})
                .catch(err=>console.error("Erreur sauvegarder groupes dans IDB : ", err))
            dispatch(mergeItems(groupesRecus))
        }        
    }    

    function dechiffrerGroupes(workers) {
        return (dispatch, getState) => traiterDechiffrerGroupes(workers, dispatch, getState)
    }
    
    async function traiterDechiffrerGroupes(workers, dispatch, getState) {
    
        const state = getState().groupes
        const { userId } = state

        const { clesDao, groupesDao } = workers
        const groupesChiffres = await groupesDao.getGroupesChiffres(userId)
        console.debug("Groupes chiffres : ", groupesChiffres)

        // Detecter les cles requises
        const liste_hachage_bytes = groupesChiffres.map(item=>item.ref_hachage_bytes)
        try {
            const cles = await clesDao.getCles(liste_hachage_bytes)
            console.debug("Cles recues : ", cles)
            for await (const groupe of groupesChiffres) {
                const cleMetadata = cles[groupe.ref_hachage_bytes]
                if(cleMetadata) {
                    const metaDechiffree = await workers.chiffrage.chiffrage.dechiffrerChampsChiffres(groupe, cleMetadata)
                    console.debug("Meta dechiffree : ", metaDechiffree)
                    const groupeMaj = {
                        ...metaDechiffree, 
                        groupe_id: groupe.groupe_id, user_id: userId,
                    }
                    await groupesDao.updateGroupe(groupeMaj)
                    dispatch(mergeItemsInner(groupeMaj))
                } else {
                    console.warn("Cle manquante pour groupe %s", groupe.groupe_nom)
                }
            }
    
        } catch(err) {
            console.error("Erreur chargement cles %O : %O", liste_hachage_bytes, err)
        }

    }

    // Async actions
    const thunks = { 
        recevoirGroupe, rafraichirGroupes, dechiffrerGroupes,
    }

    return thunks
}

export const thunks = creerThunks(groupesSlice.actions)

// Middleware
export function middlewareSetup(workers) {
    const middleware = createListenerMiddleware()
    
    middleware.startListening({
        matcher: isAnyOf(pushItems, mergeItems),
        effect: (action, listenerApi) => middlewareListener(workers, action, listenerApi)
    }) 
    
    return middleware
}

async function middlewareListener(workers, action, listenerApi) {
    console.debug("middlewareListener running effect, action : %O", action)

    await listenerApi.unsubscribe()
    try {
        listenerApi.dispatch(thunks.dechiffrerGroupes(workers))
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
        const { groupe_id: groupe_idA, nom_groupe: nomA } = a,
              { groupe_id: groupe_idB, nom_groupe: nomB } = b

        const labelA = nomA || groupe_idA,
              labelB = nomB || groupe_idB
        
        const compLabel = labelA.localeCompare(labelB)
        if(compLabel) return compLabel * ordre

        // Fallback, tuuid (doit toujours etre different)
        return groupe_idA.localeCompare(groupe_idB) * ordre
    }
}
