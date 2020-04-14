import store from '../store'
import $rest from './rest'
import {_} from './util'
import util from './util'
import FilterColumn from 'c%/FilterColumn.vue'
import PerScope from 'c%/PerScope.vue'

function op_render(h,params){
    let op_items = []
    for(let key in this.operation_keys){
        let op = this.operation_keys[key]
        //根据权限显示操作按钮
        let directives = []
        let conditionFn
        let conditionResult = true
        if(op.per){
            directives.push({
                name:'per',
                value:op.per,
                expression: '',
                arg: 'display',
                modifiers: {
                
                }
            })
        }
        //可以做简单的计算判断，比如是否启用删除按钮
        if(op.condition){
            if(_.isString(op.condition)){
                let condition = util.copy(op.condition)
                let index = condition.indexOf('this.eid$')
                if(index > -1) {
                    condition = condition.replace('this.eid$',this.eid$)
                }
                conditionFn = new Function('row','params','return '+condition)
            }else if(_.isFunction(condition)){
                conditionFn = condition
            }
            if(_.isFunction(conditionFn)){
                if(!conditionFn(params.row,params)){
                    conditionResult = false
                }
            }
        }
        if(_.isFunction(this.operation_func[key]) && op.show!==false && conditionResult){
            op_items.push(
                h('Dropdown-item',{
                    nativeOn:{
                        click:this.operation_func[key].bind(this,params)
                    },
                    directives: directives
                },[
                    h('Icon', {
                        props: {
                            type: op.type
                        },
                    }),
                    ' ',
                    op.title
                ]),
            )
        }
    }
    return h('div',[
    h('Dropdown',{
      props:{
        placement:'bottom-start',
        trigger:'click',
        transfer: this.modal$?false:true
      }  
        },[
            h('Button',{
                props:{
                    type:'primary',
                    size:'small'
                }
            },[
                '操作',
                ' ',
                h('Icon',{
                  props:{
                    type:'arrow-down-b'
                  }  
                })
            ]),
            h('Dropdown-menu',{
                slot:'list'
            },op_items)
        ])
    ])
}

