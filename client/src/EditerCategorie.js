import { useCallback } from 'react'

import Button from 'react-bootstrap/Button'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'


function EditerCategorie(props) {

    const { fermer } = props

    return (
        <div>
            <Row>
                <Col xs={8} md={10} lg={11}><h2>Categorie</h2></Col>
                <Col><Button variant="secondary" onClick={fermer}>X</Button></Col>
            </Row>

        </div>
    )
}

export default EditerCategorie
