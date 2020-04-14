/*
* @Author: Administrator
* @Date:   2017-10-21 10:41:09
* @Last Modified by:   Administrator
* @Last Modified time: 2017-10-25 09:31:06
*/
const cmd = require('node-cmd')
const Promise = require('bluebird')
const path = require('path')
const fs = require('fs')
const os = require('os')

const exeCmd = Promise.promisify(cmd.get,{multiArgs:true,context:cmd})

var cmd_cd = 'echo %cd%'
if(os.type() == 'Darwin'){
	cmd_cd = 'pwd'
}

exeCmd(cmd_cd).then(data=>{
	var ui_src_root_path
	var www_path
	ui_src_root_path = data[0].trim()
	www_path = path.join(ui_src_root_path,'../../www')
	release(ui_src_root_path,www_path)
})

function sprintf(){
  var arg = arguments,
    str = arg[0] || '',
    i, n;
  for (i = 1, n = arg.length; i < n; i++) {
    str = str.replace(/%s/, arg[i]);
  }
  return str;
}

function next(){
	return new Promise((resolve,reject)=>{
		resolve()
	})
}


function release(src,www){
	//删除public admin目录文件
	var public_admin = www+'\\public\\ui\\neza\\pc'
	var landev_public_admin = '\\\\linux01\\x360p_www\\public\\ui\\neza\\pc'
	if(os.type() == 'Darwin'){
		public_admin = www + '/public/ui/neza/pc'
		landev_public_admin = '/Volumes/x360p_www/public/ui/neza/pc'
	}
	var src_dist     = src+'\\release'
	if(os.type() == 'Darwin'){
		src_dist = src + '/release'
	}
	var command 	 = sprintf('xcopy %s %s /y /e',src_dist,public_admin)
	var command2     = sprintf('xcopy %s %s /y /e',src_dist,landev_public_admin)
	if(os.type() == 'Darwin'){
		command = sprintf('cp -r %s/ %s',src_dist,public_admin)
		command2 = sprintf('cp -r %s/ %s',src_dist,landev_public_admin)
	}
	clear_dist(public_admin)
	.then(data=>{
		return exeCmd(command)
	})
	.then(data=>{
		return clear_dist(landev_public_admin)
	})
	.then(data=>{
		return exeCmd(command2)
	})
	.then(data=>{
		console.log('done!')
	})

}


function clear_dist(public_admin){
	var public_admin_dist = public_admin+'\\dist'
	var public_admin_index = public_admin+'\\index.html'
	var command = []
	if(os.type() == 'Darwin'){
		public_admin_dist = public_admin + '/dist'
		public_admin_index = public_admin + '/index.html'
	}
	if(fs.existsSync(public_admin_dist)){
		if(os.type() == 'Darwin'){
			command.push(sprintf('rm -rf %s',public_admin_dist))
		}else{
			command.push(sprintf('rd /s /q %s',public_admin_dist))
		}
		
	}
	if(fs.existsSync(public_admin_index)){
		if(os.type() == 'Darwin'){
			command.push(sprintf('rm -rf %s',public_admin_index))
		}else{
			command.push(sprintf('del %s',public_admin_index))
		}
		
	}
	if(command.length > 0){
		return exeCmd(command.join("\n"))
	}else{
		return next()
	}
}

