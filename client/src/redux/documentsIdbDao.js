import { ouvrirDB, STORE_DOCUMENTS } from './idbDocuments'

// const STORE_DOCUMENTS = 'documents'

export function init() {
    return ouvrirDB()
}

// Met dirty a true et dechiffre a false si mismatch derniere_modification
export async function syncDocuments(docs, opts) {
    opts = opts || {}
    if(!docs) return []

    const db = await ouvrirDB()
    const store = db.transaction(STORE_DOCUMENTS, 'readwrite').store

    for await (const infoDoc of docs) {
        console.debug("Conserver doc ", infoDoc)
        const { doc_id, header } = infoDoc
        const documentDoc = await store.get(doc_id)
        if(documentDoc) {
            if(header !== documentDoc.header) {
                // Fichier connu avec une version differente
                await store.update({...documentDoc, ...infoDoc})
            }
        } else {
            const user_id = infoDoc.user_id || opts.userId
            if(!user_id) throw new Error("UserId manquant")
            await store.put({...infoDoc, user_id})
        }
    }
}

// opts {merge: true, dechiffre: true}, met dirty a false
export async function updateDocument(doc, opts) {
    opts = opts || {}
    const dechiffre = opts.dechiffre

    const { doc_id, user_id } = doc
    if(!doc_id) throw new Error('updateDocument document_id doit etre fourni')
    if(!user_id) throw new Error('updateDocument user_id doit etre fourni')

    const flags = ['dirty', 'dechiffre', 'expiration']
          
    const db = await ouvrirDB()
    const store = db.transaction(STORE_DOCUMENTS, 'readwrite').store
    const documentDoc = (await store.get(doc_id)) || {}
    Object.assign(documentDoc, doc)
    
    if(dechiffre === true) {
        // Retirer champ data_chiffre
        delete documentDoc.data_chiffre
    }

    // Changer flags
    flags.forEach(flag=>{
        const val = opts[flag]
        if(val !== undefined) documentDoc[flag] = val
    })

    await store.put(documentDoc)
}

export async function deleteDocuments(document_ids) {
    const db = await ouvrirDB()
    const store = db.transaction(STORE_DOCUMENTS, 'readwrite').store
    for await (const document_id of document_ids) {
        await store.delete(document_id)
    }
}

export async function getParDocumentIds(document_ids) {
    const db = await ouvrirDB()
    const store = db.transaction(STORE_DOCUMENTS, 'readonly').store
    const documents = Promise.all( document_ids.map(document_id=>store.get(document_id)) )
    return documents
}

// cuuid falsy donne favoris
export async function getParGroupeId(userId, groupeId) {
    const db = await ouvrirDB()

    const store = db.transaction(STORE_DOCUMENTS, 'readonly').store        
    const index = store.index('useridGroupe')

    const docs = []
    let curseur = await index.openCursor([userId, groupeId])
    while(curseur) {
        const value = curseur.value
        // console.debug("getParCollection Row %O = %O", curseur, value)
        const { supprime } = value
        if(supprime === true) {
            // Supprime
        } else {
            docs.push(value)
        }
        curseur = await curseur.continue()
    }

    // console.debug('getParCollection cuuid %s userId: %s resultat collection %O, documents %O', cuuid, userId, collection, docs)

    return { documents: docs }
}

export async function getDocumentsChiffres(userId) {
    console.debug("Get documents chiffres userId ", userId)
    const db = await ouvrirDB()
    const store = db.transaction(STORE_DOCUMENTS, 'readonly').store
    const index = store.index('userid')
    let curseur = await index.openCursor(userId)
    const groupes = []
    while(curseur) {
        const value = curseur.value
        if(value.data_chiffre) groupes.push(value)
        curseur = await curseur.continue()
    }
    return groupes
}

// Supprime le contenu de idb
export async function clear() {
    const db = await ouvrirDB()
    const store = db.transaction(STORE_DOCUMENTS, 'readwrite').store
    store.clear()
}
