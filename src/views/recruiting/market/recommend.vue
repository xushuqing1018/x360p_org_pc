<template>
	<div class="c-grid">		
		<div class="box box-result">
			<Form ref="ref_search" :model="search_field" :label-width="70" class="filter-form row"> 
                
                <FormItem label="是否有效" class="col-md-3 col-sm-6" prop="is_valid">
                   <Select v-model="search_field.is_valid" clearable>
						<Option :value="-1">不限</Option>
						<Option :value="0">待确定</Option>
						<Option :value="1">有效</Option>
						<Option :value="2">无效</Option>
					</Select>
                </FormItem>
              	<FormItem label="转客户" class="col-md-3 col-sm-6" prop="is_transfer">
                   <Select v-model="search_field.is_transfer" clearable>
						<Option :value="-1">不限</Option>
						<Option :value="0">待转化</Option>
						<Option :value="1">已转化</Option>
					</Select>
                </FormItem>
                <FormItem label="是否报名" class="col-md-3 col-sm-6" prop="is_deal">
                   <Select v-model="search_field.is_deal" clearable>
						<Option :value="-1">不限</Option>
						<Option :value="0">未报名</Option>
						<Option :value="1">已报名</Option>
					</Select>
                </FormItem>
				<FormItem label="是否奖励" class="col-md-3 col-sm-6" prop="is_reward">
                   <Select v-model="search_field.is_reward" clearable>
						<Option :value="-1">不限</Option>
						<Option :value="0">未奖励</Option>
						<Option :value="1">已奖励</Option>
					</Select>
                </FormItem>
                  
                <template v-if="searchExpand">
                	<FormItem label="电话" class="col-md-3 col-sm-6" prop="tel">
	                   <Input v-model="search_field.tel" placeholder="请输入电话"></Input>
	                </FormItem> 
	                <Form-item label="性别" prop="sex" class="col-md-3 col-sm-6">
						<Select v-model="search_field.sex">
							<Option v-for="item in sexOptions" :value="item.value">{{item.label}}</Option>							
						</Select>
					</Form-item>              
	                <FormItem label="年龄" class="col-md-3 col-sm-6" prop="age">
	                    <select-age v-model="search_field.age"></select-age>
	                </FormItem>
	                <FormItem label="跟进人" class="col-md-3 col-sm-6" prop="assigned_eid" v-per="'market.all'" v-if="type_market=='all'">                    
	                   <select-employee v-model="search_field.assigned_eid" clearable ></select-employee>
	                </FormItem>
	                <FormItem label="校区" class="col-md-3 col-sm-6" prop="bid">
	                	<select-branch v-model="search_field.bid" clearable></select-branch>
	                </FormItem>
	                <Form-item label="推荐学员" class="col-md-3 dol-sm-6" prop="recommend_sid">
	                	<select-student v-model="search_field.recommend_sid" clearable></select-student>
	                </Form-item>  
	                <FormItem label="姓名" class="col-md-3 col-sm-6" prop="name">
	                   <Input v-model="search_field.name" placeholder="请输入姓名"></Input>
	                </FormItem>
                </template>
            </Form>
            <Row class="basic">
                <Col span="24" class="mt-2" style="margin-left:0px;">
                	<Button-group>
                        <Button type="primary" icon="ios-search" v-tooltip="'查询'" @click="search">查询</Button>
                        <Button type="primary" :icon="toggleSearchIcon" @click="toggleSearch"></Button>
                    </Button-group>
                    <Button type="primary" icon="refresh" @click="resetSearch">重置</Button>

                    <!-- <export-button res="market_recommends" :params="params"></export-button> -->
                    
                    <div class="pull-right">
                        <per-scope per="clue.all" @on-change="type_market = $event"></per-scope>
                    </div>
               		<div class="pull-right mr-4">
                        <label>当前列表：</label>
                        <ButtonGroup>
                        	<Button :type="is_reg==-1?'primary':'ghost'" icon="ios-person-outline" @click="is_reg=-1">所有</Button>
                            <Button :type="is_reg==0?'primary':'ghost'" icon="ios-person-outline" @click="is_reg=0">未分配</Button>
                            <Button :type="is_reg==1?'primary':'ghost'" icon="ios-person" @click="is_reg=1">已分配</Button>
                        </ButtonGroup>
                   	</div> 
                </Col>
            </Row>
		</div>
		
		<div class="box box-result">
			<div class="toolbar">
				<Dropdown trigger="click">
					<Button 
						type="primary" 
						icon="more" 
						:disabled="selectedList.length==0" 
						title="先勾选名单，可连续对名单进行操作"
						v-per="'clue.batch'"
						>批量操作&nbsp;{{selectedList.length}}
					</Button>
					<DropdownMenu slot="list">
						<DropdownItem @click.native="clearClue"><Icon type="android-remove-circle"></Icon> 清空</DropdownItem>
						<DropdownItem @click.native="validation"><Icon type="android-checkmark-circle"></Icon> 确认有效性</DropdownItem>
						<DropdownItem @click.native="assigned()"><Icon type="ios-people-outline"></Icon> 批量分配</DropdownItem>
						<DropdownItem @click.native="multipleTransfer"><Icon type="ios-people"></Icon> 转为客户</DropdownItem>
						<DropdownItem @click.native="multipleDel"><Icon type="ios-trash"></Icon> 批量删除</DropdownItem>
					</DropdownMenu>
				</Dropdown>				
				<filter-column class="pull-right" :keys="column_keys"></filter-column>
        	</div>
	        <div class="content">
				<div class="content-body">
		            <Table 
		            	v-loading.like="'market_clues'"
		            	class="customer-list" 
		            	ref="tableExcel"
		            	:page="pageIndex" 
		            	:page-size="pageSize" 
		            	:stripe="true" 
		            	:show-header="true" 
		            	:data="data" 
		            	:columns="columns" 
		            	:no-data-text="$store.state.config.EMPTY_DATA_TEXT" 
		            	:no-filtered-data-text="$store.state.config.EMPTY_FILTER_DATA_TEXT"
		            	@on-sort-change="sortChange"
		            	@on-selection-change="selectionChange"> 
		            </Table>
		        </div>
		        <div class="content-footer">
		            <div class="pagenation">
		                <Page 
		                	:total="total" 
		                	:current="pageIndex" 
		                	:show-sizer="true" 
		                	:page-size="pageSize" 
		                	:show-total="true"
		                	:transfer="true"
		                	@on-change="pagenation" 
		                	@on-page-size-change="pagesize">
		                </Page>		                
		            </div>
		        </div>
			</div>
		</div>
		<info-modal ref="info" @on-success="init_data"></info-modal>
		<assign-employee ref="assigned" @on-success="assignSuccess"></assign-employee>
		<validation ref="validation" @on-success="init_data"></validation>
	</div>
