import { openDB } from 'idb'

const DB_NAME = 'documents',
      STORE_DOCUMENTS = 'documents',
      STORE_GROUPES = 'groupes',
      STORE_CATEGORIES = 'categories',
      VERSION_COURANTE = 1

export { DB_NAME, STORE_DOCUMENTS, STORE_GROUPES, STORE_CATEGORIES }

export function ouvrirDB(opts) {
    opts = opts || {}

    return openDB(DB_NAME, VERSION_COURANTE, {
        upgrade(db, oldVersion) {
            createObjectStores(db, oldVersion)
        },
        blocked() {
            console.error("OpenDB %s blocked", DB_NAME)
        },
        blocking() {
            console.warn("OpenDB, blocking")
        }
    })

}

function createObjectStores(db, oldVersion) {
    let documentStore = null, groupeStore = null, categorieStore = null
    try {
        /*eslint no-fallthrough: "off"*/
        switch(oldVersion) {
            case 0:
                categorieStore = db.createObjectStore(STORE_CATEGORIES, {keyPath: 'categorie_id'})
                categorieStore.createIndex('userid', 'user_id', {unique: false, multiEntry: false})

                groupeStore = db.createObjectStore(STORE_GROUPES, {keyPath: 'groupe_id'})
                groupeStore.createIndex('userid', 'user_id', {unique: false, multiEntry: false})

                documentStore = db.createObjectStore(STORE_DOCUMENTS, {keyPath: 'doc_id'})
                documentStore.createIndex('userid', 'user_id', {unique: false, multiEntry: false})
                documentStore.createIndex('useridGroupe', ['user_id', 'groupe_id'], {unique: false, multiEntry: false})
            case 1: // Plus recent, rien a faire
                break
            default:
                console.warn("createObjectStores Default..., version %O", oldVersion)
        }
    } catch(err) {
        console.error("Erreur preparation IDB : ", err)
        throw err
    }
}

export async function clearContenuDechiffre() {
    const db = await ouvrirDB()
    await db.transaction(STORE_GROUPES, 'readwrite').store.clear()
    await db.transaction(STORE_DOCUMENTS, 'readwrite').store.clear()

    // TODO : deplacer vers section globale
    const dbMillegrille = await openDB('millegrilles')
    await dbMillegrille.transaction('clesDechiffrees', 'readwrite').store.clear()
}
