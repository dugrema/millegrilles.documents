import {lazy} from 'react'

const Documents = lazy( () => import('./Documents') )

function Accueil(props) {

    return (
        <div>
            <Documents />
        </div>
    )
}

export default Accueil
