import fetch from 'node-fetch'

const getJsonServiceRequest = async (uri, jwt) => {
    try {
        const response = await fetch(uri, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + jwt
                }})
            return await response.json()
    } catch (err) {
        console.error(err)
        return { error : err}
    }
    
}

export { getJsonServiceRequest }
