import { createSlice, isAnyOf, createListenerMiddleware } from '@reduxjs/toolkit'

const SLICE_NAME = 'categories'

const initialState = {
    liste: null,                        // Liste triee
    sortKeys: {key: 'nom', ordre: 1},   // Ordre de tri
    mergeVersion: 0,                    // Utilise pour flagger les changements

    categorieId: null,                  // Identificateur actif
}

// Actions
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
    // console.debug("pushAction liste triee : %O", liste)

    state.liste = liste
}

function clearAction(state) {
    state.liste = null
}

// payload {uuid_appareil, ...data}
function mergeItemsAction(state, action) {
    const mergeVersion = state.mergeVersion
    state.mergeVersion++

    let payload = action.payload
    if(!Array.isArray(payload)) {
        payload = [payload]
    }

    for (const payloadItem of payload) {
        console.debug("mergeAction action: %O", action)
        let { categorie_id } = payloadItem

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
        let dataCourant = liste.filter(item=>item.categorie_id === categorie_id).pop()

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

            if(retirer) state.liste = liste.filter(item=>item.categorie_id !== categorie_id)

        } else if(peutAppend === true) {
            liste.push(data)
            state.liste = liste
        }
    }

    // Trier
    state.liste.sort(genererTriListe(state.sortKeys))
}

function setCategorieIdAction(state, action) {
    state.categorieId = action.payload
}

const categoriesSlice = createSlice({
    name: SLICE_NAME,
    initialState,
    reducers: {
        setCategorieId: setCategorieIdAction,
        pushItems: pushItemsAction, 
        mergeItems: mergeItemsAction,
        clearItems: clearAction,
        setSortKeys: setSortKeysAction,
    }
})

export const { 
    setCategorieId, pushItems, mergeItems, clearItems, setSortKeys,
} = categoriesSlice.actions

export default categoriesSlice.reducer

function creerThunks(actions) {

    // Action creators are generated for each case reducer function
    const { 
        setCategorieId, pushItems, mergeItems, clearItems,
    } = actions

    function rafraichirCategories(workers) {
        return (dispatch, getState) => traiterRafraichirCategories(workers, dispatch, getState)
    }

    async function traiterRafraichirCategories(workers, dispatch, getState) {
        console.debug('traiterRafraichirCategories')
        const { categoriesDao } = workers
    
        const state = getState().categories
        const { userId } = state
    
        // Nettoyer la liste
        dispatch(clearItems())
    
        const categories = await categoriesDao.getParUserId(userId)
        console.debug("Chargement categories locales : ", categories)

        // Pre-charger le contenu de la liste de fichiers avec ce qu'on a deja dans idb
        if(categories) {
            dispatch(pushItems({liste: categories}))
        }
    
        const reponseCategories = await workers.connexion.getCategoriesUsager()
        console.debug("Chargement categories serveur : ", reponseCategories)
        const categoriesRecues = reponseCategories.categories
        if(categoriesRecues) {
            categoriesDao.syncCategories(categoriesRecues)
                .catch(err=>console.error("Erreur sauvegarder categories dans IDB : ", err))
            dispatch(mergeItems(categoriesRecues))
        }        
    }    

    // Async actions
    const thunks = { 
        rafraichirCategories,
    }

    return thunks
}

export const thunks = creerThunks(categoriesSlice.actions)

function genererTriListe(sortKeys) {
    
    const key = sortKeys.key || 'nom',
          ordre = sortKeys.ordre || 1

    return (a, b) => {
        if(a === b) return 0
        if(!a) return 1
        if(!b) return -1

        // Fallback, nom/tuuid du fichier
        const { categorie_id: categorie_idA, nom_categorie: nomA } = a,
              { categorie_id: categorie_idB, nom_categorie: nomB } = b

        const labelA = nomA || categorie_idA,
              labelB = nomB || categorie_idB
        
        const compLabel = labelA.localeCompare(labelB)
        if(compLabel) return compLabel * ordre

        // Fallback, tuuid (doit toujours etre different)
        return categorie_idA.localeCompare(categorie_idB) * ordre
    }
}
