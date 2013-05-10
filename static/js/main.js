/* About-animation */
$('header .about').click(function () {
    'use strict';    
    $('section.about').slideToggle(100);
});

var socket = io.connect();

socket.on('room', function (data) {
    'use strict';
    $('.conversation').prepend('<div class="room"><strong>' + data.name + '</strong> has joined <strong>' + data.room + '</strong>.</div>');
});

socket.on('name', function (data) {
    'use strict';
    $('.conversation').prepend('<div class="name"><strong>' + data.previous + '</strong> is now logged in as <strong>' + data.now + '</strong>.</div>');
});

socket.on('quit', function (data) {
    'use strict';
    $('.conversation').prepend('<div class="quit"><strong>' + data.name + '</strong> has quit.</div>');
});

socket.on('chat', function (data) {
    'use strict';
    $('.conversation').prepend('<div class="chat"><strong>' + data.name + '</strong><br>' + data.message + '</div>');
});

socket.on('whisper', function (data) {
    'use strict';
    $('.conversation').prepend('<div class="whisper"><strong>' + data.name + ' whispered:</strong><br>' + data.message + '</div>');
});

socket.on('you', function (data) {
    'use strict';
    $('header .name').html(data.name);
    $('header .room').html(data.room);
});

/* Default events */
socket.on('disconnect', function () {
    'use strict';
    $('.conversation').prepend('<div class="disconnect error">Disconnected :(</div>');
});

socket.on('connect', function () {
    'use strict';
    $('.conversation').prepend('<div class="connect">Connected :)</div>');
});

socket.on('reconnect', function () {
    'use strict';
    $('.conversation').prepend('<div class="reconnect">Reconnected :)</div>');
});

socket.on('connecting', function () {
    'use strict';
    $('.conversation').prepend('<div class="connecting">Connecting...</div>');
});

socket.on('reconnecting', function () {
    'use strict';
    $('.conversation').prepend('<div class="reconnecting">Reconnecting...</div>');
});

socket.on('connect_failed', function () {
    'use strict';
    $('.conversation').prepend('<div class="connectFailed error">Connect failed :(</div>');
});

socket.on('error', function (reason) { // includes custom errors
    'use strict';
    $('.conversation').prepend('<div class="error"><strong>An error occurred: </strong>' + reason + '</div>');
});

socket.on('reconnect_failed', function () {
    'use strict';
    $('.conversation').prepend('<div class="reconnectFailed error">Reconnect failed :(</div>');
});

$('.chat form').submit(function () {
    'use strict';
    var message = $('.chat input').val(),
        commands = message.split(' ');
    
    if (message !== '') {
        switch (commands[0].toLowerCase()) {
        case 'room':
            socket.emit('room', { room: commands[1] });
            break;
        case 'name':
            socket.emit('name', { name: commands[1] });
            break;
        case 'whisper':
            socket.emit('whisper', { to: commands[1], message: commands.slice(2).join(' ') });
            break;
        default:
            socket.emit('chat', { message: message });
            break;
        }
        $('.chat input').val('');
    }
    return false;
});