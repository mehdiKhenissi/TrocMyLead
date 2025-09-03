/** Import des modules nécessaires */
import Axios from './caller.service'


let getAllenterprises = (token, page_nb) => {
    return Axios.get('/enterprises?page=' + page_nb,
    {
        headers: {
            Authorization: 'Bearer ' + token,
            Accept: "application/ld+json"
        }
    })
}

let getEnterprise = (token, id) => {
    return Axios.get('/enterprises/'+id,
    {
        headers: {
            Authorization: 'Bearer ' + token,
            Accept: "application/ld+json"
        }
    })
}

let updateEnterprise = (token, enterprise) => {
    return Axios.patch('/enterprises/'+enterprise.id, 
    enterprise,
    {
        headers: {
            Authorization: 'Bearer ' + token,
            Accept: "application/ld+json"
        }
    }
    )
}

let createEnterprise = (enterprise) => {
    return Axios.post('/enterprises', enterprise)
}


let uploadEnterpriseFiles = (enterpriseFiles, id) => {
    return Axios.post('/enterprises/'+id+'/upload/files', enterpriseFiles,
    {
        headers: {
            'Content-Type': 'multipart/form-data',
          }
    })
}

let deleteEnterprise = (eid) => {
    return Axios.delete('/enterprises/'+eid)
}

export const enterpriseService = {
    getAllenterprises,
    getEnterprise,
    updateEnterprise,
    createEnterprise,
    uploadEnterpriseFiles,
    deleteEnterprise
}