import React from 'react';
import styles from './MyButton.module.css';

// custom button components

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

export { MyButton, TwoButtonsInline, SingleButton, TextButton };
