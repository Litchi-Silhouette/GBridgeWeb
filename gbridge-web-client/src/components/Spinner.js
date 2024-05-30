import React from 'react';
import './Spinner.css';

const Spinner = ({ size = 'large', color = '#0000ff' }) => {
    const spinnerSize = size === 'large' ? 80 : size === 'medium' ? 40 : size === 'small' ? 20 : 10;
    const borderSize = size === 'large' ? 16 : size === 'medium' ? 8 : size === 'small' ? 4 : 2;

    const spinnerStyle = {
        width: `${spinnerSize}px`,
        height: `${spinnerSize}px`,
        borderWidth: `${borderSize}px`,
        borderTopColor: color,
    };

    return <div className="spinner" style={spinnerStyle}></div>;
};

export default Spinner;
