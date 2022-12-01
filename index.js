const express = require('express');
const cors = require('cors');
const app = express();
const mongo = require("mongodb")
const mongoose = require("mongoose")
const validurl = require("valid-url")
const shortId = require("shortid")

// const URLcheck = require("url").URL
require('dotenv').config();

// Basic Configuration
const port = process.env.PORT || 3000;
const secrets = process.env.MONGO_URI

mongoose.connect(process.env.MONGO_URI,{
  useNewUrlParser: true,
  useUnifiedTopology: true,
})

const Schema = new mongoose.Schema({
  original_url:String,
  short_url: String
})

//URL model
const ShortUrl  = mongoose.model("ShortUrl",Schema)

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({
  extended:false
}))

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});


app.post("/api/shorturl/",(request,response)=>{
  const { url } = request.body
  const urlinfo = validurl.isWebUri(request.body.url)
  if(urlinfo != undefined){
    let id = shortId.generate();
    // console.log(id)
    let newUrl = new ShortUrl({
       original_url:urlinfo,
      short_url: id
    })
    newUrl.save((error,data)=>{
      if(error) return console.error(error)
          response.json({
            original_url:newUrl.original_url,
            short_url: newUrl.short_url
          })
    })
  }else{
      response.json({"error":"invalid URL"});
  }
  // console.log(urlinfo)

})

app.get("/api/shorturl/:shortid",(request,response)=>{
  ShortUrl.find({
    short_url : request.params.shortid
  }).then((data)=>{
    response.redirect(data[0].original_url)
  })
})
// app.use("/api/shorturl",router)

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
