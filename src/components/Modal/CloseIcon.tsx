import React from 'react'
import './Modal.css'

interface ModalProps {
  close: () => void
  }


export default function CloseModal({ close } : ModalProps) {
  return (
    <h4 className="ic_close" onClick={close}><i className="fas fa-times"></i></h4>
  )
}
