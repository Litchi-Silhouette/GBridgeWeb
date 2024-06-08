// src/screens/Home.js
import React, { useState, useEffect } from 'react';
import { useAxios } from '../utils/AxiosContext';
import { differenceInDays, addDays } from 'date-fns';
import parseItems from '../utils/ParseItem';// Import the CSS module
import { useSelector } from 'react-redux';
import config from '../config/config.json';
import Header from '../components/Header';
import styles from './Home.module.css';
import Spinner from '../components/Spinner';
import { useNavigate } from 'react-router-dom';
import TextAnimation from '../components/TextAnimation';
import RepaymentInterface from '../components/RepayInterface';
import DefaultUserIcon from '../assets/default_user_icon.png';

const ProgressRing = ({ radius, stroke, progress, color }) => {
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;

  const [offset, setOffset] = useState(circumference);

  useEffect(() => {
    const progressOffset = (1 - progress) * circumference;
    setOffset(progressOffset);
  }, [progress, circumference]);

  return (
    <svg
      height={radius * 2}
      width={radius * 2}
    >
      <circle
        stroke="lightgray"
        fill="transparent"
        strokeWidth={stroke}
        r={normalizedRadius}
        cx={radius}
        cy={radius}
      />
      <circle
        stroke={color || "rgba(0, 123, 255, 1)"}
        fill="transparent"
        strokeWidth={stroke}
        strokeDasharray={circumference + ' ' + circumference}
        strokeDashoffset={offset}
        r={normalizedRadius}
        cx={radius}
        cy={radius}
        style={{ transition: 'stroke-dashoffset 3s ease-in-out' }} // Slowed down transition
      />
    </svg>
  );
};

