<template>
	<div class="c-grid">
		<div class="box box-query">
			<Form ref="ref_search" :model="search_field" :label-width="80" class="filter-form row">
				<Form-item label="盟商名称" prop="org_name" class="col-md-3 col-sm-6">
					<Input v-model="search_field.org_name" placeholder="加盟商名称"></Input>
				</Form-item>
				<Form-item label="运营状态" prop="status" class="col-md-3 col-sm-6">
					<Select v-model="search_field.status">
						<Option :value="item.value" v-for="item in status_list">{{item.label}}</Option>
					</Select>
				</Form-item>
				<Form-item label="合同结束日期" prop="contract_end_int_day" :label-width="90" class="col-md-3 col-sm-6">
					<date-range-picker 
						v-model="search_field.contract_end_int_day" 
						@on-change="search" 
						label="选择合同结束日期" 
						placement="bottom"
						style="width:100%">
					</date-range-picker>					
				</Form-item>
				<Form-item label="校360系统状态" :label-width="100" prop="system_status" class="col-md-3 col-sm-6">
					<Select v-model="search_field.system_status">
						<Option :value="item.value" v-for="item in system_status_list">{{item.label}}</Option>
					</Select>
				</Form-item>								
			</Form>
			<Row class="basic">
	            <Col span="24" class="mt-2">
	            	<Button-group>
                        <Button class="ml-2" type="primary" @click="search" icon="ios-search">查询</Button>  
                    </Button-group>
                	<Button type="primary" icon="refresh" @click="resetSearch">重置</Button>
                	<export-button res="franchisees" :params="params"></export-button>
                	<import-button res="franchisees" name="加盟商" @on-import-finish="init_data"></import-button>

                	<div class="pull-right">
                        <label>权限范围：</label>
				        <ButtonGroup>
				            <Button 
				                :type="type_franch=='my'?'primary':'ghost'" 
				                size="small" 
				                icon="android-person" 
				                @click="type_franch='my'"
				                >我的
				            </Button>
				            <Button 
				                :type="type_franch=='dpt'?'primary':'ghost'" 
				                size="small" 
				                icon="home" 
				                @click="type_franch='dpt'"
				                v-if="sub_eids.length>0"
				                >部门
				            </Button>
				            <Button 
				                :type="type_franch=='all'?'primary':'ghost'" 
				                size="small" 
				                icon="android-people" 
				                :disabled="userPers.indexOf(per)<0" 
				                @click="type_franch='all'"
				                >所有
				            </Button>
				        </ButtonGroup>
                   	</div>
	            </Col>
	        </Row>         
		</div>
		<div class="box box-result">
			<div class="toolbar">
				<Button type="primary" icon="plus" @click="add">添加加盟商</Button>
				<Dropdown trigger="click">
					<Button 
						type="primary" 
						icon="more" 
						:disabled="s_list.length==0" 
						title="先勾选加盟商，可对加盟商进行批量操作"
						>
						批量操作&nbsp;{{s_list.length}}
					</Button>
					<DropdownMenu slot="list">
						<DropdownItem @click.native="updateName"><Icon type="android-refresh"></Icon> 更新简称</DropdownItem>
					</DropdownMenu>
				</Dropdown> 
	            <filter-column :keys="column_keys"></filter-column>
	        </div>
	        <div class="content">
				<div class="content-body">
			        <Table 
				        v-loading="'franchisees'" 
				        :page-size="pageSize" 
				        :page="pageIndex" 	
				        :stripe="true" 
				        :show-header="true" 
				        :data="data" 
				        :columns="columns" 
				        :no-data-text="$store.state.config.EMPTY_DATA_TEXT" 
				        :no-filtered-data-text="$store.state.config.EMPTY_FILTER_DATA_TEXT" 
				        @on-sort-change="sortChange"
					@on-selection-change="addSelectData"
				        > 
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
				            @on-change="pagenation" 
				            @on-page-size-change="pagesize"
			           		>
			            </Page>
			        </div>
			    </div>  
		    </div>
	    </div>
    </div>
</template>

