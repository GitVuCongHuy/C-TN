import React, { useState, useCallback, useEffect, useRef } from 'react';
import styles from './Chatbot.module.css';
import { BsChatDots } from 'react-icons/bs';

const CHATBOT_API_ENDPOINT = '/api/chatbot/message';

function ChatbotComponent() {
  const [messages, setMessages] = useState([{ id: Date.now(), sender: 'bot', text: 'Chào bạn, tôi có thể giúp gì?' }]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false); // trạng thái mở/đóng

  const [sessionId] = useState(() => `web-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (isOpen) scrollToBottom();
  }, [messages, isOpen]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleInputChange = (e) => setInputValue(e.target.value);

  const sendMessage = useCallback(async () => {
    const text = inputValue.trim();
    if (!text) return;

    const userMsg = { id: Date.now(), sender: 'user', text };
    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    setIsLoading(true);

    try {
      const response = await fetch(CHATBOT_API_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, sessionId }),
      });

      const data = await response.json();
      const botMsg = { id: Date.now() + 1, sender: 'bot', text: data.reply };
      setMessages(prev => [...prev, botMsg]);
    } catch (err) {
      setMessages(prev => [...prev, { id: Date.now() + 1, sender: 'bot', text: 'Xin lỗi, tôi đang gặp lỗi.' }]);
    } finally {
      setIsLoading(false);
    }
  }, [inputValue, sessionId]);

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !isLoading) sendMessage();
  };

  return (
    <>
      {!isOpen && (
        <button className={styles['chatbot-button']} onClick={() => setIsOpen(true)} aria-label="Mở chat">
            <BsChatDots size={26} />
        </button>
      
      )}

      {isOpen && (
        <div className={styles['chatbot-container']}>
          <div className={styles['chatbot-header']} onClick={() => setIsOpen(false)}>
            ☕ Chat với chúng tôi
          </div>
          <div className={styles['chatbot-messages']}>
            {messages.map(msg => (
              <div key={msg.id} className={`${styles.message} ${styles[msg.sender]}`}>
                <span className={styles['message-text']}>{msg.text}</span>
              </div>
            ))}
            {isLoading && (
              <div className={`${styles.message} ${styles.bot}`}>
                <span className={styles['message-text']}>...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
          <div className={styles['chatbot-input']}>
            <input
              type="text"
              value={inputValue}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
              placeholder="Nhập tin nhắn..."
              disabled={isLoading}
            />
            <button onClick={sendMessage} disabled={isLoading}>Gửi</button>
          </div>
        </div>
      )}
    </>
  );
}

export default ChatbotComponent;
