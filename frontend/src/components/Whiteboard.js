import React, { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useSocket } from '../context/SocketContext';
import Toolbar from './Toolbar';
import Sidebar from './Sidebar';
import Canvas from './Canvas';

const WhiteboardContainer = styled.div`
  height: 100vh;
  position: relative;
  background: #f8f9fa;
  overflow: hidden;
`;

const MainContent = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  position: relative;
`;

const Header = styled.div`
  background: white;
  padding: 15px 20px;
  border-bottom: 1px solid #e1e5e9;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 10px;
    align-items: stretch;
  }
`;

const RoomInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 15px;

  @media (max-width: 768px) {
    flex-wrap: wrap;
    gap: 8px;
  }
`;

const RoomTitle = styled.h2`
  color: #333;
  font-size: 1.2rem;
  font-weight: 600;

  @media (max-width: 768px) {
    font-size: 1rem;
  }
`;

const RoomId = styled.span`
  background: #e9ecef;
  color: #495057;
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 0.8rem;
  font-family: monospace;

  @media (max-width: 768px) {
    font-size: 0.7rem;
    padding: 2px 6px;
  }
`;

const UserCount = styled.div`
  display: flex;
  align-items: center;
  gap: 5px;
  color: #666;
  font-size: 0.9rem;
`;

const UserDot = styled.div`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #28a745;
`;

const HeaderActions = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;

  @media (max-width: 768px) {
    justify-content: center;
    flex-wrap: wrap;
  }
`;

const Button = styled.button`
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;

  @media (max-width: 768px) {
    padding: 6px 12px;
    font-size: 0.8rem;
    min-width: 80px;
  }

  &.primary {
    background: #667eea;
    color: white;

    &:hover {
      background: #5a6fd8;
    }
  }

  &.secondary {
    background: #f8f9fa;
    color: #333;
    border: 1px solid #e1e5e9;

    &:hover {
      background: #e9ecef;
    }
  }

  &.danger {
    background: #dc3545;
    color: white;

    &:hover {
      background: #c82333;
    }
  }
`;

const CanvasContainer = styled.div`
  flex: 1;
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const LoadingOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const LoadingText = styled.div`
  color: #666;
  font-size: 1.1rem;
`;

const SidebarOverlay = styled.div`
  position: fixed;
  top: 0;
  right: 0;
  width: min(300px, 90vw);
  height: 100vh;
  background: white;
  border-left: 1px solid #e1e5e9;
  box-shadow: -2px 0 8px rgba(0,0,0,0.1);
  transition: transform 0.3s ease-in-out, opacity 0.3s;
  z-index: 1000;
  overflow: hidden;
  touch-action: pan-y;
  transform: ${({ $show }) => $show ? 'translateX(0)' : 'translateX(100%)'};
  opacity: ${({ $show }) => $show ? 1 : 0};
  pointer-events: ${({ $show }) => $show ? 'auto' : 'none'};

  @media (max-width: 768px) {
    width: 100vw;
    right: 0;
    transform: ${({ $show }) => $show ? 'translateX(0)' : 'translateX(100vw)'};
  }
`;

const Backdrop = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.3);
  opacity: ${props => props.$show ? '1' : '0'};
  visibility: ${props => props.$show ? 'visible' : 'hidden'};
  transition: all 0.3s ease-in-out;
  z-index: 999;
`;

const RedDot = styled.span`
  display: inline-block;
  width: 10px;
  height: 10px;
  background: #dc3545;
  border-radius: 50%;
  margin-left: 6px;
  vertical-align: middle;
