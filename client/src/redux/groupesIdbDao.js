import { ouvrirDB, STORE_GROUPES } from './idbDocuments'

export function init() {
    return ouvrirDB()
}

export async function syncGroupes(groupes) {
    if(!groupes) return []

    const db = await ouvrirDB()
    const store = db.transaction(STORE_GROUPES, 'readwrite').store

    for await (const infoGroupe of groupes) {
        const { groupe_id } = infoGroupe
        const groupeDoc = await store.get(groupe_id)
        if(groupeDoc) {
            if(groupeDoc.header !== infoGroupe.header) {
                console.debug("update groupe : ", infoGroupe)
                await store.update({...infoGroupe, dechiffre: false})
            }
        } else {
            console.debug("put groupe : ", infoGroupe)
            await store.put(infoGroupe)
        }
    }
}

// opts {merge: true, dechiffre: true}, met dirty a false
export async function updateGroupe(groupe, opts) {
    opts = opts || {}

    const { groupe_id, user_id } = groupe
    if(!groupe_id) throw new Error('updateCategorie groupe_id doit etre fourni')
    if(!user_id) throw new Error('updateCategorie user_id doit etre fourni')

    const flags = ['dirty']
          
    const db = await ouvrirDB()
    const store = db.transaction(STORE_GROUPES, 'readwrite').store
    const groupeDoc = (await store.get(groupe_id)) || {}
    Object.assign(groupeDoc, groupe)
    
    // Changer flags
    flags.forEach(flag=>{
        const val = opts[flag]
        if(val !== undefined) groupeDoc[flag] = val
    })

    await store.put(groupeDoc)
}

export async function deleteGroupes(groupe_ids) {
    const db = await ouvrirDB()
    const store = db.transaction(STORE_GROUPES, 'readwrite').store
    for await (const groupe_id of groupe_ids) {
        await store.delete(groupe_id)
    }
}

export async function getParUserId(userId) {
    const db = await ouvrirDB()
    const store = db.transaction(STORE_GROUPES, 'readonly').store
    const index = store.index('userid')
    let curseur = await index.openCursor(userId)
    const categories = []
    while(curseur) {
        const value = curseur.value
        categories.push(value)
        curseur = await curseur.continue()
    }
    return categories
}

// Supprime le contenu de idb
export async function clear() {
    const db = await ouvrirDB()
    const store = db.transaction(STORE_GROUPES, 'readwrite').store
    store.clear()
}
