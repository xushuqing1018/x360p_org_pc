<style scoped>
.time-section {
    padding: 5px 0px;
    margin-bottom: 5px;
    border-bottom: 1px dashed #ccc;
}
</style>


<template>
    <Modal v-drag-modal v-model="modal$.show" :mask-closable="true" :width="width" :title="title" @on-cancel="closeModal">
    	<div :class="classes">
    		<div class="list-main">
                <div class="row">
                    <div class="col-sm-4">
                        <div class="tree-wrap">
                            <RadioGroup v-model="type" type="button" size="small" class="mb-2 d-block" @on-change="changeGroup">
                                <Radio :label="1">部门</Radio>
                                <Radio :label="2" v-if="rid==0">权限组</Radio>
                                <Radio :label="3">科目</Radio>
                                <Radio :label="4" v-if="rid==1">时段</Radio>
                            </RadioGroup>
                            <div v-show="type==4" class="time-section">
                                <span>开始时间：{{startDate||defaultStartDate}}</span><br>
                                <span>结束时间：{{endDate||'-'}}</span>
                            </div>
                            <div :class="focus_bg" v-if="type!=4" class="tree-anchor" @click="clickRoot">
                                <Icon type="ios-people"></Icon>
                                {{org_name}}
                            </div>
                            <div :class="focus_bg" v-else class="tree-anchor" @click="clickRoot">
                                <Icon type="calendar"></Icon>
                                所有时段
                            </div>
                            <x-tree
                                v-show="departments.length>0&&type==1"
                                :data="departments"
                                text-field-name="dpt_name"
                                value-field-name="dpt_id"
                                @item-click="click_dpt">
                            </x-tree>
                            <x-tree
                                v-show="authRoles.length>0&&type==2&&rid==0"
                                :data="authRoles"
                                text-field-name="role_name"
                                value-field-name="rid"
                                @item-click="click_dpt"
                                >
                            </x-tree>
                            <x-tree
                                v-show="subjects.length>0&&type==3"
                                :data="subjects"
                                text-field-name="subject_name"
                                value-field-name="sj_id"
                                @item-click="click_dpt"
                                >
                            </x-tree>
                            <x-tree
                                v-show="timeSections.length>0&&type==4"
                                ref="ts"
                                :data="timeSections"
                                text-field-name="ts_name"
                                value-field-name="tsid"
                                @item-click="click_dpt"
                                >
                            </x-tree>
                        </div>
                    </div>
                    <div class="col-sm-8">
                        <div class="list-condition">                	
                			<Input 
                				v-model="params.search_value" 
                				placeholder="员工名称" 
                				size="small" 
                				style="width:200px;"
                				class="d-inline-block"
                				v-focusme="'searchkey'"
                				@keyup.native.enter="search">
                			</Input>
                			<ButtonGroup>
                				<Button type="primary" icon="ios-search" @click="search" size="small">查询</Button>
                			</ButtonGroup>
                            <Button type="primary" icon="refresh" @click="resetSearch" size="small">重置</Button>                		
                        </div>
                        <div class="list-body">
                            <div class="list-body-wrap" v-loading.like="'employee'">
                                
                                <table class="table-list">
                                    <thead>
                                        <tr>
                                            <th width="30" v-if="multiple">
                                            	<div class="ivu-table-cell">
                                                	<Checkbox v-model="checkAll" @click.native="handleCheckAll"></Checkbox>
                                                </div>
                                            </th>
                                            <th><div class="ivu-table-cell">姓名</div></th>
                                            <th><div class="ivu-table-cell">电话</div></th>
                                            <th><div class="ivu-table-cell">归属校区</div></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr 
                                        :class="{'table-info':item.$selected}" 
                                        @click="toggleSelected(item)" 
                                        v-for="item in filter_data">
                                            <td v-if="multiple">
                                                <div class="ivu-table-cell"><Checkbox v-model="item.$selected"></Checkbox></div>
                                            </td>
                                            <td>
                                                <div class="ivu-table-cell">
                                                    <avatar-and-name :src="item.photo_url" :name="item.ename" :sex="item.sex"></avatar-and-name>
                                                </div>
                                            </td>
                                            <td>
                                                <div class="ivu-table-cell">
                                                    <Icon type="ios-telephone"></Icon>{{item.mobile}}
                                                </div>
                                            </td>
                                            <td>
                                                <div class="ivu-table-cell">
                                                    {{item.bid|branch_name('-')}}
                                                </div>
                                            </td>
                                        </tr>
                                        <tr v-if="data.length == 0">
                                            <td colspan="4" style="text-align: center"><p class="empty">没有合适的员工</p></td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>

                            <div class="list-page clearfix">
                                <Page class="pull-right" size="small" :total="total" :show-total="true" :current="pageIndex" :show-sizer="true" :page-size="pageSize" @on-change="pagenation" @on-page-size-change="pagesize"></Page>
                            </div>
                            
                        </div>
                    </div>
                </div>
            </div>
            <div class="multi-selected" v-if="this.multiple">
                <Card>
                    <div slot="title">
                        <span>已选择：<span class="badge">{{selectedTotal}}</span></span>
                        <Button @click="clearSelectedId" class="pull-right" type="ghost" shape="circle" size="small" icon="trash-a" title="清空"></Button>
                    </div>
                    <ul class="multi-selected-list">
                        <li v-for="item in selectedList">
                            <span>{{item.ename}}</span>
                            <Button @click="cancelSelectedId(item)" class="pull-right" type="ghost" shape="circle" size="small" icon="trash-a" title="移除"></Button>
                        </li>
                    </ul>
                </Card>
            </div>
    	</div>
        <div slot="footer">
            <div class="footer-selected pull-left" v-if="!multiple">
            	<span>已选择：</span>
            	<Input :value="labelText" class="x-ivu-input" readonly style="width:120px"></Input>
            </div>
            <div class="footer-selected  ml-3 pull-left" v-if="did>0">
	            <span>销售角色：</span>
	            <Select v-model="sale_role_did" class="x-ivu-select" style="width:120px" placement="top">
	            	<Option :value="item.did" v-for="(item,index) in roles" :key="index">{{item.title}}</Option>
	            </Select>
            </div>
            <Button type="default" @click="cancel">取消</Button>
            <Button type="primary" @click="ok">确定</Button>
        </div>
    </Modal>
