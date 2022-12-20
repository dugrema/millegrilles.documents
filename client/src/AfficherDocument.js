import { lazy, useCallback, useMemo } from 'react'

import Button from 'react-bootstrap/Button'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'

import { useDispatch, useSelector } from 'react-redux'

import { setDocId } from './redux/documentsSlice'

const ChampQuill = lazy( () => import('./ChampQuill') )

function AfficherDocument(props) {
    const { groupeId, editer } = props

    const dispatch = useDispatch()
    const docId = useSelector(state=>state.documents.docId)
    const groupes = useSelector(state=>state.groupes.liste)
    const categories = useSelector(state=>state.categories.liste)
    const listeDocuments = useSelector(state=>state.documents.liste)

    const contenuDocument = useMemo(()=>{
        if(!docId || !listeDocuments) return null
        return listeDocuments.filter(item=>item.doc_id === docId).pop()
    }, [docId, listeDocuments])

    const [groupe, categorie] = useMemo(()=>{
        if(!categories || !groupes || !groupeId) return [null, null]
        const groupe = groupes.filter(item=>item.groupe_id === groupeId).pop()
        if(!groupe) return [null, null]
        const categorieId = groupe.categorie_id
        const categorie = categories.filter(item=>item.categorie_id === categorieId).pop()
        return [groupe, categorie]
    }, [categories, groupes, groupeId])

    const fermerHandler = useCallback(()=>dispatch(setDocId(null)), [dispatch])

    if(!groupe) return ''

    return (
        <div>
            <Row>
                <Col>
                    <Button variant="secondary" onClick={editer} value='true'>Editer</Button>
                    <Button variant="secondary" onClick={fermerHandler}>Retour</Button>
                </Col>
            </Row>

            <MasqueContenu 
                categorie={categorie} 
                contenu={contenuDocument} />
        </div>
    )
}

export default AfficherDocument

function MasqueContenu(props) {
    const { categorie, contenu } = props

    return categorie.champs.map((item, idx)=>{
        const valeurContenu = contenu[item.code_interne] || ''

        // Certains champs prennent toujours toute la largeur de l'ecran
        let colWidth = {md: 3, xl: 2}
        if(['html'].includes(item.type_champ)) {
            colWidth = {}
        }

        return (
            <Row key={idx}>
                <Col xs={12} {...colWidth}>{item.nom_champ}</Col>
                <Col>
                    <AfficherChamp champ={item} valeur={valeurContenu} />
                </Col>
            </Row>
        )
    })
}

function AfficherChamp(props) {
    const { champ, valeur } = props

    const typeChamp = champ.type_champ

    if(typeChamp === 'text') {
        return (
            <p>{valeur}</p>
        )
    } else if(typeChamp === 'number') {
        return (
            <p>{valeur}</p>
        )
    } else if(typeChamp === 'password') {
        return (
            <p>{valeur}</p>
        )
    } else if(typeChamp === 'url') {
        return (
            <p>{valeur}</p>
        )
    } else if(typeChamp === 'html') {
        return (
            <ChampQuill value={valeur} readonly={true} />
        )
    } else {
        return <p>Type de champ non supporte</p>
    }

}
