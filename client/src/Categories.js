import React, { useState, useCallback, useEffect, useMemo } from 'react'
import { proxy as comlinkProxy } from 'comlink'

import Button from 'react-bootstrap/Button'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'

import useWorkers, { useEtatPret } from './WorkerContext'

const EditerCategorie = React.lazy( () => import('./EditerCategorie') )


function Categories(props) {

    const workers = useWorkers()
    const etatPret = useEtatPret()

    const [categorieId, setCategorieId] = useState('')
    const [categories, setCategories] = useState('')
    const categorie = useMemo(()=>{
        if(!categorieId) return ''
        if(categorieId === true) return {}
        return categories.filter(item=>item.categorie_id === categorieId).pop()
    }, [categories, categorieId])

    const nouvelleCategorieHandler = useCallback(()=>setCategorieId(true), [setCategorieId])
    const fermerEditerCategorieHandler = useCallback(()=>setCategorieId(''), [setCategorieId])

    const categoriesChangeesHandler = useCallback(comlinkProxy(message => {
        console.debug("Message recu : %O", message)
        // traiterLecture(instance.instance_id, message, _contexteCallback.listeSenseurs, _contexteCallback.setListeSenseurs)
      }), [setCategories])
    
    useEffect(()=>{
        if(!etatPret) return

        workers.connexion.getCategoriesUsager()
            .then(reponse=>{
                console.debug("Reponse : ", reponse)
                if(reponse.categories) return setCategories(reponse.categories)
                setCategories('')
            })
            .catch(err=>console.error("Erreur chargement categories : ", err))

        workers.connexion.ecouterEvenementsCategoriesUsager(categoriesChangeesHandler)
            .catch(err=>console.error("Erreur ecouterEvenementsCategoriesUsager ", err))
        return () => { 
            workers.connexion.retirerEvenementsCategoriesUsager()
                .catch(err=>console.warn("Erreur retrait listener categories ", err))
        }
      
    }, [workers, etatPret, setCategories, categoriesChangeesHandler])

    if(categorie) {
        return (
            <EditerCategorie categorie={categorie} fermer={fermerEditerCategorieHandler} />
        )
    }

    return (
        <div>
            <h3>Categories</h3>

            <ListeCategories categories={categories} setCategorieId={setCategorieId} />

            <Button variant="secondary" onClick={nouvelleCategorieHandler}>Nouvelle</Button>
        </div>
    )
}

export default Categories

function ListeCategories(props) {

    const { categories, setCategorieId } = props

    const setCategorieHandler = useCallback(event=>setCategorieId(event.currentTarget.value), [setCategorieId])

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