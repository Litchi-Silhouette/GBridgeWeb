import React, { useState } from 'react';
import styles from './MyButton.module.css';
import BellIcon from '../assets/bell.png';
import InputModal from './InputModal';

const IPSetting = () => {
    const [visibility, setVisibility] = useState(false);

    return (
        <button onClick={() => setVisibility(true)} className={styles.ipButton}>
            <InputModal modalVisible={visibility} onConfirm={(text) => {
                console.log(text);
                global.host = text.trim();
                setVisibility(false);
            }} onRequestClose={() => setVisibility(false)}
                title={"Enter server IP:"}
                placeholder={global.host}
            />
        </button>
    );
};

const IconButton = ({ onPress, image, selected }) => {
    return (
        <button onClick={onPress} className={[styles.iconButton, selected ? styles.selected : ''].join(' ')}>
            <img src={image} alt="icon" className={styles.iconImage} />
        </button>
    );
};

const NotificationButton = ({ onPress }) => {
    return (
        <IconButton onPress={onPress} image={BellIcon} />
    );
};

const MyButton = ({ title, onPress, disable }) => {
    return (
        <button className={[styles.myButton, disable ? styles.disabled : ''].join(' ')}
            onClick={onPress} disabled={disable}>
            {title}
        </button>
    );
};

const SingleButton = ({ title, onPress, disable }) => {
    return (
        <button className={[styles.singleButton, disable ? styles.disabled : ''].join(' ')}
            onClick={onPress} disabled={disable}>
            {title}
        </button>
    );
};

const TwoButtonsInline = ({ title1, title2, onPress1, onPress2, disable1, disable2 }) => {
    return (
        <div className={styles.buttonsInlineContainer}>
            <MyButton title={title1} onPress={onPress1} disable={disable1} />
            <MyButton title={title2} onPress={onPress2} disable={disable2} />
        </div>
    );
};

const TextButton = ({ title, onPress }) => {
    return (
        <button className={styles.textButton} onClick={onPress}>
            {title}
        </button>
    );
};

export { MyButton, TwoButtonsInline, SingleButton, IPSetting, NotificationButton, TextButton };
