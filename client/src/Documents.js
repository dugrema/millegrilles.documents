import { lazy, useState, useCallback, useEffect, useMemo } from 'react'
import { proxy as comlinkProxy } from 'comlink'

import useWorkers, { useUsager, useEtatPret } from './WorkerContext'

import Button from 'react-bootstrap/Button'
import Form from 'react-bootstrap/Form'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'

import { useDispatch, useSelector } from 'react-redux'

import { setUserId, setGroupeId, setDocumentId, mergeItems as documentsMergeItems, thunks as thunksDocuments } from './redux/documentsSlice'

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
    }, [dispatch, usager])

    return (
        <div>
            <SelectionnerGroupe groupes={groupes} onChange={groupeIdChangeHandler} />

            <p></p>

            <AfficherListeDocuments />

        </div>
    )
}

export default AfficherDocuments

function AfficherListeDocuments(props) {
    
    const dispatch = useDispatch()
    const workers = useWorkers()
    const etatPret = useEtatPret()
    const groupeId = useSelector(state=>state.documents.groupeId)
    const documentId = useSelector(state=>state.documents.documentId)
    const groupes = useSelector(state=>state.groupes.liste)
    const categories = useSelector(state=>state.categories.liste)
    const listeDocuments = useSelector(state=>state.documents.liste) || []

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
        dispatch(documentsMergeItems(message.message))
      }), [dispatch])
    
    const documentNewHandler = useCallback(()=>{
        dispatch(setDocumentId(true))
    }, [dispatch])

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
        dispatch(thunksDocuments.rafraichirDocuments(workers))
            .catch(err=>console.error("Erreur chargement documents ", err))
    }, [workers, dispatch, groupe, categorie])

    if(documentId === true) {
        return (
            <EditerDocument groupeId={groupeId} />
        )
    } else if(documentId) {
        return (
            <AfficherDocument />            
        )
    }

    if(!groupeId) return ''
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
                <DocumentRow key={item.doc_id} value={item} groupe={groupe} categorie={categorie} />
            ))}

        </div>
    )
}

export function SelectionnerGroupe(props) {
    const { value, onChange, groupes } = props

    const documentId = useSelector(state=>state.documents.documentId)

    return (
        <Form.Group as={Row} controlId="groupeId">
            <Form.Label column sm={4} md={2}>Groupe</Form.Label>
            <Col>
                <Form.Select value={value} onChange={onChange} disabled={!!documentId}>
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

    const { value, categorie } = props

    const label = value.doc_id

    return (
        <Row>
            <Col>{label}</Col>
        </Row>
    )
}
