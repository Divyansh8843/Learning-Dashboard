const socketio = require('socket.io');

let io;

exports.init = (httpServer) => {
  io = socketio(httpServer, {
    cors: {
      origin: process.env.FRONTEND_URL,
      methods: ['GET', 'POST']
    }
  });
  
  io.on('connection', (socket) => {
    console.log('New client connected');
    
    // Join quiz room for real-time updates
    socket.on('join-quiz', (quizId) => {
      socket.join(`quiz-${quizId}`);
      console.log(`Client joined quiz ${quizId}`);
    });
    
    socket.on('disconnect', () => {
      console.log('Client disconnected');
    });
  });
  
  return io;
};

exports.getIO = () => {
  if (!io) {
    throw new Error('Socket.io not initialized');
  }
  return io;
};

