/** Import des modules nécessaires */
import Axios from './caller.service'

let downloadMultipleInvoices = (token, date_from, date_to) => {
    return Axios.get('download/invoices?date_from='+date_from+'&date_to='+date_to,
    {
        responseType: 'blob',
        headers: {
            Authorization: 'Bearer ' + token,
            Accept: "application/json"
        }
    })
}


let downloadInvoice = (token, id_sell) => {
    return Axios.get('download/invoice/'+id_sell,
    {
        responseType: 'blob',
        headers: {
            Authorization: 'Bearer ' + token,
            Accept: "application/ld+json"
        }
    })
}

let testApi = () => {
    return Axios.get('test',
    {
        withCredentials: true, // Ensure cookies are included in the request
        headers: {
            //Authorization: 'Bearer ' + token,
            Accept: 'application/json'
          }
    })
}


export const customService = {
    downloadMultipleInvoices,
    downloadInvoice,
    testApi
}