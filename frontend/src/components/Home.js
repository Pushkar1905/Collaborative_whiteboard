import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useSocket } from '../context/SocketContext';

const HomeContainer = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
`;

const Card = styled.div`
  background: white;
  border-radius: 20px;
  padding: 40px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  max-width: 500px;
  width: 100%;
  text-align: center;
`;

const Title = styled.h1`
  color: #333;
  margin-bottom: 10px;
  font-size: 2.5rem;
  font-weight: 700;
`;

const Subtitle = styled.p`
  color: #666;
  margin-bottom: 30px;
  font-size: 1.1rem;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const InputGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  text-align: left;
`;

const Label = styled.label`
  color: #333;
  font-weight: 600;
  font-size: 0.9rem;
`;

const Input = styled.input`
  padding: 12px 16px;
  border: 2px solid #e1e5e9;
  border-radius: 10px;
  font-size: 1rem;
  transition: border-color 0.3s ease;

  &:focus {
    border-color: #667eea;
    outline: none;
  }
`;

const CheckboxGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 10px;
`;

const Checkbox = styled.input`
  width: 18px;
  height: 18px;
  accent-color: #667eea;
`;

const Button = styled.button`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 15px 30px;
  border: none;
  border-radius: 10px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 20px rgba(102, 126, 234, 0.3);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

const Divider = styled.div`
  margin: 30px 0;
  display: flex;
  align-items: center;
  gap: 15px;
  color: #666;

  &::before,
  &::after {
    content: '';
    flex: 1;
    height: 1px;
    background: #e1e5e9;
  }
`;

const QuickJoinButton = styled.button`
  background: #f8f9fa;
  color: #333;
  padding: 12px 24px;
  border: 2px solid #e1e5e9;
  border-radius: 10px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: #e9ecef;
    border-color: #667eea;
  }
`;

const StatusIndicator = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-bottom: 20px;
  padding: 10px;
  border-radius: 8px;
  background: ${props => props.connected ? '#d4edda' : '#f8d7da'};
  color: ${props => props.connected ? '#155724' : '#721c24'};
  font-size: 0.9rem;
`;

const StatusDot = styled.div`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: ${props => props.connected ? '#28a745' : '#dc3545'};
`;

