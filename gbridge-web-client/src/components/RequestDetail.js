import React from 'react';
import Modal from 'react-modal';
import styles from './RequestDetail.module.css'; // Import the CSS module
import { SingleButton } from './MyButton';
import { useSelector } from 'react-redux';

const RequestDetail = ({ visible, onRequestClose, request, onActionPress, market }) => {
    const gUsername = useSelector((state) => state.global.username);

    const getActionButton = () => {
        if (market) {
            return (
                <SingleButton title="Match" onPress={onActionPress} disable={false} />
            );
        }
        if (request.status === 'Post') {
            return (
                <SingleButton title="Delete" onPress={() => onActionPress('delete')} disable={false} />
            );
        } else if (request.borrower_username === gUsername && request.status === 'Deal') {
            return (
                <SingleButton title="Repay" onPress={() => onActionPress('repay')} disable={false} />
            );
        } else if (request.lender_username === gUsername && request.status === 'Deal') {
            return (
                <SingleButton title="Remind" onPress={() => onActionPress('remind')} disable={false} />
            );
        }
        return null;
    };

    const getCounterParty = () => {
        if (market)
            return <p className={styles.modalInfo}>Poster: {request.poster}</p>;
        if (request.borrower_username === gUsername) {
            return <p className={styles.modalInfo}>Lender : {request.lender}</p>;
        } else {
            return <p className={styles.modalInfo}>Borrower : {request.borrower}</p>;
        }
    };

    return (
        <Modal
            isOpen={visible}
            onRequestClose={onRequestClose}
            contentLabel="Request Details"
            className={styles.modal}
            overlayClassName={styles.overlay}
        >
            <div className={styles.modalView}>
                <h2 className={styles.modalTitle}>{market ? 'Post' : request.status} Details</h2>
                <div className={styles.row}>
                    <div className={styles.column}>
                        {(market || request.status === 'Deal') && getCounterParty()}
                        <p className={styles.modalInfo}>Interest : {request.interest} /month</p>
                        <p className={styles.modalInfo}>Amount : {request.amount}</p>
                        <p className={styles.modalInfo}>Period : {request.period} months</p>
                        <p className={styles.modalInfo}>Method : {request.method}</p>
                        <p className={styles.modalInfo}>{request.status} Date : {request.date}</p>
                        {market && <p className={styles.modalInfo}>Score: {request.score}</p>}
                    </div>
                    <div className={styles.column}>
                        {request.extra && (
                            <>
                                <p className={styles.modalInfo}>Extra Info :</p>
                                <img src={request.extra} alt="Extra Info" className={styles.image} />
                            </>
                        )}
                        <p className={styles.modalInfo}>Description</p>
                        <p className={styles.modalDes}>{request.description}</p>
                    </div>
                </div>
                <div className={styles.buttonContainer}>
                    {getActionButton()}
                    <SingleButton title="Close" onPress={onRequestClose} disable={false} />
                </div>
            </div>
        </Modal>
    );
};

export default RequestDetail;
