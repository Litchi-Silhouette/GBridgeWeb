import React, { useState, useEffect } from 'react';

const TextAnimation = ({ lines, pauseDuration = 3000 }) => {
    const [displayedTexts, setDisplayedTexts] = useState(new Array(lines.length).fill(''));
    const [lineIndex, setLineIndex] = useState(0);

    useEffect(() => {
        let timeoutId;

        const currentLine = lines[lineIndex];
        const currentText = displayedTexts[lineIndex];

        if (currentText.length < currentLine.length) {
            timeoutId = setTimeout(() => {
                const newTexts = displayedTexts.map((text, index) =>
                    index === lineIndex ? text + currentLine[text.length] : text);
                setDisplayedTexts(newTexts);
            }, 100);
        } else if (lineIndex < lines.length - 1) {
            // Move to the next line after the current line is fully displayed
            setTimeout(() => setLineIndex(lineIndex + 1), 300);
        } else {
            // After all lines are displayed, wait and then reset
            timeoutId = setTimeout(() => {
                setDisplayedTexts(new Array(lines.length).fill(''));
                setLineIndex(0);
            }, pauseDuration);
        }

        return () => clearTimeout(timeoutId);
    }, [displayedTexts, lineIndex, lines, pauseDuration]);

    return (
        <div style={styles.container}>
            {displayedTexts.map((text, index) => (
                <p key={index} style={styles.textStyle}>
                    {text}
                </p>
            ))}
        </div>
    );
};

const styles = {
    container: {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
    },
    textStyle: {
        fontSize: '30px',
        color: 'black',
        margin: '5px 0',
        fontWeight: 'bold',
    }
};

export default TextAnimation;
