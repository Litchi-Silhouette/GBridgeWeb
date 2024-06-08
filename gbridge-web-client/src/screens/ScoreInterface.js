import React, { useState, useEffect } from 'react';
import { useAxios } from '../utils/AxiosContext';
import styles from './ScoreInterface.module.css'; // Import the CSS module
import { TwoButtonsInline, TextButton } from '../components/MyButton';
import Spinner from '../components/Spinner';
import Header from '../components/Header';
import config from '../config/config.json';
import { useNavigate } from 'react-router-dom';

const ScoreInterface = () => {
    const [score, setScore] = useState(null);
    const [info, setInfo] = useState(null);
    const [suggestion, setSuggestion] = useState('Waiting for suggestions');
    const [loadingInfo, setLoadingInfo] = useState(true);
    const [loadingScore, setLoadingScore] = useState(true);
    const [loadingSuggestions, setLoadingSuggestions] = useState(false);
    const axios = useAxios();
    const navigate = useNavigate();

    useEffect(() => {
        getScore();
    }, []);

    const getScore = async () => {
        try {
            const response = await axios.post(config.proxy.common, {
                type: "estimate_score",
                content: {},
                extra: null
            });

            if (response.data.success) {
                setScore(response.data.content.score);
                setLoadingScore(false);
                getInfo();
            } else {
                alert("Failed to retrieve score details.");
            }
        } catch (error) {
            alert("Failed to retrieve score details.");
        }
    };

    const getInfo = async () => {
        try {
            const response = await axios.post(config.proxy.common, {
                type: "get_user_info",
                content: [
                    "cash",
                    "income",
                    "expenditure",
                    "debt",
                    "assets",
                    "no_of_dependents",
                    "graduated",
                    "self_employed",
                    "residential_assets_value",
                    "commercial_assets_value",
                    "luxury_assets_value",
                    "bank_asset_value"
                ],
                extra: null
            });

            if (response.data.success) {
                setInfo(response.data.content);
                setLoadingInfo(false);
            } else {
                alert("Failed to retrieve user information.");
            }
        } catch (error) {
            alert("Failed to retrieve user information.");
        }
    };

    const getSuggestions = async () => {
        setLoadingSuggestions(true);
        try {
            const response = await axios.post(config.proxy.common, {
                type: "get_bot_evaluation",
                content: {},
                extra: null
            });

            if (response.data.success) {
                setSuggestion(response.data.content);
                setLoadingSuggestions(false);
            } else {
                alert("Failed to retrieve suggestions.");
                setLoadingSuggestions(false);
            }
        } catch (error) {
            alert("Failed to retrieve suggestions.");
        }
    };

    const { cash, income, expenditure, debt, assets,
        no_of_dependents, graduated, self_employed,
        residential_assets_value, commercial_assets_value,
        luxury_assets_value, bank_asset_value
    } = info || {};

    const renderUserInfo = () => {
        if (loadingScore || loadingInfo)
            return <div className={styles.spinnerContainer}><Spinner size='large' /></div>;
        else {
            return (
                <div className={styles.leftContainer}>
                    <p className={styles.info}>Your Score: {parseFloat(score ? score : 0.5).toFixed(2)}/1.00</p>
                    <p className={styles.info}>Cash: ${cash ? cash.toString() : 'NO INFO'}</p>
                    <p className={styles.info}>Income: ${income ? income.toString() : 'NO INFO'}/month</p>
                    <p className={styles.info}>Expenditure: ${expenditure ? expenditure.toString() : 'NO INFO'}/month</p>
                    <p className={styles.info}>Debt: ${debt ? debt.toString() : 'NO INFO'}</p>
                    <p className={styles.info}>Assets: ${assets ? assets.toString() : 'NO INFO'}</p>
                    <p className={styles.info}>No. of Dependents: {no_of_dependents ? no_of_dependents.toString() : 'NO INFO'}</p>
                    <p className={styles.info}>Graduated: {graduated ? 'YES' : 'NO'}</p>
                    <p className={styles.info}>Self Employed: {self_employed ? 'YES' : 'NO'}</p>
                    <p className={styles.info}>Residential Assets Value: ${residential_assets_value ? residential_assets_value.toString() : 'NO INFO'}</p>
                    <p className={styles.info}>Commercial Assets Value: ${commercial_assets_value ? commercial_assets_value.toString() : 'NO INFO'}</p>
                    <p className={styles.info}>Luxury Assets Value: ${luxury_assets_value ? luxury_assets_value.toString() : 'NO INFO'}</p>
                    <p className={styles.info}>Bank Asset Value: ${bank_asset_value ? bank_asset_value.toString() : 'NO INFO'}</p>
                </div>
            );
        }
    }


    return (
        <div className={styles.container}>
            <Header />
            <div className={styles.infoContainer}>
                {renderUserInfo()}
                <div className={styles.rightContainer}>
                    <TextButton title="Evaluation from bot:" onPress={getSuggestions} />
                    <div className={styles.suggestionBoard}>
                        <p className={styles.suggestion}>{loadingSuggestions ? <div className={styles.spinnerContainer}><Spinner size='large' /></div> : suggestion}</p>
                    </div>
                </div>
            </div>
            <TwoButtonsInline
                title1="Ask GPT"
                title2="Ask professional"
                onPress1={() => navigate('/botChat', { replace: true })}
                onPress2={() => navigate('/adviserChat', { replace: true })}
                disable1={false}
                disable2={false}
            />
        </div>
    );
};

export default ScoreInterface;
