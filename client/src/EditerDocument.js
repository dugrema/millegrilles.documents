import { lazy, useState, useCallback, useEffect, useMemo } from 'react'
import useWorkers from './WorkerContext'

import Button from 'react-bootstrap/Button'
import Form from 'react-bootstrap/Form'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'

import { useDispatch, useSelector } from 'react-redux'

import { setDocId } from './redux/documentsSlice'

const ChampQuill = lazy( () => import('./ChampQuill') )

function EditerDocument(props) {

    const { groupeId, editer } = props

    const workers = useWorkers()
    const dispatch = useDispatch()
    const docId = useSelector(state=>state.documents.docId)
    const groupes = useSelector(state=>state.groupes.liste)
    const categories = useSelector(state=>state.categories.liste)
    const listeDocuments = useSelector(state=>state.documents.liste)

    const [contenuDocument, setContenuDocument] = useState('')

    const onContenuChangeHandler = useCallback(event=>{
        const {name, value} = event.currentTarget
        const contenu = {...contenuDocument, [name]: value}
        setContenuDocument(contenu)
    }, [contenuDocument, setContenuDocument])

    const [groupe, categorie] = useMemo(()=>{
        if(!categories || !groupes || !groupeId) return [null, null]
        const groupe = groupes.filter(item=>item.groupe_id === groupeId).pop()
        if(!groupe) return [null, null]
        const categorieId = groupe.categorie_id
        const categorie = categories.filter(item=>item.categorie_id === categorieId).pop()
        return [groupe, categorie]
    }, [categories, groupes, groupeId])

    const fermerHandler = useCallback(()=>{
        editer(false)
        dispatch(setDocId(null))
    }, [dispatch, editer])

    const sauvegarderHandler = useCallback(event=>{
        console.debug("sauvegarder : %O dans groupe %O, categorie: %O", contenuDocument, groupe, categorie)
        const ref_hachage_bytes = groupe.ref_hachage_bytes
        const commande = {
            groupe_id: groupe.groupe_id,
            categorie_version: categorie.version,
        }
        if(docId && docId !== true) commande.doc_id = docId
        
        workers.clesDao.getCles(ref_hachage_bytes)
            .then( async cle => {
                cle = cle[ref_hachage_bytes]
                console.debug("Cle pour chiffrer document : ", cle)
                const champsChiffres = await workers.chiffrage.chiffrage.updateChampsChiffres(contenuDocument, cle.cleSecrete)
                console.debug("Champs chiffres ", champsChiffres)
                Object.assign(commande, champsChiffres)

                const reponse = await workers.connexion.sauvegarderDocument(commande)
                console.debug("Reponse sauvegarder document ", reponse)
                fermerHandler()
            })
            .catch(err=>console.error("Erreur sauvegarde document ", err))
    }, [workers, categorie, groupe, docId, contenuDocument, fermerHandler])

    // Copier contenu du document sur init
    useEffect(()=>{
        // Todo : detecter si nouveau doc ou existant
        const contenuDocument = {}
        if(typeof(docId) === 'string') {
            // Chargement document
            const docInfo = listeDocuments.filter(item=>item.doc_id === docId).pop()
            if(docInfo) {
                Object.assign(contenuDocument, docInfo)
            }
        }

        // Initialiser champs manquants
        for(const champ of categorie.champs) {
            const code_interne_champ = champ.code_interne
            if(contenuDocument[code_interne_champ] === undefined) {
                contenuDocument[code_interne_champ] = null  // Initialiser champ
            }
        }

        setContenuDocument(contenuDocument)

    }, [listeDocuments, categorie, docId, setContenuDocument])

    if(!groupe) return ''

    return (
        <div>
            <MasqueContenu 
                categorie={categorie} 
                contenu={contenuDocument} 
                onChange={onContenuChangeHandler} />

            <p></p>

            <Row>
                <Col>
                    <Button onClick={sauvegarderHandler}>Sauvegarder</Button>
                    <Button variant="secondary" onClick={fermerHandler}>Annuler</Button>
                </Col>
            </Row>
        </div>
    )
}

export default EditerDocument

function MasqueContenu(props) {
    const { categorie, contenu, onChange={onChange} } = props

    return categorie.champs.map((item, idx)=>{
        const valeurContenu = contenu[item.code_interne] || ''

        // Certains champs prennent toujours toute la largeur de l'ecran
        let colWidth = {md: 3, xl: 2}
        if(['html'].includes(item.type_champ)) {
            colWidth = {}
        }

        return (
            <Row key={idx}>
                <Col xs={12} {...colWidth}>{item.nom_champ}</Col>
                <Col>
                    <ChampInput champ={item} valeur={valeurContenu} onChange={onChange} />
                </Col>
            </Row>
        )
    })
}

function ChampInput(props) {
    const { champ, valeur, onChange } = props

    const typeChamp = champ.type_champ

    if(typeChamp === 'text') {
        return (
            <Form.Control name={champ.code_interne} value={valeur} onChange={onChange} />
        )
    } else if(typeChamp === 'number') {
        return (
            <Form.Control name={champ.code_interne} value={valeur} onChange={onChange} />
        )
    } else if(typeChamp === 'password') {
        return (
            <Form.Control name={champ.code_interne} value={valeur} onChange={onChange} />
        )
    } else if(typeChamp === 'html') {
        return (
            <ChampQuill name={champ.code_interne} value={valeur} onChange={onChange} />
        )
    } else {
        return <p>Type de champ non supporte</p>
    }

}
