import React, {Suspense, useState, useEffect, useMemo, useCallback} from 'react'
import { Provider as ReduxProvider, useDispatch, useSelector } from 'react-redux'

import Container from 'react-bootstrap/Container'
import Nav from 'react-bootstrap/Nav'
import Navbar from 'react-bootstrap/Navbar'
import NavDropdown from 'react-bootstrap/NavDropdown'

import { LayoutMillegrilles, ModalErreur, Menu as MenuMillegrilles, DropDownLanguage, ModalInfo } from '@dugrema/millegrilles.reactjs'

import ErrorBoundary from './ErrorBoundary'
import useWorkers, {useEtatConnexion, WorkerProvider, useUsager, useFormatteurPret, useInfoConnexion} from './WorkerContext'
import storeSetup from './redux/store'

import { useTranslation } from 'react-i18next'
import './i18n'

// Importer JS global
import 'react-bootstrap/dist/react-bootstrap.min.js'

// Importer cascade CSS global
import 'bootstrap/dist/css/bootstrap.min.css'
import 'font-awesome/css/font-awesome.min.css'
import '@dugrema/millegrilles.reactjs/dist/index.css'

import manifest from './manifest.build'

import './index.scss'
import './App.css'

const Accueil = React.lazy( () => import('./Accueil') )
const Categories = React.lazy( () => import('./Categories') )
const Groupes = React.lazy( () => import('./Groupes') )

function App() {
  
  return (
    <WorkerProvider attente={<Attente />}>
      <ErrorBoundary>
        <Suspense fallback={<Attente />}>
          <ProviderReduxLayer />
        </Suspense>
      </ErrorBoundary>
    </WorkerProvider>
  )

}
export default App

function ProviderReduxLayer() {

  const workers = useWorkers()
  const store = useMemo(()=>{
    if(!workers) return
    return storeSetup(workers)
  }, [workers])

  return (
    <ReduxProvider store={store}>
        <LayoutMain />
    </ReduxProvider>
  )
}

function LayoutMain(props) {

  const { i18n, t } = useTranslation()

  const workers = useWorkers()
  const usager = useUsager()
  const etatConnexion = useEtatConnexion()
  const etatFormatteurMessage = useFormatteurPret()
  const infoConnexion = useInfoConnexion()

  const [sectionAfficher, setSectionAfficher] = useState('')
  const [erreur, setErreur] = useState('')
  
  const handlerCloseErreur = () => setErreur(false)

  const etatAuthentifie = usager && etatFormatteurMessage

  const [userId, estProprietaire] = useMemo(()=>{
    if(!usager) return [null, null]
    const extensions = usager.extensions
    return [extensions.userId, extensions.delegationGlobale === 'proprietaire']
  }, [usager])

  // Setup userId dans redux
  //useEffect(()=>{dispatch(setUserIdDocuments(userId))}, [userId])

  const menu = (
    <MenuApp 
        i18n={i18n} 
        estProprietaire={estProprietaire}
        setSectionAfficher={setSectionAfficher} />
  ) 

  return (
      <LayoutMillegrilles menu={menu}>

          <Container className="contenu">

              <Suspense fallback={<Attente workers={workers} idinfoConnexionmg={infoConnexion} etatConnexion={etatAuthentifie} />}>
                <ApplicationDocuments 
                    workers={workers}
                    usager={usager}
                    etatAuthentifie={etatAuthentifie}
                    etatConnexion={etatConnexion}
                    infoConnexion={infoConnexion}
                    sectionAfficher={sectionAfficher}
                    setSectionAfficher={setSectionAfficher}
                  />
              </Suspense>

          </Container>

          <ModalErreur show={!!erreur} err={erreur.err} message={erreur.message} titre={t('Erreur.titre')} fermer={handlerCloseErreur} />

      </LayoutMillegrilles>
  )  

}

function ApplicationDocuments(props) {

  const { sectionAfficher, setSectionAfficher} = props

  let Page = null
  switch(sectionAfficher) {
    case 'Categories': Page = Categories; break
    case 'Groupes': Page = Groupes; break
    default:
      Page = Accueil
  }

  return (
    <Container className="main-body">
      <Page setSectionAfficher={setSectionAfficher} />
    </Container>
  )

}

function MenuApp(props) {

  const { i18n, setSectionAfficher, estProprietaire } = props

  const infoConnexion = useInfoConnexion()
  const usager = useUsager()
  const etatConnexion = useEtatConnexion()

  const idmg = useMemo(()=>{
    if(!infoConnexion) return null
    return infoConnexion.idmg
  }, [infoConnexion])

  const { t } = useTranslation()
  const [showModalInfo, setShowModalInfo] = useState(false)
  const handlerCloseModalInfo = useCallback(()=>setShowModalInfo(false), [setShowModalInfo])

  const handlerSelect = useCallback(eventKey => {
      switch(eventKey) {
        case 'groupes': setSectionAfficher('Groupes'); break
        case 'categories': setSectionAfficher('Categories'); break
        case 'portail': window.location = '/millegrilles'; break
        case 'deconnecter': window.location = '/millegrilles/authentification/fermer'; break
        case 'information': setShowModalInfo(true); break
        default:
          setSectionAfficher('')
      }
  }, [setSectionAfficher, setShowModalInfo])

  const handlerChangerLangue = eventKey => {i18n.changeLanguage(eventKey)}
  const brand = (
      <Navbar.Brand>
          <Nav.Link onClick={handlerSelect} title={t('titre')}>
              {t('titre')}
          </Nav.Link>
      </Navbar.Brand>
  )

  return (
      <>
          <MenuMillegrilles brand={brand} labelMenu="Menu" etatConnexion={etatConnexion} onSelect={handlerSelect}>

            <Nav.Link eventKey="groupes" title={t('menu.groupes')}>
                {t('menu.groupes')}
            </Nav.Link>

            <Nav.Link eventKey="categories" title={t('menu.categories')}>
                {t('menu.categories')}
            </Nav.Link>

            <Nav.Link eventKey="information" title="Afficher l'information systeme">
                {t('menu.information')}
            </Nav.Link>

            <DropDownLanguage title={t('menu.language')} onSelect={handlerChangerLangue}>
                <NavDropdown.Item eventKey="en-US">English</NavDropdown.Item>
                <NavDropdown.Item eventKey="fr-CA">Francais</NavDropdown.Item>
            </DropDownLanguage>

            <Nav.Link eventKey="portail" title={t('menu.portail')}>
                {t('menu.portail')}
            </Nav.Link>

            <Nav.Link eventKey="deconnecter" title={t('menu.deconnecter')}>
                {t('menu.deconnecter')}
            </Nav.Link>

          </MenuMillegrilles>

          <ModalInfo 
              show={showModalInfo} 
              fermer={handlerCloseModalInfo} 
              manifest={manifest} 
              idmg={idmg} 
              usager={usager} />
      </>
  )
}

function Attente(_props) {
  return (
      <div>
          <p className="titleinit">Preparation de l'application Documents</p>
          <p>Veuillez patienter durant le chargement de la page.</p>
          <ol>
              <li>Initialisation</li>
              <li>Chargement des composants dynamiques</li>
              <li>Connexion a la page</li>
          </ol>
      </div>
  )
}
