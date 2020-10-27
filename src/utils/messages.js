const generateMessage = (username, text)=>{
    return {
        username,
        text,
        CreatedAt : new Date().getTime()
    }  
}

const generateLocationMessage = (username, url)=>{
    return {
        username,
        url,
        CreatedAt : new Date().getTime()
    }
}

module.exports = {
    generateMessage,
    generateLocationMessage
}