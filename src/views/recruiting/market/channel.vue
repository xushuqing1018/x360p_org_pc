<template>
	<div class="c-grid">
		<div class="box box-query">
			<Form ref="ref_search" :model="search_field" :label-width="70" class="filter-form row"> 
                <FormItem label="渠道名称" class="col-md-3 col-sm-6" prop="channel_name">
                   <Input v-model="search_field.channel_name" placeholder="请输入渠道名称"></Input>
                </FormItem>
                <FormItem label="创建时间" class="col-md-3 col-sm-6" prop="channel_name">
                   <date-range-picker 
                    	v-model="search_field.create_time" 
                    	@on-change="search"  
                    	label="选择日期" 
                    	placement="bottom"
                    	style="width:100%">
					</date-range-picker>
                </FormItem>
                 <FormItem label="渠道类型" class="col-md-3 col-sm-6" prop="is_share">
                	<Select v-model="search_field.is_share" @on-change="search">
                		<Option :value="-1">不限</Option>
                		<Option :value="1">共享渠道</Option>
                		<Option :value="0">非共享渠道</Option>
                	</Select>
                </FormItem>
			</Form>
			<Row class="basic">
                <Col span="24" class="mt-2" style="margin-left:0px;">
                	<Button type="primary" icon="ios-search" v-tooltip="'查询'" @click="search">查询</Button>                       
                    <Button type="primary" icon="refresh" class="ml-2" @click="resetSearch">重置</Button>

                    <export-button res="market_channels" :params="params"></export-button>
					
                    <div class="pull-right">
                        <per-scope per="channel.all" @on-change="perScopeChange"></per-scope>
                    </div>
                </Col>
            </Row>
		</div>
		
		<div class="box box-result">
			<div class="toolbar">
				<select-channel ref="channel" style="display:inline-block;width:unset" @on-success="init_data">
					<Button type="primary" icon="plus" @click="addInfo" v-per="'channel.add'">新增渠道</Button>
				</select-channel>
				<Dropdown trigger="click">
					<Button 
						type="primary" 
						icon="more" 
						:disabled="s_channel.length==0" 
						title="先勾选渠道，可连续对渠道进行操作"
						>
						批量操作&nbsp;{{s_channel.length}}
					</Button>
					<DropdownMenu slot="list">
						<DropdownItem @click.native="mergeChannel"><Icon type="merge"></Icon> 合并渠道</DropdownItem>
					</DropdownMenu>
				</Dropdown>
			</div>
			<div class="content">
				<div class="content-body">
		            <Table 
		            	v-loading="'market_channels'"
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
						@on-selection-change="addSelectData"> 
		            </Table>
		        </div>
		        <div class="content-footer">
		            <div class="pagenation">
		                <Page
		                	:transfer="true"
		                	:total="total" 
		                	:current="pageIndex" 
		                	:show-sizer="true" 
		                	:page-size="pageSize" 
		                	:show-total="true" 
		                	@on-change="pagenation" 
		                	@on-page-size-change="pagesize">
		                </Page>
		            </div>
		        </div>
			</div>
		</div>
		<info-modal ref="info" @on-success="init_data"></info-modal>
		<import-button class="hide" ref="market_clues" res="market_clues" :params="marketParams" name="市场名单" @on-import-finish="init_data" v-per="'market.import'"></import-button>	
	</div>
</template>

