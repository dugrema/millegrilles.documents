import { useState, useCallback, useEffect } from 'react'
import useWorkers from './WorkerContext'

import Button from 'react-bootstrap/Button'
import Form from 'react-bootstrap/Form'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'

import { useDispatch, useSelector } from 'react-redux'

import { setDocumentId } from './redux/documentsSlice'


function AfficherDocument(props) {
    return <p>Afficher document</p>
}

export default AfficherDocument
