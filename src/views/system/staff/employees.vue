<template>
	<div class="c-grid row">
        <div class="col-md-3" style="padding-right:0">
            <div class="box" style="height:99%">
                <div class="row filter-form my-4">
                    <div class="col-md-8" style="padding-right:0">
                        <Input v-model="dpt_name" size="small" placeholder="请输入部门名称" v-focusme="'searchkey'"></Input>
                    </div>
                    <div class="col-md-4">
                        <Button type="primary" icon="ios-search"  @click="search_dpt">查询</Button>
                    </div>
                </div>
                <div class="tree-wrap">
                    <div :class="focus_bg" class="tree-anchor" @click="clickRoot">
                        <Icon type="ios-people"></Icon>
                        {{org_name}}
                    </div>
                    <x-tree
                        v-if="departments.length>0"
                        :data="departments"
                        text-field-name="dpt_name"
                        value-field-name="dpt_id"
                        @item-click="click_dpt">
                    </x-tree>
                </div>
            </div>
        </div>
        <div class="col-md-9">
            <div class="box box-query" v-if="current_dpt_id==0">
                <Form ref="ref_search" :model="search_field" :label-width="70" class="filter-form mt-3 row">
                    <Form-item label="姓名" prop="ename" class="col-md-3 col-sm-6">
                        <Input v-model="search_field.ename" placeholder="请输入员工姓名"></Input>
                    </Form-item>
                    <Form-item label="手机号" prop="mobile" class="col-md-3 col-sm-6">
                        <Input v-model="search_field.mobile" placeholder="请输入手机号"></Input>                    
                    </Form-item>
                    <Form-item label="员工状态" prop="is_on_job" class="col-md-3 col-sm-6">
                        <Select v-model="search_field.is_on_job">
                            <Option value="-1">不限</Option>
                            <Option value="1">在职</Option>
                            <Option value="0">离职</Option>
                       </Select>
                    </Form-item>  
                    <Form-item label="微信绑定" prop="is_weixin_bind" class="col-md-3 col-sm-6">
                        <Select v-model="search_field.is_weixin_bind">
                            <Option value="-1">不限</Option>
                            <Option value="1">已绑定</Option>
                            <Option value="0">未绑定</Option>
                       </Select>
                    </Form-item>                  
                </Form>
                <Row class="basic">
                    <Col span="6" class="mt-2" style="margin-left:34px;">
                        <Button type="primary" icon="ios-search" @click="search">查询</Button>
                        <Button type="primary" icon="refresh" @click="resetSearch">重置</Button>
                        <export-button res="employees" :params="params" v-per="'employees.add'"></export-button>
                    </Col>
                </Row>
            </div>
            <div class="box box-result">
                <div class="toolbar">
                    <Button type="primary" icon="plus" @click="add" v-per="'employees.add'">添加新员工</Button>
                    <import-button res="employees" name="员工" @on-import-finish="search" v-per="'employees.add'"></import-button>
                    <filter-column :keys="column_keys" v-if="column_keys_ready"></filter-column>
                </div>
                <div class="content">
                    <div class="content-body">
                        <Table 
                        	v-loading.like="'employees'" 
                        	:pageSize="pageSize" 
                        	:page="pageIndex" 
                        	:stripe="true" 
                        	:show-header="true" 
                        	:data="data" 
                        	:columns="columns" 
                        	:no-data-text="$store.state.config.EMPTY_DATA_TEXT" 
                        	:no-filtered-data-text="$store.state.config.EMPTY_FILTER_DATA_TEXT" 
                        	@on-sort-change="sortChange">
                        </Table>
                    </div>
                    <div class="content-footer">
                        <div class="pagenation">
                            <Page 
                            	:total="total" 
                            	:show-total="true" 
                            	:current="pageIndex" 
                            	:show-sizer="true" 
                            	:page-size="pageSize"
                            	@on-change="pagenation" 
                            	@on-page-size-change="pagesize">
                            </Page>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <employee-info-modal 
        @save="init_data" 
        ref="infoModal">
        </employee-info-modal>
        <employee-account-modal 
        :employee="current_employee"
        @save="init_data" 
        ref="accountModal">
        </employee-account-modal>
	</div>
