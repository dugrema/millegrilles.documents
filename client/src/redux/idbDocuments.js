import { openDB } from 'idb'

const DB_NAME = 'documents',
      STORE_DOCUMENTS = 'documents',
      VERSION_COURANTE = 1

export { DB_NAME, STORE_DOCUMENTS }

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
    let documentStore = null
    try {
        /*eslint no-fallthrough: "off"*/
        switch(oldVersion) {
            case 0:
                console.debug("Creation docstore")
                documentStore = db.createObjectStore(STORE_DOCUMENTS, {keyPath: 'document_id'})
                console.debug("Creation index")
                documentStore.createIndex('useridGroupe', ['user_id', 'groupe_id'], {unique: false, multiEntry: false})
                console.debug("OK")
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
