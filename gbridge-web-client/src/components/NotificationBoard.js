import React, { useState, useEffect } from 'react';
import { useAxios } from '../utils/AxiosContext';
import Modal from 'react-modal';
import { differenceInDays, addDays } from 'date-fns';
import parseItems from '../utils/ParseItem';
import { SingleButton } from './MyButton';
import styles from './NotificationBoard.module.css'; // Import the CSS module
import { useSelector } from 'react-redux';
import config from '../config/config.json';

const NotificationBoard = ({ modalVisible, onRequestClose, navigate }) => {
    const [loans, setLoans] = useState([]);
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const axios = useAxios();

    const gUsername = useSelector(state => state.global.username);

    useEffect(() => {
        fetchLoans().catch((error) => {
            setLoading(false);
            alert(`Failed to connect to server: ${error.message}`);
        });
    }, []);

    const fetchMessages = async () => {
        try {
            const response = await axios.post(config.proxy.common, {
                type: 'get_notification',
                extra: null
            });
            if (response.data.success) {
                if (!response.data.content) return;
                const fetchedMessages = response.data.content
                    .filter(msg => msg.receiver === gUsername)
                    .map((msg, index) => ({ ...msg, id: index }));
                setMessages(fetchedMessages);
                setLoading(false);
                console.log('Fetched messages');
            } else {
                alert('Failed to fetch messages.');
            }
        } catch {
            alert('Failed to fetch messages.');
        }
    };

    const fetchLoans = async () => {
        try {
            const response = await axios.post(config.proxy.common, {
                type: 'get_user_deals',
                extra: null
            });
            if (response.data.success) {
                if (!response.data.content) return;
                let items = parseItems(response.data.content);
                items = items.map(item => ({
                    ...item,
                    dueDate: addDays(new Date(item.created_time), 30 * item.period).toLocaleDateString()
                }));
                const currentDate = new Date();
                const loanDeals = items.filter(req => (
                    req.borrower_username === gUsername && differenceInDays(req.dueDate, currentDate) < 15
                ));
                setLoans(loanDeals);
                fetchMessages();
                console.log('Fetched posts and deals');
            } else {
                alert('Failed to fetch deals.');
                setLoading(false);
            }
        } catch {
            alert('Failed to fetch deals.');
            setLoading(false);
        }
    };

    const confirmReading = (item) => {
        if (window.confirm("You make sure you have received the notification?")) {
            axios.post(config.proxy.common, {
                type: "delete_notification",
                content: {
                    _id: item._id
                }
            }).then((response) => {
                if (response.data.success) {
                    console.log("Deleted notification");
                    fetchMessages();
                } else {
                    alert('Failed to delete message.');
                }
            }).catch(() => {
                alert('Failed to delete message.');
            });
        }
    };

    const navigateToRepayment = (loan) => {
        navigate('Repay', { item: loan });
    };

    const renderLoan = (loan) => (
        <div className={styles.itemContainer} onClick={() => navigateToRepayment(loan)}>
            <p style={{ padding: 0, margin: 0 }}>Amount: {loan.amount} Due: {loan.dueDate}</p>
        </div>
    );

    const renderMessage = (message) => (
        <div className={styles.itemContainer} onClick={() => confirmReading(message)}>
            <p style={{ color: "#007BFF", padding: 0, margin: 0 }}>Sender: {message.sender}</p>
            <p style={{ fontSize: 16, padding: 0, margin: 0 }}>{message.content}</p>
        </div>
    );

    const renderEmpty = (title) => (
        <p className={styles.title}>{title}</p>
    );

    if (loading) {
        return (
            <Modal
                isOpen={modalVisible}
                onRequestClose={onRequestClose}
                contentLabel="Loading"
                className={styles.modal}
                overlayClassName={styles.overlay}
            >
                <div className={styles.container}>
                    <div className={styles.modalView}>
                        <p className={styles.title}>Loading...</p>
                    </div>
                </div>
            </Modal>
        );
    }

    return (
        <Modal
            isOpen={modalVisible}
            onRequestClose={onRequestClose}
            contentLabel="Notifications"
            className={styles.modal}
            overlayClassName={styles.overlay}
        >
            <div className={styles.container}>
                <div className={styles.modalView}>
                    <p className={styles.modalTitle}>Notifications</p>
                    <div className={styles.row}>
                        <div className={styles.column}>
                            <p className={styles.title}>Upcoming Repayment</p>
                            <div className={styles.listContainer}>
                                {loans.length > 0 ? loans.map(renderLoan) : renderEmpty("No upcoming repayment")}
                            </div>
                        </div>
                        <div className={styles.column}>
                            <p className={styles.title}>Messages</p>
                            <div className={styles.listContainer}>
                                {messages.length > 0 ? messages.map(renderMessage) : renderEmpty("No messages")}
                            </div>
                        </div>
                    </div>
                    <div className={styles.buttonContainer}>
                        <SingleButton title="Close" onClick={onRequestClose} disable={false} />
                    </div>
                </div>
            </div>
        </Modal>
    );
};

export default NotificationBoard;
