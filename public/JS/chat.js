//This is client side script
const socket=io() //to connect to server

// Elements
const $messageForm = document.getElementById('messageForm')
const $MessageInput = document.getElementById('MessageInput');
const $SubmitButton = document.getElementById('SubmitButton');
const $shareLocation = document.getElementById('shareLocation');
const $messages = document.getElementById('messages');

//Templates
const $message_template = document.getElementById('message_template').innerHTML;
const $location_template = document.getElementById('location_template').innerHTML;
const $sidebar_template = document.querySelector('#sidebar_template').innerHTML;

//Options
const{ username,room } = Qs.parse(location.search,{ ignoreQueryPrefix: true});

const autoscroll = ()=>{
    //to get newMessage
    const $newMessage = $messages.lastElementChild

    //to get height of $newMessage
    const newMessageStyles = getComputedStyle($newMessage)
    const newMessageMargin = parseInt(newMessageStyles.marginBottom)
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin
    
    const visibleHeight = $messages.offsetHeight

    const contentHeight = $messages.scrollHeight

    const scrollOffset = $messages.scrollTop + visibleHeight

    if(contentHeight - newMessageHeight <= scrollOffset){
        $messages.scrollTop = $messages.scrollHeight
    }
}

 //the string in 1st parameter should be the same as the string in socket.emit 
socket.on('message',(mail)=>{
    console.log(mail);
    const html = Mustache.render($message_template,{
        name: mail.username,
        text: mail.text,
        CreatedAt: moment(mail.CreatedAt).format("h:m a")
    });
    $messages.insertAdjacentHTML('beforeend',html);
    autoscroll()
});

socket.on('roomInfo', ( { room, users } )=>{
    const html = Mustache.render($sidebar_template,{
        room,
        users
    });
    document.querySelector('#chat__sidebar').innerHTML = html;
});

$messageForm.addEventListener('submit',(e)=>{
    e.preventDefault()
    
    //disable button
    $SubmitButton.setAttribute('disabled','disabled');

    const  mytext=$MessageInput.value;
    socket.emit('SendMessage',mytext, (error)=>{
       
        //enable button
        $SubmitButton.removeAttribute('disabled');
        $MessageInput.value = '';
        $MessageInput.focus();

        if(error){
            return console.log(error);
        }
        console.log('Message Delivered');
    });
})

$shareLocation.addEventListener('click',()=>{
    if(!navigator.geolocation){
        return alert('Geolocation is not supported by your Browser! Try on another Browser');
    }

    $shareLocation.setAttribute('disabled','disabled');

    navigator.geolocation.getCurrentPosition((position)=>{
        const cordinates={
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
        }

        socket.emit('sendPosition',cordinates,()=>{
            console.log('Location Shared');
            $shareLocation.removeAttribute('disabled');
        });
    });
});


socket.on('locationMessage',(url)=>{
    console.log(url);
    const test=Mustache.render($location_template,{
       name: url.username, 
       link: url.url,
       CreatedAt : moment(url.CreatedAt).format("h:m a")
    });
    $messages.insertAdjacentHTML('beforeend',test);
});

socket.emit('join',{ username,room }, (error)=>{
        if(error){
            alert(error);
            location.href = '/'
        }
});