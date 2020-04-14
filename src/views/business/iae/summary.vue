<template>
	<div class="c-grid">
		<div class="box box-query">
			<Form ref="ref_search" :label-width="70" :model="search_field" class="filter-form row">
				<Form-item label="统计报表" prop="type" class="col-md-3 col-sm-6">
					<Select v-model="search_field.type">
						<Option v-for="item in types" :value="item.value">{{item.label}}</Option>						
					</Select>
				</Form-item>
				<Form-item label="时间范围" prop="int_day" class="col-md-3 col-sm-6">
					<date-range-picker v-model="search_field.int_day" style="width:100%"></date-range-picker>
				</Form-item>
			</Form>
			<Row class="basic">
                <Col span="24" class="mt-2" style="margin-left:0px;">  
                    <Button class="ml-2" type="primary" icon="ios-search" @click="search">查询</Button>
                    <Button type="primary" icon="refresh" @click="resetSearch">重置</Button>
	            	<!-- <Button type="primary" size="large" @click="exportExcel('收支汇总')" icon="ios-download-outline" class="ml-2" v-per="'reports.export'">导出</Button> -->
	            	<export-button res="report_tally_by_stats" :params="params"></export-button>
                </Col>
            </Row>
		</div>
		
		<div class="box box-result">
			<div class="content">
				 <div class="content-body">
	                <Table 
	                	ref="tableExcel"
	                    v-loading.like="'tallys'" 
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
		            	<Alert>
		            		<span class="ml-3">收入：
		            			<Tag color="green">{{label_currency}}{{sum.income}}</Tag>
		            		</span>
		            		<span class="ml-3">支出：
		            			<Tag color="yellow">{{label_currency}}{{sum.payout}}</Tag>
		            		</span>
		            		<span class="ml-3">合计：
		            			<Tag color="blue">{{label_currency}}{{sum.sum}}</Tag>
		            		</span>		            		
		            	</Alert>
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
	import dateRangePicker from 'c%/DateRangePicker.vue'
	import ExportButton from 'c%/ExportButton.vue'
	
	export default{
		mixins: [grid,common],
		components: {
			dateRangePicker,
			ExportButton
		},
		data () {
			return {		
				rest_api: 'tallys/do_stats?group=aa_id',
				pk: 'th_id',
				sum: {
					income: 0,
					payout: 0,
					sum: 0
				},
				types: [					
					{ label:'按账户统计', value: 'aa_id' },
					{ label:'按大类统计', value: 'cate' },
					{ label:'按小类统计', value: 'tt_id' },
					{ label:'按往来单位统计', value: 'client_th_id' },
					{ label:'按项目统计', value: 'item_th_id' },
					{ label:'按人员统计', value: 'employee_th_id' },
				],
				search_field: {
					type: 'aa_id',
					int_day: []
				},
				column_keys: {
					aa_id: {
						title: '账户',
						show: true
					},
					cate: {
						title: '大类',
						show: false
					},
					tt_id: {
						title: '类型',
						show: false
					},
					client_th_id: {
						title: '往来单位',
						show: false
					},
					item_th_id: {
						title: '项目',
						show: false
					},
					employee_th_id: {
						title: '人员',
						show: false
					},
					income: {
						title: '收入',
						show: true
					},
					payout: {
						title: '支出',
						show: true
					}					
				},
				column_render:{
					aa_id(h,params) {
						let obj = this.accounts.find(a=>a.aa_id===params.row.aa_id),
							result = '未指定'
						if(obj){
							result = obj.name
						}
						return h('span',result)
					},
					cate (h,params) {
						let map_types = {1:'收入',2:'支出',3:'转账',4:'应收',5:'应付'}
						return h('span',map_types[params.row.cate]||'未指定')
					},
					tt_id (h,params) {
						let obj = this.tally_types.find(t=>t.tt_id===params.row.tt_id),							
							result = '未指定'
						if(obj){
							result = obj.name
						}
						return h('span',result)
					},
					client_th_id (h,params) {
						let obj = this.tally_helps.find(t=>t.th_id===params.row.client_th_id),							
							result = '未指定'
						if(obj){
							result = obj.name
						}
						return h('span',result)
					},
					item_th_id (h,params) {
						let obj = this.tally_helps.find(t=>t.th_id===params.row.item_th_id),							
							result = '未指定'
						if(obj){
							result = obj.name
						}
						return h('span',result)
					},
					employee_th_id (h,params) {
						let obj = this.tally_helps.find(t=>t.th_id===params.row.employee_th_id),							
							result = '未指定'
						if(obj){
							result = obj.name
						}
						return h('span',result)
					},										
				},			
				
			}
		},
		watch: {
			'search_field.type': function (val) {
				this.rest_api = 'tallys/do_stats?group='+val
				this.showColumn(val)
				this.init_data()
			}
		},
		mounted () {
			this.init_data()
		},
		methods: {
			//控制列显示
			showColumn (field) {
				let column_keys = this.column_keys,
					show_list = [field,'income','payout']
				for(let key in column_keys){
					column_keys[key].show = show_list.indexOf(key)>-1					
				}
			},
			deal_data (data) {
				if(data&&data.length>0){
					this.sum.income = 0
					this.sum.payout = 0
					data.forEach(d=>{
						this.sum.income = util.add(this.sum.income,d.income)
						this.sum.payout = util.add(this.sum.payout,d.payout)
					})
					this.sum.sum = util.sub(this.sum.income,this.sum.payout)
				}
				
				return data
			},
			hook_get_param (params) {
				let int_day = this.search_field.int_day
				if(int_day.length>0&&int_day!=','){
					params.int_day = util.sprintf('[Between,%s,%s]',this.search_field.int_day[0],this.search_field.int_day[1])
				}
			},
			resetSearch () {
				this.$form('ref_search').reset()
				this.init_data()
			}
		},
		computed: {
			accounts () {
				return this.$store.state.gvars.accounts
			},
			tally_types () {
				return this.$store.state.gvars.tally_types
			},
			tally_helps () {
				return this.$store.state.gvars.tally_helps
			},
		}
	}
</script>
