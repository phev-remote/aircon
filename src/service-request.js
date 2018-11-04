import fetch from 'node-fetch'

const getJsonServiceRequest = (uri, jwt) => {
    const response = await fetch(uri, {
    method: 'GET',
    headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + jwt
        }})
    return await response.json()
}

export { getJsonServiceRequest }
