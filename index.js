const { Server } = require('socket.io')

const io = new Server({
  // localhost
  // cors: 'http://localhost:5173',

  // internet
  cors: 'https://mechatnow-app.netlify.app/',
})

let onlineUsers = []

io.on('connection', (socket) => {
  console.log('New connection: ', socket.id)

  //listen to a connection
  socket.on('addNewUser', (userId) => {
    !onlineUsers.some((user) => user.userId === userId) &&
      userId &&
      onlineUsers.push({
        userId,
        socketId: socket.id,
      })

    console.log('Online users: ', onlineUsers)

    io.emit('getOnlineUsers', onlineUsers)
  })

  //add message
  socket.on('sendMessage', (message) => {
    const user = onlineUsers.find((user) => user.userId === message.recipientId)
    if (user) {
      io.to(user.socketId).emit('getMessage', message)
      io.to(user.socketId).emit('getNotification', {
        senderId: message.senderId,
        isRead: false,
        date: new Date(),
      })
    }
  })

  socket.on('disconnect', () => {
    onlineUsers = onlineUsers.filter((user) => user.socketId !== socket.id)
    io.emit('getOnlineUsers', onlineUsers)
  })
})

io.listen(3000)