<script>
	import Vue from 'vue'
	import moment from 'moment'
	import util,{_} from '@/libs/util'
	import grid from '@/libs/grid.mixin'
	import common from '@/libs/common.mixin'
	import globals from '@/libs/globals.mixin'
	import SelectOrg from 'c%/SelectOrg.vue'
	import DateRangePicker from 'c%/DateRangePicker.vue'
	import ExportButton from 'c%/ExportButton.vue'
	import ImportButton from 'c%/ImportButton.vue'
	import OperationItems from './archive/operation-franchisee.vue'

	Vue.component('franchisee-operation',OperationItems)
	
	export default{
		mixins: [grid,common,globals],
		components: {
			SelectOrg,
			DateRangePicker,
			ExportButton,
			ImportButton,
		},
		data () {
			return {
				rest_api: 'franchisees',
				pk: 'fc_id',
				type_franch: '',
				per: 'orgs.all',
				showCheckbox: true,
				s_list: [],
				search_field: {
					org_name: '',
					contract_end_int_day: [],
					status: -1,
					system_status: -1
				},
				showIndex: false,
				status_list: [
					{label: '不限',value: -1},
					{label: '未选址',value: 0},
					{label: '筹备期',value: 1},
					{label: '预售期',value: 2},
					{label: '正常营业',value: 3},
					{label: '停业',value: 4},
					{label: '已解约',value: 5}
				],
				system_status_list: [
					{label: '不限',value: -1},
					{label: '未开通',value: 0},
					{label: '待审核',value: 1},
					{label: '已开通',value: 2},
				],
				column_keys: {
					operate: {
						title: '操作',
						width: 80,
						fixed: 'left'
					},
					index: {
						type: 'index',
						title:'#',
	                    width: 60,
	                    align: 'center',
	                    fixed: 'left'
					},
					org_name: {
						title: '盟商名称',
						width: 150,
						fixed: 'left',
						show: true
					},
					org_address: {
						title: '详细地址',
						width: 250,
						show: true
					},
					mobile: {
						title: '中心座机',
						width: 120,
					},
					is_sign: {
						title: '签约',
						width: 120
					},
					system_status: {
						title: '系统状态',
						width: 120
					},
					status: {
						title: '运营状态',
						sortable: 'custom',
						width: 120,
						show: true
					},
					address_did: {
						title: '店面性质',
						width: 120,
						show: true
					},
					decorate_fee: {
						title: '装修费用',
						sortable: 'custom',
						width: 150,
						show:true
					},
					is_owner_change: {
						title: '主体变更',
						sortable: 'custom',
						width: 120,
						show: true
					},
					business_license: {
						title: '营业执照号',
						width: 150,
						show: true
					},
					is_authorize_dispatch: {
						title: '授权铜牌',
						sortable: 'custom',
						width: 120,
						show: true
					},
					org_email: {
						title: '企业邮箱',
						width: 180,
						show: true
					},
					sale_eid: {
						title: '渠道销售',
						width: 120,
						show: true
					},
					service_eid: {
						title: '督导员工',
						width: 120,
						show: true
					},
					contract_start_int_day: {
						title: '合同开始日期',
						sortable: 'custom',
						width: 150,
						show: true
					},
					contract_end_int_day: {
						title: '合同结束日期',
						sortable: 'custom',
						width: 150,
						show: true
					},
					open_int_day: {
						title: '开业日期',
						sortable: 'custom',
						width: 150,
						show: true
					}
				},
				column_render: {
					operate(h,params) {
						return h('franchisee-operation',{
							props: {
								info: params.row,
								placement: 'bottom-start'
							},
							on: {
								'on-success':() => {
									this.init_data()
								}
							}
						})
					},
					org_name (h,params) {
						return h('a',{
							class: 'text-info',
							on: {
								click:()=>{
									this.franchiseeDetail(params.row.fc_id)
								}
							}
						},params.row.org_name)
					},
					org_address (h,params) {
                        return h('span',params.row.org_address||'-')
					},
					status (h,params) {
						return h('span',this.$filter('franchisee_status')(params.row.status))
					},
					system_status (h,params) {
						let map = {
							0:{label: '未开通',color: 'text-danger'},
							1:{label: '待审核',color: 'text-info'},
							2:{label: '已开通',color: 'text-success'}
						}
						return h('span',{
							'class': map[params.row.system_status].color
						},map[params.row.system_status].label)
					},
					address_did (h,params) {
						return h('span',this.$filter('dict_title')(params.row.address_did,'address'))
					},
					decorate_fee (h,params) {
						let result = [],
							decorate = '总部装修：'
						if(params.row.is_head_decorate==1) {
							result.push(decorate)
						}
						if(params.row.decorate_fee) {
							let icon = h('Icon',{
								props: {
									type: 'social-yen'
								}
							})
							result.push(icon)
							result.push(params.row.decorate_fee)
						}else{
							result.push('-')
						}
						return h('span',result)
					},
					is_owner_change (h,params) {
						let map = {1:{label: '已完成',color: 'text-success'},0:{label: '未完成',color: 'text-danger'}}
						return h('span',{
							'class': map[params.row.is_owner_change].color
						},map[params.row.is_owner_change].label)
					},
					business_license (h,params) {
						return h('span',params.row.business_license||'-')
					},
					is_authorize_dispatch (h,params) {
						let map = {1:{label: '已授权',color: 'text-success'},0:{label: '未授权',color: 'text-danger'}}
						return h('span',{
							'class': map[params.row.is_authorize_dispatch].color
						},map[params.row.is_authorize_dispatch].label)
					},
					org_email (h,params) {
						return h('span',params.row.org_email || '-')
					},
					sale_eid (h,params) {
						return h('span',this.$filter('ename')(params.row.sale_eid||'-'))
					},
					service_eid (h,params) {
						return h('span',this.$filter('ename')(params.row.service_eid||'-'))
					},
					is_sign (h,params) {
						let map = {9:{label: '已解约',color: 'text-gray'},1:{label: '已签约',color: 'text-success'},0:{label: '未签约',color: 'text-danger'}}
						return h('span',{
							'class': map[params.row.is_sign].color
						},map[params.row.is_sign].label)
					},
					contract_start_int_day (h,params) {
						return h('span',params.row.contract_start_int_day || '-')
					},
					contract_end_int_day (h,params) {
						return h('span',params.row.contract_end_int_day || '-')
					},
					open_int_day (h,params) {
						return h('span',params.row.open_int_day || '-')
					}
				}
			}
		},
		watch: {
			'type_franch': function (val) {
				this.init_data()
			}
		},
		mounted() {
			this.replaceSearchField()
			this.checkFranchPer()
		},
		beforeDestroy() {
	        this.setStateSearchDetail(false)
	    },
		methods: {
			updateName() {
				this.$Modal.confirm({
					content: '确认更新所选加盟商简称',
					onOk: () => {
						this.$http.post('franchisees/multi_update_short_name', {
							fc_ids: this.s_list.map(item => {
								return item.fc_id
							})
						})
						.then(res => {
							this.$Message.success('更新成功')
						},res => {
							this.error(res.body.message)
						})
					}
				})
			},
			addSelectData(s) {
				this.s_list = s;
			},
			checkFranchPer() {
				if(this.userPers.indexOf(this.per) > -1) {
					this.type_franch = 'all'
				}else{
					if(this.sub_eids.length > 0) {
						this.type_franch = 'dpt'
					}else{
						this.type_franch = 'my'
					}
				}
			},
			add() {
				this.$Modal.open('app/franchisees/archive/info-modal.vue',{
					on: {
						save:() => {
							this.init_data()
						}
					}
				})
				.then(modal => {
					modal.show('添加加盟商')
				})
			},
			editInfo(row) {
				this.$Modal.open('app/franchisees/archive/info-modal.vue',{
					on: {
						save:() => {
							this.init_data()
						}
					}
				})
				.then(modal => {
					modal
					.set('info',row)
					.show(util.sprintf('编辑加盟商【%s】',row.org_name),'edit')
				})
			},
			deleteInfo(row) {
				this.confirm(util.sprintf('确定删除加盟商【%s】吗？',row.org_name))
				.then(() => {
					this.delete(row)
				})
			},
			manageContact(row) {
				this.$Modal.open('app/franchisees/archive/contact-list-modal.vue',{
					props: {
						franchisee: row
					}
				})
				.then(modal => {
					modal
					.show(util.sprintf('加盟商联系人【%s】',row.org_name))
				})
			},
			createContract(row) {
				this.$Modal.open('app/franchisees/contract/info-modal.vue',{
					props: {
						'fc-id': row.fc_id
					},
					on: {
						save:() => {
							this.init_data()
						}
					}
				})
				.then(modal => {
					modal.show(util.sprintf('创建合同【%s】',row.org_name),'add')
				})
			},
			addService(row) {
				this.$Modal.open('app/franchisees/service/info-modal.vue',{
					props: {
						'fc-id': row.fc_id,
						'fc-og-id': row.fc_og_id
					}
				})
				.then(modal => {
					modal.show(util.sprintf('添加服务记录【%s】',row.org_name),'add')
				})
			},
			openOrgModal() {
				this.$r('ref_org').openModal()
			},
			openSystem(row) {
				this.$Modal.open('app/franchisees/system/info-modal.vue',{
					props: {
						franchisee: row
					},
					on: {
						save: () => {
							this.init_data()
						}
					}
				})
				.then(modal => {
					modal.show(util.sprintf('开通校360系统【%s】',row.org_name),'add')
				})
			},
			linkOrgSystem(selected) {
				if(selected.fc_id) {
					this.$Message.error(util.sprintf('校360系统【%s】已关联盟商资料',selected.org_name))
					return
				}
				this.$rest('franchisees').add_url_param(this.current_franchisee.fc_id,'doconnect')
				.post({
					og_id: selected.og_id
				})
				.success(res => {
					this.$Message.success('关联成功')
					this.init_data()
				})
				.error(res => {
					this.error(res.body.message)
				})
			},
			franchiseeDetail(id) {
				this.setStateSearchInfo()
				this.$router.push({path: `/app/franchisees/archive/${id}/service`})
			},
			perScopeChange(value) {
	            this.type_franch = value
	        },
			resetSearch () {
				this.$form('ref_search').reset()
				this.init_data()
			},
			hook_get_param (params) {
				let search_obj = util.copy(this.search_field)
				for(let o in search_obj) {
					let property = search_obj[o]
					if(o=='contract_end_int_day'){
						if(property!=','&&property.length>0){
							params[o] = util.sprintf('[Between,%s]',property.join(','))
						}												
					}else{
						if(property!==''&&property!==-1){
							params[o] = property	
						}		
					}									
				}
				if(this.type_franch=='my') {
					params.service_eid = this.eid$
				}
				else if(this.type_franch=='dpt') {
					params.service_eid = this.sub_eids.join(',')
				}
			}
		}
	}
</script>
