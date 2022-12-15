import React, {useState, useCallback} from 'react'

import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'

const Groupes = React.lazy( () => import('./Groupes') )

function Accueil(props) {

    return (
        <div>
            <p>Choisir option dans le menu</p>
        </div>
    )
}

export default Accueil
