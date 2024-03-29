import { lazy, useCallback, useState, useEffect, useMemo } from 'react'

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
                <AfficherChamp champ={item} valeur={valeurContenu} />
            </Row>
        )
    })
}

function AfficherChamp(props) {
    const { champ, valeur } = props

    const typeChamp = champ.type_champ


    if(typeChamp === 'text') {
        return (
            <ChampTexteCopier value={valeur} />
        )
    } else if(typeChamp === 'number') {
        return (
            <Col>
                <p>{valeur}</p>
            </Col>
        )
    } else if(typeChamp === 'password') {
        return (
            <ChampTexteCopier value={valeur} />
        )
    } else if(typeChamp === 'url') {
        return (
            <ChampTexteCopier value={valeur} openUrl={true} />
        )
    } else if(typeChamp === 'html') {
        return (
            <Col>
                <ChampQuill value={valeur} readonly={true} />
            </Col>
        )
    } else {
        return <Col><p>Type de champ non supporte</p></Col>
    }

}

function ChampTexteCopier(props) {

    const { className, value, openUrl } = props

    const [copie, setCopie] = useState(false)

    const url = useMemo(()=>{
        if(!openUrl) return
        // Valider le URL
        try {
            return new URL(value)
        } catch(err) {
            // url invalide
            return ''
        }
    }, [openUrl, value])

    useEffect(()=>{
        if(copie) setTimeout(()=>setCopie(false), 5000)
    }, [copie, setCopie])

    const copierClipboard = useCallback(()=>{
        navigator.clipboard.writeText(value)
            .then(()=>{
                setCopie(true)
            })
            .catch(err=>console.error("ChampTexteCopier Erreur ", err))
    }, [value, setCopie])

    const openUrlHandler = useCallback(()=>{
        window.open(url.href, '_blank', 'noopener=true,noreferrer=true')
    }, [url])

    let classNameEffectif = className + ' champ-copiable'
    if(copie) classNameEffectif += ' copie'

    return (
        <>
            <Col>
                <p className={classNameEffectif} onClick={copierClipboard}>
                    {value}
                    {' '}
                    {url?(
                        <Button variant='secondary' onClick={openUrlHandler}><i className='fa fa-external-link'/></Button>
                    ):''}
                    {' '}
                    {copie?<i className='fa fa-check'/>:''}
                </p>
            </Col>
        </>
    )

}
