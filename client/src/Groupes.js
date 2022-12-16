import React, { useCallback, useEffect, useMemo } from 'react'
import { proxy as comlinkProxy } from 'comlink'
import { useDispatch, useSelector } from 'react-redux'

import Button from 'react-bootstrap/Button'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'

import useWorkers, { useEtatPret } from './WorkerContext'
import { setGroupeId, pushItems, mergeItems, clearItems } from './redux/groupesSlice'

const EditerGroupe = React.lazy( () => import('./EditerGroupe') )

function AfficherGroupes(props) {

    const workers = useWorkers()
    const dispatch = useDispatch()
    
    // Categories et groupes charges sous App.js/ApplicationDocuments
    const categories = useSelector(state=>state.categories.liste)
    const groupes = useSelector(state=>state.groupes.liste)
    const groupeId = useSelector(state=>state.groupes.groupeId) || ''
    
    const groupe = useMemo(()=>{
        if(!groupes || !groupeId) return ''
        if(groupeId === true) return {}
        return groupes.filter(item=>item.groupe_id === groupeId).pop()
    }, [groupes, groupeId])

    const nouveauGroupeHandler = useCallback(()=>dispatch(setGroupeId(true)), [dispatch])
    const fermerEditerGroupeHandler = useCallback(()=>dispatch(setGroupeId('')), [dispatch])

    // const groupesMajHandler = useCallback(comlinkProxy(message => {
    //     dispatch(mergeItems(message.message))
    //   }), [dispatch])
    
    // useEffect(()=>{
    //     if(!etatPret) return

    //     workers.connexion.getGroupesUsager()
    //         .then(reponse=>{
    //             console.debug("Reponse : ", reponse)
    //             if(reponse.groupes) {
    //                 return dispatch(pushItems({liste: reponse.groupes, clear: true}))
    //             } else {
    //                 dispatch(clearItems())
    //             }
    //         })
    //         .catch(err=>console.error("Erreur chargement groupes : ", err))


    //     workers.connexion.ecouterEvenementsGroupesUsager(groupesMajHandler)
    //         .catch(err=>console.error("Erreur ecouterEvenementsGroupesUsager ", err))

    //     return () => { 
    //         workers.connexion.retirerEvenementsGroupesUsager()
    //             .catch(err=>console.warn("Erreur retrait listener groupes ", err))
    //     }
      
    // }, [workers, dispatch, etatPret, groupesMajHandler])

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

    const setGroupeHandler = useCallback(event=>dispatch(setGroupeId(event.currentTarget.value)), [dispatch])

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
