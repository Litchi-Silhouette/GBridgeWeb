import React, { useState, useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import { TextField, Typography, Avatar, List, ListItem, Paper } from '@mui/material';
import { useAxios } from '../utils/AxiosContext';
import { MyButton } from '../components/MyButton';
import styles from './ChatInterface.module.css';
import { styled } from '@mui/material/styles';
import DefaultUserIcon from '../assets/default_user_icon.png';
import DefaultOppIcon from '../assets/default_opp_icon.png';
import config from '../config/config.json';
import { useSelector } from 'react-redux';
import Spinner from '../components/Spinner';
import Header from '../components/Header';

const CustomTextField = styled(TextField)(({ theme }) => ({
    margin: '0 10px 0 0',
    fontSize: '16px',
    '& .MuiInputBase-root': {
        borderRadius: 4,
        backgroundColor: '#F3F6F9',
        padding: '10px 12px',
    },
    '& .MuiOutlinedInput-root': {
        '& fieldset': {
            borderColor: '#E0E3E7',
        },
        '&:hover fieldset': {
            borderColor: '#B2BAC2',
        },
        '&.Mui-focused fieldset': {
            borderColor: '#6F7E8C',
        },
    },
}));

const ChatInterface = forwardRef((props, ref) => {
    const messageBox = useRef(null);
    const userIcon = useSelector(state => state.global.portrait);

    useImperativeHandle(ref, () => ({
        scrollToEnd(animated = false) {
            const container = messageBox.current;
            if (container)
                container.scrollTo({
                    top: container.scrollHeight,
                    behavior: animated ? 'smooth' : 'instant'
                });
        }
    }));

    const scrollToEnd = (animated = false) => {
        const container = messageBox.current;
        if (container)
            container.scrollTo({
                top: container.scrollHeight,
                behavior: animated ? 'smooth' : 'instant'
            });
    };

    const sendMessage = () => {
        const inputText = props.inputText;
        if (inputText.trim() === '') {
            alert("Please enter a message.");
            return;
        }

        const currentTime = new Date();
        const newMessage = {
            id: props.messages.length + 1,
            date: currentTime.toLocaleDateString(),
            time: currentTime.toLocaleTimeString(),
            text: props.inputText,
            user: "You"
        };

        props.setMessages(prevMessages => [...prevMessages, newMessage]);
        props.setInputText('');
        props.setIsLoading(true);
        scrollToEnd(true);
        props.forwardMessage(inputText);
    };

    // Render a message item  
    const renderMessageItem = (item) => {
        const isUser = item.user !== props.opp;
        let icon = isUser ? (userIcon || DefaultUserIcon) : DefaultOppIcon;

        const currentDate = new Date().toLocaleDateString();
        return (
            <ListItem key={item.id} className={styles.messageContainer} >
                <Typography variant="body2" color="textSecondary" className={styles.timeText}>
                    {item.date !== currentDate && `${item.date} `}{item.time}
                </Typography>
                <Typography variant="body2" color="textSecondary" className={`${styles.infoText} ${isUser ? styles.userText : styles.responseText}`}>
                    {item.user}
                </Typography>
                <div className={isUser ? styles.userMessage : styles.responseMessage}>
                    <Avatar alt="user icon" src={icon} className={styles.avatar} />
                    <Typography
                        component="span"
                        variant="body2"
                        color="textPrimary"
                        className={`${styles.messageText} ${isUser ? styles.userMessage : styles.responseMessage}`}
                    >
                        {item.text}
                    </Typography>
                </div>
            </ListItem >
        );
    };

    return (
        <div className={styles.container}>
            <Header />
            <div className={styles.chatContainer}>
                <h2 className={styles.title}>
                    {props.opp} Chat
                </h2>
                <Paper className={styles.chatBox} ref={messageBox}>
                    <List>
                        {props.messages.map((item) => renderMessageItem(item))}
                    </List>
                </Paper>
                <div className={styles.inputContainer}>
                    <CustomTextField
                        fullWidth
                        variant="outlined"
                        placeholder="Type a message..."
                        size="small"
                        value={props.inputText}
                        onChange={(e) => props.setInputText(e.target.value)}
                        multiline
                        minRows={1}
                    />
                    {props.isLoading ? (
                        <Spinner size="small" />
                    ) : (
                        <MyButton onPress={sendMessage} disable={props.inputText === ""} title="Send" />
                    )}
                </div>
            </div>
        </div>
    );
});

const BotChatInterface = () => {
    const [messages, setMessages] = useState([]);
    const [inputText, setInputText] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const axios = useAxios();
    const chatRef = useRef(null);

    const forwardMessage = async (inputText) => {
        try {
            const orgResponse = await axios.post(config.proxy.common, {
                type: "send_message_to_bot",
                content: inputText
            });
            const response = orgResponse.data;
            if (response.success) {
                const currentTime = new Date();
                const newResponse = {
                    id: messages.length + 1,
                    date: currentTime.toLocaleDateString(),
                    time: currentTime.toLocaleTimeString(),
                    text: response.content,
                    user: "Bot"
                };

                setMessages(prevMessages => [...prevMessages, newResponse]);
                setTimeout(() => chatRef.current?.scrollToEnd(true), 100);
            } else
                throw new Error();
        } catch (error) {
            alert("Failed to send message.");
        }
        setIsLoading(false);
    };

    return (
        <ChatInterface
            ref={chatRef}
            messages={messages}
            setMessages={setMessages}
            inputText={inputText}
            setInputText={setInputText}
            isLoading={isLoading}
            setIsLoading={setIsLoading}
            forwardMessage={forwardMessage}
            opp="Bot"
        />
    );
};

const AdviserChatInterface = () => {
    const [messages, setMessages] = useState([]);
    const [inputText, setInputText] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const axios = useAxios();
    const chatRef = useRef(null);
    const interval = useRef(null);

    useEffect(() => {
        console.log("mounted AdviserChatInterface!");

        if (interval.current) clearInterval(interval.current);
        interval.current = setInterval(fetchAdvisorMessages, 3000);
        fetchAdvisorMessages();

        return () => {
            console.log("unmounted AdviserChatInterface!");
            clearInterval(interval.current);
            interval.current = null;
        };
    }, []);

    const fetchAdvisorMessages = async () => {
        if (isLoading) return;
        try {
            const orgResponse = await axios.post(config.proxy.common, {
                type: "get_adviser_conversation"
            })
            const response = orgResponse.data;
            if (response.success) {
                let length = messages.length;
                setMessages(prevMessages => { length = prevMessages.length; return prevMessages });
                if (response.content && response.content.length > length) {
                    const newMessages = response.content.slice(length).map((message, index) => {
                        const timeAll = new Date(message.time);
                        return {
                            id: index + 1 + length,
                            date: timeAll.toLocaleDateString(),
                            time: timeAll.toLocaleTimeString(),
                            text: message.msg,
                            user: message.role === 'user' ? "You" : "Adviser"
                        };
                    });
                    setMessages(prevMessages => [...prevMessages, ...newMessages]);
                    setTimeout(() => chatRef.current?.scrollToEnd(true), 100);
                }
            } else
                throw new Error();
        } catch (error) {
            alert("Failed to fetch messages from adviser.");
        }
    };

    const forwardMessage = async (inputText) => {
        try {
            const response = await axios.post(config.proxy.common, {
                type: "send_message_to_adviser",
                content: inputText
            });
            if (response.data.success)
                console.log("sent message to advisor!");
            else
                throw new Error();
        } catch (error) {
            alert("Failed to send message.");
        }
        setIsLoading(false);
    }

    return (
        <ChatInterface
            ref={chatRef}
            messages={messages}
            setMessages={setMessages}
            inputText={inputText}
            setInputText={setInputText}
            isLoading={isLoading}
            setIsLoading={setIsLoading}
            forwardMessage={forwardMessage}
            opp="Adviser"
        />
    );
};

export { BotChatInterface, AdviserChatInterface };
