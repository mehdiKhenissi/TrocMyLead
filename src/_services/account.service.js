/** Import des modules nécessaires */
import Axios from './caller.service'

let login = (credentials) => {
  return Axios.post('/login', credentials)
}

let logout = () => {
  localStorage.removeItem('itsMeUser')
  localStorage.removeItem('token')
  if (localStorage.getItem('token') == null && localStorage.getItem('itsMeUser') == null) {
    return true
  } else {
    return false
  }
}

let getToken = () => {
  return localStorage.getItem('token')
}

let saveToken = (token) => {
  localStorage.setItem('token', token)
}

let isLogged = () => {
  try {
    let token = localStorage.getItem('token')
    const [header, payload, signature] = token.split('.')
    const decodedToken = JSON.parse(atob(payload))

    if (typeof decodedToken.exp !== 'undefined' && decodedToken.exp > Date.now() / 1000) {
      return !!token
    } else {
      return false
    }
  } catch (error) {
    return false
  }
}

let isAdmin = () => {
  try {
    let token = localStorage.getItem('token')
    const [header, payload, signature] = token.split('.')
    const decodedToken = JSON.parse(atob(payload))

    if (isLogged() && JSON.parse(accountService.getSessionUser()).roles.includes('ROLE_ADMIN')) {
      return true
    } else {
      return false
    }
  } catch (error) {
    return false
  }
}

let saveSessionUser = (meUserInfos) => {
  localStorage.setItem('itsMeUser', JSON.stringify(meUserInfos))
}

let getSessionUser = () => {
  return localStorage.getItem('itsMeUser')
}

let clearSessionUser = () => {
  return localStorage.clear()
}

let sessionUserIsGood = () => {
  try {
    let response = false;
    if (isLogged()) {
      // checking if user infos are good
      // console.log('before');
      response = Axios.get('/users/' + JSON.parse(getSessionUser()).id, {
        headers: {
          Authorization: 'Bearer ' + getToken(),
          Accept: 'application/json'
        }
      })
        .then((response) => {
          // console.log(response.data);
          if (typeof response.data != 'undefined') {
            return true
          } else {
            return false
          }
        })
        .catch(async (err) => {
          return false
        })
    }
    
    return response;
  } catch (error) {
    return false
  }
 
}

export const accountService = {
  login,
  logout,
  saveToken,
  getToken,
  isLogged,
  isAdmin,
  getSessionUser,
  saveSessionUser,
  clearSessionUser,
  sessionUserIsGood
}
