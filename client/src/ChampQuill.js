import { useCallback } from 'react'
import ReactQuill from 'react-quill'

function ChampQuill(props) {
    const { name, value, readonly, onChange } = props

    const handleChange = useCallback(value=>{
        if(!!onChange) onChange({'currentTarget': {name, value}})
    }, [onChange])

    let className = '', theme = 'snow'
    if(!!readonly) {
        className += ' afficher'
        theme = ''
    } else {
        className += ' editeur-body'
    }

    return (
        <>
            <ReactQuill className={className} value={value} readOnly={!!readonly} theme={theme} onChange={handleChange} />
            <br className="clear"/>
        </>
    )
}

export default ChampQuill