const Home = () => {
  const [view, setView] = useState('home');
  const [selectedItem, setSelectedItem] = useState(null);
  const [loans, setLoans] = useState([]);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0.5);
  const [color, setColor] = useState("rgba(0, 123, 255, 1)");
  const axios = useAxios();
  const navigate = useNavigate();

  const gUsername = useSelector(state => state.global.username);
  const gUserIcon = useSelector(state => state.global.portrait);
  const authenticated = useSelector(state => state.global.authenticated);

  useEffect(() => {
    getScore();
    fetchLoans().catch((error) => {
      setLoading(false);
      alert(`Failed to connect to server: ${error.message}`);
    });
  }, []);

  const getScore = async () => {
    try {
      const response = await axios.post(config.proxy.common, {
        type: "estimate_score",
        content: {},
        extra: null
      });
      let blue = {
        r: 0,
        g: 123,
        b: 255,
      };
      let red = {
        r: 255,
        g: 44,
        b: 44,
      };
      let color = {};
      if (response.data.success) {
        const score = response.data.content.score;
        setProgress(score);
        console.log('Fetched score');
        color.r = Math.floor((1 - score) * red.r + score * blue.r);
        color.g = Math.floor((1 - score) * red.g + score * blue.g);
        color.b = Math.floor((1 - score) * red.b + score * blue.b);
        setColor(`rgba(${color.r}, ${color.g}, ${color.b}, 1)`);
      } else {
        alert("Failed to retrieve score details.");
      }
    } catch {
      alert("Failed to retrieve score details.");
    }
  };

  const fetchMessages = async () => {
    try {
      const response = await axios.post(config.proxy.common, {
        type: 'get_notification',
        extra: null
      });
      if (response.data.success) {
        if (!response.data.content) return;
        const fetchedMessages = response.data.content
          .filter(msg => msg.receiver === gUsername)
          .map((msg, index) => ({ ...msg, id: index }));
        setMessages(fetchedMessages);
        setLoading(false);
        console.log('Fetched messages');
      } else {
        alert('Failed to fetch messages.');
      }
    } catch {
      alert('Failed to fetch messages.');
    }
  };

  const fetchLoans = async () => {
    try {
      const response = await axios.post(config.proxy.common, {
        type: 'get_user_deals',
        extra: null
      });
      if (response.data.success) {
        if (!response.data.content) return;
        let items = parseItems(response.data.content);
        items = items.map(item => ({
          ...item,
          dueDate: addDays(new Date(item.created_time), 30 * item.period).toLocaleDateString()
        }));
        const currentDate = new Date();
        const loanDeals = items.filter(req => (
          req.borrower_username === gUsername && differenceInDays(req.dueDate, currentDate) < 15
        ));
        setLoans(loanDeals);
        fetchMessages();
        console.log('Fetched posts and deals');
      } else {
        alert('Failed to fetch deals.');
        setLoading(false);
      }
    } catch {
      alert('Failed to fetch deals.');
      setLoading(false);
    }
  };

  const confirmReading = (item) => {
    if (window.confirm("You make sure you have received the notification?")) {
      axios.post(config.proxy.common, {
        type: "delete_notification",
        content: {
          _id: item._id
        }
      }).then((response) => {
        if (response.data.success) {
          console.log("Deleted notification");
          fetchMessages();
        } else {
          alert('Failed to delete message.');
        }
      }).catch(() => {
        alert('Failed to delete message.');
      });
    }
  };

  const navigateToRepayment = (loan) => {
    setSelectedItem(loan);
    setView('repayment');
  };

  const renderLoan = (loan) => (
    <div className={styles.itemContainer} onClick={() => navigateToRepayment(loan)}>
      <p style={{ padding: 0, margin: 0 }}>Amount: {loan.amount} Due: {loan.dueDate}</p>
    </div>
  );

  const renderMessage = (message) => (
    <div className={styles.itemContainer} onClick={() => confirmReading(message)}>
      <p style={{ color: "#007BFF", padding: 0, margin: 0 }}>Sender: {message.sender}</p>
      <p style={{ fontSize: 16, padding: 0, margin: 0 }}>{message.content}</p>
    </div>
  );

  const renderEmpty = (title) => {
    return (
      <div className={styles.emptyContainer}>
        {loading ? <Spinner size="medium" /> : <p className={styles.title} > {title}</p>}
      </div>
    )
  };

  const renderBody = () => {
    if (view === 'home')
      return (
        <>
          <div className={styles.top}>
            <TextAnimation lines={["A new day in GBridge!"]} />
            <div className={styles.topContainer}>
              <div className={styles.topContainer}>
                <img src={gUserIcon || DefaultUserIcon} alt="User Icon" className={styles.icon} />
                <div className={styles.colum}>
                  <p className={styles.title}>{gUsername}</p>
                  <p className={styles.title}>{authenticated ? "Verified" : "Not Verified"}</p>
                </div>
              </div>
              <div className={styles.topContainer}>
                <ProgressRing radius={50} stroke={10} progress={progress} color={color} />
                <div className={styles.colum}>
                  <p className={styles.title}>Your Score:</p>
                  <p className={styles.title} style={{ color: color }}>{progress.toFixed(2)}/1.00</p>
                </div>
              </div>
            </div>
          </div>
          <p className={styles.modalTitle}>Notifications</p>
          <div className={styles.row}>
            <div className={styles.column}>
              <p className={styles.title}>Upcoming Repayment</p>
              <div className={styles.listContainer}>
                {loans.length > 0 ? loans.map(renderLoan) : renderEmpty("No upcoming repayment")}
              </div>
            </div>
            <div className={styles.column}>
              <p className={styles.title}>Messages</p>
              <div className={styles.listContainer}>
                {messages.length > 0 ? messages.map(renderMessage) : renderEmpty("No messages")}
              </div>
            </div>
          </div>
        </>
      );
    else
      return <RepaymentInterface loanDetail={selectedItem} goBack={
        () => {
          setSelectedItem(null);
          setView('home');
        }} />;
  }

  return (
    <div className={styles.container}>
      <Header />
      {renderBody()}
    </div >
  );
};

export default Home;