`;

// Simple chat icon SVG
const ChatIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M4 20V6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H7l-3 3z" stroke="#667eea" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="#fff"/>
  </svg>
);

function Whiteboard() {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const { 
    socket, 
    isConnected, 
    currentRoom, 
    users, 
    joinRoom, 
    leaveRoom,
    sendDraw,
    clearCanvas,
    undo,
    redo,
    socketReady
  } = useSocket();

  const [isLoading, setIsLoading] = useState(true);
  const [showSidebar, setShowSidebar] = useState(false);
  const [currentUsername, setCurrentUsername] = useState('');
  const [drawingSettings, setDrawingSettings] = useState({
    tool: 'pen',
    color: '#000000',
    brushSize: 2,
    opacity: 1
  });
  const [pendingPassword, setPendingPassword] = useState(null);
  const [joinTried, setJoinTried] = useState(false);
  const canvasRef = useRef(null);
  const [remoteDrawEvent, setRemoteDrawEvent] = useState(null);
  const [touchStart, setTouchStart] = useState(null);
  const hasJoinedRef = useRef(false);
  const [hasUnreadMessages, setHasUnreadMessages] = useState(false);

  // Listen for join-error to handle password prompt
  useEffect(() => {
    if (!socket) return;
    const handleJoinError = (error) => {
      if (error.message === 'Incorrect password' || error.message === 'Password required') {
        let password = '';
        while (!password) {
          password = window.prompt('Enter room password:');
          if (password === null) {
            // User cancelled, go back to home
            navigate('/');
            return;
          }
        }
        setPendingPassword(password);
        setJoinTried(false); // Allow retry
        hasJoinedRef.current = false; // Allow joinRoom to be called again
      } else {
        alert(error.message);
        navigate('/');
      }
    };
    socket.on('join-error', handleJoinError);
    return () => socket.off('join-error', handleJoinError);
  }, [socket, navigate]);

  useEffect(() => {
    if (isConnected && roomId && socketReady && !hasJoinedRef.current && !joinTried) {
      let username = localStorage.getItem('username');
      if (!username) {
        username = `User${Math.floor(Math.random() * 1000)}`;
        localStorage.setItem('username', username);
      }
      setCurrentUsername(username);
      // If retrying with a password, set isPrivate=true
      const isPrivate = !!pendingPassword;
      joinRoom(roomId, username, isPrivate, pendingPassword || '');
      setIsLoading(false);
      hasJoinedRef.current = true;
      setJoinTried(true);
    }
  }, [isConnected, roomId, joinRoom, socketReady, pendingPassword, joinTried]);

  useEffect(() => {
    if (socket) {
      // Listen for drawing events from other users
      socket.on('draw', handleRemoteDraw);
      socket.on('stroke', handleRemoteDraw);
      socket.on('clear-canvas', handleRemoteClear);
      socket.on('canvas-data', handleRemoteCanvasData);

      return () => {
        socket.off('draw');
        socket.off('stroke');
        socket.off('clear-canvas');
        socket.off('canvas-data');
      };
    }
  }, [socket]);

  useEffect(() => {
    if (socket && currentRoom?.roomId) {
      socket.emit('request-canvas', { roomId: currentRoom.roomId });
    }
  }, [socket, currentRoom]);

  useEffect(() => {
    if (showSidebar && hasUnreadMessages) {
      setHasUnreadMessages(false);
    }
  }, [showSidebar, hasUnreadMessages]);

  useEffect(() => {
    // Call leaveRoom on tab close or refresh
    const handleBeforeUnload = () => {
      leaveRoom();
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [leaveRoom]);

  const handleRemoteDraw = (data) => {
    console.log('[Whiteboard] Received draw event:', data);
    setRemoteDrawEvent(data);
  };

  const handleRemoteClear = () => {
    console.log('[Whiteboard] handleRemoteClear called');
    if (canvasRef.current) {
      canvasRef.current.clear();
    }
    // Optionally, reset local undo/redo stacks if needed
  };

  const handleRemoteCanvasData = ({ canvasData }) => {
    if (canvasRef.current && typeof canvasRef.current.loadImageFromDataUrl === 'function') {
      canvasRef.current.loadImageFromDataUrl(canvasData || '');
    }
    // Optionally, reset local undo/redo stacks if needed
  };

  const handleDrawEvent = (drawData) => {
    const effectiveRoomId = currentRoom?.roomId || roomId;
    console.log('[Whiteboard] Emitting draw event:', drawData, 'roomId:', effectiveRoomId);
    sendDraw({
      ...drawData,
      roomId: effectiveRoomId
    });
  };

  const handleClearCanvas = () => {
    const effectiveRoomId = currentRoom?.roomId || roomId;
    console.log('[Whiteboard] handleClearCanvas, currentRoom:', currentRoom, 'roomId:', effectiveRoomId);
    clearCanvas(effectiveRoomId);
  };

  const handleUndo = () => {
    const effectiveRoomId = currentRoom?.roomId || roomId;
    undo(effectiveRoomId);
  };

  const handleRedo = () => {
    const effectiveRoomId = currentRoom?.roomId || roomId;
    redo(effectiveRoomId);
  };

  const handleExportImage = async () => {
    if (canvasRef.current) {
      try {
        const dataUrl = canvasRef.current.exportImage();
        const link = document.createElement('a');
        link.download = `whiteboard-${roomId}-${new Date().toISOString().slice(0, 10)}.png`;
        link.href = dataUrl;
        link.click();
      } catch (error) {
        console.error('Error exporting image:', error);
        alert('Failed to export image');
      }
    }
  };

  const handleExportPDF = async () => {
    if (canvasRef.current) {
      try {
        const pdf = await canvasRef.current.exportPDF();
        pdf.save(`whiteboard-${roomId}-${new Date().toISOString().slice(0, 10)}.pdf`);
      } catch (error) {
        console.error('Error exporting PDF:', error);
        alert('Failed to export PDF');
      }
    }
  };

  const handleLeaveRoom = () => {
    leaveRoom(() => {
      setTimeout(() => navigate('/'), 0); // Ensure navigation after server ack
    });
  };

  const copyRoomLink = () => {
    const link = `${window.location.origin}/whiteboard/${roomId}`;
    navigator.clipboard.writeText(link);
    alert('Room link copied to clipboard!');
  };

  const handleTouchStart = (e) => {
    setTouchStart(e.touches[0].clientX);
  };

  const handleTouchMove = (e) => {
    if (!touchStart) return;
    
    const currentTouch = e.touches[0].clientX;
    const diff = touchStart - currentTouch;
    
    // If swiped left more than 50px, close sidebar
    if (diff > 50) {
      setShowSidebar(false);
      setTouchStart(null);
    }
  };

  const handleTouchEnd = () => {
    setTouchStart(null);
  };

  const handleNewSidebarMessage = () => {
    if (!showSidebar) setHasUnreadMessages(true);
  };

  if (isLoading) {
    return (
      <LoadingOverlay>
        <LoadingText>Connecting to room...</LoadingText>
      </LoadingOverlay>
    );
  }

  return (
    <WhiteboardContainer>
      <MainContent>
        <Header>
          <RoomInfo>
            <RoomTitle>Collaborative Whiteboard</RoomTitle>
            <RoomId>{roomId}</RoomId>
            <UserCount>
              <UserDot />
              {users.length} users online
            </UserCount>
          </RoomInfo>
          
          <HeaderActions>
            <Button className="secondary" onClick={copyRoomLink}>
              Copy Link
            </Button>
            <Button className="secondary" style={{ position: 'relative', padding: '8px', borderRadius: '50%', width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              aria-label={showSidebar ? 'Hide chat' : 'Show chat'}
              onClick={() => {
                console.log('[Sidebar] Opened by user button click');
                setShowSidebar(!showSidebar);
              }}>
              <ChatIcon />
              {!showSidebar && hasUnreadMessages && (
                <RedDot style={{ position: 'absolute', bottom: 4, right: 4 }} />
              )}
            </Button>
            <Button className="danger" onClick={handleLeaveRoom}>
              Leave Room
            </Button>
          </HeaderActions>
        </Header>

        <CanvasContainer>
          <Canvas
            ref={canvasRef}
            tool={drawingSettings.tool}
            color={drawingSettings.color}
            brushSize={drawingSettings.brushSize}
            opacity={drawingSettings.opacity}
            onDrawEvent={handleDrawEvent}
            remoteDrawEvent={remoteDrawEvent}
          />
        </CanvasContainer>

        <Toolbar 
          settings={drawingSettings}
          onSettingsChange={setDrawingSettings}
          onClear={handleClearCanvas}
          onUndo={handleUndo}
          onRedo={handleRedo}
          onExportImage={handleExportImage}
          onExportPDF={handleExportPDF}
        />
      </MainContent>

      <SidebarOverlay 
        $show={showSidebar}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <Sidebar 
          users={users}
          roomId={roomId}
          currentUsername={currentUsername}
          onClose={() => {
            console.log('[Sidebar] Closed by user');
            setShowSidebar(false);
          }}
          onNewMessage={handleNewSidebarMessage}
        />
      </SidebarOverlay>

      <Backdrop $show={showSidebar} onClick={() => setShowSidebar(false)} />
    </WhiteboardContainer>
  );
}

export default Whiteboard; 