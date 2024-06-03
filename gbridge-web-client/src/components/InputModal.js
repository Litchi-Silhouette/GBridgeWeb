import React, { useState } from 'react';
import Modal from 'react-modal';
import { SingleButton } from './MyButton';
import styles from './InputModal.module.css';

Modal.setAppElement('#root'); // Set the root element for accessibility

const InputModal = ({ modalVisible, onConfirm, onRequestClose, title, placeholder, multiline, canNone }) => {
    const [inputText, setInputText] = useState('');

    return (
        <Modal
            isOpen={modalVisible}
            onRequestClose={onRequestClose}
            contentLabel="Input Modal"
            className={styles.Modal}
            overlayClassName={styles.Overlay}
        >
            <div className={styles.modalView}>
                <h2 className={styles.modalText}>{title}</h2>
                <textarea
                    className={styles.textInputStyle}
                    rows={multiline ? 4 : 1}
                    onChange={e => setInputText(e.target.value)}
                    value={inputText}
                    placeholder={placeholder}
                />
                <div className={styles.buttonContainer}>
                    {canNone && <SingleButton title="Send" onPress={() => onConfirm(inputText)} disable={false} />}
                    {!canNone && <SingleButton title="Confirm" onPress={() => onConfirm(inputText)} disable={!inputText || inputText === ""} />}
                    <SingleButton title="Cancel" onPress={onRequestClose} disable={false} />
                </div>
            </div>
        </Modal>
    );
};

export default InputModal;
