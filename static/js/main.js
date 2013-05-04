var socket = io.connect();

socket.on('room', function (data) {
    'use strict';
    $('.conversation').prepend('<div class="room"><strong>' + data.name + '</strong> has joined <strong>' + data.room + '</strong>.</div>');
});

socket.on('name', function (data) {
    'use strict';
    $('.conversation').prepend('<div class="name"><strong>' + data.previous + '</strong> is now logged in as <strong>' + data.now + '</strong>.</div>');
});

socket.on('error', function (data) {
    'use strict';
    $('.conversation').prepend('<div class="error"><strong>An error occurred: <strong>' + data.message + '</div>');
});

socket.on('quit', function (data) {
    'use strict';
    $('.conversation').prepend('<div class="quit"><strong>' + data.name + '</strong> has quit.</div>');
});

socket.on('chat', function (data) {
    'use strict';
    $('.conversation').prepend('<div class="chat"><strong>' + data.name + '</strong><br>' + data.message + '</div>');
});

socket.on('you', function (data) {
    'use strict';
    console.log(data); // TODO
    $('header .name').html(data.name);
    $('header .room').html(data.room);
});

socket.on('disconnect', function () {
    'use strict';
    $('.conversation').prepend('<div class="disconnect error">Disconnected :(</div>');
});

$('.chat form').submit(function () {
    'use strict';
    var message = $('.chat input').val(),
        commands = message.split(' ');
    
    if (message !== '') {
        switch (commands[0]) {
        case 'room':
            socket.emit('room', { room: commands[1] });
            break;
        case 'name':
            socket.emit('name', { name: commands[1] });
            break;
        default:
            socket.emit('chat', { message: message });
            break;
        }
        $('.chat input').val('');
    }
    return false;
});