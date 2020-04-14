<style lang="less">

.img-thumb img{
	margin-left: 1.3px;
}
.img-thumb{
	width: 60px;
	height:60px;
	line-height: 60px;
	text-align:center;
	border:1px dotted #ccc;
	border-radius:2px;
}
.img-thumb img{
	width:100%;
	height:100%;
	border:none;
}
.ivu-table-cell p {
	margin-bottom: 0;
}
.name-cls {
	padding: 15px 0;
}
.ivu-table-row td:nth-child(4) .ivu-table-cell {
	h4 {
		color: #666;
		line-height: 1.5;
	}
	p {
		color: #999;
		line-height: 1.5;
	}
}
</style>

<template>
    <div class="c-grid">
    	<div class="box box-query">
    		<Form ref="ref_search" :label-width="80" :model="search_field" class="filter-form row">
    			<Form-item label="体验课名称" prop="lesson_name" class="col-md-3 col-sm-6">
    				<Input v-model="search_field.lesson_name" placeholder="请输入名称"></Input>
    			</Form-item>
    			<Form-item label="年份" prop="year" class="col-md-3 col-sm-6">
    				<Select v-model="search_field.year" :clearable="true" size="small">
                        <Option v-for="item in years" :value="item">{{item}}</Option>
                    </Select>
    			</Form-item>
    			<Form-item label="期段" prop="season" class="col-md-3 col-sm-6">
    				<Select v-model="search_field.season" :clearable="true" size="small">
                        <Option v-for="item in dicts('season')" :value="item.name">{{item.title}}</Option>
                    </Select>
    			</Form-item>
    			<Form-item label="校区" prop="bids" class="col-md-3 col-sm-6">
    				<select-branch v-model="search_field.bids" clearable></select-branch>
    			</Form-item>
    		</Form>
    		<Row class="basic">
                <Col span="24" class="mt-2" style="margin-left:0px;">  
                    <Button class="ml-2" type="primary" @click="init_data" icon="ios-search">查询</Button>                   
                	<Button type="primary" icon="refresh" @click="resetSearch">重置</Button>
                	<CheckboxGroup class="ml-2 d-inline" v-model="search_field.status">
                		<Checkbox :label="1" :readonly="readOnly(1,'status')">启用</Checkbox>
                		<Checkbox :label="0" :readonly="readOnly(0,'status')">停用</Checkbox>
                	</CheckboxGroup>
                </Col>
            </Row>           
        </div>
        <div class="box box-result">
        	<div class="toolbar">
        		<Button type="primary" @click="add" icon="plus" v-per="'demolesson.add'">添加体验课</Button>
				<filter-column :keys="column_keys"></filter-column>
        	</div>
        	<div class="content">
				<div class="content-body">
                    <Table 
                    v-loading="'lessons'" 
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
	import util from '@/libs/util'
    import grid from '@/libs/grid.mixin'
    import directive from '@/libs/directive.mixin'
    import globals from '@/libs/globals.mixin'
    import common from '@/libs/common.mixin'
    import SelectMaterial from 'c%/SelectMaterial.vue'
    import selectBranch from 'c%/SelectBranch.vue'
    import ImportButton from 'c%/ImportButton.vue'
    export default {
    	mixins:[common,directive,grid,globals],
    	components: {
    		ImportButton,
    		selectBranch,
    		SelectMaterial
    	},
    	data () {
			return {
				mt_ids: [],
				bind_action: '',
				current_lid: 0,
				search_field: {
					lesson_name: '',
	                year: '',
	                season: '',
	                bids: [],
	                lesson_type: [0,1,2],
	                status: [1],
	                is_demo: 1
	            },
				rest_api:'lessons',
				pk: 'lid',
				datakey: 'lesson',
				column_keys: {
					lesson_cover_picture: {
						title: '封面',
						width: 100,
						show: true
					},
					lesson_name: {
						title: '课程',
						width: 300,
						show: true
					},
					lesson_type: {
						title: '授课方式',
						show: true
					},
					charge:{
						title:'收费',
						show:true
					},
					unit_price: {
						title: '单价',
						sortable: 'custom',
						show: false
					},
					sale_price: {
						title: '售价',
						sortable: 'custom',
						show: false
					},
					sj_ids: {
						title: '科目',
						show: true
					},
					fit_grade:{
						title:'适用年级',
						show:true
					},
					price_type: {
						title: '收费模式',
						show: false
					},
					is_term: {
						title: '按期收费',
						show: false
					},
					bids: {
						title: '校区',
						show: true
					},
					year:{
						title:'年份',
						show:false
					},
					season:{
						title:'期段',
						show:false
					},
					status: {
						title: '状态',
						show: true
					}
				},
				operation_keys: {
					edit: {
						title: '编辑',
						type: 'edit',
						per: 'demolesson.edit',
					},
					delete: {
						title: '删除',
						type: 'ios-trash',
						per: 'demolesson.delete'
					}
				},
				operation_func: {
					edit(params) {						
						let lesson = util.copy(params.row)
						lesson.unit_lesson_minutes = parseFloat(params.row.unit_lesson_minutes)
						lesson.unit_price = parseFloat(params.row.unit_price)
						lesson.sale_price = parseFloat(params.row.sale_price)
						lesson.as_class_nums = parseInt(params.row.as_class_nums)
						lesson.lesson_nums = parseFloat(params.row.lesson_nums)
						lesson.unit_lesson_hours = parseFloat(params.row.unit_lesson_hours)
						this.$Modal.open('system/basic/lesson/info-modal.vue',{
							on:{
								save:()=>{
									this.init_data()
								}
							}
						})
						.then(modal=>{
							modal.set('info',lesson)
							.show(
								util.sprintf("编辑体验课:%s",lesson.lesson_name),
								'edit'
							)
						})
					},
					bind(params) {
						this.mt_ids.splice(0,this.mt_ids.length)
						this.current_lid = params.row.lid
						let lesson_material = params.row.lesson_material
						this.bind_action = 'post'
						this.$r('select_material').openModal()
					},
					clear_bind(params) {
						let m = '',
							lesson_material = params.row.lesson_material
						lesson_material.forEach(item => {
							m += util.sprintf("%s%s%s，",item.name,item.pivot.default_num,item.unit)
						})
						this.confirm(`该课程已绑定物品：${m}确定解除绑定吗？`)
						.then(() => {
							this.$rest('lessons')
							.delete(params.row.lid+'/materials')
							.success(res => {
								this.$Message.success('解绑成功')
								this.init_data()
								this.$store.dispatch('updateGlobalVar','lessons')
							})
							.erro(res => {
								this.$Message.erro(res.body.message)
							})
						})
						.catch(() => {})
					},
					delete(params) {
						this.confirm(util.sprintf('确定要删除课程【%s】吗?',params.row.lesson_name))
						.then(()=>{
							this.$rest('lessons')
							.delete(params.row.lid)
							.success(response=>{
								this.init_data()
								this.$store.dispatch('updateGlobalVar','lessons')
							})
							.error(response=>{
								this.error(response.body.message)
							})
						})
					}
				},
				column_render: {
					lesson_cover_picture(h, params) {
						let url = ''
						url = params.row.lesson_cover_picture ? params.row.lesson_cover_picture : '/static/img/default_lesson_cover.jpg'
						return h('div', {
							attrs: {
								class: 'img-thumb'
							}
						} ,[
							h('img', {
								attrs: {
									src: url
								}
							})
						])
					},
					//收费综合
					charge(h,params){
						let unit_map = ['期','次','课时','月']
						let unit_type = params.row.is_term?0:params.row.price_type
						let unit = unit_map[unit_type]
						let text = util.sprintf("按%s收费,%s元/%s",unit,params.row.sale_price,unit)
						let c = []
						let unit_price = params.row.unit_price
						c.push(h('p',text))
						if(params.row.is_term){
							unit = unit_map[params.row.price_type]
							unit_price = parseFloat(params.row.sale_price / params.row.lesson_nums).toFixed(2)
							text = util.sprintf("共%s%s,单价:%s元/%s",params.row.lesson_nums,unit,unit_price,unit)
							c.push(h('p',text))
						}

						return h('div',{
							attrs:{
								class:'lesson-charge'
							}
						},c)
					},
					unit_price(h , params) {
						let unit = ''
						let map = {1:'元/课次', 2:'元/课时', 3:'元/月'}
						unit = params.row.is_term ? '元/期' : map[params.row.price_type]
						return h('div', [
							this.label_currency,
							`${params.row.unit_price} ${unit}`
						])
					},
					sale_price(h, params) {
						return h('div', [
							this.label_currency,
							`${params.row.sale_price} 元`
						])
					},
					lesson_name(h, params) {
						let c = []
						let c1 = []
						let filter = this.$filter('dict_title')
						c1.push(h('span',params.row.lesson_name))
						
						c.push(h('h4',c1))
						if(params.row.product_level_did > 0){
							c.push(h('p','课程级别:'+filter(params.row.product_level_did,'product_level')))
						}
						return h('div', {
							attrs: {
								class: 'name-cls'
							}
						},c)
					},
					is_package(h, params) {
						let map = {0:'否',1:'是'}
						return h('div', map[params.row.is_package])
					},
					sj_ids(h, params) {
						return h('div',this.$filter('sj_ids_text')(params.row.sj_ids))
					},
					mt_id(h, params) {
						let material = params.row.lesson_material
						let m = []
						if(material.length > 0) {
							material.forEach(item => {
								m.push(h('p',util.sprintf("%s:%s%s",item.name,item.pivot.default_num,item.unit)))
							})
						}else{
							m = '-'
						}
						return h('div',m)
					},
					lesson_type(h, params) {
						let c = []
						c.push(h('p',this.$filter('lesson_type')(params.row.lesson_type)))
						if(params.row.price_type != 3){
							c.push(h('p',util.sprintf("单次课时长:%s分钟",params.row.unit_lesson_minutes)))
							c.push(h('p',util.sprintf("每次课消耗:%s课时",params.row.unit_lesson_hours)))
						}

						return h('div',c)
					},
					price_type(h, params) {
						return h('div',this.$filter('price_type')(params.row.price_type))
					},
					is_term(h, params) {
						if(!params.row.is_term) {
							return h('div','否')
						}else{
							let result = params.row.lesson_nums
							let map = {1:'课次',2:'课时'}
							return h('div', result+map[params.row.price_type]+'/期')
						}
					},
					status(h,params) {
						return h('span',params.row.status===1?'启用':'停用')
					}
				}
			}
		},
		created(){
			if(!this.enable_grade){
				delete this.column_keys['fit_grade']
			}
		},
		mounted () {			
			this.init_data()
		},
		methods: {
			readOnly (val,field) {
				let arr = this.search_field[field]
				if(arr.length===1&&arr[0]===val){
					return true
				}
				return false
			},
			showChapter (row) {
				
			},
			add () {
				this.$Modal.open('system/basic/lesson/info-modal.vue',{
					props: {
						'is-demo':1
					},
					on:{
						save:()=>{
							this.init_data()
						}
					}
				})
				.then(modal=>{
					modal
					.show(
						'添加体验课'
					)
				})
				
			},
			hook_get_param (params) {
				let search_obj = util.copy(this.search_field)				
				for(let o in search_obj) {
					let property = search_obj[o]	
					if(o=='bids'){
						if(property.length>0){
							params[o] = String(property)						
						}else if(!this.is_admin){
							params[o] = String(this.bids_user)
						}
					}else if(o=='lesson_type'){
						if(property!=','&&property.length>0){
							params[o] = util.sprintf('[In,%s]',property.join(','))
						}	
					}else if(o=='status') {
						params[o] = util.sprintf('[In,%s]',property.join(','))
					}
					else if(property!=''){
						params[o] = property
					}
				}
			},
			resetSearch () {
				this.$r('ref_search').resetFields()
				this.init_data()
			},
			bindMaterial(selected) {
				let materials = []
				selected.forEach(item => {
					materials.push({
						lid: this.current_lid,
						mt_id: item.mt_id,
						default_num: item.bind_num
					})
				})
				this.$rest('lesson_materials').
				post({data:materials,action:this.bind_action})
				.success(response => {
					this.$Message.success('绑定成功')
					this.init_data()
					this.$store.dispatch('updateGlobalVar','lessons')
				})
				.error(response => {
					this.error(response.body.message)
				})
			}
		},
		computed: {
			years() {
				let now = (new Date()).getFullYear()
				return [now+2, now+1, now, now-2, now-1]
			}
		}
    }
</script>