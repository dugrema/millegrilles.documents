import { Suspense, lazy, useState, useCallback, useEffect, useMemo } from 'react'
import { proxy as comlinkProxy } from 'comlink'

import useWorkers, { useUsager, useEtatPret } from './WorkerContext'

import Button from 'react-bootstrap/Button'
import Form from 'react-bootstrap/Form'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'

import { useDispatch, useSelector } from 'react-redux'

import { setUserId, setGroupeId, setDocId, setSortKeys as setSortKeysDocuments, thunks as thunksDocuments } from './redux/documentsSlice'

const AfficherDocument = lazy( () => import('./AfficherDocument') )
const EditerDocument = lazy( () => import('./EditerDocument') )

function AfficherDocuments(props) {

    const dispatch = useDispatch()
    const usager = useUsager()
    const etatPret = useEtatPret()

    const groupes = useSelector(state=>state.groupes.liste)

    const groupeIdChangeHandler = useCallback(event=>{
        const groupeId = event.currentTarget.value
        dispatch(setGroupeId(groupeId))
    }, [dispatch])

    useEffect(()=>{
        if(!etatPret || !usager) return
    
        const userId = usager.extensions.userId
        dispatch(setUserId(userId))
    }, [dispatch, usager, etatPret])

    return (
        <div>
            <SelectionnerGroupe groupes={groupes} onChange={groupeIdChangeHandler} />

            <p></p>

            <Suspense fallback={<Attente />}>
                <AfficherListeDocuments />
            </Suspense>

        </div>
    )
}

export default AfficherDocuments

function AfficherListeDocuments(props) {
    
    const dispatch = useDispatch()
    const workers = useWorkers()
    const etatPret = useEtatPret()
    const groupeId = useSelector(state=>state.documents.groupeId)
    const docId = useSelector(state=>state.documents.docId)
    const groupes = useSelector(state=>state.groupes.liste)
    const categories = useSelector(state=>state.categories.liste)
    const listeDocuments = useSelector(state=>state.documents.liste) || []
    const listeRecue = useSelector(state=>state.documents.listeRecue) || false

    const [editer, setEditer] = useState(false)

    const groupe = useMemo(()=>{
        if(!groupes || !groupeId) return null
        return groupes.filter(item=>item.groupe_id === groupeId).pop()
    }, [groupes, groupeId])

    const categorie = useMemo(()=>{
        if(!groupe || !categories) return null
        const categorieId = groupe.categorie_id
        return categories.filter(item=>item.categorie_id === categorieId).pop()
    }, [groupe, categories])

    const documentsMajHandler = useCallback(comlinkProxy(message => {
        console.debug("Message document recu : ", message)
        // dispatch(documentsMergeItems(message.message))
        const docCleanup = {...message.message}
        delete docCleanup['_signature']
        delete docCleanup['_certificat']
        delete docCleanup['en-tete']
        delete docCleanup.certificat
        dispatch(thunksDocuments.recevoirDocument(workers, docCleanup))
            .catch(err=>console.error("Erreur reception maj document ", err))
      }), [dispatch])
    
    const documentNewHandler = useCallback(()=>dispatch(setDocId(true)), [dispatch])
    const docIdChangeHandler = useCallback(event => dispatch(setDocId(event.currentTarget.value)), [dispatch])
    const editerHandler = useCallback(event=>{
        if(event && event.currentTarget) {
            setEditer(event.currentTarget.value==='true')
        } else if(event === true) {
            setEditer(true)
        } else {
            setEditer(false)
        }
    }, [setEditer])

    useEffect(()=>{
        if(!etatPret) return

        // Mettre listener en place pour les documents de l'usager (tous les groupes)
        workers.connexion.ecouterEvenementsDocumentsUsager(documentsMajHandler)
          .catch(err=>console.error("Erreur ecouterEvenementsDocumentsUsager ", err))
    
        return () => { 
          workers.connexion.retirerEvenementsDocumentsUsager()
            .catch(err=>console.warn("Erreur retrait listener documents usager ", err))
        }

    }, [workers, dispatch, etatPret, documentsMajHandler])

    useEffect(()=>{
        if(!groupe || !categorie || categorie.categorie_id !== groupe.categorie_id) return
        
        // Maj tri des documents
        const champLabel = categorie.champs[0]
        const code_interne = champLabel.code_interne
        dispatch(setSortKeysDocuments({key: code_interne, ordre: 1}))

        dispatch(thunksDocuments.rafraichirDocuments(workers))
            .catch(err=>console.error("Erreur chargement documents ", err))
    }, [workers, dispatch, groupe, categorie])

    if(docId === true || editer === true) {
        return (
            <EditerDocument groupeId={groupeId} editer={editerHandler} />
        )
    } else if(docId) {
        return (
            <AfficherDocument groupeId={groupeId} editer={editerHandler} />
        )
    }

    if(!groupe || !categorie) return ''

    if(!listeRecue) return <p>Chargement en cours</p>

    return (
        <div>
            <p></p>

            <Row>
                <Col>Liste de {listeDocuments.length} documents</Col>
                <Col>
                    <Button variant="secondary" onClick={documentNewHandler}>+ Nouveau</Button>
                </Col>
            </Row>

            {listeDocuments.map(item=>(
                <DocumentRow key={item.doc_id} 
                    value={item} 
                    groupe={groupe} 
                    categorie={categorie} 
                    setDocId={docIdChangeHandler} />
            ))}

        </div>
    )
}

export function SelectionnerGroupe(props) {
    const { value, onChange, groupes } = props

    const docId = useSelector(state=>state.documents.docId)

    return (
        <Form.Group as={Row} controlId="groupeId">
            <Form.Label column sm={4} md={2}>Groupe</Form.Label>
            <Col>
                <Form.Select value={value} onChange={onChange} disabled={!!docId}>
                    <SelectionGroupeOptions groupes={groupes} />
                </Form.Select>        
            </Col>
        </Form.Group>
    )
}

function SelectionGroupeOptions(props) {

    const { groupes } = props

    if(!groupes || groupes.length === 0) {
        return <option>Aucuns groupes configures.</option>
    }

    let options = groupes.map(item=>{
        const label = item.nom_groupe || item.groupe_id
        return (
            <option key={item.groupe_id} value={item.groupe_id}>{label}</option>
        )
    })

    const optionSelect = <option key='none'>Selectionner</option>

    return [optionSelect, ...options]

}

function DocumentRow(props) {

    const { value, categorie, setDocId } = props

    const champLabel = categorie.champs[0]
    const idChampLabel = champLabel.code_interne
    const label = value[idChampLabel] || value.doc_id

    return (
        <Row>
            <Col>
                <Button variant="link" onClick={setDocId} value={value.doc_id}>
                    {label}
                </Button>
            </Col>
        </Row>
    )
}

function Attente(_props) {
    return (
        <div>
            <p>Veuillez patienter durant le chargement de la section.</p>
        </div>
    )
}
