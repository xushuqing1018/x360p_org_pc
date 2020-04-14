import Vue from 'vue'
import Vuex from 'vuex'
import params from '../config/params'
import actions from './actions'
import mutations from './mutations'

Vue.use(Vuex)

const state = {
    layout:null,
    config: params,
    sys_name: '校360专业版',
    login_logo: '',
    copyright: '',
    client:null,
    ui: {
    	
    },
    user: {
        login_time: 0,
        login_server_time: 0,
        expire_time: 0,
        token: '',
        bid: 0,
        info: null
    },
    branch: {
        mode: 'single',
        id: 0,
        ids: [],
        last_update:0
    },
    project:{
        mode: 'signle',
        id:0,
        ids:[],
        map:{},
        umap:{},
    },
    gvars: {

    },
    dicts: {

    },
    maps: {

    },
    cache: {

    },
    guide:false,
    is_submit: false,
    is_get: false,
    is_loading: false,
    is_siderbar_min: false,
    is_aside_min: true,
    card: {
    	refresh: false,
    	type: 'attendance'
    },
    http:{
    	saving:false,
    	request:'',
    	response:''
    },
    drag:{
        field:'',
        data:null
    },
    upload: {
    	upload_task: []	
    },
    arrange:null,
    router_help:[],
    lesson_standard_file: [],
    app:{
        theme:'theme-default',
        color:'#1c2b36'
    },
    scan_reader:{
        times:0,
        code:''
    },
    issue_card:{
        list:[]
    },
    follow_customers:{
        list:[],
        cursor:0
    },
    market_channels: [],
    latest_version:{
        ver:'',
        content:'',
        vid:0,
        publish_date:0,
        read:0
    },
    search:{
        fields: {

        },
        params: {

        },
        pk: '',
        detail: false
    },
    export:{
        tasks:[]
    },
    dashboard:{
        current:'default'
    },
    gtip: {
        show: false,
        text: ''
    }
}

const getters = {
	isLogin(state){
		let cur_time = (new Date()).getTime() / 1000
		let expired_time = state.user.login_time + state.user.expire_time
		return state.user.login_time > 0 && expired_time > cur_time
	},
	isLock(){
		let islock = Vue.localStorage.get('islock')
		return String(islock) === 'true'
	},
	getGlobalVar:(state,getter)=>(name)=>{
		return state.gvars[name]
	},
	getDictList:(state,getter)=>(name)=>{
		return state.dicts[name]
	},
	getMapText:(state,getter)=>(id,name)=>{
		let map = state.maps[name]
		return map?map[id]:id
	},
	getMapObject:(state,getter)=>(id,name)=>{
		let map = state.maps[name+'_object']
		return map?map[id]:null
	},
	isCache:(state,getter)=>(ck)=>{
		if(state.cache[ck]){
			return true
		}
		return false
	}
}


export default new Vuex.Store({
	state,
	getters,
	actions,
	mutations
})