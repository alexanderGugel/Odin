// About-animation
$('header .about').click(function () {
    $('section.about').slideToggle(100);
});

var socket = io.connect();

socket.on('room', function (data) {
    $('.conversation').prepend('<div class="room"><strong>' + data.name + '</strong> has joined <strong>' + data.room + '</strong>.</div>');
});

socket.on('name', function (data) {
    $('.conversation').prepend('<div class="name"><strong>' + data.previous + '</strong> is now logged in as <strong>' + data.now + '</strong>.</div>');
});

socket.on('quit', function (data) {
    $('.conversation').prepend('<div class="quit"><strong>' + data.name + '</strong> has quit.</div>');
});

socket.on('chat', function (data) {
    $('.conversation').prepend('<div class="chat"><strong>' + data.name + '</strong><br>' + data.message + '</div>');
});

socket.on('whisper', function (data) {
    $('.conversation').prepend('<div class="whisper"><strong>' + data.name + ' whispered:</strong><br>' + data.message + '</div>');
});

socket.on('you', function (data) {
    $('header .name').html(data.name);
    $('header .room').html(data.room);
});

// Default events
socket.on('disconnect', function () {
    $('.conversation').prepend('<div class="disconnect error">Disconnected :(</div>');
});

socket.on('connect', function () {
    $('.conversation').prepend('<div class="connect">Connected :)</div>');
});

socket.on('reconnect', function () {
    $('.conversation').prepend('<div class="reconnect">Reconnected :)</div>');
});

socket.on('connecting', function () {
    $('.conversation').prepend('<div class="connecting">Connecting...</div>');
});

socket.on('reconnecting', function () {
    $('.conversation').prepend('<div class="reconnecting">Reconnecting...</div>');
});

socket.on('connect_failed', function () {
    $('.conversation').prepend('<div class="connectFailed error">Connect failed :(</div>');
});

socket.on('error', function (reason) { // includes custom errors
    $('.conversation').prepend('<div class="error"><strong>An error occurred: </strong>' + reason + '</div>');
});

socket.on('reconnect_failed', function () {
    $('.conversation').prepend('<div class="reconnectFailed error">Reconnect failed :(</div>');
});

$('.chat form').submit(function () {
    var message = $('.chat input').val();
    
    if (message !== '') {
        socket.emit('message', message);
        $('.chat input').val('');
    }
    return false;
});