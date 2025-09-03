/** Import des modules nécessaires */
import Axios from './caller.service'


let getAllLitiges = (token, page_nb) => {
    return Axios.get('/litiges?page=' + page_nb,
    {
        headers: {
            Authorization: 'Bearer ' + token,
            Accept: "application/ld+json"
        }
    })
}


let createLitige = (token, litige) => {
    return Axios.post('/litiges', litige,
    {
        headers: {
            Authorization: 'Bearer ' + token,
            Accept: "application/json"
        }
    })
}


let getLitigesByLead = (token, idLead) => {
    return Axios.get('/litiges/lead' + idLead,
    {
        headers: {
            Authorization: 'Bearer ' + token,
            Accept: "application/ld+json"
        }
    })
}


let updateLitige = (token, litige) => {
    return Axios.patch('/litiges/' + litige.id, litige, {
      headers: {
        Authorization: 'Bearer ' + token,
        Accept: 'application/json'
      }
    })
  }


let deleteLitige = (token, lid) => {
    return Axios.delete('/litiges/'+lid,
    {
        headers: {
            Authorization: 'Bearer ' + token,
            Accept: "application/ld+json"
        }
    })
}


export const litigeService = {
    getAllLitiges,
    createLitige,
    getLitigesByLead,
    updateLitige,
    deleteLitige
}