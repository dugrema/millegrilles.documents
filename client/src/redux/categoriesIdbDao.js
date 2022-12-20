import { ouvrirDB, STORE_CATEGORIES } from './idbDocuments'

export function init() {
    return ouvrirDB()
}

export async function syncCategories(categories) {
    if(!categories) return []

    const db = await ouvrirDB()
    const store = db.transaction(STORE_CATEGORIES, 'readwrite').store

    for await (const infoCategorie of categories) {
        const { categorie_id } = infoCategorie
        const categorieDoc = await store.get(categorie_id)
        if(categorieDoc) {
            if(categorieDoc.nom_categorie !== infoCategorie.nom_categorie) {
                console.debug("update categorie : ", infoCategorie)
                await store.put(infoCategorie)
            }
        } else {
            console.debug("put categorie : ", infoCategorie)
            await store.put(infoCategorie)
        }
    }
}

// opts {merge: true, dechiffre: true}, met dirty a false
export async function updateCategorie(categorie, opts) {
    opts = opts || {}

    const { categorie_id, user_id } = categorie
    if(!categorie_id) throw new Error('updateCategorie categorie_id doit etre fourni')
    if(!user_id) throw new Error('updateCategorie user_id doit etre fourni')

    const flags = ['dirty', 'expiration']
          
    const db = await ouvrirDB()
    const store = db.transaction(STORE_CATEGORIES, 'readwrite').store
    const categorieDoc = (await store.get(categorie_id)) || {}
    Object.assign(categorieDoc, categorie)
    
    // Changer flags
    flags.forEach(flag=>{
        const val = opts[flag]
        if(val !== undefined) categorieDoc[flag] = val
    })

    await store.put(categorieDoc)
}

export async function deleteCategories(categorie_ids) {
    const db = await ouvrirDB()
    const store = db.transaction(STORE_CATEGORIES, 'readwrite').store
    for await (const categorie_id of categorie_ids) {
        await store.delete(categorie_id)
    }
}

export async function getParCategorieIds(categorie_ids) {
    const db = await ouvrirDB()
    const store = db.transaction(STORE_CATEGORIES, 'readonly').store
    const categories = Promise.all( categorie_ids.map(categorie_id=>store.get(categorie_id)) )
    return categories
}

export async function getParUserId(userId) {
    const db = await ouvrirDB()
    const store = db.transaction(STORE_CATEGORIES, 'readonly').store
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
    const store = db.transaction(STORE_CATEGORIES, 'readwrite').store
    store.clear()
}
