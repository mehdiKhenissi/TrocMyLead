/** Import des modules nécessaires */
import Axios from './caller.service'


let getMeUser = (token) => {
    return Axios.get('/me',
    {
        headers: {
            Authorization: 'Bearer ' + token,
            Accept: "application/json"
        }
    })
}

let getAllUsers = (token) => {
    return Axios.get('/users',
    {
        headers: {
            Authorization: 'Bearer ' + token,
            Accept: "application/ld+json"
        }
    })
}

let getAllUsersByEnterprise = (token, id) => {
    return Axios.get('/users/enterprise/'+id,
    {
        headers: {
            Authorization: 'Bearer ' + token,
            Accept: "application/json"
        }
    })
}

let getUser = (token, uid) => {
    return Axios.get('/users/'+uid,
    {
        headers: {
            Authorization: 'Bearer ' + token,
            Accept: "application/json"
        }
    })
}

let updateUser = (token, user) => {
    return Axios.patch('/users/'+user.id, 
    user,
    {
        headers: {
            Authorization: 'Bearer ' + token,
            Accept: "application/json"
        }
    })
}

let createUser = (user) => {
    return Axios.post('/users', user)
}

let reinitUserPassword = (email) => {
    return Axios.patch('/users/reinit/password', email,
    {
        headers: {
            Accept: "application/json"
        }
    })
}

let updateUserPassword = (token, old_password, id) => {
    return Axios.patch('/users/'+id+'/update/password', old_password,
    {
        headers: {
            Authorization: 'Bearer ' + token,
            Accept: "application/json"
        }
    })
}

let enableUserAccount = (datas) => {
    return Axios.patch('/enable/account', datas)
}


let getNewActivationCode = (email) => {
    return Axios.get('/new/validation/code?email='+email)
}

let deleteUser = (uid) => {
    return Axios.delete('/users/'+uid)
}

export const userService = {
    getMeUser,
    getAllUsers,
    getUser,
    updateUser,
    createUser,
    reinitUserPassword,
    updateUserPassword,
    deleteUser,
    getAllUsersByEnterprise,
    enableUserAccount,
    getNewActivationCode
}