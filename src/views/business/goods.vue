<template>
    <div class="c-grid">
    	<div class="box box-query">
    		<Row class="basic">
                <Col span="6">
                    <Input class="input-search" size="small" v-model="params.search_value" v-focusme="'searchkey'">
                        <Select v-model="params.search_field" slot="prepend" style="width: 80px;">
                            <Option value="name">物品名称</Option>
                        </Select>
                        <Button 
                        	slot="append" 
                        	icon="ios-search" 
                        	v-tooltip="'查询'" 
                        	@click="search" 
                        	style="padding: 6px 15px;">
                        </Button>                    
                    </Input>
                </Col>
                <Col span="2">
                    <Button type="primary" icon="refresh" @click="resetSearch">重置</Button>
                </Col>
           </Row>    		
    		
    	</div>
    	
    	<div class="box box-result">
    		<div class="toolbar">	
				<filter-column :keys="column_keys"></filter-column>
			</div>
    		<div class="content">
    			<div class="content-body">
		            <Table 		            	
		            	v-loading.like="'material'" 
		            	:data="data" 
		            	:border="true" 
		            	:stripe="true" 
		            	:page="pageIndex" 
		            	:columns="columns" 
		            	:show-header="true" 
		            	:page-size="pageSize" 
		            	:no-data-text="$store.state.config.EMPTY_DATA_TEXT" 
		            	:no-filtered-data-text="$store.state.config.EMPTY_FILTER_DATA_TEXT" 
		            	@on-sort-change="sortChange"> 
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
	import directive from '@/libs/directive.mixin'
	export default{
		mixins: [grid,directive,common,globals],
		components: {
		},
		data () {
			return {
				rest_api: 'material',
				pk: 'mt_id',
				search_field: {
					name: ''
				},
				column_keys: {
					name: {
						title: '物品名称',
						show: true
					},
					unit: {
						title: '计量单位',
						show: true
					},
					desc: {
						title: '描述',
						show: true
					},
					image: {
						title: '图片',
						show: true
					},
					qty: {
						title: '数量',
						show: true
					},
					purchae_price: {
						title: '进货价',
						show: true
					},
					sale_price: {
						title: '销售价',
						show: true
					},
				},
				column_render: {
					
				}
			}
		},
		mounted () {
			this.init_data()
		},
		methods: {
			hook_get_param (params) {
				params.with = 'student,cls'
				let search_obj = util.copy(this.search_field)				
				for(let o in search_obj) {
					let property = search_obj[o]
					if(o=='int_day'){
						if(property!=','&&property.length>0){
							params[o] = util.sprintf('[Between,%s]',property.join(','))
						}												
					}else if (o=='is_pay'){
						if(property.length>0){
							params[o] = util.sprintf('[In,%s]',property.join(','))
						}
					}else{					
						if(property&&property!='-1'){
							params[o] = property
						}
					}
				}
			},
			resetSearch () {
				this.$r('ref_search').resetFields()
				this.search_field.is_pay = [0,1]
				this.init_data()
			}
		},
		computed: {
			subjects () {
				return this.$store.state.gvars.subjects
			}
		}
	}
	
</script>
