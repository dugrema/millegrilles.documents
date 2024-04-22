import { useState, useCallback, useMemo } from 'react'

import Button from 'react-bootstrap/Button'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Form from 'react-bootstrap/Form'

import useWorkers, { useUsager } from './WorkerContext'

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
    const usager = useUsager()

    const userId = useMemo(()=>{
        if(!usager || !usager.extensions) return null
        return usager.extensions.userId
    }, [usager])

    const [ nomGroupe, setNomGroupe ] = useState(groupe.nom_groupe || '')
    const [ categorieId, setCategorieId ] = useState(groupe.categorie_id || '')
    const [ securiteGroupe, setSecuriteGroupe ] = useState(groupe.securite_groupe || 'groupe')

    const nomGroupeChangeHandler = useCallback(event=>setNomGroupe(event.currentTarget.value), [setNomGroupe])
    const categorieChangeHandler = useCallback(event=>setCategorieId(event.currentTarget.value), [setCategorieId])
    const securiteChangeHandler = useCallback(event=>setSecuriteGroupe(event.currentTarget.value), [setSecuriteGroupe])

    const sauvegarderGroupeHandler = useCallback(()=>{
        Promise.resolve()
            .then(async () => {
                const metadataDechiffre = {
                    nom_groupe: nomGroupe,
                    securite_groupe: securiteGroupe,
                }
                
                const commande = {
                    // nom_groupe: nomGroupe,
                    categorie_id: categorieId,
                }

                if(groupe.groupe_id) {
                    commande.groupe_id = groupe.groupe_id
                }
                
                let cleId = groupe.cle_id || groupe.ref_hachage_bytes
                
                let commandeMaitrecles = null
                if(!groupe.groupe_id) {
                    // Nouveau groupe - creer la cle
                    const certificatsChiffrage = await workers.connexion.getCertificatsMaitredescles()
                    // const identificateurs_document = {'type': 'groupe'}

                    // const {doc: metadataChiffre, commandeMaitrecles: _commandeMaitrecles} = await workers.chiffrage.chiffrerDocument(
                    //     metadataDechiffre, 'Documents', certificatsChiffrage, {identificateurs_document, userId, DEBUG: true})

                    const {doc: metadataChiffre, commandeMaitrecles: _commandeMaitrecles} = await workers.chiffrage.chiffrerChampsV2(
                        metadataDechiffre, 'Documents', certificatsChiffrage, {DEBUG: false})

                    // Conserver information chiffree
                    Object.assign(commande, metadataChiffre)

                    console.debug("Commande maitre des cles : %O", _commandeMaitrecles)
                    commandeMaitrecles = _commandeMaitrecles
                } else if(cleId) {
                    commande.groupe_id = groupe.groupe_id
                    commande.cleId = cleId

                    // Recuperer cle pour re-chiffrer
                    let cle = await workers.clesDao.getCles(cleId)
                    cle = cle[cleId]

                    const champsChiffres = await workers.chiffrage.chiffrage.updateChampsChiffres(
                        metadataDechiffre, cle.cleSecrete, cleId)
                    Object.assign(commande, champsChiffres)
                } else {
                    throw new Error('Cle manquante')
                }
        
                // console.debug("Sauvegarder groupe : %O, commande maitre des cles : %O", commande, commandeMaitrecles)
                const reponse = await workers.connexion.sauvegarderGroupeUsager(commande, commandeMaitrecles)
                if(reponse.ok === true) fermer()
              })
            .catch(err=>console.error("Erreur sauvegarde groupe : ", err))
    }, [workers, userId, groupe, nomGroupe, securiteGroupe, categorieId, fermer])

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

            <SecuriteGroupe onChange={securiteChangeHandler} value={securiteGroupe} />

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

function SecuriteGroupe(props) {

    const { onChange, value } = props

    return (
        <Row>
            <Col sm={4} md={2}>Securite</Col>
            <Col>
                <Form.Check 
                    type='radio' name='securite' value='groupemotdepasse' 
                    checked={value==='groupemotdepasse'} onChange={onChange}
                    label='Personnelle avec mot de passe' id='securite-motdepasse' />
                <Form.Check 
                    type='radio' name='securite' value='groupe' 
                    checked={value==='groupe'} onChange={onChange}
                    label='Personnelle' id='securite-personel' />
                <Form.Check 
                    type='radio' name='securite' value='document' 
                    checked={value==='document'} onChange={onChange}
                    label='Partagee' id='securite-partagee' />
            </Col>
        </Row>
    )
}
