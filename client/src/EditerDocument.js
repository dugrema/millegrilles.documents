import { useState, useCallback, useEffect } from 'react'
import useWorkers from './WorkerContext'

import Button from 'react-bootstrap/Button'
import Form from 'react-bootstrap/Form'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'

import { useDispatch, useSelector } from 'react-redux'

import { setDocumentId } from './redux/documentsSlice'

function EditerDocument(props) {

    const dispatch = useDispatch()

    const fermerHandler = useCallback(()=>dispatch(setDocumentId(null)))

    return (
        <div>
            <p>Editer document</p>
            <p></p>
            <Row>
                <Col>
                    <Button onClick={fermerHandler}>Annuler</Button>
                </Col>
            </Row>
        </div>
    )
}

export default EditerDocument