</template>
<script>
import common from '@/libs/common.mixin'
import globals from '@/libs/globals.mixin'
import modal from '@/libs/modal.mixin'
import globalselect from '@/libs/globalselect.mixin'
import directive from '@/libs/directive.mixin'
import util from '@/libs/util'
import {_} from '@/libs/util'
import moment,{ months } from 'moment'
import XTree from 'c%/Xtree.vue'
import AvatarAndName from 'c%/AvatarAndName.vue'

const prefixCls = 'select-list';
const resName   = 'employee'
const idField   = 'eid'
const textField = 'ename'
const gvarName  = 'employees'
const filterDate = {
    bid:0,
    dpt_id:0,
    rid:0,
    sj:{
        id:0,
        assign:true
    },
    eids: {
        open: false,
        list: []
    }
    // ts: {
    //     week_day: 0,
    //     int_start_hour: '',
    //     int_end_hour: ''
    // }
}

export default {
	name:'EmployeeList',
    mixins: [common,modal,globals,globalselect,directive],
    components:{
        XTree,
        AvatarAndName
    },
    props:{
        value: {
            type: Boolean,
            default: false
        },
        mode: {
        	type: String,
        	default: 'employee'
        },
        rid: {
        	type: Number,
        	default: 0
        },
        did: {
        	type: Number,
        	default: 0
        },
        width:{
            type:String,
            default:'640'
        },
        title:{
            type:String,
            default:'选择员工'
        },
        multiple: {
            type: Boolean,
            default: false
        },
        selected:{
            type:[Array,Number,String],
            default:[]
        },
        limitPer: {
            type: Boolean,
            default: true
        },
        startDate: {
        	type: [String,Number],
        	default: moment().format('YYYY-MM-DD')
        },
        endDate: {
        	type: String,
        	default: function() {
                return ''
            }
        },
        intHours: {
            type:Array,
            default(){
                return []
            }
        }
    },
    data() {
        return {
            params:{
                search_field:textField,
                search_value:'',
                order_field:'',
                order_sort:'',
                last_search_value:''
            },
            textField:textField,
            idField:idField,
            gvarName:gvarName,
            focus_bg:'focus',
            sale_role_did: 0,
            departments:[],
            authRoles:[],
            subjects:[],
            timeSections: [],
            type: 1,
            filter:util.copy(filterDate)
        }
    },
    computed:{
        defaultStartDate() {
            return moment().format('YYYY-MM-DD')
        },
        classes () {
            return [
                `${prefixCls}`,
                {
                    [`${prefixCls}-multiple`]: this.multiple,
                    [`${prefixCls}-single`]: !this.multiple
                }
            ];
        },
        roles () {
        	return this.$store.state.gvars.dicts.sale_role
        },
        filter_data () {
        	let data = this.data,
        		filter = (item)=>{
        			if(this.mode=='user'){
        				return item.uid>0
        			}else{
        				return true        				
        			}
        		}
        		
        	return data.filter(filter)
        }
    },
	
    methods: {  
        click_dpt(vnode,item){
            this.focus_bg = ''
            this.clearSelectedId()
            this.filter = util.copy(filterDate)
            if(this.type==1) {
                let bid = item._data.bid,
                    dpt_id = item.id
                if(bid>0) {
                    this.filter.bid = bid
                }
                if(dpt_id) {
                    this.filter.dpt_id = dpt_id
                }
                this.pagenation(1)
            }else if(this.type==2) {
                let rid = item._data.rid
                if(rid>0) {
                    this.filter.rid = rid
                }
                this.pagenation(1)
            }else if(this.type==3) {
                let sj_id = item._data.sj_id
                if(sj_id>0) {
                    this.filter.sj.id = sj_id
                    this.filter.sj.assign = true
                }else{
                    this.filter.sj.id = 0
                    this.filter.sj.assign = false
                }
                this.pagenation(1)
            }else if(this.type==4) {
                let _data = item._data;
                var post = {};
                post.week_day =  _data.week_day;
                post.bid =  this.bid$;
                if(_data.int_start_hour) {
                    post.int_start_hour =  Number(this.$filter('format_int_hour')(_data.int_start_hour))
                }
                if(_data.int_end_hour) {
                    post.int_end_hour =  Number(this.$filter('format_int_hour')(_data.int_end_hour))
                }
                
                this.$http.get('employee_time_sections',{
                    params: post
                })
                .then(res => {
                    var list = res.body.data.list;
                    this.filter.eids.open = true;
                    var startDate = null;
                    if(this.startDate == '') {
                        startDate = moment().format('YYYY-MM-DD');
                    }
                    else {
                        startDate = this.startDate
                    }
                    var filterList = list.filter(item => {
                        var cDate = this.$filter('int_date')(item.int_day);
                        if(this.endDate == '') {
                            if(cDate == startDate) {
                                return true
                            }
                            else{
                                return false
                            }
                        }
                        else {
                            if(moment(cDate).isBetween(startDate,endDate)
                                ||cDate==startDate
                                ||cDate==endDate) {
                                return true
                            }
                            else {
                                return false
                            }
                        }
                    })
                    filterList.forEach(item => {
                        this.filter.eids.list.push(item.eid)
                    })
                    this.pagenation(1)
                },res => {
                    this.$Message.error(res.body.message)
                })
            }
        },
        getDeptTree() {
             let depts = []

            this.$store.state.gvars.departments.forEach(item=>{
                
                if(item.dpt_type == 1 && this.bids_user.indexOf(item.bid) === -1 && !this.is_admin && this.limitPer){
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

            return util.list_to_tree(depts,'dpt_id','pid')
        },
        getAuthRolesTree() {
            let roles = util.copy(this.$store.state.gvars.roles)
            roles.forEach(item=>{
                item.id = item.rid
                item.pid = 0
                item.icon = 'ivu-icon ivu-icon-record'
            })
            return roles
        },
        getSubjectsTree() {
            let subjects = util.copy(this.$store.state.gvars.subjects)
            subjects.push({
                sj_id:0,
                color:'text-danger',
                subject_name:'未指定科目'
            })
            subjects.forEach(item=>{
                item.id = item.sj_id
                item.pid = 0
                item.icon = 'ivu-icon ivu-icon-record'
            })
            return subjects
        },
        getTimeSectionsTree() {
            let timeSections = util.copy(this.$store.state.gvars.time_sections)
            timeSections.forEach(item=>{
                item.id = item.tsid
                item.pid = item.week_day+10000
                item.ts_name = item.int_start_hour+'~'+item.int_end_hour
                item.icon = 'ivu-icon ivu-icon-record'
            })
            var weekMap = ['一','二','三','四','五','六','日'];
            var startDate = moment(this.startDate,'YYYY-MM-DD')
            for (let index = 0; index < 7; index++) {
                timeSections.push({
                    id: index+1+10000,
                    pid: 0,
                    icon:'ivu-icon ivu-icon-clock',
                    ts_name: '周'+weekMap[index],
                    week_day: index+1
                })
            }
            let tree = util.list_to_tree(timeSections)
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
            this.focus_bg = 'focus'
            this.clearSelectedId()
            this.clearSty(this.departments)
            this.clearSty(this.subjects)
            this.clearSty(this.authRoles)
            this.clearSty(this.timeSections)
            this.filter = util.copy(filterDate)
            this.pagenation(1)
        },
        ok(){
            if(!this.selectedTotal){
                this.$Message.error('请'+this.title)
                return
            }
            if(this.did>0&&this.sale_role_did<=0){
            	this.$Message.error('请选择角色')
                return
            }
            if(this.multiple){
                this.$emit('on-select',{selected:this.selectedList})
            }else{
                let row = this.getObjById(this.selIds[0])
                this.$emit('on-select',{selected:row,sale_role_did:this.sale_role_did})
                this.sale_role_did = 0
            }
            this.$emit('input',false)
            this.close()
        },
        cancel(){
            this.$emit('input',false)
            this.close()
        },
        closeModal() {
            this.cancel()
        },
        data_filter(list) {
            let data = []

            // 过滤掉当前账户没有权限的校区中的老师
            list.forEach(l => {
                if(l.bids.length == 0){
                    if(this.rid > 100 && this.rid < 200){
                        data.push(l)
                    }
                }else{
                    for(let i=0,len=l.bids.length;i<len;i++) {
                        if(this.is_admin || !this.limitPer || this.bids_user.indexOf(l.bids[i]) > -1) {
                            data.push(l)
                            break;
                        }
                    }
                }
            })
            if(this.rid > 0) {
                data = data.filter(item => item.rids.indexOf(this.rid) > -1)
            }else{
                if(this.filter.rid>0) {
                    data = data.filter(item => item.rids.indexOf(this.filter.rid) > -1)
                }
            }
            if(this.filter.sj.id>0) {
                data = data.filter(item => item.sj_ids.indexOf(this.filter.sj.id) > -1)
            }else{
                if(!this.filter.sj.assign) {
                    data = data.filter(item =>item.sj_ids.length == 0)
                }
            }
            if(this.filter.bid>0) {
                data = data.filter(item=> item.bids.indexOf(this.filter.bid) > -1)
            }else {
                if(this.filter.dpt_id>0) {
                    data = data.filter(item=> item.dpt_ids.indexOf(this.filter.dpt_id) > -1)
                }
            }
            // 过滤掉离职的
            data = data.filter(item=>item.is_on_job == 1)
            
            if(this.filter.eids.open) {
                data = data.filter(item => {
                    if(this.filter.eids.list.indexOf(item.eid) != -1) {
                        return true
                    }
                    return false
                })
            }

            return data
        },
        changeGroup(value) {
            this.clickRoot()
            if(value == 4) {
                let index = 0
                if(this.startDate) {
                    index = moment(this.startDate,'YYYY-MM-DD').isoWeekday() - 1
                }else{
                    index = moment().isoWeekday() - 1
                }
                
                this.timeSections[index].selected = true
                if(!this.timeSections[index].opened) {
                    this.$refs.ts.$children[index].handleItemToggle()
                }
                let children = this.timeSections[index]['children']
                if(this.intHours.length==2
                    &&this.intHours[0]!=='') {
                    let start = this.intHours[0]
                    let end = this.intHours[1]
                    if(children.length>0) {
                        let cindex = children.findIndex(c => c._data.int_start_hour==start&&c._data.int_end_hour==end)
                        if(cindex > -1) {
                            this.timeSections[index]['children'][cindex].selected = true
                            this.timeSections[index].selected = false
                            this.click_dpt({},{
                                value: children[cindex].id,
                                _data: {
                                    week_day:index+1,
                                    int_start_hour:start,
                                    int_end_hour:end
                                }
                            })
                        }
                    }else{
                        this.click_dpt({},{
                            value: this.timeSections[index].id,
                            _data: {
                                week_day:index+1
                            }
                        })
                    }
                }else{
                    this.click_dpt({},{
                        value: this.timeSections[index].id,
                        _data: {
                            week_day:index+1
                        }
                    })
                }
            }
        }
    },
    created() {
        this.departments = this.getDeptTree()
        this.authRoles = this.getAuthRolesTree()
        this.subjects = this.getSubjectsTree()
        this.timeSections = this.getTimeSectionsTree()
    },
    mounted() {
        this.init_data()
        this.refreshSelId(this.selected);
    }
}
</script>