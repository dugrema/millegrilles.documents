import { useState, useCallback, useMemo, useEffect } from 'react'

import Button from 'react-bootstrap/Button'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Form from 'react-bootstrap/Form'

import useWorkers from './WorkerContext'

function EditerCategorie(props) {

    const { categorieId, fermer } = props

    const categorie = useMemo(()=>{
        if(!categorieId) return ''
        if(categorieId === true) return {}
        throw new Error("todo - Charger categorie")
    }, [categorieId])

    if(!categorie) return ''

    return (
        <div>
            <Row>
                <Col xs={8} md={10} lg={11}><h2>Categorie</h2></Col>
                <Col><Button variant="secondary" onClick={fermer}>X</Button></Col>
                <FormCategorie 
                    categorie={categorie} 
                    fermer={fermer} />
            </Row>

        </div>
    )
}

export default EditerCategorie

function FormCategorie(props) {

    const { categorie, fermer } = props

    const workers = useWorkers()

    const [nomCategorie, setNomCategorie] = useState(categorie.nom_categorie || '')
    const [champs, setChamps] = useState(categorie.champs || [])

    const nomCategorieChangeHandler = useCallback(event=>setNomCategorie(event.currentTarget.value), [setNomCategorie])

    const ajouterChampHandler = useCallback(()=>{
        const nouveauChamp = {nom_champ: '', code_interne: '', type_champ: 'text', taille_maximum: 100, requis: false}
        setChamps([...champs, nouveauChamp])
    }, [champs, setChamps])

    const supprimerChampHandler = useCallback(event=>{
        const champIdx = Number.parseInt(event.currentTarget.value)
        const champsFiltres = champs.filter((_, idx)=>idx!==champIdx)
        setChamps(champsFiltres)
    }, [champs, setChamps])

    const champChangeHandler = useCallback((name, event)=>{
        const { dataset, value, checked, type: targetType } = event.currentTarget
        const { idx } = dataset
        const idxInt = Number.parseInt(idx)

        let valeurChamp = value
        if(targetType === 'checkbox') valeurChamp = checked

        const champsModifies = champs.map((item, idxChamp)=>{
            if(idxInt !== idxChamp) return item
            return {...item, [name]: valeurChamp}
        })
        setChamps(champsModifies)

    }, [champs, setChamps])

    const sauvegarderCategorieHandler = useCallback(()=>{
        console.debug("Sauvegarder %s : %O", nomCategorie, champs)

        let versionCategorie = 1
        if(categorie.version) {
            // Optimistic locking pour prochaine version
            versionCategorie = categorie.version + 1
        }

        const commande = {
            nom_categorie: nomCategorie,
            champs,
            version: versionCategorie,
        }

        workers.connexion.sauvegarderCategorie(commande)
            .then(reponse=>{
                console.debug("Reponse sauvegarder categorie : ", reponse)
                fermer()
            })
            .catch(err=>console.error("Erreur sauvegarder categorie : ", err))

    }, [workers, fermer, categorie, nomCategorie, champs])

    useEffect(()=>{
        if(champs.length > 0) return
        ajouterChampHandler()
    }, [champs, ajouterChampHandler])

    return (
        <div>
            <Form.Group as={Row} controlId="nomCategorie">
                <Form.Label column sm={4} md={2}>Nom de la categorie</Form.Label>
                <Col>
                    <Form.Control value={nomCategorie} onChange={nomCategorieChangeHandler} />
                </Col>
            </Form.Group>

            {champs.map((item, idx)=>{
                return (
                    <FormChamp 
                        key={idx} idx={idx} 
                        champ={item} 
                        supprimer={supprimerChampHandler} 
                        champChangeHandler={champChangeHandler} />
                )
            })}
            <Button variant="secondary" onClick={ajouterChampHandler}>+ Ajouter</Button>

            <p></p>

            <Row>
                <Col>
                    <Button onClick={sauvegarderCategorieHandler}>Sauvegarder</Button>
                </Col>
            </Row>
        </div>
    )
}

function FormChamp(props) {

    const { champ, supprimer, idx, champChangeHandler } = props

    const nomChampChangeHandler = useCallback(event=>champChangeHandler('nom_champ', event), [champChangeHandler])
    const codeInterneChangeHandler = useCallback(event=>champChangeHandler('code_interne', event), [champChangeHandler])
    const typeChampChangeHandler = useCallback(event=>champChangeHandler('type_champ', event), [champChangeHandler])
    const tailleMaximumChangeHandler = useCallback(event=>champChangeHandler('taille_maximum', event), [champChangeHandler])
    const requisChangeHandler = useCallback(event=>champChangeHandler('requis', event), [champChangeHandler])

    if(!champ) return ''

    return (
        <Row className='categorie-champ'>
            <Col xs={1} md={1}>
                <Button variant="secondary" onClick={supprimer} value={''+idx}>X</Button>
            </Col>
            <Col xs={6} md={4}>
                <Form.Control data-idx={idx} value={champ.nom_champ} onChange={nomChampChangeHandler} 
                    placeholder='Nom champ' />
            </Col>
            <Col xs={5} md={4}>
                <Form.Control data-idx={idx} value={champ.code_interne} onChange={codeInterneChangeHandler} 
                    placeholder='Code interne' />
            </Col>
            <Col xs={{span: 4, offset: 1}} md={{span: 3, offset: 0}}>
                <SelectTypeChamp idx={idx} value={champ.type_champ} onChange={typeChampChangeHandler} />
            </Col>
            <Col xs={3} md={{span: 3, offset: 1}}>
                <Form.Control data-idx={idx} value={champ.taille_maximum} onChange={tailleMaximumChangeHandler} />
            </Col>
            <Col xs={4}>
                <Form.Check 
                    id={'checkbox_requis_'+idx} 
                    type="checkbox" 
                    data-idx={idx} 
                    checked={champ.requis||false} 
                    onChange={requisChangeHandler} 
                    label="Requis" />
            </Col>
        </Row>
    )
}

function SelectTypeChamp(props) {

    const { value, onChange, idx } = props

    return (
        <Form.Select data-idx={idx} value={value} onChange={onChange}>
            <option value="text">Texte</option>
            <option value="password">Mot de passe</option>
            <option value="number">Nombre</option>
            <option value="url">URL</option>
        </Form.Select>
    )

}
