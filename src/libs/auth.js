import Vue from 'vue'
import store from '../store'

const state = store.state


function is_expired(login_time,expire_time){
	let cur_time = Math.floor((new Date()).getTime() / 1000)
	let expired_time = login_time + expire_time
	//console.log('expired_time:'+expired_time+',cur_time:'+cur_time)
	return expired_time < cur_time
}

function isLock(){
	let islock = Vue.localStorage.get('islock')
	
	return String(islock) === "true"
}

function setLock(bool){
	Vue.localStorage.set('islock',bool)
}

function isLogin(){
	let user = state.user
	if(state.user.login_server_time == 0){
		user = JSON.parse(Vue.localStorage.get('user'))
		if(!user || typeof user !== 'object'){	
			user = state.user
		}else{
			if(user.login_time > 0 && !is_expired(user.login_time,user.expire_time)){
				store.commit('setLoginInfo',user.info)
			}
		}
		
	}
	return user.login_time > 0 && !is_expired(user.login_time,user.expire_time)
}

function getLocalLogin(){
	let user = JSON.parse(Vue.localStorage.get('user'))
	if(typeof user === 'object'){
		if(!is_expired(user.login_time,user.expire_time)){
			store.commit('setLoginInfo',user.info)
		}else{
			store.commit('clearLoginInfo')
		}
	}else{
		store.commit('clearLoginInfo')
		return null
	}
	return store.state.user
}

function setLocalLogin(user){
	store.commit('setLoginInfo',user)
}

function setGlobalAreas(data){
	store.commit('setGlobalAreas',data)
}

function getGlobalAreas(){
	let areas = JSON.parse(Vue.localStorage.get('areas'))	
	if(typeof areas === 'object'){
		store.commit('setGlobalAreas',areas)
	}else{
		return null
	}
	return store.state.global_areas
}

function setGlobalBranches(data){
	store.commit('setGlobalBranches',data)
}

function getGlobalBranches(){
	let branches = JSON.parse(Vue.localStorage.get('branches'))
	if(typeof branches === 'object'){
		store.commit('setGlobalBranches',branches)
	}else{
		return null
	}
	return store.state.global_branches
}

function setGlobalRoles(data){
	store.commit('setGlobalRoles',data)
}

function getGlobalRoles(){
	let roles = JSON.parse(Vue.localStorage.get('roles'))
	if(typeof roles === 'object'){
		store.commit('setGlobalRoles',roles)
	}else{
		return null
	}
	return store.state.global_roles
}

function setGlobalPers(data){
	store.commit('setGlobalPers',data)
}

function getGlobalPers(){
	let pers = JSON.parse(Vue.localStorage.get('pers'))
	if(typeof pers === 'object'){
		store.commit('setGlobalPers',pers)
	}else{
		return null
	}
	return store.state.global_pers
}

const Auth = {
	isLock,
	setLock,
	isLogin,
	getLocalLogin,
	setLocalLogin,
	setGlobalAreas,
	getGlobalAreas,
	setGlobalBranches,
	getGlobalBranches,
	setGlobalRoles,
	getGlobalRoles,
	setGlobalPers,
	getGlobalPers,
}

export default Auth