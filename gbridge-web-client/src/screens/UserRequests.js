import React, { useState, useEffect } from 'react';
import RequestDetail from '../components/RequestDetail';
import parseItems from '../utils/ParseItem';
import InputModal from '../components/InputModal';
import styles from './UserRequests.module.css'; // Import CSS module
import { useSelector } from 'react-redux';
import { useAxios } from '../utils/AxiosContext';
import Spinner from '../components/Spinner';
import Header from '../components/Header';
import { SingleButton } from '../components/MyButton';
import config from '../config/config.json';
import { useNavigate } from 'react-router-dom';

const UserRequests = () => {
    const [type, setType] = useState("loan");
    const [posts, setPosts] = useState({ loan: [], invest: [] });
    const [deals, setDeals] = useState({ loan: [], invest: [] });
    const [loading, setLoading] = useState(true);
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [reminderModal, setReminderModal] = useState(false);
    const gUsername = useSelector(state => state.global.username);
    const axios = useAxios();
    const navigate = useNavigate();

    useEffect(() => {
        fetchRequests();
    }, []);

    const switchTab = (tab) => {
        if (tab !== type) {
            setType(tab);
        }
    };

    const fetchRequests = async () => {
        setDeals({ loan: [], invest: [] });
        setPosts({ loan: [], invest: [] });
        setLoading(true);
        try {
            const postOrgResponse = await axios.post(config.proxy.common, {
                type: 'get_user_posts',
                content: null,
                extra: null
            });
            const postResponse = postOrgResponse.data;

            if (postResponse.success) {
                let items = parseItems(postResponse.content);
                items = items.map(item => ({ ...item, status: 'Post' }));
                const loanPosts = items.filter(req => req.post_type === 'borrow');
                const investmentPosts = items.filter(req => req.post_type === 'lend');
                setPosts({ loan: loanPosts, invest: investmentPosts });

                const dealOrgResponse = await axios.post(config.proxy.common, {
                    type: 'get_user_deals',
                    content: null,
                    extra: null
                });

                const dealResponse = dealOrgResponse.data;
                if (dealResponse.success) {
                    items = parseItems(dealResponse.content);
                    items = items.map(item => ({ ...item, status: 'Deal' }));
                    const loanDeals = items.filter(req => req.borrower_username === gUsername);
                    const investmentDeals = items.filter(req => req.lender_username === gUsername);
                    setDeals({ loan: loanDeals, invest: investmentDeals });
                    setLoading(false);
                } else {
                    alert('Failed to fetch deals.');
                    setLoading(false);
                }
            } else {
                alert('Failed to fetch posts.');
                setLoading(false);
            }
        } catch {
            alert('Failed to fetch posts.');
            setLoading(false);
        }
    };

    const handleAction = (item) => {
        setSelectedRequest(item);
        setShowModal(true);
    };

    const handleModalClose = () => {
        setSelectedRequest(null);
        setShowModal(false);
    };

    const deleteRequest = async () => {
        try {
            const response = await axios.post(config.proxy.common, {
                type: 'withdraw_market_post',
                content: {
                    _id: selectedRequest._id
                },
                extra: null
            });

            if (response.data.success) {
                alert('Request deleted successfully.');
                handleModalClose();
                fetchRequests();
            } else {
                alert('Failed to delete request.');
            }
        } catch {
            alert('Failed to delete request.');
        }
    };

    const repayRequest = () => {
        const req = selectedRequest;
        handleModalClose();
        navigate('/Repay', { item: req });
    };

    const remindRequest = () => {
        setReminderModal(true);
    };

    const handleReminder = async (message) => {
        const { selectedRequest } = this.state;
        try {
            const response = await axios.post(config.proxy.common, {
                type: 'send_notification',
                content: {
                    receiver: selectedRequest.borrower_username,
                    content: message
                },
                extra: null
            });
            if (response.data.success) {
                alert('Message sent successfully.');
            } else {
                alert('Failed to send message.');
            }
        } catch {
            alert('Failed to send message.');
        }
        handleReminderModalClose();
    };

    const handleReminderModalClose = () => {
        setReminderModal(false);
        handleModalClose();
    };

    const handleActionPress = (actionType) => {
        switch (actionType) {
            case 'delete':
                deleteRequest();
                break;
            case 'repay':
                repayRequest();
                break;
            case 'remind':
                remindRequest();
                break;
            default:
                break;
        };
    };

    const renderRequest = (item) => (
        <div className={styles.requestItem} onClick={() => handleAction(item)}>
            <p className={styles.itemText}>
                {item.status === 'Post' && (parseFloat(item.score).toFixed(3) + " - ")}
                {item.amount} - {item.period} - {item.date}
            </p>
        </div>
    );

    const renderEmptyComponent = () => (
        <div className={styles.emptyContainer}>
            {loading ? <Spinner size='medium' /> : <p>No request available</p>}
        </div>
    );

    return (
        <div className={styles.container}>
            <Header />
            <div className={styles.tabContainer}>
                <div
                    className={`${styles.tab} ${type === 'loan' ? styles.activeTab : ''}`}
                    onClick={() => switchTab('loan')}
                >
                    <p className={styles.tabText}>Loan</p>
                </div>
                <div
                    className={`${styles.tab} ${type === 'invest' ? styles.activeTab : ''}`}
                    onClick={() => switchTab('invest')}
                >
                    <p className={styles.tabText}>Invest</p>
                </div>
            </div>
            <div className={styles.row}>
                <div className={styles.column}>
                    <p className={styles.header}>{type === 'invest' ? 'Invest' : 'Loan'} Posts</p>
                    <p className={`${styles.header} ${styles.subHeader}`}>score - amount - period (month) - date</p>
                    <div className={styles.listContainer}>
                        {posts[type].length > 0 ? posts[type].map(renderRequest) : renderEmptyComponent()}
                    </div>
                    <SingleButton title="Loan" onPress={() => navigate('/Post', { post_type: 'borrow' })} disable={false} />
                </div>
                <div className={styles.column}>
                    <p className={styles.header}>{type === 'invest' ? 'Invest' : 'Loan'} Deals</p>
                    <p className={`${styles.header} ${styles.subHeader}`}>amount - period (month) - date</p>
                    <div className={styles.listContainer}>
                        {deals[type].length > 0 ? deals[type].map(renderRequest) : renderEmptyComponent()}
                    </div>
                    <SingleButton title="Invest" onPress={() => navigate('/Post', { post_type: 'lend' })} disable={false} />
                </div>
            </div>
            {showModal && selectedRequest && (
                <RequestDetail
                    visible={showModal}
                    onRequestClose={handleModalClose}
                    request={selectedRequest}
                    onActionPress={handleActionPress}
                />
            )}
            {reminderModal && (
                <InputModal
                    visible={reminderModal}
                    multiline={true}
                    title={"Send message to " + selectedRequest.borrower}
                    placeholder="Enter your message here"
                    onConfirm={handleReminder}
                    onRequestClose={handleReminderModalClose}
                />
            )}
        </div>
    );
};

export default UserRequests;