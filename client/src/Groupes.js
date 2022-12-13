import { useCallback } from 'react'

import Button from 'react-bootstrap/Button'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'

function AfficherGroupes(props) {

    const { setGroupeId } = props

    const nouveauGroupeHandler = useCallback(()=>setGroupeId(true), [setGroupeId])

    return (
        <div>
            <h3>Groupes</h3>

            <Button variant="secondary" onClick={nouveauGroupeHandler}>Nouveau</Button>

            <Row>
                <Col>Groupe</Col>
                <Col>Nombre documents</Col>
                <Col>Nouveau</Col>
            </Row>

        </div>
    )
}

export default AfficherGroupes