function Home() {
  const navigate = useNavigate();
  const { isConnected, joinRoom } = useSocket();
  const [mode, setMode] = useState('join'); // 'join' or 'create'

  // State for create room
  const [createData, setCreateData] = useState({
    username: '',
    isPrivate: false,
    password: '',
    passwordConfirm: ''
  });
  // State for join room
  const [joinData, setJoinData] = useState({
    username: '',
    roomId: '',
    password: ''
  });

  const handleCreateChange = (e) => {
    const { name, value, type, checked } = e.target;
    setCreateData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };
  const handleJoinChange = (e) => {
    const { name, value } = e.target;
    setJoinData(prev => ({ ...prev, [name]: value }));
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (!createData.username.trim()) {
      alert('Please enter a username');
      return;
    }
    if (createData.isPrivate) {
      if (!createData.password.trim()) {
        alert('Please enter a password for private room');
        return;
      }
      if (createData.password !== createData.passwordConfirm) {
        alert('Passwords do not match');
        return;
      }
    }
    try {
      const res = await fetch(
        (process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000') + '/api/rooms',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: `Room ${Math.random().toString(36).substring(2, 10)}`,
            isPrivate: createData.isPrivate,
            password: createData.isPrivate ? createData.password : ''
          })
        }
      );
      if (!res.ok) {
        const err = await res.json();
        alert(err.message || 'Failed to create room');
        return;
      }
      const room = await res.json();
      localStorage.setItem('username', createData.username);
      joinRoom(room.roomId, createData.username, createData.isPrivate, createData.password);
      navigate(`/whiteboard/${room.roomId}`);
    } catch (error) {
      alert('Failed to create room');
    }
  };

  const handleJoinSubmit = (e) => {
    e.preventDefault();
    if (!joinData.username.trim()) {
      alert('Please enter a username');
      return;
    }
    if (!joinData.roomId.trim()) {
      alert('Please enter a Room ID');
      return;
    }
    localStorage.setItem('username', joinData.username);
    joinRoom(joinData.roomId.trim(), joinData.username, !!joinData.password, joinData.password);
    navigate(`/whiteboard/${joinData.roomId.trim()}`);
  };

  const handleQuickJoin = () => {
    const username = `User${Math.floor(Math.random() * 1000)}`;
    const roomId = generateRoomId();
    joinRoom(roomId, username);
    navigate(`/whiteboard/${roomId}`);
  };

  const generateRoomId = () => {
    return Math.random().toString(36).substring(2, 10);
  };

  return (
    <HomeContainer>
      <Card>
        <StatusIndicator connected={isConnected}>
          <StatusDot connected={isConnected} />
          {isConnected ? 'Connected to server' : 'Connecting to server...'}
        </StatusIndicator>
        <Title>Collaborative Whiteboard</Title>
        <Subtitle>Draw, collaborate, and create together in real-time</Subtitle>
        <div style={{ display: 'flex', gap: 16, justifyContent: 'center', marginBottom: 24 }}>
          <Button className={mode === 'join' ? 'primary' : 'secondary'} onClick={() => setMode('join')}>Join Room</Button>
          <Button className={mode === 'create' ? 'primary' : 'secondary'} onClick={() => setMode('create')}>Create Room</Button>
        </div>
        {mode === 'join' ? (
          <Form onSubmit={handleJoinSubmit}>
            <InputGroup>
              <Label htmlFor="join-username">Your Name</Label>
              <Input
                type="text"
                id="join-username"
                name="username"
                value={joinData.username}
                onChange={handleJoinChange}
                placeholder="Enter your name"
                required
              />
            </InputGroup>
            <InputGroup>
              <Label htmlFor="roomId">Room ID</Label>
              <Input
                type="text"
                id="roomId"
                name="roomId"
                value={joinData.roomId}
                onChange={handleJoinChange}
                placeholder="Enter Room ID"
                required
              />
            </InputGroup>
            <InputGroup>
              <Label htmlFor="join-password">Room Password (if private)</Label>
              <Input
                type="password"
                id="join-password"
                name="password"
                value={joinData.password}
                onChange={handleJoinChange}
                placeholder="Enter room password"
              />
            </InputGroup>
            <Button type="submit" disabled={!isConnected}>Join Room</Button>
          </Form>
        ) : (
          <Form onSubmit={handleCreateSubmit}>
            <InputGroup>
              <Label htmlFor="create-username">Your Name</Label>
              <Input
                type="text"
                id="create-username"
                name="username"
                value={createData.username}
                onChange={handleCreateChange}
                placeholder="Enter your name"
                required
              />
            </InputGroup>
            <CheckboxGroup>
              <Checkbox
                type="checkbox"
                id="isPrivate"
                name="isPrivate"
                checked={createData.isPrivate}
                onChange={handleCreateChange}
              />
              <Label htmlFor="isPrivate">Private Room</Label>
            </CheckboxGroup>
            {createData.isPrivate && (
              <>
                <InputGroup>
                  <Label htmlFor="create-password">Room Password</Label>
                  <Input
                    type="password"
                    id="create-password"
                    name="password"
                    value={createData.password}
                    onChange={handleCreateChange}
                    placeholder="Enter room password"
                    required
                  />
                </InputGroup>
                <InputGroup>
                  <Label htmlFor="create-password-confirm">Confirm Password</Label>
                  <Input
                    type="password"
                    id="create-password-confirm"
                    name="passwordConfirm"
                    value={createData.passwordConfirm}
                    onChange={handleCreateChange}
                    placeholder="Confirm room password"
                    required
                  />
                </InputGroup>
              </>
            )}
            <Button type="submit" disabled={!isConnected}>Create Room</Button>
          </Form>
        )}
      </Card>
    </HomeContainer>
  );
}

export default Home; 