const express = require('express')
const app = express()
const port = 3000

var bodyParser = require('body-parser')

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json())

app.use(function (req, res) {
    console.log('----------Body:----------')
    console.log(req.body);
    console.log('----------Headers:----------')
    console.log(req.headers);
    res.setHeader('Content-Type', 'text/plain')
    res.write('you posted:\n')
    res.write(JSON.stringify(req.headers, null, 2))
    res.end(JSON.stringify(req.body, null, 2))
})

app.get('/', (req, res) => {
    res.send('Hello World!')
})

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})