import Vue from 'vue'

function updateGlobalVar(state,{name,data}){
	if(name == 'areas'){
		try{
			let areas = []
			data.forEach(item=>{
    			if(item.level === 1){
    				areas.push({
    					value: item.area_id,
    					label: item.name,
    					children: []
    				})
    			}
    			if(item.level === 2){
    				let parea = areas.find(child=>child.value === item.parent_id)
    				if(parea && parea.children){
    					parea.children.push({
    						value: item.area_id,
	    					label: item.name,
	    					children: []
    					})
    				}          				            										
    			}
    			if(item.level === 3){  
    				let parent = data.find(di=>di.area_id === item.parent_id)
    				let top    = areas.find(ci=>ci.value === parent.parent_id)  
    				let top_children = top.children.find(si=>si.value === item.parent_id) 
    				if(top_children && top_children.children){
    					top_children.children.push({
    						value: item.area_id,
    						label: item.name
    					})
    				}						
    			}            			
    		})
    		Vue.set(state.gvars,name,areas)
    	}catch(e){
    	}
    }else{	
		Vue.set(state.gvars,name,data)
		let sname = name.substr(0,name.length-1)
		if(typeof state.maps[sname] != 'undefined'){
			state.maps[sname] = {}
			state.maps[sname+'_object'] = {}
		}
	}
	if(name == 'config' && state.gvars.projects){
		initUserProjectIds(state)
	}
}

function setBranchMode (state,mode) {
	let bkey = 'branch-'+state.user.info.uid,
		branch = JSON.parse(Vue.localStorage.get(bkey))
		
	if(branch!=null){
		branch.mode = mode
		Vue.localStorage.set(bkey,JSON.stringify(branch))
	}
}

function init_bid_pj_ids_map(state){
	let bid_dpt_id_map = {},
        dpt_id_bid_map  = {},
        bid_pj_ids_map = {},
        user_bid_pj_ids_map = {},
		user_pj_ids = state.project.ids,
		user_bids = state.user.info.employee.bids || [],
		user_charge_pj_ids = state.user.info.employee.charge_pj_ids || [],
		has_in = function(a1,a2){
			let ret = []
			for(let i=0;i<a1.length;i++){
				if(a2.indexOf(a1[i]) !== -1){
					ret.push(a1[i])
				}
			}
			return ret
		}
    state.gvars.departments.forEach(d=>{
	    if(d.dpt_type == 1 && d.bid > 0){
	      bid_dpt_id_map[d.bid] = d.dpt_id
	      dpt_id_bid_map[d.dpt_id] = d.bid
	      bid_pj_ids_map[d.bid] = []
		  user_bid_pj_ids_map[d.bid] = []
	    }
	})
	state.gvars.departments.forEach(d=>{
	    if(d.dpt_type == 3 && d.pj_id > 0 && d.pid > 0){
	      let bid = dpt_id_bid_map[d.pid]
	      if(bid){
	        if(typeof bid_pj_ids_map[bid] == 'undefined'){
	          bid_pj_ids_map[bid] = []
	        }
	        bid_pj_ids_map[bid].push(d.pj_id)

	        if(user_pj_ids.indexOf(d.pj_id) !== -1){
	        	if(typeof user_bid_pj_ids_map[bid] == 'undefined'){
	        		user_bid_pj_ids_map[bid] = []
	        	}
	        	user_bid_pj_ids_map[bid].push(d.pj_id)
	        }
	      }
	    }
	})

	
	for(let bid in user_bid_pj_ids_map){
		if(user_bids.indexOf(parseInt(bid)) === -1 && user_charge_pj_ids.length > 0){
			user_bid_pj_ids_map[bid] = has_in(user_charge_pj_ids,bid_pj_ids_map[bid])
		}
	}
	state.project.map  = bid_pj_ids_map
	state.project.umap = user_bid_pj_ids_map
	
}

