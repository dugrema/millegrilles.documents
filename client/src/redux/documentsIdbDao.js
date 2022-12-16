import { ouvrirDB, STORE_DOCUMENTS } from './idbDocuments'

// const STORE_DOCUMENTS = 'documents'

export function init() {
    return ouvrirDB()
}

// Met dirty a true et dechiffre a false si mismatch derniere_modification
export async function syncDocuments(docs) {
    if(!docs) return []

    const db = await ouvrirDB()
    const store = db.transaction(STORE_DOCUMENTS, 'readwrite').store

    let dirtyDocs = []
    for await (const infoDoc of docs) {
        const { document_id, derniere_modification } = infoDoc
        const documentDoc = await store.get(document_id)
        if(documentDoc) {
            if(derniere_modification !== documentDoc.derniere_modification) {
                // Fichier connu avec une date differente
                dirtyDocs.push(document_id)
                if(documentDoc.dirty !== false) {
                    // Conserver flag dirty
                    documentDoc.dirty = true
                    await store.put(documentDoc)
                }
            } else if(documentDoc.dirty) {
                // Flag existant
                dirtyDocs.push(document_id)
            }
        } else {
            // Fichier inconnu
            dirtyDocs.push(document_id)
        }
    }

    return dirtyDocs
}

// opts {merge: true, dechiffre: true}, met dirty a false
export async function updateDocument(doc, opts) {
    opts = opts || {}

    const { document_id, user_id } = doc
    if(!document_id) throw new Error('updateDocument document_id doit etre fourni')
    if(!user_id) throw new Error('updateDocument user_id doit etre fourni')

    const flags = ['dirty', 'dechiffre', 'expiration']
          
    const db = await ouvrirDB()
    const store = db.transaction(STORE_DOCUMENTS, 'readwrite').store
    const documentDoc = (await store.get(document_id)) || {}
    Object.assign(documentDoc, doc)
    
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
export async function getParGroupe(groupeId, userId) {
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

// Supprime le contenu de idb
export async function clear() {
    const db = await ouvrirDB()
    const store = db.transaction(STORE_DOCUMENTS, 'readwrite').store
    store.clear()
}
