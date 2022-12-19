import { useState, useCallback, useEffect, useMemo } from 'react'
import useWorkers from './WorkerContext'

import Button from 'react-bootstrap/Button'
import Form from 'react-bootstrap/Form'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'

import { useDispatch, useSelector } from 'react-redux'

import { setDocumentId } from './redux/documentsSlice'

function EditerDocument(props) {

    const { groupeId } = props

    const dispatch = useDispatch()
    const groupes = useSelector(state=>state.groupes.liste)
    const categories = useSelector(state=>state.categories.liste)

    const [contenuDocument, setContenuDocument] = useState('')

    const onContenuChangeHandler = useCallback(event=>{
        const {name, value} = event.currentTarget
        const contenu = {...contenuDocument, [name]: value}
        setContenuDocument(contenu)
    }, [contenuDocument, setContenuDocument])

    const [groupe, categorie] = useMemo(()=>{
        if(!categories || !groupes || !groupeId) return [null, null]
        const groupe = groupes.filter(item=>item.groupe_id === groupeId).pop()
        if(!groupe) return [null, null]
        const categorieId = groupe.categorie_id
        const categorie = categories.filter(item=>item.categorie_id === categorieId).pop()
        return [groupe, categorie]
    }, [categories, groupes, groupeId])

    const sauvegarderHandler = useCallback(event=>{
        console.debug("sauvegarder : ", contenuDocument)
    }, [contenuDocument])

    const fermerHandler = useCallback(()=>dispatch(setDocumentId(null)))

    // Copier contenu du document sur init
    useEffect(()=>{
        // Todo : detecter si nouveau doc ou existant

        // Nouveau document
        const contenuDocument = {}
        for(const champ of categorie.champs) {
            const code_interne_champ = champ.code_interne
            contenuDocument[code_interne_champ] = null  // Initialiser champs
        }

        setContenuDocument(contenuDocument)

    }, [categorie, setContenuDocument])

    if(!groupe) return ''

    return (
        <div>
            <MasqueContenu 
                categorie={categorie} 
                contenu={contenuDocument} 
                onChange={onContenuChangeHandler} />

            <p></p>

            <Row>
                <Col>
                    <Button onClick={sauvegarderHandler}>Sauvegarder</Button>
                    <Button variant="secondary" onClick={fermerHandler}>Annuler</Button>
                </Col>
            </Row>
        </div>
    )
}

export default EditerDocument

function MasqueContenu(props) {
    const { categorie, contenu, onChange={onChange} } = props

    return categorie.champs.map((item, idx)=>{
        const valeurContenu = contenu[item.code_interne] || ''
        return (
            <Row key={idx}>
                <Col xs={12} md={3} xl={2}>{item.nom_champ}</Col>
                <Col>
                    <ChampInput champ={item} valeur={valeurContenu} onChange={onChange} />
                </Col>
            </Row>
        )
    })
}

function ChampInput(props) {
    const { champ, valeur, onChange } = props

    const typeChamp = champ.type_champ

    if(typeChamp === 'text') {
        return (
            <Form.Control name={champ.code_interne} value={valeur} onChange={onChange} />
        )
    } else if(typeChamp === 'number') {
        return (
            <Form.Control name={champ.code_interne} value={valeur} onChange={onChange} />
        )
    } else {
        return <p>Type de champ non supporte</p>
    }

}