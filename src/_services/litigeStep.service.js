/** Import des modules nécessaires */
import Axios from './caller.service'


let getAllLitigeStepsByLitigeId = (token, litige_id) => {
    return Axios.get('/litige_steps/litige/' + litige_id,
    {
        headers: {
            Authorization: 'Bearer ' + token,
            Accept: "application/json"
        }
    })
}

let createLitigeStep = (token, litigeStep) => {
    return Axios.post('/litige_steps', litigeStep,
    {
        headers: {
            Authorization: 'Bearer ' + token,
            Accept: "application/json"
        }
    })
}


let deleteLitigeStep = (token, litigeStepID) => {
    return Axios.delete('/litige_steps/'+litigeStepID,
    {
        headers: {
            Authorization: 'Bearer ' + token,
            Accept: "application/json"
        }
    })
}


export const litigeStepService = {
    getAllLitigeStepsByLitigeId,
    createLitigeStep,
    deleteLitigeStep
}