import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, { 
    cors: {
        origin: '*'
    }
});
const roomGroup = 'group'
io.on("connection", (socket) => {
  console.log('a user connected', socket.id)

  socket.on('joinRoom', async (userName) =>{
    console.log(`${userName} is joining the group`)

    await socket.join(roomGroup)

    //send to all
    //io.to(roomGroup).emit('roomNotice', userName)

    //broadcast
    socket.to(roomGroup).emit('roomNotice', userName)

    socket.on('chatMessage', (msg)=>{
        socket.to(roomGroup).emit('chatMessage', msg)
    })

    socket.on('typing', (userName)=>{
        socket.to(roomGroup).emit('typing', userName)
    })

    socket.on('stopTyping', (userName) =>{
        socket.to(roomGroup).emit('stopTyping', userName)
    })

  })
});

httpServer.listen(3000, ()=>{
    console.log('server is running on port : 3000')
});