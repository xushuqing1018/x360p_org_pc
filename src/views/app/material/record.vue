<template>
	<div>
		<Form ref="ref_search" :model="search_field" :label-width="60" class="filter-form row">
			<Form-item label="物品" prop="mt_id" class="col-sm-4" v-if="type_record=='all'">
				<select-material v-model="search_field.mt_id" @selected="search"></select-material>
			</Form-item>
			<Form-item label="日期" prop="int_day" class="col-sm-4">
				<date-range-picker 
					v-model="search_field.int_day" 
					@on-change="search" 
					placement="right-start"
					:transfer="true"
					style="width: 100%">
				</date-range-picker>
			</Form-item>
			<Form-item label="类型" prop="type" class="col-sm-4">
				<Select v-model="search_field.type">
					<Option :value="-1">不限</Option>
					<Option :value="1">入库</Option>
					<Option :value="2">出库</Option>
				</Select>
			</Form-item>
		</Form>
		<Row class="mt-2">
			<Col span="24">
				<Button class="ml-2" type="primary" size="small" @click="search" icon="ios-search">查询</Button>
				<Button type="primary" size="small" icon="refresh" @click="resetSearch">重置</Button>
				<export-button res="material_historys" :params="params" size="small"></export-button>
				<ButtonGroup class="pull-right">
					<Button type="primary" size="small" @click="back" icon="reply" v-if="type_record=='all'"></Button>
					<Button type="primary" size="small" @click="ignoreMtid" v-else>查看所有记录</Button>
				</ButtonGroup>
			</Col>
		</Row>
		<div class="box box-result">
    		<div class="toolbar">	
				<filter-column :keys="column_keys"></filter-column>
			</div>
    		<div class="content">
    			<div class="content-body">
					<Table 
					v-loading.like="'material_historys'" 
					:page="pageIndex" 
					:page-size="pageSize" 
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
					<div class="clearfix">
						<Page 
							size="small"
							class="pull-right mt-3"
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
	</div>
</template>

<script>
	import util from '@/libs/util'
	import grid from '@/libs/grid.mixin'
	import common from '@/libs/common.mixin'
	import globals from '@/libs/globals.mixin'
	import SelectMaterial from 'c%/SelectMaterial.vue'
	import DateRangePicker from 'c%/DateRangePicker.vue'
	import ExportButton from 'c%/ExportButton.vue'
	
	export default{
		mixins: [grid,common,globals],
		components: {
			SelectMaterial,
			DateRangePicker,
			ExportButton
		},
		props: {
			mtId: {
				type: [Number,String],
				default: () => {
					return 0
				}
			}
		},
		data () {
			return {
				rest_api: '',
				pk: 'mh_id',
				key: '',
				search_field: {
					int_day: [],
					type: -1,
					mt_id: 0
				},
				type_record: '',
				column_keys: {
					mt_id: {
						title: '物品',
						show: true
					},
					name: {
						title: '仓库名',
						show: true
					},
					int_day: {
						title: '日期',
						show: true,
						sortable:true
					},
					type: {
						title: '类型',
						show: true,
						sortable:true
					},
					cate: {
						title: '分类',
						show: true
					},
					num: {
						title: '数量',
						show: true
					},
					remark: {
						title: '备注',
						show: true
					},
					eid:{
						title: '经手人',
						show: false
					},
					operate: {
						title: '操作',
						show: true
					}
				},
				column_render: {
					mt_id(h,params) {
						let result = '-'
						let material = params.row.material
						if(material) {
							result = material.name
						}
						return h('span',result)
					},
					name(h,params) {						
						return h('span',params.row.material_store.name)
					},
					int_day(h,params) {
						return h('span',this.$filter('int_date')(params.row.int_day))
					},
					type(h,params) {
						let map = {1:'入库',2:'出库'}
						return h('span',map[params.row.type])
					},
					cate(h,params) {
						let map = {1:'进货',2:'领用',3:'调拨',4:'破损',5:'报名下单'}
						return h('span',map[params.row.cate])
					},
					num(h,params) {
						let tag = {color:'green',label:'+ '+params.row.num}
						if(params.row.type===2){
							tag.color = 'yellow'
							tag.label = '- '+params.row.num
						}
						
						return h('Tag',{
							props: {
								color: tag.color
							}
						},tag.label)
					},
					eid(h,params){
						return h('span',this.$filter('ename')(params.row.eid,'-'))  
					},
					operate (h,params) {
						return h('Button',{
							props: {
								type: 'ghost',
								shape: 'circle',
								icon: 'ios-trash'								
							},
							attrs: {
								title: '撤销'
							},
							on: {
								click: ()=>{
									this.delInfo(params.row)
								}
							}
						})
					}
				}
			}
		},
		watch: {
			mtId: function (val) {				
				if(val > 0){
					this.rest_api = 'material_historys'
					this.init_data()					
				}
			}
		},
		methods: {
			ignoreMtid() {
				this.type_record = 'all'
				this.search()
			},
			back() {
				this.type_record = ''
				this.search()
			},
			delInfo (row) {
				this.confirm('确定撤销本条记录？')
				.then(()=>{
					this.delete(row).then(()=>{
						this.$emit('on-success')
					})					
				})
			},
			hook_get_param(params){
	       		let search_obj = util.copy(this.search_field)
				for(let o in search_obj) {
					let property = search_obj[o]
					if(o=='int_day'){
						if(property!=','&&property.length>0){
							params[o] = util.sprintf('[Between,%s]',property.join(','))
						}												
					}else{		
						if(property&&property!='-1'){
							params[o] = property
						}
					}
				}
				params.with = 'material'

				if(this.type_record=='' && this.mtId>0) {
					params.mt_id = this.mtId					
				}
	        },
			resetSearch () {
				this.$r('ref_search').resetFields()
				this.init_data()
			}
		},
		computed: {
			filter_data () {
				let material_key = this.key,
					data = this.data
				
				if(!/^\s*$/.test(material_key)){
					return data.filter(s=>s.material_store&&s.material_store.name.indexOf(material_key)>-1)
				}				
				return data	
			}
		}
	}
</script>

<style>
</style>