import React, { useState, useCallback, useEffect, useMemo } from 'react'
import { proxy as comlinkProxy } from 'comlink'
import { useDispatch, useSelector } from 'react-redux'

import Button from 'react-bootstrap/Button'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'

import useWorkers, { useEtatPret } from './WorkerContext'

import { setCategorieId, pushItems, mergeItems, clearItems } from './redux/categoriesSlice'

const EditerCategorie = React.lazy( () => import('./EditerCategorie') )


function Categories(props) {

    const workers = useWorkers()
    const dispatch = useDispatch()
    const etatPret = useEtatPret()
    
    const categories = useSelector(state=>state.categories.liste) || []
    const categorieId = useSelector(state=>state.categories.categorieId) || ''
    
    // const [categorieId, setCategorieId] = useState('')
    // const [categories, setCategories] = useState('')
    const categorie = useMemo(()=>{
        if(!categorieId) return ''
        if(categorieId === true) return {}
        return categories.filter(item=>item.categorie_id === categorieId).pop()
    }, [categories, categorieId])

    const nouvelleCategorieHandler = useCallback(()=>dispatch(setCategorieId(true)), [setCategorieId])
    const fermerEditerCategorieHandler = useCallback(()=>dispatch(setCategorieId('')), [setCategorieId])

    const categoriesMajHandler = useCallback(comlinkProxy(message => {
        console.debug("Message recu : %O", message)
        dispatch(mergeItems(message.message))
      }), [dispatch])
    
    useEffect(()=>{
        if(!etatPret) return

        workers.connexion.getCategoriesUsager()
            .then(reponse=>{
                console.debug("Reponse : ", reponse)
                if(reponse.categories) {
                    return dispatch(pushItems({liste: reponse.categories, clear: true}))
                } else {
                    dispatch(clearItems())
                }
            })
            .catch(err=>console.error("Erreur chargement categories : ", err))

        workers.connexion.ecouterEvenementsCategoriesUsager(categoriesMajHandler)
            .catch(err=>console.error("Erreur ecouterEvenementsCategoriesUsager ", err))
        return () => { 
            workers.connexion.retirerEvenementsCategoriesUsager()
                .catch(err=>console.warn("Erreur retrait listener categories ", err))
        }
      
    }, [workers, dispatch, etatPret, categoriesMajHandler])

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
    const categorieId = useSelector(state=>state.categorieId) || ''

    const setCategorieHandler = useCallback(event=>dispatch(setCategorieId(event.currentTarget.value)), [])

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