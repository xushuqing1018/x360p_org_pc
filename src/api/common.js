import Vue from 'vue'


function Logout(){
	return new Promise((resolve,reject)=>{
		Vue.http.get('logout').then(response=>{
			resolve(response)
		},response=>{
			reject(response)
		})
	})
}

function getGlobalVar(name){
	return new Promise((resolve,reject)=>{
		Vue.http.get('global/'+name).then(response=>{
			resolve(response.body.data)
		},response=>{
			reject(response.body.msg)
		})
	})
}

function switchUserBranch(bid){
	return new Promise((resolve,reject)=>{
		Vue.http.get('switchbid/'+bid).then(response=>{
			resolve()
		},response=>{
			reject(response.body.msg)
		})
	})
}

function getDataList(url){
	return new Promise((resolve,reject)=>{
		Vue.http.get(url).then(response=>{
			resolve(response.body.data.list)
		},response=>{
			reject(response.body.msg)
		})
	})
}

function updateBranchSort(bids){
	return new Promise((resolve,reject)=>{
		Vue.http.post('branches/0/sort',{bids:bids}).then(response=>{
			resolve(response.body)
		},response=>{
			reject(response.body.msg)
		})
	})
}

function getDataRowById(id,res){
	return new Promise((resolve,reject)=>{
		if(Array.isArray(id)){
			id = id.join(',')
		}
		Vue.http.get('datarow?id='+id+'&res='+res).then(response=>{
			resolve(response.body.data)
		},response=>{
			reject(response.body.msg)
		})
	})
}

function getDataRows(res,size){
	size = size || 3000
	let url = res+'?pagesize='+size
	return new Promise((resolve,reject)=>{
		Vue.http.get(url).then(response=>{
			resolve(response.body.data.list)
		},response=>{
			reject(response.body.msg)
		})
	})
}

function exeTodayTask(){
	let url = 'index/todaytask';
	return new Promise((resolve,reject)=>{
		Vue.http.get(url).then(response=>{
			resolve()
		},response=>{
			reject()
		})
	})
}

function getRouterHelp(path){
	return new Promise((resolve,reject)=>{
		Vue.http.get('open/helpdoc?router='+path).then(response=>{
			resolve(response.body.data)
		},response=>{
			reject(response.body.msg)
		})
	})
}

export default {
	Logout,
	getGlobalVar,
	getDataList,
	switchUserBranch,
	updateBranchSort,
	getDataRowById,
	getDataRows,
	exeTodayTask,
	getRouterHelp
}