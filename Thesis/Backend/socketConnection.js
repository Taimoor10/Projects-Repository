module.exports = function socketConnect(server) {
    var io = require('socket.io')(server)
    //Opens a socket connection
    this.openSocketConnection = () =>{
        socketConnection = io.on('connection', (socket) => {
            socket.emit('news', {Ok: "Computer"});
        })
    return socketConnection
    }

    //Closes a Socket Connection
    this.closeSocketConnection = (socket) =>{
        socket.on('terminate', function (){
            socket.disconnect(0)
        })
    return "Socket Closed"
    }
}