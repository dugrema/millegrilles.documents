import { useState, useCallback, useMemo, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import Button from 'react-bootstrap/Button'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Form from 'react-bootstrap/Form'

import useWorkers, { useEtatPret } from './WorkerContext'
import { pushItems, clearItems } from './redux/categoriesSlice'

function EditerGroupe(props) {
    
    const { groupe, fermer } = props

    if(!groupe) return <p>Aucun groupe selectionne</p>

    return (
        <div>
            <Row>
                <Col xs={8} md={10} lg={11}><h2>Groupe</h2></Col>
                <Col><Button variant="secondary" onClick={fermer}>X</Button></Col>
                <FormGroupe 
                    groupe={groupe} 
                    fermer={fermer} />
            </Row>

        </div>
    )

}

export default EditerGroupe

function FormGroupe(props) {

    const { fermer } = props

    const groupe = props.groupe || {}

    const workers = useWorkers()

    const [ nomGroupe, setNomGroupe ] = useState(groupe.nom_groupe || '')
    const [ categorieId, setCategorieId ] = useState(groupe.categorie_id || '')

    const nomGroupeChangeHandler = useCallback(event=>setNomGroupe(event.currentTarget.value), [setNomGroupe])
    const categorieChangeHandler = useCallback(event=>setCategorieId(event.currentTarget.value), [setCategorieId])

    const sauvegarderGroupeHandler = useCallback(()=>{
        const commande = {
            nom_groupe: nomGroupe,
            categorie_id: categorieId,
        }
        if(groupe.groupe_id) commande.groupe_id = groupe.groupe_id

        console.debug("Sauvegarder groupe : ", commande)
        workers.connexion.sauvegarderGroupeUsager(commande)
            .then(reponse=>{
                if(reponse.ok === true) fermer()
            })
            .catch(err=>console.error("Erreur sauvegarder changements : ", err))

    }, [workers, groupe, nomGroupe, categorieId, fermer])

    return (
        <div>
            <Form.Group as={Row} controlId="nomGroupe">
                <Form.Label column sm={4} md={2}>Nom du groupe</Form.Label>
                <Col>
                    <Form.Control value={nomGroupe} onChange={nomGroupeChangeHandler} />
                </Col>
            </Form.Group>

            <SelectionCategorie value={categorieId} onChange={categorieChangeHandler} />

            <p></p>

            <Row>
                <Col>
                    <Button onClick={sauvegarderGroupeHandler}>Sauvegarder</Button>
                </Col>
            </Row>
        </div>
    )

}

function SelectionCategorie(props) {

    const { value, onChange } = props

    return (
        <Form.Group as={Row} controlId="categorieId">
            <Form.Label column sm={4} md={2}>Categorie</Form.Label>
            <Col>
                <Form.Select value={value} onChange={onChange}>
                    <SelectionCategorieOptions />
                </Form.Select>        
            </Col>
        </Form.Group>
    )
}

function SelectionCategorieOptions(props) {

    const workers = useWorkers()
    const dispatch = useDispatch()
    const etatPret = useEtatPret()
    const categories = useSelector(state=>state.categories.liste)

    useEffect(()=>{
        if(!etatPret) return

        // S'assurer d'avoir les categories les plus recentes
        workers.connexion.getCategoriesUsager()
            .then(reponse=>{
                if(reponse.categories) {
                    return dispatch(pushItems({liste: reponse.categories, clear: true}))
                } else {
                    dispatch(clearItems())
                }
            })
            .catch(err=>console.error("Erreur chargement categories : ", err))

    }, [etatPret])

    if(!categories || categories.length === 0) {
        return <option>Aucune categorie</option>
    }

    let options = categories.map(item=>{
        return (
            <option key={item.categorie_id} value={item.categorie_id}>{item.nom_categorie}</option>
        )
    })

    const optionSelect = <option key='none'>Selectionner</option>

    return [optionSelect, ...options]

}
