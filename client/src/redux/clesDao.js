import multibase from 'multibase'

const CONST_TIMEOUT_CERTIFICAT = 2 * 60 * 1000

function build(workers) {

    let cacheCertificatsMaitredescles = null

    return {
        // Recupere une liste de cles, les conserve dans le usagerDao (cache) si applicable
        getCles(liste_hachage_bytes) {
            return getCles(workers, liste_hachage_bytes)
        },
        getCertificatsMaitredescles() {
            if(cacheCertificatsMaitredescles) return cacheCertificatsMaitredescles
            return getCertificatsMaitredescles(workers)
                .then(reponse=>{
                    cacheCertificatsMaitredescles = reponse
                    setTimeout(()=>{
                        cacheCertificatsMaitredescles = null
                    }, CONST_TIMEOUT_CERTIFICAT)
                    return reponse
                  })
        }
    }
}

export default build

async function getCles(workers, liste_hachage_bytes) {

    if(typeof(liste_hachage_bytes) === 'string') liste_hachage_bytes = [liste_hachage_bytes]

    const { connexion, chiffrage, usagerDao } = workers

    const clesManquantes = [],
          clesDechiffrees = {}

    // Recuperer cles connues localement
    for await (const hachage_bytes of liste_hachage_bytes) {
        const cleDechiffree = await usagerDao.getCleDechiffree(hachage_bytes)
        if(cleDechiffree) {
            clesDechiffrees[hachage_bytes] = cleDechiffree
        } else {
            clesManquantes.push(hachage_bytes)
        }
    }

    // console.debug("Cles connues : %d, cles manquantes : %d", Object.keys(clesDechiffrees).length, clesManquantes.length)
    if(clesManquantes.length > 0) {
        // Recuperer les cles du serveur
        const reponseClesChiffrees = await connexion.getClesGroupes(liste_hachage_bytes)
        console.debug("getCles reponseClesChiffrees ", reponseClesChiffrees)
        for (const infoCle of reponseClesChiffrees.cles) {
            const cleId = infoCle.cle_id
            // const cleSecrete = await chiffrage.dechiffrerCleSecrete(infoCle.cle)
            const cleSecrete = multibase.decode('m' + infoCle.cle_secrete_base64)

            infoCle.cleSecrete = cleSecrete
            delete infoCle.cle_secrete_base64

            // Sauvegarder la cle pour reutilisation
            usagerDao.saveCleDechiffree(cleId, cleSecrete, infoCle)
                .catch(err=>{
                    console.warn("clesDao.getCles Erreur sauvegarde cle dechiffree %s dans la db locale", err)
                })
        
            clesDechiffrees[cleId] = infoCle
        }
    }

    return clesDechiffrees
}

async function getCertificatsMaitredescles(workers) {
    const { connexion } = workers
    return connexion.getCertificatsMaitredescles()
}
