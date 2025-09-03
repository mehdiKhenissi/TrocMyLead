/** Import des modules nécessaires */
import Axios from './caller.service'

let getAllLeads = (page_nb) => {
  return Axios.get('/all-leads?page=' + page_nb, {
    // headers: {
    //     Authorization: 'Bearer ' + token,
    //     Accept: "application/json"
    // }
  })
}

let getUserLeads = (token, page_nb) => {
  return Axios.get('/user-leads?page=' + page_nb, {
    headers: {
      Authorization: 'Bearer ' + token,
      Accept: 'application/ld+json'
    }
  })
}

let getLead = (lid) => {
  return Axios.get('/leads/' + lid)
}

let updateLead = (token, lead) => {
  return Axios.patch('/leads/' + lead.id, lead, {
    withCredentials: true, // Ensure cookies are included in the request
    headers: {
      Authorization: 'Bearer ' + token,
      Accept: 'application/json'
    }
  })
}

let createLead = (token, lead) => {
  //console.log(lead)
  return Axios.post('/leads', 
  lead,
  {
    withCredentials: true, // Ensure cookies are included in the request
    headers: {
      Authorization: 'Bearer ' + token,
      Accept: 'application/ld+json'
    }
  }
  )
}

let updateStatusLead = (token, lead) => {
  return Axios.patch('/status/lead/'+lead.id,
  lead,
  {
    headers: {
      Authorization: 'Bearer ' + token,
      Accept: 'application/ld+json'
    }
  }
  )
}

let chatGptPriceLead = (token, lead) => {
  return Axios.post('/leads/price',
  lead,
  {
    withCredentials: true, // Ensure cookies are included in the request
    headers: {
      Authorization: 'Bearer ' + token,
      Accept: 'application/json'
    }
  }
  )
}

let deleteLead = (lid) => {
  return Axios.delete('/leads/' + lid)
}

export const leadService = {
  getAllLeads,
  getUserLeads,
  getLead,
  updateLead,
  createLead,
  updateStatusLead,
  deleteLead,
  chatGptPriceLead
}
