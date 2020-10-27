const path = require('path'); 
const http = require('http');
const express = require('express');
const socketio = require('socket.io')
const Filter = require('bad-words'); 
const { generateMessage , generateLocationMessage } = require('./utils/messages');
const { addUser, removeUser, getUser, getUsersinroom} = require('./utils/users');

const app = express() //to create a server
const server = http.createServer(app) //to create a server  
const io = socketio(server) 
   
const port = process.env.PORT || 3000
const publicDirectoryPath = path.join(__dirname , '../public'); //path to public directory

app.use(express.static(publicDirectoryPath)); // add a static file

//1st paramenter is the name of event and 2nd is the callback function to run upon firing the event
io.on('connect',(socket)=>{
    console.log('New Web Socket Connection');   

    socket.on('join', ({ username, room }, callback)=>{
        const{ error, user } = addUser({ id: socket.id, username, room })
        
        if(error){
            return callback(error);
        }

        socket.join(user.room); //allows is to join a chatroom
        socket.emit('message', generateMessage('Sura','Welcome!')); //only emits a message 
        socket.broadcast.to(user.room).emit('message', generateMessage('Sura',`${user.username} has joined!`));
        io.to(user.room).emit('roomInfo',{
            room: user.room,
            users: getUsersinroom(user.room)
        })
        
        callback();
    });

    socket.on('SendMessage',(text,callback)=>{
        const user = getUser(socket.id);
        const filter = new Filter()
        if(filter.isProfane(text)){
            return callback('Profabity Not Allowed')
        }

        io.to(user.room).emit('message',generateMessage(user.username,text)) //updates count of every available conections(i.e across browsers)
        callback(); //for acknowlegement
    });

    socket.on('sendPosition',(position,callback)=>{
        const user = getUser(socket.id);
        io.to(user.room).emit('locationMessage', generateLocationMessage(user.username,`https://www.google.com/maps/?q=${position.latitude},${position.longitude}`));
        callback();
    });

    //socket.on is written inside io.on to disconnect a client 
    socket.on('disconnect',()=>{
        const user = removeUser(socket.id);
        if(user){
            io.to(user.room).emit('message', generateMessage('Sura',`${user.username} Has Left!`));
            io.to(user.room).emit('roomInfo',{
                room: user.room,
                users: getUsersinroom(user.room)
            })
        }
    });
});

server.listen(port, ()=>{
    console.log(`Server is running on port ${port}!`)
});




//Notes: 
//1) broadcast method broadcasts a message to every connected client except the sender who just joined the room(in our case)
//2) io.to.emit emits a message to everyone in the specific room
//3) socket.broadcast.to.emit emits a message to everyone except the sender in a specific room
//4) io.emit send a message to every connected client