function initUserProjectIds(state){
	if(!state.gvars.configs.params.enable_project){
		state.project.map = {}
		return
	}

	let all_pj_len = state.gvars.projects.length 
	let is_admin = state.user.info.is_admin === 1
	let user_pj_ids = state.user.info.employee.pj_ids

	if(is_admin){
		user_pj_ids = []
		state.gvars.projects.forEach(pj=>{
			user_pj_ids.push(pj.pj_id)
		})
	}

	state.project.ids = user_pj_ids

	init_bid_pj_ids_map(state)

	setHttpHeaderPjId(state)


}

function setHttpHeaderPjId(state){
	let cur_bid = state.branch.id 
	let xjid = -1
	try{
		let umap_len = state.project.umap[cur_bid].length
		let map_len  = state.project.map[cur_bid].length
		if(umap_len == 1){
			xjid = state.project.umap[cur_bid][0]
		}else if(umap_len > 1){
			if(state.project.id > 0){
				xjid = state.project.id
			}else{
				if(map_len > umap_len){
					xjid = state.project.umap[cur_bid].join(',')
				}
			}
		}else{
			if(map_len > 0){
				xjid = 0
			}
		}
	}catch(e){
		xjid = 0
	}

	if(xjid !== -1){
		state.project.id = xjid
		Vue.http.headers.common['x-jid'] = xjid.toString()
	}else{
		if(typeof Vue.http.headers.common['x-jid'] != 'undefined'){
			delete Vue.http.headers.common['x-jid']
		}
	}
}

