import React, { useCallback, useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import Button from 'react-bootstrap/Button'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'

import { setCategorieId } from './redux/categoriesSlice'

const EditerCategorie = React.lazy( () => import('./EditerCategorie') )


function Categories(props) {

    const dispatch = useDispatch()
    
    // Les categories sont mises a jour dans App.js/ApplicationDocuments
    const categories = useSelector(state=>state.categories.liste)
    const categorieId = useSelector(state=>state.categories.categorieId) || ''
    
    const categorie = useMemo(()=>{
        if(!categorieId || !categories) return ''
        if(categorieId === true) return {}
        return categories.filter(item=>item.categorie_id === categorieId).pop()
    }, [categories, categorieId])

    const nouvelleCategorieHandler = useCallback(()=>dispatch(setCategorieId(true)), [dispatch])
    const fermerEditerCategorieHandler = useCallback(()=>dispatch(setCategorieId('')), [dispatch])

    if(categorie) {
        return (
            <EditerCategorie categorie={categorie} fermer={fermerEditerCategorieHandler} />
        )
    }

    return (
        <div>
            <h3>Categories</h3>

            <ListeCategories />

            <Button variant="secondary" onClick={nouvelleCategorieHandler}>Nouvelle</Button>
        </div>
    )
}

export default Categories

function ListeCategories(props) {

    const dispatch = useDispatch()

    const categories = useSelector(state=>state.categories.liste) || []

    const setCategorieHandler = useCallback(event=>dispatch(setCategorieId(event.currentTarget.value)), [dispatch])

    if(!categories || categories.length === 0) return (
        <p>Aucune categorie</p>
    )

    return categories.map(item=>{
        return (
            <Row key={item.categorie_id}>
                <Col>
                    <Button variant="link" onClick={setCategorieHandler} value={item.categorie_id}>
                        {item.nom_categorie}
                    </Button>
                </Col>
            </Row>
        )
    })
}