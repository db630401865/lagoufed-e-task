const fs = require('fs')

function geFileList(path){
  var filesList = [];
  readFile(path,filesList);
  let totalSize = 0
  for(var i=0;i<filesList.length;i++){
    totalSize += filesList[i].size
  }
  return totalSize;
}
 
//遍历读取文件
function readFile(path,filesList){
 files = fs.readdirSync(path);
 files.forEach(item=>{
  statObj = fs.statSync(path+'/'+item);   
  if(statObj.isFile()){
    let obj = {
      size:statObj.size,
      name:item,
      path:path+'/'+item
    }
    filesList.push(obj)
  }else{ 
    readFile(path + '/' +item,filesList);
  }  
 });
}

console.log(geFileList("/Users/dongbo/Desktop/学习dom/nodeDemo/lgserve"));
