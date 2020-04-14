<template>
	<div class="c-grid">		
		<div class="box box-result">
			<Form ref="ref_search" :model="search_field" :label-width="80" class="filter-form row"> 
                <FormItem label="姓名" class="col-md-3 col-sm-6" prop="name">
                    <Input v-model="search_field.name" placeholder="请输入姓名" @keyup.native.enter="search"></Input>
                </FormItem>
                <FormItem label="录入日期" class="col-md-3 col-sm-6" prop="create_time">
                    <date-range-picker 
                    	v-model="search_field.create_time" 
                    	@on-change="search"  
                    	label="选择日期" 
                    	placement="bottom"
                    	style="width:100%">
					</date-range-picker>
                </FormItem>
                <FormItem label="获取日期" class="col-md-3 col-sm-6" prop="get_time">
                    <date-range-picker 
                    	v-model="search_field.get_time" 
                    	@on-change="search"  
                    	label="选择日期" 
                    	placement="bottom"
                    	style="width:100%">
					</date-range-picker>
                </FormItem>
                <FormItem label="校区" class="col-md-3 col-sm-6" prop="bid">
                	<select-branch v-model="search_field.bid" clearable></select-branch>
                </FormItem>
                <template v-if="searchExpand">
                	<FormItem label="分配校区" class="col-md-3 col-sm-6" prop="cu_assigned_bid">
	                	<select-branch v-model="search_field.cu_assigned_bid" clearable></select-branch>
	                </FormItem>
                	<FormItem label="是否有效" class="col-md-3 col-sm-6" prop="is_valid">
	                   <Select v-model="search_field.is_valid" clearable>
							<Option :value="-1">不限</Option>
							<Option :value="0">待确定</Option>
							<Option :value="1">有效</Option>
							<Option :value="2">无效</Option>
						</Select>
	                </FormItem>
	                <FormItem label="是否转客户" class="col-md-3 col-sm-6" prop="is_change">
	                   <Select v-model="search_field.is_change" clearable>
							<Option :value="-1">不限</Option>
							<Option :value="0">否</Option>
							<Option :value="1">是</Option>
						</Select>
	                </FormItem>
	                <FormItem label="是否到访" class="col-md-3 col-sm-6" prop="is_visit">
	                   <Select v-model="search_field.is_visit" clearable>
							<Option :value="-1">不限</Option>
							<Option :value="0">否</Option>
							<Option :value="1">是</Option>
						</Select>
	                </FormItem>
	                <FormItem label="来源渠道" class="col-md-3 col-sm-6" prop="mc_id">                  
	                   <select-channel v-model="search_field.mc_id" :show-add="false"></select-channel>
	                </FormItem>
	                <FormItem label="招生来源" class="col-md-3 col-sm-6" prop="from_did">                    
	                   <dictionary-from v-model="search_field.from_did" clearable></dictionary-from>
	                </FormItem>
	                <FormItem label="电话" class="col-md-3 col-sm-6" prop="tel">
	                   <Input v-model="search_field.tel" placeholder="请输入电话"></Input>
	                </FormItem>
	                <Form-item label="性别" prop="sex" class="col-md-3 col-sm-6">
						<Select v-model="search_field.sex">
							<Option v-for="(item,index) in sexOptions" :key="index" :value="item.value">{{item.label}}</Option>							
						</Select>
					</Form-item>
					<FormItem label="年龄" class="col-md-3 col-sm-6" prop="age">
	                    <select-age v-model="search_field.age"></select-age>
	                </FormItem>
	                
	                <FormItem label="市场跟进人" class="col-md-3 col-sm-6" prop="assigned_eid" v-per="'clue.all'">                    
	                   <select-employee v-model="search_field.assigned_eid" clearable ></select-employee>
	                </FormItem>
	                <FormItem label="销售跟进人" class="col-md-3 col-sm-6" prop="assigned_eid" v-per="'clue.all'">                    
	                   <select-employee v-model="search_field.cu_assigned_eid" clearable ></select-employee>
	                </FormItem>
	                <FormItem label="录入人" class="col-md-3 col-sm-6" prop="create_uid" v-per="'clue.all'">                    
	                   <select-employee v-model="search_field.create_uid" mode="user" clearable></select-employee>
	                </FormItem>
	                <FormItem label="采单人" class="col-md-3 col-sm-6" prop="get_eid">
	                	<select-employee v-model="search_field.get_eid" clearable ></select-employee>
	                </FormItem>
	                <FormItem label="采单地点" class="col-md-3 col-sm-6" prop="get_address_did">
	                	<Select v-model="search_field.get_address_did" clearable>
							<Option :value="item.did" v-for="(item,index) in dicts('get_address')" :key="index">{{item.title}}</Option>
						</Select>
	                </FormItem>
					<Form-item label="就读学校" prop="school_id" class="col-md-3 col-sm-6" v-if="isEF('school_id','mcl')">
						<select-public-school v-model="search_field.school_id" clearable></select-public-school>
					</Form-item>
					<Form-item label="意向级别" class="col-md-3 col-sm-6" prop="intention_level" v-if="isEF('intention_level','mcl')">
					    <Select v-model="search_field.intention_level" multiple style="width: 100%">
							<Option v-for="item in starList" :value="item.value" :key="item.value">{{ item.label }}</Option>
						</Select>
					</Form-item>
                </template>
            </Form>
            <Row class="basic">
                <Col span="24" class="mt-2" style="margin-left:0px;">
                	<Button-group>
                        <Button type="primary" icon="ios-search" v-tooltip="'查询'" @click="search">查询</Button>
                        <Button type="primary" :icon="toggleSearchIcon" @click="toggleSearch"></Button>
                    </Button-group>
                    <Button type="primary" icon="refresh" @click="resetSearch">重置</Button>

                    <export-button res="market_clues" :params="params" v-per="'clue.export'" :total="total" :max-sync-nums="1000"></export-button>

                    <Button type="ghost" icon="android-arrow-dropdown" @click="issueClue" v-if="og_id$" v-per="'clue.issue'">
                    	<Badge :count="uncheckout_nums">总部市场名单</Badge>
                    </Button>
                    
                    <CheckboxGroup v-model="search_field.is_deal" style="display: inline-block;" class="ml-3">
                    	<Checkbox :label="0">未成交</Checkbox>
                    	<Checkbox :label="1">已成交</Checkbox>
                    </CheckboxGroup>
                    
                    <div class="pull-right">
                        <per-scope per="clue.all" @on-change="perScopeChange"></per-scope>
                    </div>
               		<div class="pull-right mr-4">
               			<template v-if="type_market=='all'">
	               			<label>销售：</label>
	                        <ButtonGroup class="mr-3">
	                        	<Button :type="is_cu_reg==-1?'primary':'ghost'" icon="android-people" @click="is_cu_reg=-1">所有</Button>
	                            <Button :type="is_cu_reg==0?'primary':'ghost'" icon="ios-person-outline" @click="is_cu_reg=0">未分配</Button>
	                            <Button :type="is_cu_reg==1?'primary':'ghost'" icon="ios-person" @click="is_cu_reg=1">已分配</Button>
	                        </ButtonGroup>
	                        <label>市场：</label>
	                        <ButtonGroup>
	                        	<Button :type="is_reg==-1?'primary':'ghost'" icon="android-people" @click="is_reg=-1">所有</Button>
	                            <Button :type="is_reg==0?'primary':'ghost'" icon="ios-person-outline" @click="is_reg=0">未分配</Button>
	                            <Button :type="is_reg==1?'primary':'ghost'" icon="ios-person" @click="is_reg=1">已分配</Button>
	                        </ButtonGroup>
                        </template>
                        <ButtonGroup v-else>
                        	<Button :type="follow_type==1?'primary':'ghost'" icon="ios-person" @click="follow_type=1">我录入的</Button>
                            <Button :type="follow_type==0?'primary':'ghost'" icon="ios-person-outline" @click="follow_type=0">我跟进的</Button>
                        </ButtonGroup>
                   	</div> 
                </Col>
            </Row>
		</div>
		
		<div class="box box-result">
			<div class="toolbar">
        		<Button type="primary" icon="plus" @click="addInfo" v-per="'clue.add'">添加</Button>
				<import-button res="multi_market_clues" name="客户" @on-import-finish="init_data" v-per="'clue.import'"></import-button>				
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
						<DropdownItem @click.native="validation"><Icon type="android-checkmark-circle"></Icon> 确认有效性</DropdownItem>
						<DropdownItem @click.native="assigned()"><Icon type="ios-people-outline"></Icon> 批量分配</DropdownItem>
						<DropdownItem @click.native="multipleTransfer"><Icon type="ios-people"></Icon> 转为客户</DropdownItem>
						<DropdownItem @click.native="multipleDel"><Icon type="ios-trash"></Icon> 批量删除</DropdownItem>
						<DropdownItem @click.native="clearClue"><Icon type="android-remove-circle"></Icon> 清空勾选</DropdownItem>
						<DropdownItem @click.native="selectProjects" v-if="enable_project" ><Icon type="ios-shuffle"></Icon> 分配项目</DropdownItem>
						<DropdownItem @click.native="batSendSms" v-if="hasPer('dashboard.sendsms')"><Icon type="chatbubble"></Icon> 发送短信</DropdownItem>
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
		                	:page-size-opts="bigPageSizeOption"
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
	import Vue 					from 'vue'	
	import util,{_}  			from '@/libs/util'
	import clue 				from './clue.mixin'
	import grid 				from '@/libs/grid.mixin'
	import common 				from '@/libs/common.mixin'
	import globals 				from '@/libs/globals.mixin'
	
	import SelectAge 			from 'c%/SelectAge.vue'
	import InfoModal 			from './info-modal.vue'
	import ImportButton 		from 'c%/ImportButton.vue'
	import SelectBranch 		from 'c%/SelectBranch.vue'
	import SelectChannel 		from 'c%/SelectChannel.vue'
	import SelectEmployee 		from 'c%/SelectEmployee.vue'
	import AssignEmployee		from './assign-employee.vue'
	import Validation 			from './validation.vue'
	import DateRangePicker 		from 'c%/DateRangePicker.vue'
	import ExportButton 		from 'c%/ExportButton.vue'
	import RichTel 				from 'c%/RichTel.vue'
	import DictionaryFrom 		from 'c%/DictionaryFrom.vue'
	import SelectPublicSchool from 'c%/SelectPublicSchool.vue'
	
	Vue.component('rich-tel',RichTel)
	export default{
		mixins: [ grid,common,globals, clue ],
		components: {
			InfoModal,
			SelectAge,
			Validation,
			SelectBranch,
			ImportButton,
			SelectChannel,
			SelectEmployee,
			AssignEmployee,
			DateRangePicker,
			ExportButton,
			DictionaryFrom,
			SelectPublicSchool
		},
		data () {
			return {
				rest_api: 'market_clues',
				pk: 'mcl_id',
				column_keys: {
					name: {
						title: '姓名',
						show: true,
						width: 100,
						fixed: 'left'
					},
					mcl_id:{
						title:'ID',
						show:false,
						width:80,
					},
					sex: {
						title: '性别',
						show: false,
						width: 80
					},
					tel: {
						title: '电话',
						show: true,
						width: 160
					},					
					email: {
						title: '邮箱',
						show: false,
						width: 160
					},
					birth_time: {
						title: '年龄',
						show: false,
						width: 100
					},
					bid: {
						title: '校区',
						show: false,
						width: 120
					},
					cu_assigned_bid: {
						title: '分配校区',
						show: false,
						width: 120
					},
					pj_ids:{
						title: '项目',
						show:false,
						width:120
					},
					school_grade: {
						title: '年级',
						show: false,
						width: 80
					},
					id_card_no:{
						title:'身份证号',
						show:false,
						width:80
					},
					channel_name: {
						title: '来源渠道',
						show: true,
						width: 110
					},
					from_did_name: {
						title: '招生来源',
						show: true,
						width: 110
					},
					last_customer_follow_up: {
						title: '最后跟进',
						show: true,
						width: 200
					},
					is_valid: {
						title: '有效性',
						show: true,
						width: 80
					},
					intention_level: {
						title: '意向级别',
						width: 180,
						show: true
					},
					is_change: {
						title: '是否转客户',
						show: true,
						width: 120
					},
					is_deal: {
						title: '是否成交',
						show: true,
						width: 100
					},
					create_uid: {
						title: '录入人',
						show: true,
						width: 100
					},
					create_time: {
						title: '录入时间',
						show: true,
						sortable: 'custom',
						width: 120
					},
					cu_assigned_eid: {
						title: '销售跟进人',
						show: true,
						width: 120
					},
					assigned_eid: {
						title: '市场跟进人',
						show: true,
						width: 120
					},			
					get_time: {
						title: '获取时间',
						show: true,
						sortable: 'custom',
						width: 120
					},
					get_eid: {
						title: '采单人',
						show: true,
						width: 120
					},
					get_address_did: {
						title: '采单地点',
						show: true,
						width: 120
					},
					remark: {
						title: '备注',
						show: true,
						width: 120
					}
				},
				column_render: {
					intention_level (h,params) {
						return h('Rate',{
							props:{
								value: params.row.intention_level,
								disabled: true
							}
						})
					},
					last_customer_follow_up (h,params) {
						let obj = params.row.last_follow_up,
							result = '-',
							tool_tip = null,
							add_btn = null
						if(obj){
							result = obj.content
						}
						
						add_btn = h('Button',{
							'class': {
								'pull-right': true
							},
							attrs: {
								'title': '添加跟进'								
							},
							props: {
								type: 'text',
								size: 'small',
								icon: 'plus'
							},
							on: {
								'click': () => {
									this.followAdd(params.row)
								}
							}
						})
						
						tool_tip = h('Tooltip',{
							'class':'x-tooltip',
							props: {
								content: result								
							}
						},[
							h('p',{
								'class': 'text-over-elips',
								style: {
									width: '150px'
								},
							},result)
						])
						
						return h('div',[tool_tip,add_btn])
						
					},					
					name (h,params) {
						let map = {0:{icon:'help',text:'未设置'}, 1:{icon:'male',text:'男'},2:{icon:'female',text:'女'}}
						let nameElement = h('a',{
							attrs: {
								'class': 'x-a-link text-info',
								title: params.row.sex>0?map[params.row.sex].text:'',
								style: 'margin-right: 5px'
							},
							on: {
								click: ()=>{
									this.customerDetail(params.row.mcl_id)
								}
							}
						},params.row.sex>0?[h('Icon',{
							props: {
								type: map[params.row.sex].icon
							}
						}),' '+params.row.name]:params.row.name);
						
						return h('span',[nameElement])
					},					
					tel (h,params) {
						let 
							label = util.sprintf("%s(%s)",
									params.row.tel,
									this.$filter('family_rel')(params.row.family_rel))
							
						return h('rich-tel',{
							props: {
								sence: 'market',
								row: params.row
							},
							on: {
								'on-success': ()=>{
									this.init_data()
								}
							}
						},label)
					},
					email (h,params) {
						return h('span',params.row.email||'-')
					},
					birth_time (h,params) {
						return h('span',util.age(params.row.birth_time))
					},
					school_grade (h,params) {
						return h('span',this.labelDicts(params.row.school_grade,'grade')||'-')
					},
					remark (h,params) {
						return h('span',params.row.remark||'-')
					},
					assigned_eid(h,params){
						return h('span',this.$filter('ename')(params.row.assigned_eid)||'-')
					},
					cu_assigned_bid (h,params) {
						return h('span',this.$filter('branch_name')(params.row.cu_assigned_bid,'-'))
					},
					cu_assigned_eid (h,params) {
						return h('span',this.$filter('ename')(params.row.cu_assigned_eid)||'-')
					},
//					from_did (h,params) {
//						return h('span',this.labelDicts(params.row.from_did,'from')||'-')
//					},
					is_valid (h,params) {
						let map = {0:'待确认',1:'有效',2:'无效'}
						
						return h('span',map[params.row.is_valid])
					},
					is_visit (h,params) {
						let map = {0: '未上门', 1: '已上门'}
						return h('span',map[params.row.is_visit])
					},
					is_deal (h,params) {
						let map = {0: '未成交', 1: '已成交'}
						return h('span',map[params.row.is_deal])
					},
					is_change (h,params) {
						let result = params.row.cu_id>0?'已转化':'-'
						return h('span',result)						
					},
					create_uid (h,params) {
						let result = params.row.employee?params.row.employee.ename:'-'
						return h('span',result)
					},
					create_time (h,params) {
						return h('span',params.row.create_time.substring(0,10))
					},
					get_eid (h,params) {
						return h('span',this.$filter('ename')(params.row.get_eid,'-'))
					},
					get_address_did (h,params) {
						return h('span',this.$filter('dict_title')(params.row.get_address_did,'get_address'))
					}
				},
				operation_keys: {
					edit:{
						title: '编辑',
						type: 'edit',
						per: 'clue.edit'
					},
					add:{
						title: '跟单',
						type: 'plus',
						per: 'clue.follow'
					},					
					validate:{
						title: '确认有效性',
						type: 'android-checkmark-circle',
						per: 'clue.edit',
						condition: 'row.is_deal==0&&row.cu_id==0&&row.is_valid==0'
					},
					assign: {
						title: '分配',
						type: 'ios-person-outline',
						per: 'clue.distribute',
						condition: 'row.is_deal==0'
					},
					transfer: {
						title: '转化为客户',
						type: 'ios-person',
						condition: 'row.is_deal==0&&row.cu_id==0&&row.is_valid==1',
						per: 'clue.transfer'
					},
					del: {
						title: '删除',
						type: 'ios-trash',
						per: 'clue.delete'
					},
					share_shuffle: {
						title: '共享给其他项目',
						type: 'ios-shuffle'
					},
					send_sms:{
						title: '发送短信',
						type:'chatbubble',
						per: 'dashboard.sendsms'
					}
				},
				operation_func: {
					edit (params) {
						this.editInfo(params.row)
					},
					add (params) {
						this.followAdd(params.row)
					},	
					validate (params) {						
						this.validateSingle(params.row)				
					},
					assign (params) {
						this.assigned([params.row])
					},
					transfer (params) {
						this.transferInfo(params.row)
					},
					del (params) {
						this.delInfo(params.row)
					},
					share_shuffle (params) {
						this.share_shuffle(params.row)
					},
					send_sms(params){
						this.sendSms(params.row)
					}
				}
			}
		},
		created(){
			this.initOptionFieldsColumn()
			this.initDisableFieldCloumns('mcl')
			if(!this.enable_project){
				delete this.column_keys['pj_ids']
				delete this.operation_keys['share_shuffle']
			}
		},
		methods: {
			customerDetail (id) {
				this.setStateSearchInfo()
				this.$router.push({path: `/recruiting/market/${id}`})
			},
			followAdd (row) {
				this.$Modal.open('recruiting/market/follow-info-modal.vue',{
					props: {
						'list': this.data,
						'page-size': this.pageSize
					},
					on: {
						'on-prevpage':() => {
							this.prev_page()
						},
						'on-nextpage':() => {
							this.next_page()
						},
						'on-success': () => {
							this.init_data()
						}
					}
				})
				.then(modal => {
					modal
					.set('mcl_id',row.mcl_id)
					.set('customerInfo',row)
					.set('tabs','basic_information')
					.set('currentIndex',row._index)
					.show('添加跟进记录','add')
				})
			},
			prev_page () {
				this.pageIndex--
				this.init_data()
			},
			next_page () {
				this.pageIndex++
				this.init_data()
			},			
			validateSingle (row) {
				this.$Modal.open('recruiting/market/validation-single.vue@modal',{
					on:{
						'on-success': ()=>{
							this.init_data()
						}
					}
				})
				.then(modal=>{
					modal.set('info',row)
					.show(`确认【${row.name}】有效性`,'add')
				})	
			},
			issueClue() {
				this.$Modal.open('recruiting/market/issue-clue.vue@modal',{
					props: {
						parent$: this
					},
					on: {
						'on-success': ()=>{
							this.init_data()
						}
					}
				})
				.then(modal=>{
					modal.show('总部分发名单')
				})
			}
		}
		
	}
</script>

<style>
</style>