<script>
	import util,{_} from '@/libs/util'
	import grid from '@/libs/grid.mixin'
	import common from '@/libs/common.mixin'
	import globals from '@/libs/globals.mixin'
	
	import InfoModal from './info-modal.vue'
	import SelectChannel from 'c%/SelectChannel.vue' 
	import ImportButton from 'c%/ImportButton.vue'
	import DateRangePicker from 'c%/DateRangePicker.vue'
	import ExportButton from 'c%/ExportButton.vue'
	
	export default{
		mixins: [ grid,common,globals ],
		components: {
			InfoModal,
			ImportButton,
			SelectChannel,
			DateRangePicker,
			ExportButton
		},
		data () {
			return {
				rest_api: 'market_channels',
				pk: 'mc_id',
				type_channel: '',
				s_channel: [],
				current_mc_id: 0,
				showCheckbox: true,
				search_field: {
					is_share: -1,
					channel_name: '',
					create_time: []
				},
				column_keys: {
					channel_name: {
						title: '渠道名称',
						show: true
					},
					status: {
						title: '状态',
						show: true
					},
					from_did: {
						title: '对应招生来源',
						show: true
					},
					total_num: {
						title: '名单总数',
						show: true
					},
					valid_num: {
						title: '有效数量',
						show: true
					},
					visit_num: {
						title: '上门数量',
						show: true
					},
					deal_num: {
						title: '成交数量',
						show: true
					},
					create_uid: {
						title: '创建人',
						show: true
					},
					create_time: {
                        title: '创建时间',
                        show: true,
					}
				},
				column_render: {
					channel_name (h,params) {
						let result = []
						
						if(params.row.is_share == 1){
							result.push(h('Tag',{
								attrs: {									
									title: '共享渠道'
								},
								props: {
									color: 'blue'
								}
							},'共'))
						}
						
						result.push(h('span',params.row.channel_name))
						
						return h('div',result)
					},
					from_did(h,params) {
						return h('span',this.labelDicts(params.row.from_did,'from')||'-')
					},
					status(h,params) {
						return h('span',{
							style: {
								color: params.row.status == 1?'#42b983':'#e96900'
							}
						},params.row.status == 1?'开启':'关闭')
					},
					create_uid(h,params) {
						let result = '-'
						if(params.row.employee) {
							result = params.row.employee.ename
						}
						return h('span',result)
					}
				},
				operation_keys: {
					edit:{
						title: '编辑',
						type: 'edit',
						per: 'channel.edit',
						condition: 'row.create_uid == ' + this.$store.state.user.info.employee.uid+'||1=='+this.$store.state.user.info.is_admin
					},
					add: {
						title: '录入',
						type: 'plus',
						per: 'channel.addclue',
						condition: 'row.status == 1'
					},
					import: {
						title: '批量导入',
						type: 'upload',
						per: 'channel.importclue',
						condition: 'row.status == 1'
					},
					qrcode: {
						title: '扫码录入',
						type: 'qr-scanner',
						per: 'channel.scannerclue',
						condition: 'row.status == 1'
					},
					del: {
						title: '删除',
						type: 'ios-trash',
						per: 'channel.delete',
						condition: 'row.create_uid == ' + this.$store.state.user.info.employee.uid+'||1=='+this.$store.state.user.info.is_admin
					}
				},
				operation_func: {
					edit (params) {
						this.editInfo(params.row)
					},
					add (params) {
						this.addClue(params.row)
					},
					import (params) {
						this.importClue(params.row)
					},
					qrcode (params) {
						this.showQR(params.row)
					},
					del (params) {
						this.delInfo(params.row)
					}
				}
			}
		},
		watch: {
			'type_channel': function (val) {
				this.init_data()
			}
		},
		computed: {
			marketParams () {
				return 'mc_id='+this.current_mc_id
			}
		},
		methods: {
			mergeChannel() {
				if(this.s_channel.length < 2) {
					this.$Message.warning({
						content: '请选择至少两条渠道！'
					})
					return false;
				}
				this.$Modal.open('recruiting/market/merge-modal.vue',{
					props: {
					},
					on:{
						'on-success':()=>{
							this.init_data()
						}
					}
				}).then(modal=>{
					modal.set('channel',this.s_channel)
					.show('选择要合并到的渠道','view')
				})
			},
			addSelectData(s) {
				this.s_channel = s;
			},
			showQR (row) {
				this.$Modal.open('recruiting/market/qr-modal.vue',{
					on: {
						'on-success': ()=>{
							this.init_data()
						}
					}
				})
				.then(modal=>{
					modal
					.set('info',row)
					.set('mc_id',row.mc_id)
					.show(`【${row.channel_name}】的二维码`)
				})
			},
			perScopeChange(value) {
                this.type_channel = value
            },
			addInfo () {
				this.$refs.channel.show('新增渠道','add')
			},
			editInfo (row) {
				let title = util.sprintf('编辑渠道【%s】',row.channel_name)
				
				this.$refs.channel
				.set('info',row)
				.show(title,'edit')
			},
			addClue (row) {				
				this.$refs.info
				.set('mc_id',row.mc_id)
				.show('添加名单','add')
			},
			delInfo (row) {
				let tip = util.sprintf('确认删除【%s】渠道吗？',row.channel_name)
				this.confirm(tip).then(()=>{
					this.delete(row)
				})
			},
			importClue (row) {
//				console.log('row.mc_id')
//				console.log(row.mc_id)
//				
				this.current_mc_id = row.mc_id
				setTimeout(()=>{
					this.$refs.market_clues.bat_add()					
				},200)
			},
			deal_data (data) {
				//更新来源渠道选择组件数据
//				this.$refs.channel.init_data()
				
				return data.list
			},
			resetSearch () {
				this.$r('ref_search').resetFields()
				this.init_data()
			},
			hook_get_param (params) {
				let search_obj = util.copy(this.search_field),
					uid = this.$store.state.user.info.uid
				
				if(this.type_channel=='my'){
					params.create_uid = uid
				}else{
					delete params.create_uid
				}
				
				
				for(let o in search_obj) {
					let property = search_obj[o]
					
					if(o == 'is_share'){
						if(property !== -1){
							params[o] = property
						}
					}else if(o == 'create_time'){
						if(property != ',' && property.length > 0){
	                        params[o] = util.sprintf('[Between,%s]',property.join(','))
	                    } 
					}else{
						if(property){
							params[o] = property
						}	
					}
				}
			},
		}
	}
</script>

<style>
</style>