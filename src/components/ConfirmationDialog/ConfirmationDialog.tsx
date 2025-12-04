'use client'

import React, { useEffect } from 'react'
import styles from './ConfirmationDialog.module.css'

interface ConfirmationDialogProps {
    isOpen: boolean
    title: string
    message: string
    confirmText?: string
    cancelText?: string
    onConfirm: () => void
    onCancel: () => void
    isDangerous?: boolean
}

export default function ConfirmationDialog({
    isOpen,
    title,
    message,
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    onConfirm,
    onCancel,
    isDangerous = false
}: ConfirmationDialogProps) {
    const dialogRef = React.useRef<HTMLDialogElement>(null)

    useEffect(() => {
        if (isOpen) {
            dialogRef.current?.showModal()
        } else {
            dialogRef.current?.close()
        }
    }, [isOpen])

    const handleConfirm = () => {
        onConfirm()
        dialogRef.current?.close()
    }

    const handleCancel = () => {
        onCancel()
        dialogRef.current?.close()
    }

    const handleBackdropClick = (e: React.MouseEvent) => {
        if (e.target === dialogRef.current) {
            handleCancel()
        }
    }

    return (
        <dialog
            ref={dialogRef}
            className={styles.dialog}
            onClick={handleBackdropClick}
        >
            <div className={styles.content}>
                <h2 className={styles.title}>{title}</h2>
                <p className={styles.message}>{message}</p>
                <div className={styles.actions}>
                    <button
                        type="button"
                        onClick={handleCancel}
                        className={styles.cancelBtn}
                    >
                        {cancelText}
                    </button>
                    <button
                        type="button"
                        onClick={handleConfirm}
                        className={`${styles.confirmBtn} ${isDangerous ? styles.dangerBtn : ''}`}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </dialog>
    )
}
