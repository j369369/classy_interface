import React from 'react'
import './Modal.css'

interface ModalProps {
    toggleWalletModal: () => void
  }


export default function CloseModal({ toggleWalletModal } : ModalProps) {
  return (
    <h4 className="ic_close" onClick={toggleWalletModal}><i className="fas fa-times"></i></h4>
  )
}
