import store from '@/store'
import {_} from './util'
import Vue from 'vue'
export default {
    filters:{
        branch_name(bid,arg2,arg3){
          let name = ''
          let branchs = store.getters.getGlobalVar('branchs')
          if(branchs){
            for(let i=0,l=branchs.length;i<l;i++){
              if(bid == branchs[i].bid){
                name = branchs[i].short_name || branchs[i].branch_name
                break
              }
            }
          }
          return name
        },
        pj_name(pj_id,arg2,arg3){
            let name = ''
            let projects = store.getters.getGlobalVar('projects')
            if(projects){
              for(let i=0,l=projects.length;i<l;i++){
                if(pj_id == projects[i].pj_id){
                  name = projects[i].pj_name
                  break
                }
              }
            }
            return name
        },
        class_name(cid){
            return store.getters.getMapText(cid,'classes')
        },
        branch_name(bid,empty){
            if(!store.state.maps.branch){
                store.state.maps.branch = {}
                store.state.maps.branch_object = {}
            }
            if(store.state.maps.branch[bid]){
                return store.state.maps.branch[bid]
            }
            let e  = store.state.gvars.branchs.find(item=>item.bid == bid)
            if(e){
                store.state.maps.branch[bid] = e.short_name || e.branch_name
                store.state.maps.branch_object[bid] = e
                return e.branch_name
            }
            return empty||bid
        },
        dpt_name(dpt_id,empty){
            if(!store.state.maps.department){
                store.state.maps.department = {}
                store.state.maps.department_object = {}
            }
            if(store.state.maps.department[dpt_id]){
                return store.state.maps.department[dpt_id]
            }
            let e  = store.state.gvars.departments.find(item=>item.dpt_id == dpt_id)
            if(e){
                store.state.maps.department[dpt_id] = e.dpt_name
                store.state.maps.department_object[dpt_id] = e
                return e.dpt_name
            }
            return empty||dpt_id
        },
        role_name(rid,empty){
            if(!store.state.maps.role){
                store.state.maps.role = {}
                store.state.maps.role_object = {}
            }
            if(store.state.maps.role[rid]){
                return store.state.maps.role[rid]
            }
            let e  = store.state.gvars.roles.find(item=>item.rid == rid)
            if(e){
                store.state.maps.role[rid] = e.role_name
                store.state.maps.role_object[rid] = e
                return e.role_name
            }
            return empty||rid
        },
        ename(eid,empty){
            if(!store.state.maps.employee){
                store.state.maps.employee = {}
                store.state.maps.employee_object = {}
            }
            if(store.state.maps.employee[eid]){
                return store.state.maps.employee[eid]
            }
            let employees  = store.state.gvars.employees||[]
            let e = employees.find(item=>item.eid == eid)
            if(e){
                store.state.maps.employee[eid] = e.ename
                store.state.maps.employee_object[eid] = e
                return e.ename
            }
            return empty||eid
        },
        enames(eids,empty){
            let text = []
            if(!store.state.maps.employee){
                store.state.maps.employee = {}
                store.state.maps.employee_object = {}
            }
            eids.forEach(eid=>{

                eid = parseInt(eid)
                if(store.state.maps.employee[eid]){
                    text.push(store.state.maps.employee[eid])
                    return;
                }
                let e  = store.state.gvars.employees.find(item=>item.eid == eid)
                if(e){
                    store.state.maps.employee[eid] = e.ename
                    store.state.maps.employee_object[eid] = e
                    text.push(e.ename)
                }
            })
            
            return text.length>0?text.join(','):empty
        },
        employee_name(eid,empty){
            if(!store.state.maps.employee){
                store.state.maps.employee = {}
                store.state.maps.employee_object = {}
            }
            if(store.state.maps.employee[eid]){
                return store.state.maps.employee[eid]
            }
            let employees  = store.state.gvars.employees||[]
            let e = employees.find(item=>item.eid == eid)
            if(e){
                store.state.maps.employee[eid] = e.ename
                store.state.maps.employee_object[eid] = e
                return e.ename
            }
            return empty||eid
        },

        lesson_name(lid,empty){
            if(!store.state.maps.lesson){
                store.state.maps.lesson = {}
                store.state.maps.lesson_object = {}
            }
            if(store.state.maps.lesson[lid]){
                return store.state.maps.lesson[lid]
            }
            let e  = store.state.gvars.lessons.find(item=>item.lid == lid)
            if(e){
                store.state.maps.lesson[lid] = e.lesson_name
                store.state.maps.lesson_object[lid] = e
                return e.lesson_name
            }
            return empty||'-'
        },
        lesson_no(lid){
            if(!store.state.maps.lesson_object){
                store.state.maps.lesson = {}
                store.state.maps.lesson_object = {}
            }
            if(store.state.maps.lesson_object[lid]){
                return store.state.maps.lesson_object[lid].lesson_no
            }
            let e  = store.state.gvars.lessons.find(item=>item.lid == lid)
            if(e){
                store.state.maps.lesson[lid] = e.lesson_name 
                store.state.maps.lesson_object[lid] = e
                return e.lesson_no
            }
            return ''
        },
        subject_name(sj_id,empty){
            if(!store.state.maps.subject){
                store.state.maps.subject = {}
                store.state.maps.subject_object = {}
            }
            if(store.state.maps.subject[sj_id]){
                return store.state.maps.subject[sj_id]
            }
            let e  = store.state.gvars.subjects.find(item=>item.sj_id == sj_id)
            if(e){
                store.state.maps.subject[sj_id] = e.subject_name
                store.state.maps.subject_object[sj_id] = e
                return e.subject_name
            }
            if(sj_id == 0){
                sj_id = '-'
            }
            return empty||sj_id
        },
        classroom_name(cr_id,empty){
            if(!store.state.maps.classroom){
                store.state.maps.classroom = {}
                store.state.maps.classroom_object = {}
            }
            if(store.state.maps.classroom[cr_id]){
                return store.state.maps.classroom[cr_id]
            }
            let e  = store.state.gvars.classrooms.find(item=>item.cr_id == cr_id)
            if(e){
                store.state.maps.classroom[cr_id] = e.room_name
                store.state.maps.classroom_object[cr_id] = e
                return e.room_name
            }
            return empty||cr_id
        },
        //期段
        season_name(s){
            let seasons = store.state.gvars.dicts.season
            let season  = seasons.find(item=>item.name == s)
            if(season){
                return season.title
            }
            return s
        },
    
        //通用字典翻译
		//调用方式 this.$filter('dict_title')(params.row.sale_role_did,'sale_role')
		//模板调用 {{row.sale_role_did|dict_title('sale_role')}}
		//grade 是使用name作关联要单独处理
        dict_title(v,d,empty){
            let list = store.state.gvars.dicts[d]
            let info
            if(list){
                info = list.find(item=>item.did == v)
                if(d=='grade'){
                	info = list.find(item=>item.name==v)
                }
                if(info){
                    return info.title
                }
            }
            return empty
        },
        
        sj_ids_text(sj_ids,empty){
            let text = []
            if(!store.state.maps.subject){
                store.state.maps.subject = {}
                store.state.maps.subject_object = {}
            }
            sj_ids.forEach(sj_id=>{

                sj_id = parseInt(sj_id)
                if(store.state.maps.subject[sj_id]){
                    text.push(store.state.maps.subject[sj_id])
                    return;
                }
                let e  = store.state.gvars.subjects.find(item=>item.sj_id == sj_id)
                if(e){
                    store.state.maps.subject[sj_id] = e.subject_name
                    store.state.maps.subject_object[sj_id] = e
                    text.push(e.subject_name)
                }
            })
            
            return text.join(',')
        },
        sms_cloud_name(v){
            let sms_clouds = store.state.gvars.sms_clound
            if(typeof sms_clouds[v] != 'undefined'){
                return sms_clouds[v].name
            }
            return v
        }
    },
    methods: {
    	initGlobal(name){
            return new Promise((resolve,reject)=>{
                if(typeof this.$store.state.gvars[name] === 'undefined'){
                    this.$store.dispatch('updateGlobalVar',name).then((data)=>{
                        resolve(data)
                    },(msg)=>{
                        reject(msg)
                    })
                }else{
                    resolve(this.$store.state.gvars[name])
                }
            })
		},
        initDictList(url,dname,force){
            return new Promise((resolve,reject)=>{
                if(typeof this.$store.state.dicts[dname] === 'undefined' || force === true){
                    this.$store.dispatch('updateDictList',{url:url,dname:dname}).then((data)=>{
                        resolve(data)
                    },(msg)=>{
                        reject(msg)
                    })
                }else{
                    resolve(this.$store.state.dicts[dname])
                }
            })
        },
        initIdMap(resName,bid){
            return new Promise((resolve,reject)=>{
                let ck = resName
                let skip_bid_res = ['lessons']
                let resFieldMap = {
                    lessons:{
                        idf:'lid',
                        txf:'lesson_name'
                    },
                    classes:{
                        idf:'cid',
                        txf:'class_name'
                    },
                    employees:{
                        idf:'eid',
                        txf:'ename'
                    },
                    subjects:{
                        idf:'sj_id',
                        txf:'subject_name'
                    }
                }
                let idf = resFieldMap[resName].idf
                let txf = resFieldMap[resName].txf
                if(skip_bid_res.indexOf(resName) === -1){
                    ck = [resName,bid].join('-')
                }
                if(this.$store.getters.isCache(ck)){
                    resolve(true)
                }else{
                    this.$store.dispatch('initIdMap',{name:resName,idf:idf,txf:txf}).then((data)=>{
                        resolve(data)
                        Vue.set(this.$store.state.cache,ck,true)
                    },msg=>{
                        reject(msg)
                    })
                }
            })
        },
        getDictList(dname){
            return this.$store.getters.getDictList(dname)
        },
        getGlobalVar(name){
            return this.$store.getters.getGlobalVar(name)
        },
        multiBranch(){
            this.$store.commit('branchMultiMode')
        },
        singleBranch(){
            this.$store.commit('branchSingleMode')
        },
        noneBranch(){
            this.$store.commit('branchNoneMode')
        },
        getSubjectObj(sj_id){
            let store = this.$store
            if(!store.state.maps.subject_object){
                store.state.maps.subject_object = {}
                store.state.maps.subject = {}
            }
            if(store.state.maps.subject_object[sj_id]){
                return store.state.maps.subject_object[sj_id]
            }
            let e  = store.state.gvars.subjects.find(item=>item.sj_id == sj_id)
            if(e){
                store.state.maps.subject[sj_id] = e.subject_name
                store.state.maps.subject_object[sj_id] = e
                return e
            }
            return null
        },
        getLessonObj(lid){
            let store = this.$store
            if(!store.state.maps.lesson_object){
                store.state.maps.lesson_object = {}
                store.state.maps.lesson = {}
            }
            if(store.state.maps.lesson_object[lid]){
                return store.state.maps.lesson_object[lid]
            }
            let e  = store.state.gvars.lessons.find(item=>item.lid == lid)
            if(e){
                store.state.maps.lesson[lid] = e.lesson_name
                store.state.maps.lesson_object[lid] = e
                return e
            }
            return null
        },
        getClassRoomObj(cr_id){
            let store = this.$store
            if(!store.state.maps.classroom_object){
                store.state.maps.classroom_object = {}
                store.state.maps.classroom = {}
            }
            if(store.state.maps.classroom_object[cr_id]){
                return store.state.maps.classroom_object[cr_id]
            }
            let e  = store.state.gvars.classrooms.find(item=>item.cr_id == cr_id)
            if(e){
                store.state.maps.classroom[cr_id] = e.room_name
                store.state.maps.classroom_object[cr_id] = e
                return e
            }
            return null
        },
        getEmployeeObj(eid){
            let store = this.$store
            if(!store.state.maps.employee_object){
                store.state.maps.employee_object = {}
                store.state.maps.employee = {}
            }
            if(store.state.maps.employee_object[eid]){
                return store.state.maps.employee_object[eid]
            }
            let e  = store.state.gvars.employees.find(item=>item.eid == eid)
            if(e){
                store.state.maps.employee[eid] = e.ename
                store.state.maps.employee_object[eid] = e
                return e
            }
            return null
        },
        ssqFormat(arg1,arg2,arg3) {
            let province,p_name,city,c_name,d_name
            try {
                province = this.areas.find(item=>item.value==arg1)
                p_name   = province.label
                city     = province.children.find(item=>item.value==arg2)
                c_name   = city.label
                d_name   = city.children.find(item=>item.value==arg3).label
            }
            catch(e) {
                console.log(e)
            }
            return p_name+c_name+d_name
        }
    },
    computed:{
    	areas(){
    		return this.$store.getters.getGlobalVar('areas')
    	},
    	branchs(){
    		return this.$store.getters.getGlobalVar('branchs')
        },
        hasMultiBranch(){
            return this.branchs.length > 1
        },
	    roles(){        	
        	return this.$store.getters.getGlobalVar('roles')
        },

        pers(){
            return this.$store.getters.getGlobalVar('pers')
        },
        mobile_pers(){
        	return this.$store.getters.getGlobalVar('mobile_pers')
        },
        configs(){
            return this.$store.getters.getGlobalVar('configs')
        },
        grades() {
            let grades = this.$store.state.gvars.dicts['grade']
            grades.forEach(item=>{
                item.name = parseInt(item.name)
            })
            return grades
        },
        branch_accounts(){
            let accounts = this.$store.state.gvars.accounts
            let bid  = this.$store.state.branch.id
            let ret = []
            accounts.forEach(item=>{
                if(item.is_public == 1 ||item.bids.indexOf(bid) !== -1){
                    ret.push(item)
                }
            })
            return ret
        },
        projects () {
            return this.$store.state.gvars.projects
        },
        subjects () {
            return this.$store.state.gvars.subjects
        },
        sms_clounds (){
            let ret = [],
                map = this.$store.state.gvars.sms_clound
            for (let o in map){
                ret.push({
                    server:o,
                    name:map[o].name,
                    can_free:map[o].can_free,
                    enable:map[o].enable,
                    params:map[o].params
                })
            }
            return ret
        }
    }
}