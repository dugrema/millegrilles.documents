import React, {useState, useCallback} from 'react'

import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'

const Groupes = React.lazy( () => import('./Groupes') )
const Categories = React.lazy( () => import('./Categories') )

function Accueil(props) {

    const { setGroupeId, setCategorieId } = props

    return (
        <div>
            <Groupes setGroupeId={setGroupeId} />
            <Categories setCategorieId={setCategorieId} />
        </div>
    )
}

export default Accueil
