import { useState, useCallback, useMemo, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import Button from 'react-bootstrap/Button'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Form from 'react-bootstrap/Form'

import useWorkers, { useEtatPret } from './WorkerContext'
import { pushItems, clearItems } from './redux/categoriesSlice'

function EditerGroupe(props) {
    
    const { categories, groupe, fermer } = props

    if(!groupe) return <p>Aucun groupe selectionne</p>

    return (
        <div>
            <Row>
                <Col xs={8} md={10} lg={11}><h2>Groupe</h2></Col>
                <Col><Button variant="secondary" onClick={fermer}>X</Button></Col>
                <FormGroupe 
                    categories={categories}
                    groupe={groupe} 
                    fermer={fermer} />
            </Row>

        </div>
    )

}

export default EditerGroupe

function FormGroupe(props) {

    const { categories, fermer } = props

    const groupe = props.groupe || {}
    const groupe_id = groupe.groupe_id

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

            <SelectionCategorie 
                categories={categories}
                value={categorieId} 
                onChange={categorieChangeHandler} 
                groupeId={groupe_id} />

            <p></p>

            <Row>
                <Col>
                    <Button onClick={sauvegarderGroupeHandler}>Sauvegarder</Button>
                </Col>
            </Row>
        </div>
    )

}

export  function SelectionCategorie(props) {

    const { groupeId, value, onChange, categories } = props

    const categorie = useMemo(()=>{
        if(!categories || !value) return ''
        return categories.filter(item=>item.categorie_id===value).pop()
    }, [value, categories])

    return (
        <Form.Group as={Row} controlId="categorieId">
            <Form.Label column sm={4} md={2}>Categorie</Form.Label>
            <Col>
                {(groupeId && value)?
                    <p>{categorie.nom_categorie}</p>
                :
                    <Form.Select value={value} onChange={onChange} disabled={!!groupeId}>
                        <SelectionCategorieOptions categories={categories} />
                    </Form.Select>        
                }
            </Col>
        </Form.Group>
    )
}

function SelectionCategorieOptions(props) {

    const { categories } = props

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
