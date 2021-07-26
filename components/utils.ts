export async function postRequest(url: string, jsonData: object) {
    const response = await fetch(url, {
        method: 'POST',
        body: JSON.stringify(jsonData),
        headers: {
            // set content-type correctly to be able to use the object server-side without JSON.parse
            'Content-Type': 'application/json'
        }
    });
    if (response.status != 200) {
        throw new Error(`status: ${response.status}, statusText: ${response.statusText}`);
    }
    return response;
}