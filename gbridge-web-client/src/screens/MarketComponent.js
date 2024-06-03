import React, { useState, useEffect } from 'react';
import { useAxios } from '../utils/AxiosContext';
import Modal from 'react-modal';
import { MultiSelect } from 'react-multi-select-component';
import styles from './MarketComponent.module.css';
import { TwoButtonsInline } from '../components/MyButton';
import parseItem from '../utils/ParseItem';
import InputModal from '../components/InputModal';
import Spinner from '../components/Spinner';
import Header from '../components/Header';
import config from '../config/config.json';
import RequestDetail from '../components/RequestDetail';

const MarketComponent = () => {
    const [type, setType] = useState("loan");
    const [items, setItems] = useState([]);
    const [selectedFilters, setSelectedFilters] = useState([]);
    const [availableFilters] = useState([
        { label: 'Full Payment', value: "Lump Sum Payment" },
        { label: 'Interest-Bearing Installments', value: "Interest-Bearing" },
        { label: 'Interest-Free Installments', value: "Interest-Free" }
    ]);
    const [showModal, setShowModal] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);
    const [inputModalVisible, setInputModalVisible] = useState(false);
    const [loading, setLoading] = useState(true);
    const axios = useAxios();

    useEffect(() => {
        fetchItems();
    }, [selectedFilters, type]);

    const fetchItems = async () => {
        setLoading(true);
        setItems([]);
        const content = selectedFilters.length === 0
            ? { post_type: type === 'loan' ? 'lend' : 'borrow' }
            : {
                $and: [
                    { post_type: type === 'loan' ? 'lend' : 'borrow' },
                    { $or: selectedFilters.map(filter => ({ method: filter.value })) }
                ]
            };

        try {
            const response = await axios.post(config.proxy.common, {
                type: `get_market_posts`,
                content: content,
                extra: null
            });
            if (response.data.success) {
                if (!response.data.content) return;
                setItems(parseItem(response.data.content).sort((a, b) => b.score - a.score));
                setLoading(false);
            } else {
                alert("Failed to fetch market items.");
                setLoading(false);
            }
        } catch (error) {
            alert("Failed to fetch market items.");
            setLoading(false);
        }
    };

    const handleItemPress = (item) => {
        setSelectedItem(item);
        setShowModal(true);
    };

    const closeDialog = () => {
        setShowModal(false);
        setSelectedItem(null);
    };

    const handleMatch = () => {
        setInputModalVisible(true);
    };

    const handlePost = async (name) => {
        if (selectedItem) {
            try {
                const response = await axios.post(config.proxy.common, {
                    type: "make_deal",
                    content: {
                        _id: selectedItem._id,
                        dealer: name
                    },
                    extra: null
                });

                if (response.data.success) {
                    alert("Successful deal!");
                    closeInputModal();
                    closeDialog();
                    fetchItems();
                } else {
                    alert("Failed to make deal.");
                }
            } catch (error) {
                alert("Failed to make deal.");
            }
        }
    };

    const closeInputModal = () => {
        setInputModalVisible(false);
    };

    const renderItem = (item) => (
        <div className={styles.itemContainer} onClick={() => handleItemPress(item)}>
            <p className={styles.itemText}>{item.poster} - {parseFloat(item.score).toFixed(3)} - {item.interest} - {item.amount} - {item.period}</p>
        </div>
    );

    const renderEmptyComponent = () => (
        <div className={styles.emptyContainer}>
            {loading ? <Spinner size="large" /> : <p>No items available</p>}
        </div>
    );

    const switchTab = (tab) => {
        if (tab !== type) {
            setType(tab);
        }
    };

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
            <div className={styles.multiSelectContainer}>
                <MultiSelect
                    options={availableFilters}
                    value={selectedFilters}
                    onChange={setSelectedFilters}
                    labelledBy="Pick Filters"
                />
            </div>
            <p className={styles.title}>Post in the Market</p>
            <p className={styles.info}>poster-score-interest-amount-duration (month)</p>
            <div className={styles.listContainer}>
                {items.length > 0 ? items.map(renderItem) : renderEmptyComponent()}
            </div>
            {inputModalVisible && (
                <InputModal
                    modalVisible={inputModalVisible}
                    onConfirm={handlePost}
                    onRequestClose={closeInputModal}
                    title="Naming Your Deal"
                    placeholder="Enter your name here..."
                />
            )}
            {showModal && selectedItem && (
                <RequestDetail visible={showModal} onRequestClose={closeDialog} request={selectedItem} onActionPress={handleMatch} market />
            )}
        </div>
    );
};

export default MarketComponent;
