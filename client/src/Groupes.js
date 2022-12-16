import React, { useState, useCallback, useEffect, useMemo } from 'react'
import { proxy as comlinkProxy } from 'comlink'
import { useDispatch, useSelector } from 'react-redux'

import Button from 'react-bootstrap/Button'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'

import useWorkers, { useEtatPret } from './WorkerContext'
import { setGroupeId, pushItems, mergeItems, clearItems } from './redux/groupesSlice'
import { pushItems as categoriePushItems, mergeItems as categoriesMergeItems } from './redux/categoriesSlice'

const EditerGroupe = React.lazy( () => import('./EditerGroupe') )

function AfficherGroupes(props) {

    const workers = useWorkers()
    const dispatch = useDispatch()
    const etatPret = useEtatPret()
    
    const categories = useSelector(state=>state.categories.liste)
    const groupes = useSelector(state=>state.groupes.liste) || []
    const groupeId = useSelector(state=>state.groupes.groupeId) || ''
    
    const groupe = useMemo(()=>{
        if(!groupeId) return ''
        if(groupeId === true) return {}
        return groupes.filter(item=>item.groupe_id === groupeId).pop()
    }, [groupes, groupeId])

    const nouveauGroupeHandler = useCallback(()=>dispatch(setGroupeId(true)), [setGroupeId])
    const fermerEditerGroupeHandler = useCallback(()=>dispatch(setGroupeId('')), [setGroupeId])

    const groupesMajHandler = useCallback(comlinkProxy(message => {
        dispatch(mergeItems(message.message))
      }), [dispatch])

    const categoriesMajHandler = useCallback(comlinkProxy(message => {
        dispatch(categoriesMergeItems(message.message))
      }), [dispatch])
    
    useEffect(()=>{
        if(!etatPret) return

        workers.connexion.getGroupesUsager()
            .then(reponse=>{
                console.debug("Reponse : ", reponse)
                if(reponse.groupes) {
                    return dispatch(pushItems({liste: reponse.groupes, clear: true}))
                } else {
                    dispatch(clearItems())
                }
            })
            .catch(err=>console.error("Erreur chargement groupes : ", err))

        // S'assurer d'avoir les categories les plus recentes
        workers.connexion.getCategoriesUsager()
            .then(reponse=>{
                if(reponse.categories) {
                    return dispatch(categoriePushItems({liste: reponse.categories, clear: true}))
                }
            })
            .catch(err=>console.error("Erreur chargement categories : ", err))

        workers.connexion.ecouterEvenementsGroupesUsager(groupesMajHandler)
            .catch(err=>console.error("Erreur ecouterEvenementsGroupesUsager ", err))

        workers.connexion.ecouterEvenementsCategoriesUsager(categoriesMajHandler)
            .catch(err=>console.error("Erreur ecouterEvenementsCategoriesUsager ", err))

        return () => { 
            workers.connexion.retirerEvenementsGroupesUsager()
                .catch(err=>console.warn("Erreur retrait listener groupes ", err))
            workers.connexion.retirerEvenementsCategoriesUsager()
                .catch(err=>console.warn("Erreur retrait listener categories ", err))
        }
      
    }, [workers, dispatch, etatPret, groupesMajHandler])

    if(groupe) {
        return (
            <EditerGroupe 
                groupe={groupe} 
                categories={categories}
                fermer={fermerEditerGroupeHandler} />
        )
    }

    return (
        <div>
            <h3>Groupes</h3>

            <ListeGroupes categories={categories} />

            <Button variant="secondary" onClick={nouveauGroupeHandler}>+ Nouveau</Button>
        </div>
    )

}

export default AfficherGroupes

function ListeGroupes(props) {

    const dispatch = useDispatch()

    const groupes = useSelector(state=>state.groupes.liste) || []

    const setGroupeHandler = useCallback(event=>dispatch(setGroupeId(event.currentTarget.value)), [])

    if(!groupes || groupes.length === 0) return (
        <p>Aucun groupe</p>
    )

    return groupes.map(item=>{
        return (
            <Row key={item.groupe_id}>
                <Col>
                    <Button variant="link" onClick={setGroupeHandler} value={item.groupe_id}>
                        {item.nom_groupe}
                    </Button>
                </Col>
            </Row>
        )
    })
}
