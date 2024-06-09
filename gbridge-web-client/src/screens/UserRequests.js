import React, { useState } from 'react';
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
        <div style={styles.container}>
            <Header />
            {renderBody()}
        </div>
    );
};

const styles = {
    container: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "10px",
        paddingTop: "70px",
        width: "100%",
        height: "100vh",
        boxSizing: "border-box",
    }
};

export default UserRequests;