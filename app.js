var express = require('express'),
    app = express(),
    http = require('http'),
    server = http.createServer(app),
    io = require('socket.io').listen(server);

io.configure(function () {
    io.set('transports', ['xhr-polling']);
    io.set('polling duration', 10);
});

// https://github.com/LearnBoost/Socket.IO/wiki/Configuring-Socket.IO
io.enable('browser client minification');  // send minified client
io.enable('browser client etag');          // apply etag caching logic based on version number
io.enable('browser client gzip');          // gzip the file

app.use(express.compress()); // compress files using gzip

app.use(express.static(__dirname + '/static')); // serve static files

server.listen(process.env.PORT || 5000);

//-------------------------------------------------------------------------------------------------------------------------------

function escapeHTML(string) {
    return string.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function blank(string) { // http://stackoverflow.com/questions/154059/how-do-you-check-for-an-empty-string-in-javascript
    return (!string || /^\s*$/.test(string));
}

function alphanumeric(string) { // http://stackoverflow.com/questions/388996/regex-for-javascript-to-allow-only-alphanumeric
    return (/^[a-z0-9]+$/i).test(string);
}

//-------------------------------------------------------------------------------------------------------------------------------

function changeRoom(io, socket, room) {
    if (blank(room)) {
        socket.emit('error', 'No room given.');
        return;
    }
    if (!alphanumeric(room)) {
        socket.emit('error', 'Room names need to be alphanumeric.');
        return;
    }
    if (socket.room !== undefined) {
        socket.leave(socket.room);
    }
    socket.room = room;
    socket.join(room);
    io.sockets.in(room).emit('room', { name: socket.name, room: socket.room });
    socket.emit('you', { name: socket.name, room: room }); // tell user about his identity
}

function chat(io, socket, message) {
    if (blank(message)) {
        socket.emit('error', 'No message given.');
        return;
    }
    io.sockets.in(socket.room).emit('chat', { name: socket.name, message: escapeHTML(message) });
}

function whisper(io, socket, message, to, names) {
    if (blank(to)) {
        socket.emit('error', 'No recipient given.');
        return;
    }
    if (blank(message)) {
        socket.emit('error', 'No message given.');
        return;
    }
    if (names[to] === undefined) {
        socket.emit('error', 'Unknown recipient.');
        return;
    }
    names[to].emit('whisper', { name: socket.name, message: escapeHTML(message) });    
    socket.emit('whisper', { name: socket.name, message: escapeHTML(message) });    
}
    
function changeName(io, socket, names, name) {
    if (blank(name)) {
        socket.emit('error', 'No name given.');
        return;
    }
    if (!alphanumeric(name)) {
        socket.emit('error', 'Names need to be alphanumeric.');
        return;
    }
    if (names[name] !== undefined) {
        socket.emit('error', 'This username is already taken. Try another one.');
        return;
    }
    var previous = socket.name;
    names[previous] = undefined; // delete old name
    names[name] = socket; // add new name to array
    socket.name = name; // override
    io.sockets.in(socket.room).emit('name', { previous: previous, now: name }); // tell everybody about the new name 
    socket.emit('you', { name: name, room: socket.room });
}

//----------------------------------------------------------------------------------------

var names = {};

io.sockets.on('connection', function (socket) {
    socket.name = socket.id; // deafault name is the unique socket.id
    names[socket.name] = socket;
    changeRoom(io, socket, 'main'); // enter default room (main)
    
    // previously, we used an extra event for each command (socket.on('chat', func...)), but this method is much easier to maintain, because adding new commands is much easier now (no modification in main.js needed)
    socket.on('message', function (message) {
        var commands = message.split(' ');
        switch (commands[0].toLowerCase()) {
            case 'room':
                changeRoom(io, socket, commands[1]); 
                break;
            case 'name':
                changeName(io, socket, names, commands[1]);
                break;
            case 'whisper':
                whisper(io, socket, commands.slice(2).join(' '), commands[1], names);
                break;
            default:
                chat(io, socket, message);
        }
    });
  
    socket.on('disconnect', function () {
        io.sockets.in(socket.room).emit('quit', { name: socket.name }); // inform channel
        names[socket.name] = undefined; // delete name  
    });
});