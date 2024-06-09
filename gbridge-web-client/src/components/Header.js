import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHome, faClipboard, faStar, faUser, faShoppingCart, faSignOutAlt } from '@fortawesome/free-solid-svg-icons';
import styles from './Header.module.css';
import gBridgeIcon from '../assets/launch_screen.png';
import { resetInfo } from '../store/globalSlice';
import { useAxios } from '../utils/AxiosContext';

// title navigation bar
const Header = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const axios = useAxios();
    const [selected, setSelected] = useState(location.pathname);

    const handleLogout = async () => {
        try {
            const response = await axios.post('/api/logout');
            if (response.data.success) {
                resetInfo(); // Reset global state
                console.log('User logged out');
                navigate('/', { replace: true });
            } else
                throw new Error('Failed to logout');
        } catch (error) {
            console.error('Error during logout:', error);
        }
    };

    return (
        <div className={styles.headerContainer}>
            <div className={styles.leftSection}>
                <img src={gBridgeIcon} alt="GBridge" className={styles.logo} />
                <span className={styles.title}>GBridge</span>
            </div>
            <div className={styles.middleSection}>
                <Link to="/home" replace className={`${styles.button} ${selected === '/home' ? styles.selected : ''}`} onClick={() => setSelected('/home')}>
                    <FontAwesomeIcon icon={faHome} size="lg" />
                    <span className={styles.buttonText}>Home</span>
                </Link>
                <Link to="/market" replace className={`${styles.button} ${selected === '/market' ? styles.selected : ''}`} onClick={() => setSelected('/market')}>
                    <FontAwesomeIcon icon={faShoppingCart} size="lg" />
                    <span className={styles.buttonText}>Market</span>
                </Link>
                <Link to="/userRequest" replace className={`${styles.button} ${selected === '/userRequest' ? styles.selected : ''}`} onClick={() => setSelected('/userRequest')}>
                    <FontAwesomeIcon icon={faClipboard} size="lg" />
                    <span className={styles.buttonText}>User Requests</span>
                </Link>
                <Link to="/score" replace className={`${styles.button} ${selected === '/score' ? styles.selected : ''}`} onClick={() => setSelected('/score')}>
                    <FontAwesomeIcon icon={faStar} size="lg" />
                    <span className={styles.buttonText}>Score</span>
                </Link>
                <Link to="/personalInfo" replace className={`${styles.button} ${selected === '/personalInfo' ? styles.selected : ''}`} onClick={() => setSelected('/personalInfo')}>
                    <FontAwesomeIcon icon={faUser} size="lg" />
                    <span className={styles.buttonText}>Personal Info</span>
                </Link>
            </div>
            <div className={styles.rightSection}>
                <button onClick={handleLogout} className={styles.logoutButton}>
                    <FontAwesomeIcon icon={faSignOutAlt} size="lg" />
                    <span className={styles.buttonText}>Logout</span>
                </button>
            </div>
        </div >
    );
};

export default Header;
