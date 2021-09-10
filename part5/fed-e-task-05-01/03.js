const http = require('http')
const url = require('url')
const path = require('path')
const mime = require('mime')
const fs = require('fs').promises
const { createReadStream } = require('fs')

let server =  http.createServer(async (req, res)=>{
  let { pathname } = url.parse(req.url)
  pathname = decodeURIComponent(pathname)
  absPath = path.join(__dirname, pathname)
  console.log(absPath);
  try {
    let statObj = await fs.stat(absPath)
    if(statObj.isFile()){
      console.log(3331);
      res.statusCode = 200
      res.setHeader("Content-type", mime.getType(absPath) + ";charset=utf-8")
      createReadStream(absPath).pipe(res)
    }else{
      let dirs = await fs.readdir(absPath)
      res.end('Is directory oh, do not operate')
    }
  } catch (error) {
    console.log(error);
    res.statusCode = 404
    res.end('Not fund')
  }
})


server.listen(1234, ()=>{
  console.log('服务起来了');
})