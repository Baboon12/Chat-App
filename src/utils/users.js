const users = []

const addUser = ({ id, username, room})=>{
    //Clean the data to avoid duplication 
    //Ex: Andrew and andrew are the same user,no duplication in username and same for room 
    username = username.trim().toLowerCase();
    room = room.trim().toLowerCase();

    //to validate that the field is not empty
    if(!username || !room){
        return {
            error: 'Username and Room are mandatory!'
        }
    }

    //check for existing users
    const existingUser = users.find((user)=>{
        return user.room === room && user.username === username
        //if user is in the same room and have same name then he/she is an existing user
    });

    //validate username
    if(existingUser){
        return { 
            error: 'Username Already in use'
        }
    }

    //to store user
    const user = { id, username,room };
    users.push(user);
    return { user }
}

const removeUser = (id)=>{
    //findIndex returns the index value of element in an array
    //If the element exists then it will give a value greater than 0
    //Else it will return -1
    const index = users.findIndex((user)=>user.id === id);

    if(index !== -1){
        //splice removes an element from array by its index
        return users.splice(index, 1)[0];
    }

}

//to get the user by its ID
const getUser = (id)=>{
    return users.find((user)=>{
        return user.id === id
    });
}

//to get list of users in a specific room
const getUsersinroom = (room)=>{
    room = room.trim().toLowerCase();
    return users.filter((user)=>{
        return user.room === room
   });
}

module.exports = {
    addUser,
    removeUser,
    getUser,
    getUsersinroom
}