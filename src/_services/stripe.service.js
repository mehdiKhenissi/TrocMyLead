/** Import des modules nécessaires */
import Axios from './caller.service'

let stripeSessionCheckout = (token, paymentData) => {
    return Axios.post('/stripe/checkout',
    paymentData,
    {
        headers: {
            Authorization: 'Bearer ' + token,
            Accept: "application/json"
        }
    })
}


let stripeRetieveSession = (token, id) => {
    return Axios.get('/stripe/session/retrieve/'+id,
    {
        headers: {
            Authorization: 'Bearer ' + token,
            Accept: "application/json"
        }
    })
}


let stripeRetieveInvoice = (token, id) => {
    return Axios.get('/stripe/invoice/retrieve/'+id,
    {
        headers: {
            Authorization: 'Bearer ' + token,
            Accept: "application/json"
        }
    })
}


let stripeRetieveCustomer = (token, id) => {
    return Axios.get('/stripe/customer/retrieve/'+id,
    {
        headers: {
            Authorization: 'Bearer ' + token,
            Accept: "application/json"
        }
    })
}


let stripeCreateCustomer = (token, stripe_customer) => {
    return Axios.post('/stripe/customer/create',
    stripe_customer,
    {
        headers: {
            Authorization: 'Bearer ' + token,
            Accept: "application/json"
        }
    })
}


let stripeCapturPayment = (token, idPayment) => {
    return Axios.get('/stripe/captur/payment/' + idPayment,
    {
        headers: {
            Authorization: 'Bearer ' + token,
            Accept: "application/json"
        }
    })
}

let stripeRefundPayment = (token, idPayment) => {
    return Axios.get('/stripe/refund/payment/' + idPayment,
    {
        headers: {
            Authorization: 'Bearer ' + token,
            Accept: "application/json"
        }
    })
}


let stripeCancelPayment = (token, idPayment) => {
    return Axios.get('/stripe/cancel/payment/' + idPayment,
    {
        headers: {
            Authorization: 'Bearer ' + token,
            Accept: "application/json"
        }
    })
}



export const stripeService = {
    stripeSessionCheckout,
    stripeRetieveInvoice,
    stripeRetieveSession,
    stripeRetieveCustomer,
    stripeCreateCustomer,
    stripeCapturPayment,
    stripeRefundPayment,
    stripeCancelPayment
}