<template>
	<div class="c-grid">
		<div class="box box-result">
			<Button type="primary" icon="plus" @click="addInfo" class="mb-3" v-per="'payaccount.add'">
				添加新账户
				<help-info ref="info" @on-success="init_data"></help-info>
			</Button>
			<div class="content">
				 <div class="content-body">
	                <Table 
	                    v-loading="'accounting_accounts'"
	                    ref="tableExcel"
	                    :page-size="pageSize" 
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
		                    <Page :total="total" 
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
	</div>
</template>

<script>
	import util from '@/libs/util'
	import grid from '@/libs/grid.mixin'
	import common from '@/libs/common.mixin'
	import globals from '@/libs/globals.mixin'
	import helpInfo from 'v%/business/iae/accounting-info.vue'
	
	export default{
		mixins: [grid,common,globals],
		components: {
			helpInfo
		},
		data () {
			return {
				rest_api: 'accounting_accounts',
				pk: 'aa_id',
				map_type: {0:'现金',1:'银行存款',2:'电子钱包',3:'应收款（债权）',4:'应付款（债务）'},
				search_field: {
					type: -1,
					name: ''
				},
				column_keys: {
					name: {
						title: '名称',
						show: true
					},
					type: {
						title: '类别',
						show: true
					},
					cp_id: {
						title: '支付配置',
						show: true
					},
					bids: {
						title: '校区',
						show: true
					},
					is_front: {
						title: '前台账户',
						show: true
					},
					th_id: {
						title: '往来账户',
						show: true
					},
					amount: {
						title: '余额',
						show: true
					},
					fee_rate:{
						title:'收款费率',
						show:true
					},
					remark: {
						title: '备注',
						show: true
					},
					operate: {
						title: '操作',
						show: true
					}
				},
				column_render:{
					type (h,params) {
						return h('span',this.map_type[params.row.type])
					},
					cp_id (h,params) {
						let result = '-'
						let list = this.$store.state.gvars.config_pay
						if(params.row.cp_id>0){
							let obj = list.find(l=>l.cp_id==params.row.cp_id)
							if(obj){
								result = obj.name
							}
						}
						
						return h('span',result)
					},
					bids (h,params) {
						let bids = params.row.bids,
							result = ''
						if(bids.length>0){
							bids.forEach(b=>{
								result += this.$filter('branch_name')(b)+','
							})
							result = result.substring(0,result.length-1)
						}else{
							result = '【公用】'
						}
						
						return h('span',result)
					},
					is_front (h,params) {
						let map = {0:'否',1:'是'}
						return h('span',map[params.row.is_front])
					},
					th_id (h,params) {
						if(params.row.th_id>0){
							return h('span',params.row.tally_help.name)
						}
						return h('span','-')
					},
					operate (h,params) {
						let edit = h('Button',{
								class: 'mr-2',
								props: {
									type: 'text',
									size: 'small',
									icon: 'edit'								
								},
								directives: [{
									name:'per',
									value:'payaccount.edit'
								}],
								on: {
									click: ()=>{
										this.editInfo(params.row)
									}
								}
							}),
							del = h('Button',{
								props: {
									type: 'text',
									size: 'small',
									icon: 'ios-trash'								
								},
								directives: [{
									name:'per',
									value:'payaccount.delete'
								}],
								on: {
									click: ()=>{
										this.delInfo(params.row)	
									}
								}
							})
						if(params.row.is_default===1){
							return ''
						}else{
							return h('div',[edit,del])
						}
					}
				},
			}
		},
		watch: {
			'search_field.type': function (val) {
				this.init_data()
			}
		},
		mounted () {
			this.init_data()
		},
		methods: {			
			resetSearch () {
				this.$form('search_form').reset()
				this.init_data()
			},
			hook_get_param (params) {
				if(this.search_field.type!=-1){
					params.type = this.search_field.type					
				}
				if(this.search_field.name.length>0){
					params.name = this.search_field.name
				}
				
			},
			addInfo () {
				this.$r('info')
				.show('添加账户','add')
			},
			editInfo (row) {				
				row.start_amount = parseInt(row.start_amount)
				row.amount = parseInt(row.amount)
				
				this.$r('info')
				.set('info',row)
				.show('修改账户【'+row.name+'】','edit')
			},
			delInfo (row) {
				let tip = util.sprintf('确认删除%s【%s】吗？',this.map_type[row.type],row.name)
				
				this.confirm(tip)
				.then(()=>{
					this.delete(row)
				})
			}
		},
		computed: {
		}
	}
</script>
