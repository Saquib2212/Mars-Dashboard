require('dotenv').config()
const express = require('express')
const bodyParser = require('body-parser')
const fetch = require('node-fetch')
const path = require('path')
const Immutable = require('immutable');

const app = express()
const port = 3000

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

app.use('/', express.static(path.join(__dirname, '../public')))

// your API calls

// example API call
app.get('/apod', async (req, res) => {
    try {
        const image = await fetch(`https://api.nasa.gov/planetary/apod?api_key=${process.env.API_KEY}`)
            .then(res => res.json())
        res.send({ image })
    } catch (err) {
        console.log('error:', err);
    }
})

//this function takes name of rover and return a detail of rover
app.post('/rovers',async(req,res)=>{
    let rovers = req.body;
    console.log(rovers)
    console.log(rovers.data)
    try{
        const data1 =await fetch (`https://api.nasa.gov/mars-photos/api/v1/rovers/${rovers.data}/latest_photos?api_key=${process.env.API_KEY}`)
        .then(res => res.json())
        res.send({data1})
        console.log(data1)
    }
    catch(error){
            console.log('error:',error);
    }
})

app.listen(port, () => console.log(`Example app listening on port ${port}!`))