const common_header_render = {
    sex(h,params){
        const map = {0:'-',1:'男',2:'女'}
        return h('span',map[params.row.sex])
    },
    lid(h,params){
        return h('span',this.$filter('lesson_name')(params.row.lid))
    },
    bid(h,params){
       return h('span',this.$filter('branch_name')(params.row.bid))
    },
    bids(h,params){
        let bids = params.row.bids
        let text = '未设置校区'
        let t    = []
        let filter = this.$filter('branch_name')
        if(bids[0] != ''){
            if(bids.length <4){
               
                bids.forEach(bid=>{
                    t.push(filter(bid))
                })
                text = t.join(',')
            }else{
                for(let i=0;i<3;i++){
                    t.push(filter(bids[i]))
                }
                text = util.sprintf("%s等%s个校区",t.join(','),bids.length)
            }
        }
        if(
            (params.row.user&&params.row.user.is_admin === 1)
            || params.row.is_public == 1 
            ) {
            text = '所有校区'
        }
        return h('div', text)
    },
    rids(h,params){
        let g_rids = this.$store.state.gvars.roles.map(_=>_.rid)
        let rids = params.row.rids.filter(r => g_rids.indexOf(r) > -1)
        let text = '未设置角色'
        let t = []
        let filter = this.$filter('role_name')
        if(rids[0] != ''){
            if(rids.length < 4){
                rids.forEach(rid=>{
                    t.push(filter(rid))
                })
                text = t.join(',')
            }else{
                for(let i=0;i<3;i++){
                    t.push(filter(rids[i]))
                }
                text = util.sprintf("%s等%s个角色",t.join(','),rids.length)
            }
        }
        if(params.row.user&&params.row.user.is_admin === 1) {
            text = '超级管理员'
        }
        return h('div',text)
    },
    teach_eid(h,params){
        return h('span',this.$filter('ename')(params.row.teach_eid,'-'))
    },
    second_eid(h,params){
        return h('span',this.$filter('ename')(params.row.second_eid,'-'))        
    },
    eids (h,params) {
        let result = '-'
        if(params.row.eids.length > 0){
            result = []
            params.row.eids.forEach(e=>{
                result.push(h('p',this.$filter('ename')(e,'-')))
            })
        }
        return h('div', result)
    },
    second_eids (h,params) {
        let result = '-'
        if(params.row.second_eids.length > 0){
        	result = []
        	params.row.second_eids.forEach(e=>{
        		result.push(h('p',this.$filter('ename')(e,'-')))
        	})
        }
        return h('div', result)
    },
    edu_eid(h,params){
        return h('span',this.$filter('employee_name')(params.row.edu_eid,'-'))                             
    },
    cr_id(h,params){
        return h('span',this.$filter('classroom_name')(params.row.cr_id,'-'))
    },
    sj_id(h,params){
        return h('span',this.$filter('subject_name')(params.row.sj_id))
    },
    sj_ids(h,params){
        return h('span',this.$filter('sj_ids_text')(params.row.sj_ids))
    },
    pj_id(h,params){
        return h('span',this.$filter('pj_name')(params.row.pj_id))
    },
    pj_ids(h,params){
        let pj_ids = params.row.pj_ids
        let text = '未归属项目'
        let t    = []
        let filter = this.$filter('pj_name')
        if(pj_ids[0] != ''){
            if(pj_ids.length <4){
               
                pj_ids.forEach(pj_id=>{
                    t.push(filter(pj_id))
                })
                text = t.join(',')
            }else{
                for(let i=0;i<3;i++){
                    t.push(filter(pj_ids[i]))
                }
                text = util.sprintf("%s等%s个项目",t.join(','),pj_ids.length)
            }
        }
        if(
            (params.row.user&&params.row.user.is_admin === 1)
            ) {
            text = '所有项目'
        }
        return h('div', text)
    },
    fit_grade(h,params){

        let text = this.labelDicts(params.row.fit_grade[0],'grade') 
        if(params.row.fit_grade[1] != params.row.fit_grade[0]){
            text += '~' + this.labelDicts(params.row.fit_grade[1],'grade')
        }
        return h('span',text)
    },
    grade(h,params){
        let text = this.labelDicts(params.row.grade,'grade')
        return h('span',text)
    },
    departments(h,params){
        let list = params.row.departments
        let text = '未设置部门'
        let t = []
        let f1 = this.$filter('dpt_name')
        let f2 = this.$filter('dict_title')
        let format1 = '%s(%s)'
        let format2 = '%s(%s, 负责人)'
       
        function format(item) {
            let format = item.is_charge ? format2 : format1
            return util.sprintf(format,
                    f1(item.dpt_id),
                    f2(item.jobtitle_did,'jobtitle'),
                )
        }
        if(list.length > 0){
            if(list.length < 4){
                list.forEach(item=>{
                    t.push(format(item))
                })
                text = t.join(',')
            }else{
                for(let i=0;i<3;i++){
                     t.push(format(list[i]))
                }
                text = util.sprintf("%s等%s个职位",t.join(','),list.length)
            } 
        }
        return h('div',text)
    },
    season(h,params){
        return h('span',this.$filter('season_name')(params.row.season))
    },
    time_section(h,params){
        let week_day='?',start='?',end='?'
        if(params.row.int_day>0) {
            week_day = this.$filter('int_week')(params.row.int_day)
        }
        if(params.row.int_start_hour>0) {
            start = this.$filter('int_hour')(params.row.int_start_hour)
        }
        if(params.row.int_end_hour>0) {
            end = this.$filter('int_hour')(params.row.int_end_hour)
        }
        return h('span',util.sprintf('周%s %s~%s',week_day,start,end))
    },
    int_day(h,params){
        let int_day = '-'
        if(params.row.int_day > 0) {
            int_day = this.$filter('int_date')(params.row.int_day)
        }
        return h('span',int_day)
    },
    teacher_level(h,params){
        if(params.row.teacher_level == -1){
            return '-'
        }
        let txt = params.row.teacher_level
        try{
            txt = this.$store.state.gvars.configs.params.teacher_level.level[params.row.teacher_level].name
        }catch(e){
            txt = params.row.teacher_level
        }
        return h('span',txt)
    },
    teach_object(h,params){
        let row = params.row
        if(row.lesson_type == 0){        	
        	if(row.is_trial == 1||row.is_makeup==1){
			let name = '试'
			if(row.is_makeup ==1){
				name='补'
			}
        		return h('div',[
	                h('Tag',{
	                    props:{
	                        color:'blue'
	                    }
	                },name),
	                h('Tag',row.name||'')
	            ])
        	}else{
        		return h('div',[
	                h('Tag',{
	                    props:{
	                        color:'blue'
	                    }
	                },'班'),
	                h('Tag',row.one_class!=null?row.one_class.class_name:'')
	            ])
        	}        	
            
        }else{
            let tag,
                students = []
            if(row.is_trial){
                tag = h('Tag',{
                    props:{
                        color:'yellow'
                    }
                },'试:'+row.name)
            }else{
                if(row.lesson_type == 1){
                    tag = h('Tag',{
                        props:{
                            color:'green'
                        }
                    },'一')
                }else if(row.lesson_type == 2){
                    tag = h('Tag',{
                        props:{
                            color:'green'
                        }
                    },'多')
                }
            }

            row.students.forEach(s=>{
                students.push(h('Tag',s.student.student_name))
            })

            return h('div',[
                    tag,
                    h('span',students)
            ])

        }
    }
}