</template>
<script>
    import util from '@/libs/util'
    import directive from '@/libs/directive.mixin'
    import grid from '@/libs/grid.mixin'
    import globals from '@/libs/globals.mixin'
    import common from '@/libs/common.mixin'
	import ImportButton from 'c%/ImportButton.vue'
	import SelectBranch from 'c%/SelectBranch.vue'
	import ExportButton from 'c%/ExportButton.vue'
	import employeeInfoModal from './employee/info-modal.vue'
    import employeeAccountModal from './employee/account-modal.vue'
    import LeaveModal from './employee/leave-modal.vue'
    import XTree from 'c%/Xtree.vue'
    export default {
        mixins:[directive,common,grid,globals],
        components: {
        	ImportButton,
        	SelectBranch,
            employeeInfoModal,
            employeeAccountModal,
            LeaveModal,
            XTree,
            ExportButton
        },
        data () {
            return {
            	rest_api: 'employees',
            	pk: 'eid',
            	rest_name: '员工',
            	datakey: 'new_object',
                btnloading: false,  
                modal_add_account:false,
                current_employee:{
                    eid:0,
                    uid:0
                },
                dpt_name: '',
                departments: [],
                search_field: {
                    ename: '',
                    mobile: '',
                    is_on_job: '1',
                    is_weixin_bind:"-1"
                },
                focus_bg: '',
                current_dpt_id: 0,
                column_keys_ready:false,
                column_keys: {
                    ename: {
                        title: '姓名',
                        sortable: 'custom',
                        show: true
                    },
                    rids: {
                        title: '角色',
                        sortable: 'custom',
                        show: true
                    },
                    bids: {
                        title: '校区',
                        sortable: 'custom',
                        show: true
                    },
                    pj_ids:{
                        title: '项目',
                        show: false
                    },
                    departments:{
                        title:'部门职位',
                        show:true
                    },
                    mobile: {
                        title: '手机',
                        sortable: 'custom',
                        show: true
                    },
                    email: {
                        title: 'Email',
                        sortable: 'custom',
                        show: false
                    },
                    uid: {
                        title: '账号',
                        sortable: 'custom',
                        show: true
                    },
                    user_status: {
                        title: '账号状态',
                        sortable: 'custom',
                        show: true
                    },
                    user_name: {
                        title: '账号名',
                        show: true
                    },
                    wx_bind: {
                        title: '微信绑定',
                        show: false
                    }
                },
                operation_keys: {
                    open_account: {
                        title: '开启账号',
                        type: 'person-add',
                        per: 'account.add',
                        condition:'row.uid == 0'
                    },
                    edit_account: {
                        title: '修改账号',
                        type: 'ios-refresh',
                        per: 'account.reset',
                        condition: 'row.uid != 0 && (row.user&&row.user.is_admin==0)'
                    },
                    active_account:{
                        title:'启用账号',
                        type:'android-done',
                        per:'account.add',
                        condition:'row.uid != 0 && row.user_status == 0'
                    },
                    disable_account:{
                        title:'禁用账号',
                        type:'minus-circled',
                        per:'account.lock',
                        condition:'row.uid != 0 && row.user_status != 0&&((row.user&&row.user.is_admin==0)||row.uid==0)'
                    },
                    open_fsys:{
                        title:'开启加盟商管理',
                        type:'android-done',
                        per:'account.add',
                        condition: (this.$store.state.client.is_org_open == 1) + '&&row.is_fsys == 0'
                    },
                    pers_extra:{
                        title: '额外权限',
                        type: 'wrench',
                        per: 'employees.extraper',
                        condition: 'row.user && row.user.is_admin == 0'
                    },
                    edit:{
                        title:'编辑',
                        type:'edit',
                        per:'employees.edit',
                        //condition: 'row.uid==0' (row.user&&row.user.is_admin==0)||
                    },
                    leave: {
                        title: '离职',
                        type: 'arrow-return-left',
                        per: 'employees.leave',
                        condition: 'row.is_on_job == 1&&((row.user&&row.user.is_admin==0)||row.uid==0)'
                    },
                    handover: {
                        title: '交接',
                        type: 'arrow-return-left',
                        per: 'employees.leave',
                        condition: '((row.user&&row.user.is_admin==0)||row.uid==0)'
                    },
                    restore: {
                        title: '返聘',
                        type: 'arrow-return-right',
                        per: 'employees.restore',
                        condition: 'row.is_on_job == 0&&((row.user&&row.user.is_admin==0)||row.uid==0)'
                    },
                    delete: {
                        title: '删除',
                        type: 'ios-trash',
                        per: 'employees.delete',
                        condition: '(row.user&&row.user.is_admin==0)||row.uid==0'
                    },
                    mobile: {
                        title: '登录手机端',
                        per:'employee.mlogin',
                        type: 'ipad',
                        condition:'row.user && row.uid != 0'
                    }
                },
                operation_func:{
                    open_account(params){
                        this.current_employee = util.copy(params.row)
                        this.$r('accountModal')
                        .show(util.sprintf('开启账号:%s',params.row.ename),'add')
                    },
                    open_fsys(params){
                        this.confirm(`确认给员工【${params.row.ename}】开通加盟商管理`)
                        .then(()=>{
                            this.openFsysAction(params)
                        })
                        
                    },
                    edit_account(params) {
                        this.current_employee = util.copy(params.row)
                        let param = {
                            account: params.row.user.account,
                            password: ''
                        }
                        this.$r('accountModal')
                        .set('info',param)
                        .show(util.sprintf('修改账号:%s',params.row.ename),'edit')
                    },
                    active_account(params){
                        this.do('active',params.row).then(response=>{
                            this.$Message.success('启用账号成功!')
                        })
                    },
                    disable_account(params){
                        this.do('disable',params.row).then(response=>{
                            this.$Message.success('禁用账号成功!')
                        })
                    },
                    pers_extra(params){
                        this.$Modal.open('system/staff/roles/select-pers-modal.vue',{
                            on: {
                                'save-pers': ({per_list,disable_per_list}) => {
                                    this.$rest('users')
                                    .add_url_param(params.row.uid)
                                    .put({
                                        pers: per_list,
                                        disable_pers:disable_per_list
                                    })
                                    .success(res => {
                                        this.$Message.success('操作成功')
                                        this.init_data()
                                    })
                                    .error(res => {
                                        this.error(res.body.message)
                                    })
                                }
                            }
                        })
                        .then(modal => {
                            modal.vuec
                            .setPers(params.row.user.pers,params.row.user.disable_pers)
                            .show(util.sprintf('额外权限[%s]',params.row.ename), 'pc_per')
                        })
                    },
                    edit(params){
                        this.edit(params)                        
                    },
                    leave(params) {
                        this.$Modal.open('system/staff/employee/leave-modal.vue@modal',{
                            on: {
                                save: (data) => {
                                    this.init_data();
                                    this.$Modal.confirm({
                                        content: `离职成功，是否对【${data.name}】进行工作交接`,
                                        onOk: () => {
                                            this.openHandoverModal(params)
                                        }
                                    })
                                }
                            }
                        })
                        .then(modal => {
                            modal
                            .set('info',params.row)
                            .show(util.sprintf('离职:%s',params.row.ename))
                        })
                    },
                    handover(params) {
                        this.openHandoverModal(params);
                    },
                    restore(params) {
                        this.confirm(util.sprintf('您确定【%s】恢复入职吗?',params.row.ename))
                        .then(()=>{
                            this.$rest('employees/do_hire')
                            .post({eid:params.row.eid})
                            .success((response)=>{
                                this.$Message.success('恢复入职成功!')
                                this.init_data()
                                this.$store.dispatch('updateGlobalVar','employees')
                            })
                            .error(response => {
                                this.$Meaaage.error(response.body.message)
                            })
                        }) 
                    },
                    delete(params){
                        this.confirm(util.sprintf('您确定要删除员工【%s】吗?',params.row.ename))
                        .then(()=>{
                            this.$rest('employees')
                            .delete(params.row.eid)
                            .success(res => {
                                this.$Message.success('删除成功')
                                this.init_data()
                                this.$store.dispatch('updateGlobalVar','employees')
                            })
                            .error(res => {
                                this.error(res.body.message)
                            })
                        })       
                    },
                    mobile (params) {
                        this.openMobile(params);
                    },
                },
                column_render: {
                    ename(h, params) {
                        let map = {0:{icon:'',text:''},1:{icon:'male',text:'男'},2:{icon:'female',text:'女'}},
                        	row = params.row,
                        	is_admin = false,
                            spans = []
                        
                        if(row.user&&row.user.is_admin==1){
                        	is_admin = true
                        }

                        spans.push(h('Icon',{
                            props: {
                                type:map[row.sex].icon
                            }
                        }))
                        spans.push(' '+row.ename)

                        if(row.is_on_job == 0){
                            spans.push(h('Tag',{
                                props: {
                                    color: 'red'
                                }
                            },'离'))
                        }

                        return h('div',{                        	
                            attrs:{
                                class: is_admin?'':'x-a-link text-info cursor',
                                title: is_admin?'超级管理员只能编辑':row.ename
                            },
                            on:{
                                click:()=>{
                                	this.eInfo(params)
                                }
                            }
                        },spans)
                    },
                    uid(h, params) {
                        let [type,color,label] = ['','',''];
                        [type,color,label] = (params.row.uid === 0 ? ['close-circled', '#999999','未开启'] : ['checkmark-circled','#006600','已开启'])
                    
                        return h('div',[
                            h('Icon',{
                                props:{
                                    type: type,
                                    color: color
                                }
                            }),
                            h('span',label)
                        ])  
                    },
                    user_status(h, params) {
                        let [type,color,label] = ['','',''];
                        [type,color,label] = ( params.row.user_status === 0 ? ['close-circled', '#999999','已禁用'] : ['checkmark-circled','#006600','已启用'])                   
                        
                        return h('div',[
                            h('Icon',{
                                props:{
                                    type: type,
                                    color: color
                                }
                            }),
                            h('span',label)
                        ])
                    },
                    user_name(h,params) {
                        let name = '-'
                        if(params.row.uid>0&&params.row.user) {
                            name = params.row.user.account
                        }
                        return h('span',name)
                    },
                    wx_bind(h,params) {
                        let map = {1:['已绑定','text-success'],0:['未绑定','text-danger']}
                        if(params.row.uid>0&&params.row.user) {
                            return h('span',{
                                class:map[params.row.user.is_weixin_bind][1]
                            },map[params.row.user.is_weixin_bind][0])
                        }
                        return h('span','-')
                    }
                }
            }
        },
        methods:{
             openFsysAction(params) {
                this.$http.post(`employees/${params.row.eid}/dofranchisee`)
                .then(res => {
                    this.$Message.success('开通成功');
                    this.init_data();
                },res => {
                    this.error(res.body.message)
                })
            },
            openHandoverModal(params) {
                this.$Modal.open('system/staff/employee/handover-modal.vue@modal',{
                    props: {
                        eid: params.row.eid,
                        itemInfo: params.row
                    },
                    on: {
                        update: () => {
                            this.init_data();
                        }
                    }
                })
                .then(modal => {
                    modal.show(`离职工作交接【${params.row.ename}】`)
                })
            },
            initOptionFieldsColumn(){
                let employee_option_fields = this.$store.state.gvars.configs.employee_option_fields
                employee_option_fields.forEach(f=>{
                    if(f.enable == 1){
                        this.$set(this.column_keys,f.name,{title:f.label,show:false})
                    }
                })
                this.column_keys_ready = true
            },
            deal_data(data){
                let employee_option_fields = this.$store.state.gvars.configs.employee_option_fields
                let fields = []
                employee_option_fields.forEach(f=>{
                    if(f.enable == 1){
                        fields.push(f.name)
                    }
                })
                function get_option_fields_default_value(obj,f){
                    if(obj && obj[f]){
                        return obj[f]
                    }
                    return ''
                }
                data.list.forEach(item=>{
                    fields.forEach(f=>{
                        item[f] = get_option_fields_default_value(item.option_fields,f)
                    })
                })
                return data.list
            },
        	//选择出生日期
        	datapicker_change (value) {
        		this.new_object.employee.birth_time = value
        	},
        	//开启账号
        	doaction (action) {
        		return new Promise((resolve,reject)=>{
        			let [method,msg,uri] = (action === 'add' ? ['post','添加成功','employees'] : ['put','编辑成功','employees/' + this.new_object.employee.eid])
	        		let param = this.new_object	        		
	        		this.btnloading = true
	        		this.$http[method](uri,param)
                    .then(response=>{   
                        this.btnloading = false                     
                        this.init_data()
                        resolve(response)
                        this.reset_modal()
                        this.$Message.success(msg)  
                    },response=>{
                        this.btnloading = false
                        this.error(response.body.message)
                        reject(response)
                    })
        		})
        		
        	},
        	//添加
            add () {
            	this.$r('infoModal').show('添加新员工')
            },
            eInfo(params) {
                this.$router.push('/system/staff/employee/'+params.row.eid)
            },
            edit(params) {
                let row = util.copy(params.row),
                    join = row.join_int_day,
                    official = row.official_int_day
                if(join!==0) {
                    row.join_int_day = this.$filter('int_date')(join)
                }
                if(official!==0) {
                    row.official_int_day = this.$filter('int_date')(official)
                }
                this.$r('infoModal')
                .set('info',{employee:row})
                .show(util.sprintf('编辑员工:%s',params.row.ename),'edit')
            },
            hook_get_param (params) {
                let search_obj = util.copy(this.search_field)
                for(let o in search_obj) {
                    let property = search_obj[o]
                    if(property&&property!=-1){
                        params[o] = property
                    }
                }
            },
            resetSearch () {
                this.$r('ref_search').resetFields()
                this.init_data()
            },      
           	search_dpt() {
                if(/^\s*$/.test(this.dpt_name)) {
                    this.$Message.error('请输入部门名称')
                    this.focus('searchkey')
                    return false
                }
                let dpts = this.$store.state.gvars.departments
                let selected_dpts = []
                dpts.forEach(item => {
                    if(item.dpt_name.indexOf(this.dpt_name) > -1) {
                        selected_dpts.push(item.dpt_id)
                    }
                })
                
                if(selected_dpts.length == 0) {
                    this.$Message.error('未找到相关部门')
                    return false
                }else{
                    let tree = []
                    this.departments.forEach(item => {
                        tree.push(item._data)
                    })
                    this.departments.splice(0,this.departments.length)
                    this.buildItem(tree,selected_dpts)
                    this.$nextTick(()=>{
                        this.$set(this,'departments',tree)
                    })
                }
            },
            buildItem(tree,ids) {
                tree.forEach(item => {
                    if(ids.indexOf(item.id) > -1) {
                        item.color = 'tree-color'
                    }else{
                        item.color = ''
                    }
                    item.opened = true
                    if(item.children&&item.children.length>0) {
                        item.children.forEach(subitem => {
                            if(ids.indexOf(subitem.id) > -1) {
                                subitem.color = 'tree-color'
                            }else{
                                subitem.color = ''
                            }
                        })
                    }
                    if(item.children&&item.children.length>0) {
                        this.buildItem(item.children,ids)
                    }
                })
            },
            click_dpt(node,item) {
                
                this.focus_bg = this.is_admin ? '' : 'not-allow'
                this.pageIndex = 1
                if(item._data.dpt_type == 0){
                    this.current_dpt_id = item.value
                    this.rest_api = 'departments/'+item.value+'/employees'    
                }else{
                    let bid = item._data.bid
                    this.current_dpt_id = 0
                    if(bid > 0) {
                        this.rest_api = 'employees?bid=' + bid
                    }else{
                        this.rest_api = 'employees?com_id='+item.value
                    }
                }
                this.init_data()
            },
            getDeptTree() {
                let depts = []
                let departments = this.$store.state.gvars.departments
                let dpt_maps = {}
                departments.forEach(item=>{
                    dpt_maps[item.dpt_id] = util.copy(item)
                })
                function get_com_id(dpt){
                    let com_id = 0
                    let _dpt = dpt
                    if(_dpt.dpt_type == 2){
                        return _dpt.dpt_id
                    }
                    while(_dpt.pid > 0){
                        if(_dpt.dpt_type == 2){
                            com_id = _dpt.dpt_id
                            break
                        }
                        _dpt = dpt_maps[_dpt.pid]
                        if(_dpt.dpt_type == 2){
                            com_id = _dpt.dpt_id
                            break
                        }
                    }
                    return com_id
                }
                let my_com_ids = []
                if(this.enable_company){
                    my_com_ids = this.$store.state.user.info.employee.com_ids
                }

                departments.forEach(item=>{
                    if(this.enable_company){
                        if(my_com_ids.length > 0){
                            let com_id = get_com_id(item)
                            if(my_com_ids.indexOf(com_id) === -1 && com_id > 0){
                                return
                            }
                        }
                    }
                    if(item.dpt_type == 1 && this.bids_user.indexOf(item.bid) === -1 && !this.is_admin){
                        return
                    }
                    let dept = util.copy(item)
                    delete dept['children']
                    dept.id  = item.dpt_id
                    if(dept.dpt_type == 1){
                        dept.icon = 'ivu-icon ivu-icon-ios-home'
                    }else if(dept.dpt_type == 2){
                        dept.icon = 'ivu-icon ivu-icon-location'
                    }else{
                        dept.icon = 'ivu-icon ivu-icon-network'
                    }
                    depts.push(dept)
                })
                let tree = util.list_to_tree(depts,'dpt_id','pid')
                return tree
            },
            clearSty(list) {
                list.forEach(item => {
                    item.selected = false
                    if(item.children&&item.children.length>0) {
                        this.clearSty(item.children)
                    }
                })
            },
            clickRoot() {
                if(this.is_admin) {
                    this.focus_bg = 'focus'
                    this.rest_api = 'employees'
                    this.current_dpt_id = 0
                    this.clearSty(this.departments)
                    this.init_data()
                }
            },
            do(action,row,params){
                return new Promise((resolve,reject)=>{
                    this.$rest('employees')
                    .add_url_param(row[this.pk],'do'+action)
                    .post(params)
                    .success(response=>{
                        this.init_data()
                        resolve(response)
                    })
                    .error(response=>{
                        this.error(response.body.message)
                        reject(response)
                    })
                })
            },
            openMobile(params) {
                this.$rest('employees')
                .add_url_param(params.row.eid,'domktoken')
                .post()
                .success(response=>{
                    this.$Modal.open('service/sm/browser-modal.vue')
                    .then(modal=>{
                        modal
                        .set('url',response.data.url)
                        .show(params.row.ename +'的教育助手')
                    })
                })
                .error(response=>{
                    this.$Notice.error({
                        title: '失败',
                        desc: response.body.message||'登录失败'
                    })
                })
            },
        },
        mounted(){
            this.departments = this.getDeptTree()
            this.initOptionFieldsColumn()
            this.initDisableFieldCloumns('employee')
            if(this.is_admin) {
                this.clickRoot()
            }else{
                this.focus = 'not-allow'
                if(this.departments.length > 0) {
                    this.departments[0].selected = true
                    this.click_dpt({},{
                        value: this.departments[0].dpt_id,
                        _data: {
                            bid: this.departments[0].bid
                        }
                    })
                }
            }
        }
    }
</script>
<style lang="less">
    .tree-wrap {
        > .tree-anchor:hover {
            background: #eee;
        }
        span {
            font-size: 12px !important;
        }
        .focus {
            background: #e1e1e1;
        }
        .not-allow {
            color: #bbbec4;
            background-color: #f7f7f7;
            border-color: #dddee1;
            cursor: not-allowed;
            &:hover{
                background-color: #f7f7f7; 
            }
        }
    }
</style>