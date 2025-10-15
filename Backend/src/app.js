//import
import express from "express"; 
import connectDB from './config/db.js'
import { createServer } from "http";
import { Server } from "socket.io";
import cookieParser from "cookie-parser";
import authRoute from './routes/auth.route.js'
import messageRoutes from './routes/message.routes.js'

//initialize
const app = express();
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

connectDB()

const httpServer = createServer(app);
const io = new Server(httpServer, { 
    cors: {
        origin: '*'
    }
});

//routes
app.use('/api', authRoute)
app.use('/api/message', messageRoutes)

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

export {httpServer}