export {common_header_render}

export default {
    components:{
        FilterColumn,
        PerScope
    },
	data(){
        return {
            imgView: false,
            bigImage: '',
            loading:false,
            rest_api:'',
            searchExpand:false,
            showEmptyColumn: false,
            params:{
                search_field:'name',
                search_value:'',
                order_field:'',
                order_sort:'',
                last_search_value:'',
                bid: ''
            },


            data: [
            ],
            modal:{
                title:'',
                action:'add',
                show:false
            },
            total:0,
            pageIndex:1,
            pageSize:10,
            init_page_size:0,
            bigPageSizeOption:[10,20,30,40,60,80,100,200,300,500,1000],
            showCheckbox:false,
            showIndex:true,
            column_keys:{},
            column_render:{},
            operation_keys:{},
            operation_func:{},
            column_operation_text:'操作',
            fixed: true,
            sexOptions: [
                {value:-1, label:'不限'},
                {value:1, label:'男'},
                {value:2, label:'女'},
                {value:0, label:'未设置'}
            ],
            autoRefresh: true
        }
    },
    methods: {
        sortChange(e){
            this.params.order_field = e.key
            this.params.order_sort = e.order
            this.init_data()
        },
		pagenation(page){
            this.pageIndex = page            
            this.init_data()           
        },
        pagesize(pagesize){
            this.pageSize = pagesize
            this.init_data()
        },
        toggleSearch(){
            this.searchExpand = !this.searchExpand
        },
        search(){
//          if(/^\s*$/.test(this.params.search_value) && this.params.last_search_value == ''){
//              this.focus('searchkey')
//              return
//          }
            this.pagenation(1)
//          this.init_data()
        },
        resetSearch(){
            this.params.search_value = ''
            this.init_data()
        },
        init_data(){
            if(this.loading){
                return false
            }        	
        	if(this.rest_api == ''){
//      		this.$Message.error('未定义rest_api!');
        		return
        	}
            let get_param = {}
            get_param.page = this.pageIndex
            get_param.pagesize = this.pageSize
            if(this.params.search_value != ''){
                get_param.search_field = this.params.search_field
                get_param.search_value = this.params.search_value
                this.params.last_search_value = this.params.search_value
            }else{
                this.params.last_search_value = ''
            }
            if(this.params.order_field != ''){
                get_param.order_field = this.params.order_field
                get_param.order_sort  = this.params.order_sort
            }
            
            this.hook_get_param(get_param)
            for(let o in get_param){
                if(get_param[o] === null){
                    delete get_param[o]
                }
            }
            this.loading = true
            this.$rest(this.rest_api)
            .get(get_param)
            .success(response=>{
                this.params = util.copy(get_param)
                this.data = this.deal_data(response)
                if(typeof response['total'] != 'undefined'){
                    this.total = response.total
                }
                if(typeof response['pagesize'] != 'undefined'){
                    this.pageSize = parseInt(response.pagesize)
                }
                
                this.loading = false
            })
            .error(response=>{
                this.loading = false
                if(response.body.error == 401){
                    this.logoutNotify(response.body.message)
                }else{
                    this.$Message.error(response.body.message||'数据加载失败~')
                }
            })
        },
        hook_get_param(param){

        },
        deal_data(data){	
        	return data.list
        },
        check(){
            return new Promise((resolve,reject)=>{
                this.$refs['form_'+this.datakey].validate(valid => {
                    if(valid) {
                        resolve()
                    } else {
                        reject()
                    }
                })  
            })  
        },
        add(){
            this.modal.action = 'add'
            this.modal.title  = '添加'+this.res_name
            this.modal.show   = true
            this[this.datakey][this.pk] = null
        },
        edit(row){
            this.rest_id   = row[this.pk]
            Object.assign(this[this.datakey],row)
            this.modal.action = 'edit'
            this.modal.title  = '编辑'+this.res_name
            this.modal.show   = true
        },
        save(){
            return new Promise((resolve,reject)=>{
                let method = 'post'
                let uri    = this.rest_api
                let param  = this[this.datakey]
                this.check().then(()=>{
                    let method = this.modal.action == 'add'?'post':'put'
                    let action = this.modal.action == 'add'?'添加':'编辑'
                    let $rest  = this.$rest(uri)
                    if(this.modal.action != 'add'){
                        $rest.add_url_param(this.rest_id)
                    }
                    $rest[method](param)
                    .success(response=>{
                        this.close()
                        this.init_data()
                        resolve(response)
                    })
                    .error(response=>{
                        this.$Message.error(response.body.message)
                        reject(response)
                    })
                })
            })
        },
        close(){
            this.modal.show = false            
        },
        delete(row){        	
            return new Promise((resolve,reject)=>{
                this.$rest(this.rest_api)
                .delete(row[this.pk])
                .success((response,rest)=>{
                    this.init_data()
                    this.$Message.success('删除成功')
                    resolve(response)
                })
                .error((response,rest)=>{
                    this.error(response.body.message)
                    reject(response)
                })
            })
        },
        do(action,row,params){
        	return new Promise((resolve,reject)=>{
                this.$rest(this.rest_api)
                .add_url_param(row[this.pk],'do'+action)
                .post(params)
                .success(response=>{
                    this.init_data()
                    resolve(response)
                })
                .error(response=>{
                    this.$Message.error(response.body.message)
                    reject(response)
                })
        	})
        },
        confirm(text){
            return new Promise((resolve,reject)=>{
                this.$Modal.confirm({
                    content:text||'您确定要进行删除操作吗?',
                    onOk:()=>{
                        resolve()
                    },
                    onCancel:()=>{
                        reject()
                    }
                })
            })
        },
        fixLeft () {
        	if(!this.fixed){
        		return false
        	}
			return this.data.length > 0 ? 'left':false;
		},
		fixRight () {
			return this.data.length > 0 ? 'right':false;
		},
        exportCSV(name,ref){
            this.$refs[ref].exportCsv({
                filename: name
            });
        },
        view_img (src) {
            this.imgView = true
            this.bigImage = src
        },
        getBid() {
          return this.$store.state.branch.id
        },
        toggleBranch(id) {

        },
        setStateSearchDetail(b) {
            this.$store.commit('setSearchDetail',b)
        },
        setStateSearchInfo() {
            let params = util.copy(this.params)
            params.pageSize = this.pageSize
            params.pageIndex = this.pageIndex

            this.$store.commit('setSearchInfo',{
                pk:this.pk,
                search:util.copy(this.search_field),
                params:params
            })
        },
        replaceSearchField() {
            if(this.state_search.pk == this.pk && this.state_search.detail) {
                let fields = util.copy(this.state_search.fields)
                
                let params = util.copy(this.state_search.params)
                let field_keys = Object.keys(fields)

                for(let key in this.search_field) {
                    if(field_keys.indexOf(key) > -1) {
                        this.search_field[key] = fields[key]
                    }
                }
                this.pageIndex = params.pageIndex
                this.pageSize = params.pageSize
                this.params = params
            }
        },
        logoutNotify(message){
            this.$Modal.error({
                title: '登录信息已过期',
                content: '您的登录信息已过期，网络故障或被其他人从别的地方登录!',
                onOk:()=>{
                    this.$store.commit('clearLoginInfo')
                    this.$router.replace('/login')
                }
            })
        }
    },
    computed: {
        state_search() {
            return this.$store.state.search
        },
        toggleSearchIcon(){
            if(this.searchExpand){
                return 'chevron-up'
            }
            return 'chevron-down'
        },
        export_params(){
            let param = {}
            param.page = this.pageIndex
            param.pagesize = this.pageSize
            if(this.params.search_value != ''){
                param[this.params.search_field] = this.params.search_value
            }
            this.hook_get_param(param)
            for(let o in param){
                if(param[o] === null){
                    delete param[o]
                }
            }
            return param
        },
    	columns_head () {
			let columns = []
			if (this.showCheckbox) {
                columns.push({
                    type: 'selection',
                    width: 30,
                    align: 'center',
                    fixed: this.fixLeft()
                })
            }
            if (this.showIndex) {
                columns.push({
                    type: 'index',
                    width: 60,
                    align: 'center',
                    fixed: this.fixLeft()
                })
            }
            return columns
		},
        columns () {
            let columns = [] 
            let operation = {}   
            let renders = this.column_render
            let empty_column = {
            	title: ' ',
            	show: true,
            	disabled: true
            }
            Object.assign(columns,this.columns_head)
            for(let key in this.column_keys){
                let col = this.column_keys[key]
                
                //不需要固定列的列表取消fixed属性
                if(typeof col['width'] == 'undefined'){
                	this.fixed = false
                }
                
                if(typeof col['show'] == 'undefined'){
                    col.show = true
                }
                if(typeof col['disabled'] == 'undefined'){
                    col.disabled = false
                }
                if(col.show){
                  let column = Object.assign({key:key},col)
                  if(renders[key]){
                    column.render = renders[key].bind(this)
                  }else if(common_header_render[key]){
                    column.render = common_header_render[key].bind(this)
                  }
                  columns.push(column)
                }
            }
            //用于大分辨率下，填补表格右侧空白列
            //表格有边框则不添加此列
            if(this.showEmptyColumn){
            	columns.push(empty_column)            	
            }
            if(!_.isEmpty(this.operation_btn)) {
                operation.key = 'operation'
                operation.title = this.column_operation_text
                operation.width = 80
                operation.render = this.operation_btn.operation.bind(this)
                columns.push(operation)
            }
            if(!_.isEmpty(this.operation_keys)){
                operation.key = 'operation'
                operation.fixed =  this.fixLeft()
                operation.title = this.column_operation_text
                operation.width = 80
                operation.render = op_render.bind(this)

                columns.unshift(operation)
            }
            if(!_.isEmpty(this.expand_render)) {
                let expand = {}
                expand.type = 'expand',
                expand.width = 50,
                expand.render = this.expand_render.expand.bind(this)
                columns.unshift(expand)
            } 
            return columns                
        },
		upload_header(){
            return {
                'x-token':this.$store.state.user.token,
                'x-file-key':'file'
            }
        },
        upload_post(){
            return {
                mod:'attachment_file'
            }
        }
    },
    watch:{
        '$store.state.branch.id':{
            handler:function(bid,old_bid){
                if(bid == old_bid || this.rest_api == ''){
                    return
                }
                this.toggleBranch(bid)
                this.init_data()
            },
            // 深度观察
            deep:true
        },
        '$store.state.branch.last_update':{
            handler:function(){
               
                if(this.rest_api == ''){
                  return
                }
                this.init_data()
            },
            // 深度观察
            deep:true
        },
        'search_field': {
            handler:function(){
                if(this.autoRefresh) {
                    if(this.tId) {
                        clearTimeout(this.tId)
                    }
                    this.tId = setTimeout(() => {
                        this.search()
                    },300)
                }
            },
            deep: true
        },
        '$store.state.project.id':{
            handler:function(pj_id,old_pj_id){
                if(pj_id == old_pj_id || this.rest_api == ''){
                    return
                }
                this.init_data()
            },
            // 深度观察
            deep:true
        },
    }
}