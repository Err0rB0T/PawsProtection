console.log('chat.js file loaded!')

// IMPORTANT! By default, socket.io() connects to the host that
// served the page, so we dont have to pass the server url
var socket = io.connect()


console.log('chat.js file loaded!')

// IMPORTANT! By default, socket.io() connects to the host that
// served the page, so we dont have to pass the server url
var socket = io.connect()

//prompt to ask user's name
const username = prompt('Welcome! Please enter your name:')

// emit event to server with the user's name
socket.emit('new-connection', { username })

// captures welcome-message event from the server
socket.on('welcome-message', (data) => {
  console.log('received welcome-message >>', data)
})
