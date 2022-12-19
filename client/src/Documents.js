import { lazy, useState, useCallback, useEffect } from 'react'

import useWorkers from './WorkerContext'

import Button from 'react-bootstrap/Button'
import Form from 'react-bootstrap/Form'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'

import { useDispatch, useSelector } from 'react-redux'

import { setDocumentId } from './redux/documentsSlice'

import { SelectionCategorie } from './EditerGroupe'

const AfficherDocument = lazy( () => import('./AfficherDocument') )
const EditerDocument = lazy( () => import('./EditerDocument') )

function AfficherDocuments(props) {

    const groupes = useSelector(state=>state.groupes.liste)

    const [groupeId, setGroupeId] = useState('')

    const groupeIdChangeHandler = useCallback(event=>setGroupeId(event.currentTarget.value), [setGroupeId])

    return (
        <div>
            <SelectionnerGroupe groupes={groupes} onChange={groupeIdChangeHandler} />

            <p></p>

            <AfficherListeDocuments groupeId={groupeId} />

        </div>
    )
}

export default AfficherDocuments

function AfficherListeDocuments(props) {
    const { groupeId } = props

    const dispatch = useDispatch()

    const documentId = useSelector(state=>state.documents.documentId)

    const documentNewHandler = useCallback(()=>{
        dispatch(setDocumentId(true))
    }, [dispatch])

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
                <Col>Liste</Col>
                <Col>
                    <Button variant="secondary" onClick={documentNewHandler}>+ Nouveau</Button>
                </Col>
            </Row>

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