/** Import des modules nécessaires */
import Axios from './caller.service'


let getAllSells = (token, page_nb) => {
    return Axios.get('/sells?page=' + page_nb,
    {
        headers: {
            Authorization: 'Bearer ' + token,
            Accept: "application/ld+json"
        }
    })
}

let getSell = (lid) => {
    return Axios.get('/sells/'+lid)
}


let getSellByLeadId = (token, lid) => {
    return Axios.get('/sells/lead/'+lid,
    {
        headers: {
            Authorization: 'Bearer ' + token,
            Accept: "application/json"
        }
    })
}

let getLeadsBuyedSelled = (token, page_nb, nb_results=10) => {
    return Axios.get('/user-leads/buyed-selled/?page=' + page_nb+'&nbresult='+nb_results,
    {
        headers: {
            Authorization: 'Bearer ' + token,
            Accept: "application/json"
        }
    })
}


let getSellsInvoicesBuyedSelled = (token, date_from, date_to) => {
    return Axios.get('sells/invoices/buyed-selled/from-to?date_from='+date_from+'&date_to='+date_to,
    {
        headers: {
            Authorization: 'Bearer ' + token,
            Accept: "application/json"
        }
    })
}

let updateSell = (token, sell) => {
    return Axios.patch('/sells/'+sell.id, 
    sell,
    {
        headers: {
            Authorization: 'Bearer ' + token,
            Accept: "application/json"
        }
    }
    )
}

let createSell = (token, lead) => {
    return Axios.post('/sells', lead,
    {
        headers: {
            Authorization: 'Bearer ' + token,
            Accept: "application/json"
        }
    })
}

let deleteSell = (lid) => {
    return Axios.delete('/sells/'+lid)
}

export const sellService = {
    getAllSells,
    getSell,
    getSellByLeadId,
    updateSell,
    createSell,
    deleteSell,
    getSellsInvoicesBuyedSelled,
    getLeadsBuyedSelled
}