/** Import des modules nécessaires */
import axios from 'axios'

let Axios = null;
if (process.env.NODE_ENV === 'development') {
    Axios = axios.create({
        baseURL: 'http://localhost:8000/api'
      })
      //console.log('http://localhost:8000/api')
} else if (process.env.NODE_ENV === 'production') {
    Axios = axios.create({
        baseURL: 'http://api.tml.jngz2533.odns.fr/public/api'
      })
      //console.log('http://api.tml.jngz2533.odns.fr/public/api')
} else if (process.env.NODE_ENV === 'test') {
    Axios = axios.create({
        baseURL: 'http://api.tml.jngz2533.odns.fr/public/api'
      })
      //console.log('http://api.tml.jngz2533.odns.fr/public/api')
}

// const Axios = axios.create({
//   baseURL: 'http://localhost:8000/api'
//   //baseURL: 'http://api.tml.jngz2533.odns.fr/public/api'
// })

export default Axios
