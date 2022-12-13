import { useCallback } from 'react'

import Button from 'react-bootstrap/Button'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'

function Categories(props) {

    const { setCategorieId } = props

    const nouvelleCategorieHandler = useCallback(()=>setCategorieId(true), [setCategorieId])

    return (
        <div>
            <h3>Categories</h3>
            <Button variant="secondary" onClick={nouvelleCategorieHandler}>Nouvelle</Button>
        </div>
    )
}

export default Categories