</template>

<script>
	import {_} from '@/libs/util'
	import util from '@/libs/util'
	import clue from './clue.mixin'
	import grid from '@/libs/grid.mixin'
	import common from '@/libs/common.mixin'
	import globals from '@/libs/globals.mixin'
	
	import SelectAge from 'c%/SelectAge.vue'
	import InfoModal from './info-modal.vue'
	import ImportButton from 'c%/ImportButton.vue'
	import SelectBranch from 'c%/SelectBranch.vue'
	import SelectEmployee from 'c%/SelectEmployee.vue'
	import SelectStudent from 'c%/SelectStudent.vue'
	import AssignEmployee from './assign-employee.vue'
	import Validation from './validation.vue'

	import ExportButton from 'c%/ExportButton.vue'
	
	export default{
		mixins: [ grid,common,globals, clue ],
		components: {
			InfoModal,
			SelectAge,
			Validation,
			SelectBranch,
			ImportButton,
			SelectEmployee,
			AssignEmployee,
			SelectStudent,
			ExportButton
		},
		data () {
			return {
				rest_api: 'market_clues',
				pk: 'mcl_id',
				type_market: 'my',
				search_field: {
					bid: [],
					mc_id: 0,
					name: '',
					tel: '',
					age: [],
					is_valid: -1,
					is_transfer: -1,
					assigned_eid: 0,
					recommend_sid: 0,
					is_deal:-1,
					is_reward:-1,
					sex: -1
				},				
				column_keys: {
					name: {
						title: '姓名',
						show: true
					},
					sex: {
						title: '性别',
						show: false
					},
					tel: {
						title: '电话',
						show: true
					},					
					email: {
						title: '邮箱',
						show: false
					},
					birth_time: {
						title: '年龄',
						show: true
					},
					bid: {
						title: '校区',
						show: false
					},
					grade: {
						title: '年级',
						show: false
					},
					is_valid: {
						title: '有效性',
						show: true
					},
					is_change: {
						title: '是否转化',
						show: true
					},
					is_deal:{
						title:'是否报名',
						show:true
					},
					is_reward:{
						title:'是否奖励',
						show:true
					},
					recommend_sid: {
						title: '推荐学员',
						show: true
					},
					recommend_uid: {
						title: '推荐学员用户',
						show: true
					},
					recommend_note: {
						title: '推荐说明',
						show: true
					},
					recommend_reward_note: {
						title: '推荐奖励备注',
						show: true
					},
					assigned_eid: {
						title: '跟进人',
						show: false
					},
					create_time: {
						title: '录入时间',
						show: true,
						width: 160
					}
				},
				column_render: {
					email (h,params) {
						return h('span',params.row.email||'-')
					},
					birth_time (h,params) {
						return h('span',util.age(params.row.birth_time))
					},
					grade (h,params) {
						return h('span',this.labelDicts('grade',params.row.grade)||'-')
					},
					remark (h,params) {
						return h('span',params.row.remark||'-')
					},
					assigned_eid(h,params){
						return h('span',this.$filter('ename')(params.row.assigned_eid)||'-')
					},
					mc_id (h,params) {
						let list = this.$store.state.market_channels,
							result = ''
						
						if(list.length){
							let obj = list.find(l=>l.mc_id==params.row.mc_id)||{}
							
							result = obj.channel_name||''							
						}
						
						return h('span',result)
					},
					is_valid (h,params) {
						let map = {0:'待确认',1:'有效',2:'无效'}
						let props = {}
						if(params.row.is_valid == 1){
							props.class = 'text-success'
						}else if(row.is_valid == 2){
							props.class = 'text-warning'
						}
						return h('span',map[params.row.is_valid])
					},
					is_change (h,params) {
						let result = params.row.cu_id>0?'已转化':'-'
						let props = {}
						if(params.row.cu_id > 0 ){
							props.class = 'text-success'
						}
						return h('span',props,result)						
					},
					is_deal(h,params){
						let map = {0:'未报名',1:'已报名'}
						let props = {}
						if(params.row.is_deal == 1){
							props.class = 'text-success'
						}
						return h('span',props,map[params.row.is_deal])
					},
					is_reward(h,params){
						let map = {0:'未奖励',1:'已奖励'}
						let props = {}
						if(params.row.is_reward == 1){
							props.class = 'text-success'
						}
						return h('span',props,map[params.row.is_reward])
					},
					recommend_sid (h,param) {
						let student = '-'
						if(param.row.recommend_student) {
							student = param.row.recommend_student.student_name
						}
						return h('span',student)
					},
					recommend_uid (h,param) {
						let user = '-'
						if(param.row.recommend_user) {
							user = param.row.recommend_user.name || param.row.recommend_user.account
						}
						return h('span',user)
					},
					create_time (h,params) {
						return h('span',params.row.create_time.substring(0,16))
					}
				},
				operation_keys: {
					edit:{
						title: '编辑',
						type: 'edit'
					},
					assign: {
						title: '分配',
						type: 'ios-person-outline',
						per:'clue.distribute',
						condition:'row.assigned_eid == 0'
					},
					transfer: {
						title: '转化为客户',
						type: 'ios-person',
						condition: 'row.cu_id==0&&row.is_valid==1'
					},
					reward:{
						title:'奖励',
						type:'beer',
						condition:'row.sid>0'
					},
					del: {
						title: '删除',
						type: 'ios-trash',
						per:'clue.delete'
					}
				},
				operation_func: {
					edit (params) {
						this.editInfo(params.row)
					},	
					assign (params) {
						this.assigned([params.row])
					},
					transfer (params) {
						this.transferInfo(params.row)
					},
					reward(params){
						this.reward(params.row)
					},
					del (params) {
						this.delInfo(params.row)
					}
				}
			}
		},
		methods:{
			reward(row){
				this.$Modal.open('recruiting/market/reward-modal.vue',{
					on:{
						'on-success':()=>{
							this.init_data()
						}
					}
				})
				.then(modal=>{
					modal.set('info',row)
					.show('奖励设置','edit')
				})
			},
			hook_get_param(params){
				let search_obj = util.copy(this.search_field),
				uid = this.$store.state.user.info.uid
							
				if(this.type_market=='my' && this.eid$>0){					
					params.assigned_eid = this.eid$
				}else{	
					if(this.is_reg == 1){
						params.assigned_eid = '[>,0]'
					}else if(this.is_reg == 0){
						params.assigned_eid = 0
					}
				}
				
			
				
				for(let o in search_obj) {
					let property = search_obj[o]
					if(o=='age'){
						if(property.length>0) {
							params.birth_time = util.sprintf('[Between,%s]',this.getBirthTimeByAge(property).join(','))
						}
					}else if(o=='bid'){
						if(property.length>0) {
							params[o] = util.sprintf('[In,%s]',property.join(','))
						}
					}
					else if(o=='is_valid'||o=='is_transfer'){
						if(property!=-1){
							if(o=='is_transfer'){
								params.cu_id = property==0?'0':'[>,0]' 
							}else{
								params[o] = property								
							}
						}
					}else if(o=='sex'){
						if(property!==-1) {
							params[o] = property
						}
					}
					else{
						if(property&&property!=-1){
							params[o] = property
						}	
					}
				}

				if(search_obj.recommend_sid == 0){
					params.recommend_sid  = '[>,0]'
				}

				params.with = 'recommend_student,recommend_user'
			}
		}
		
	}
</script>

<style>
</style>