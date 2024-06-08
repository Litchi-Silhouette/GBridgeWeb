import React, { useState } from 'react';
import styles from './UserRequests.module.css'; // Import CSS module
import Header from '../components/Header';
import CartInterface from '../components/Cart';
import PostInterface from '../components/PostInterface';

const UserRequests = () => {
    const [view, setView] = useState("cart"); // cart, borrow, lend

    const changeView = (view) => {
        setView(view);
    }

    const renderBody = () => {
        if (view === "cart") {
            return <CartInterface navigateToPost={changeView} />;
        } else {
            return <PostInterface post_type={view} goBack={() => changeView('cart')} />;
        }
    }

    return (
        <div className={styles.container}>
            <Header />
            {renderBody()}
        </div>
    );
};

export default UserRequests;