export default {
	addExportTask(state,task){
		state.export.tasks.push(task)
	},
	clearExportTask(state,task){
		state.export.tasks.splice(0,state.export.tasks.length)
	},
	updateUploadTask(state,list) {
		state.upload.upload_task = list	
	},
	updateLessonStandardFile(state,list) {
		state.lesson_standard_file = list
	},
	updateScanReader(state,code){
		state.scan_reader.times++
		state.scan_reader.code = code
	},
	updateRouterHelp(state,data){
		state.router_help = data
	},
	setLayout(state,vm){
		state.layout = vm
	},
	setLoginInfo(state,data){
		state.client = data.client
		state.base_url = data.base_url
		state.user.info = data
		state.user.token = data.token
		state.user.login_time = Math.floor((new Date()).getTime()/1000)
		state.user.login_server_time = data.login_server_time
		state.user.expire_time = data.expired
		state.branch.id = state.user.info.bid
		state.branch.ids.push(state.user.info.bid)

		Vue.localStorage.set('user',JSON.stringify(state.user))
		Vue.http.headers.common['x-token'] = data.token
		Vue.http.headers.common['x-sub-host'] = data.x_sub_host
		Vue.http.headers.common['x-bid']   = data.bid.toString()
	},
	setClient(state,data){
		state.client = data
	},
	updateClient(state,data){
		state.client = data
		state.user.info.client = data
		Vue.localStorage.set('user',JSON.stringify(state.user))
	},
	setGlobalVars(state,globals){
		for(let o in globals){
			updateGlobalVar(state,{name:o,data:globals[o]})
		}
		initUserProjectIds(state)
	},
	clearLoginInfo(state){
		state.user.info = null
		state.user.login_time  = 0
		state.user.login_server_time = 0
		state.user.expire_time = 0
		state.user.token = ''
		Vue.localStorage.remove('user')
		delete Vue.http.headers.common['x-token']
		delete Vue.http.headers.common['x-sub-host']
	},
	updateCard(state) {
		state.card.refresh = !state.card.refresh		
	},
	updateLoginExpire(state){
		state.user.login_time = Math.floor((new Date()).getTime()/1000)
		Vue.localStorage.set('user',JSON.stringify(state.user))
	},
	updateUserInfo(state,{user,action}){
		switch(action) {
			case 'changeName':
				state.user.info.name = user.name
				break
			case 'changeAvatar':
				state.user.info.avatar = user.avatar
				break
			case 'bind_mobile':
				state.user.info.mobile = user.mobile
				state.user.info.is_mobile_bind = 1
				break
			case 'bind_email':
				state.user.info.email = user.email
				state.user.info.is_email_bind = 1
				break
			case 'bind_wx':
				state.user.info.is_weixin_bind = 1
				state.user.info.openid = user.openid
				break
			case 'unbind_wx':			
				state.user.info.is_weixin_bind = 0
				state.user.info.openid = ''
				break
			case 'changeUI':
				state.user.info.client.params = user.client.params
				break
		}
		Vue.localStorage.set('user',JSON.stringify(state.user))
	},
	setWxToken(state,{openid}){
		state.user.openid = openid
		Vue.localStorage.set('user',JSON.stringify(state.user))
	},
	updateGlobalVar,
	initUserProjectIds,
	setHttpHeaderPjId,
	updateDictList(state,{name,data}){
		Vue.set(state.dicts,name,data)
	},
	switchUserBranch(state,bid){
		state.user.info.bid = bid
		Vue.localStorage.set('user',JSON.stringify(state.user))
	},
	branchMultiMode(state){
		if(state.branch.mode != 'multi'){
			if(state.branch.ids.indexOf(state.branch.id) === -1){
				state.branch.ids.push(state.branch.id)
			}
			state.branch.mode = 'multi'
		}
		setBranchMode(state,state.branch.mode)
		Vue.http.headers.common['x-bid']   = state.branch.ids.join(',')
	},
	branchSingleMode(state){		
		if(state.branch.mode != 'single'){
			if(state.branch.id == 0){
				state.branch.id = state.branch.ids[0]
			}
			state.branch.mode = 'single'
		}
		setBranchMode(state,state.branch.mode)
		Vue.http.headers.common['x-bid']   = state.branch.id.toString()
	},
	branchNoneMode(state){
		if(state.branch.mode != ''){
			state.branch.mode = ''		
			
			delete Vue.http.headers.common['x-bid']
		}
		setBranchMode(state,state.branch.mode)
	},	
	setBranchId(state,bid){
		let bkey = 'branch-'+state.user.info.uid
		state.branch.id = bid
		Vue.http.headers.common['x-bid']   = bid.toString()
		Vue.localStorage.set(bkey,JSON.stringify(state.branch))
	},
	setProjectId(state,pj_id){
		let bkey = 'project-'+state.user.info.uid
		state.project.id = pj_id
		Vue.http.headers.common['x-jid']   = pj_id.toString()
		Vue.localStorage.set(bkey,JSON.stringify(state.branch))
	},
	setBranchIds(state,ids){
		if(!ids){
			return
		}
		if(ids.length == 0){
			state.branch.ids.splice(0,state.branch.ids.length)
		}else{
			state.branch.ids.splice(0,state.branch.ids.length)
			ids.forEach(id=>{
	
				state.branch.ids.push(id)
				
			})
		}
		state.branch.last_update++
		let bkey = 'branch-'+state.user.info.uid
		Vue.http.headers.common['x-bid']   = state.branch.ids.join(',')
		Vue.localStorage.set(bkey,JSON.stringify(state.branch))
	},
	setProjectIds(state,ids){
		if(!ids){
			return
		}
		if(ids.length == 0){
			state.project.ids.splice(0,state.project.ids.length)
		}else{
			state.project.ids.splice(0,state.project.ids.length)
			ids.forEach(id=>{
	
				state.project.ids.push(id)
				
			})
		}
		state.project.last_update++
		let bkey = 'project-'+state.user.info.uid
		Vue.http.headers.common['x-jid']   = state.project.ids.join(',')
		Vue.localStorage.set(bkey,JSON.stringify(state.project))
	},
	setProjectMap(state,map){
		state.project.map = map
	},
	branchUp(state,index){
		if(index == 0){
			return
		}
		let arr = state.gvars.branchs
		let first  = arr[index]
		let second = arr[index-1]
		arr.splice(index-1,2,first,second)

	},
	branchDown(state,index){
		let arr = state.gvars.branchs
		let arrlen = arr.length
		if(index == arrlen-1){
			return
		}
		let first = arr[index+1]
		let second = arr[index]
		arr.splice(index,2,first,second)
	},
	buildIdTextMap(state,{list,name,ifield,tfield}){
		let name_object = name+'_object'
		let map = state.maps[name]||{},
			map_object = state.maps[name_object]||{}
		list.forEach(item=>{
			map[item[ifield]] = item[tfield]
			map_object[item[ifield]] = item
		})
		Vue.set(state.maps,name,map)
		Vue.set(state.maps,name_object,map_object)
	},
	updateIdTextMap(state,{item,name,ifield,tfield}){
		let name_object = name+'_object'
		let map = state.maps[name]||{},
			map_object = state.maps[name_object]||{}
		map[item[ifield]] = item[tfield]
		map_object[item[ifield]] = item
		Vue.set(state.maps,name,map)
		Vue.set(state.maps,name_object,map_object) 
	},
	setCache(state,{key,val}){
		Vue.set(state.cache,key,val)
	},
	changeSiderbar(state){
		state.is_siderbar_min = !state.is_siderbar_min
	},
	changeAside(state) {
		state.is_aside_min = !state.is_aside_min
	},
	httpRequestStart(state,url){
		state.http.request = url
		state.http.response = ''
	},
	httpRequestEnd(state,url){
		state.http.response = url
		if(url == state.http.request){
			state.http.request = ''
		}
	},
	httpSavingStart(state,{url,method}){
		state.http.saving = true
	},
	httpSavingEnd(state,{url,method}){
		state.http.saving = false
	},
	startDrag(state,{field,data}){
		state.drag.field = field
		state.drag.data  = data
	},
	endDrag(state){
		state.drag.field = ''
		state.drag.data  =  null
	},
	setArrange(state,arrange){
		state.arrange = arrange
	},
	clearArrange(state){
		state.arrange = null
	},
	setGuideOn(state){
		state.guide = true
	},
	setGuideOff(state){
		state.guide = false
	},
	setAppTheme(state,{theme,color}) {
		state.app.theme = theme
		state.app.color = color
	},
	addIssueCard(state,data) {
		state.issue_card.list.push(data)
	},
	updateIssueCard(state,{id,card_no}) {
		let object = state.issue_card.list.find(item => item.sid==id)
		if(object) {
			object.card_no = card_no
		}
	},
	setMarketChannel (state,list){
		state.market_channels = list
	},	
	addFollowCustomer(state,{id,name,first_tel,photo_url}) {
		state.follow_customers.list.push({
			cu_id: id,
			name: name,
			first_tel:first_tel,
			photo_url: photo_url
		})
	},
	removeFollowCustomer(state,index) {
		state.follow_customers.list.splice(index,1)
	},
	clearFollowCustomer(state) {
		let length = state.follow_customers.list.length
		state.follow_customers.cursor = 0
		state.follow_customers.list.splice(0,length)
	},
	prevCursor(state) {
		state.follow_customers.cursor--
	},
	nextCursor(state) {
		state.follow_customers.cursor++
	},
	setLatestVersion(state,version){
		state.latest_version.ver = version.ver
		state.latest_version.content = version.content
		state.latest_version.publish_date = version.publish_date
		state.latest_version.vid = version.vid
		let sk = 'ver-'+state.latest_version.vid
		let ver_read = Vue.localStorage.get(sk)
		if(ver_read){
			state.latest_version.read = 1
		}
	},
	updateLatestVersionRead(state){
		if(state.latest_version.vid > 0){
			let sk = 'ver-'+state.latest_version.vid
			Vue.localStorage.set(sk,1)
			state.latest_version.read = 1
		}
	},
	setSearchInfo(state,{pk,search,params}) {
		state.search.pk = pk
		state.search.fields = search
		state.search.params = params
	},
	setSearchDetail(state,detail) {
		state.search.detail = detail
	},
	setDashboard(state,db){
		state.dashboard.current = db
	},
	showGTip(state,text){
		state.gtip.show = true;
		state.gtip.text = text;
	},
	closeGTip(state){
		state.gtip.show = false;
	},
	
}