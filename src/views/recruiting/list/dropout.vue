<template>
	<div class="c-grid">
		<div class="box box-query">
			<Form ref="ref_search" :model="search_field" :label-width="70" class="filter-form row">
				<Form-item label="学员姓名" prop="student_name" class="col-md-3 col-sm-6">
					<Input v-model="search_field.student_name" placeholder="请输入学员姓名 / 拼音" @keyup.native.enter="search"></Input>
				</Form-item>
				<Form-item label="英文名" prop="nick_name" class="col-md-3 col-sm-6">
					<Input v-model="search_field.nick_name" placeholder="请输入昵称 / 英文名"></Input>
				</Form-item>
				<Form-item label="手机号" prop="first_tel" class="col-md-3 col-sm-6">
					<Input v-model="search_field.first_tel" placeholder="请输入手机号"></Input>					
				</Form-item>					
			</Form>
			<Row class="basic">
                <Col span="6" class="mt-2" style="margin-left:0px;">                	
                	<Button-group>
                        <Button class="ml-2" type="primary" @click="search" icon="ios-search">查询</Button>
                    </Button-group>
                	<Button type="primary" icon="refresh" @click="resetSearch">重置</Button>  
                	<export-button res="drops" :params="params" v-per="'customer.export'"></export-button>
                </Col>
           </Row>			
		</div>
		<div class="box box-result">
			<div class="toolbar">		
				<RadioGroup v-model="data_mode" type="button">
			        <Radio label="list"><Icon type="navicon"></Icon>　列表</Radio>
			        <Radio label="avatar"><Icon type="image"></Icon>　头像</Radio>
			    </RadioGroup>
				<filter-column :keys="column_keys"></filter-column>
			</div>
			<div class="content">
				<div class="content-body">
		            <Table 
		            	v-show="data_mode=='list'"
		            	ref="tableExcel"
		            	v-loading="'students'" 
		            	:data="data" 
		            	:stripe="true" 
		            	:page="pageIndex" 
		            	:columns="columns" 
		            	:show-header="true" 
		            	:page-size="pageSize" 
		            	:no-data-text="$store.state.config.EMPTY_DATA_TEXT" 
		            	:no-filtered-data-text="$store.state.config.EMPTY_FILTER_DATA_TEXT" 
		            	@on-sort-change="sortChange"> 
		            </Table>
		            
		            <div class="row" v-show="data_mode=='avatar'">
		            	<div class="col-lg-2 col-md-3 col-sm-4 mb-3 padder-sm" v-for="(item,index) in data">
			            	<Card dis-hover>
			            		<div slot="title" class="clearfloat">
			            			<Button type="text" icon="ios-telephone">{{item.first_tel||item.second_tel}}</Button>			            			
			            		</div>	
			            		<div class="text-center">		            			
			            			<letterAvatar 
			            				title="点击查看详情"
			            				size='120' 
			            				:src="item.photo_url" 
			            				:name='item.student_name' 
			            				@click.native="studentDetail(item.sid)" 
			            				:rounded=true>
				            		</letterAvatar>		
							    
			            			<h5 class="mt-2">
			            				<a @click="studentDetail(item.sid)">
											<Icon :type="item.sex=='1'?'man':'woman'"></Icon>
											{{item.student_name}}
										</a>
										<Tag color="blue">
											{{getAge(item.birth_time)}}
											<span v-if="!item.birth_time">？</span>
										</Tag>
									</h5>
			            		</div>
			            	</Card>
		            	</div>
		            </div>
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
		                	:page-size-opts="pageSizeOptions">
		                </Page>
		            </div>
		        </div>
			</div>
		</div>	
	</div>
</template>

<script>
	import Vue from 'vue'
	import util from '@/libs/util'
	import $rest from '@/libs/rest'
	import grid from '@/libs/grid.mixin'
	import common from '@/libs/common.mixin'
	import globals from '@/libs/globals.mixin'
	import letterAvatar from 'c%/LetterAvatar.vue'
	import DateRangePicker from 'c%/DateRangePicker.vue'

	import ExportButton from 'c%/ExportButton.vue'
	
	export default{
		mixins: [grid,globals,common],
		components: {
			letterAvatar,
			DateRangePicker,
			ExportButton
		},
		data () {
			return {
				rest_api: 'students?status=90',
				pk: 'sid',
				data_mode: 'list',
				showIndex: false,
				search_field: {
					student_name: '',
					nick_name: '',
					first_tel: '',
				},
				column_keys: {
					row_number: {
						type: 'index',
						title:'#',
	                    width: 60,
	                    align: 'center',
	                    disabled:true
					},
					student_name: {
						title: '姓名',
						width: 150,
						show: true,
						disabled:true
					},
					sex: {
						title: '性别',
						show: false
					},
					age: {
						title: '年龄',
						show: true
					},
					status: {
						title: '状态',
						show: true
					},
					quit_reason: {
						title: '退学原因',
						show: true
					},
					sno: {
						title: '学号',
						show: false
					},					
					nick_name: {
						title: '英文名/昵称',
						show: false
					},
					first_tel: {
						title: '手机号',
						show: true
					},
					first_family_rel: {
						title: '关系/姓名',
						show: true
					},
					second_tel: {
						title: '第二电话',
						show: false
					},
					second_family_rel: {
						title: '关系/姓名',
						show: false
					},
					school_id_text: {
						title: '公立学校',
						show: false
					},
					shool_grade: {
						title: '年级',
						show: false
					},
					school_class: {
						title: '班级',
						show: false
					}
				},
				column_render: {					
					student_name (h,params) {
						let map = {0:{icon:'help',text:'-'},1:{icon:'male',text:'男'},2:{icon:'female',text:'女'}}
						return h('avatar-and-name',{
								attrs: {
									class: 'x-a-link text-info'
								},
								on: {
									click: ()=>{
										this.studentDetail(params.row.sid)						
									}
								},
								props: {
									src: params.row.photo_url,
									name: params.row.student_name,
									sex: params.row.sex
								} 
							}
						)
					},
					status(h,params) {
						return h('Tag',{
								props:{
									type:'border',
									color:this.ss_map[params.row.status].color
								}
							},
							this.ss_map[params.row.status].text
						)
					},					
					sex (h,params) {
						let map_sex = {0:'-',1:'男',2:'女'}
						return h('span',map_sex[params.row.sex])
					},
					age (h,params) {
						if(params.row.birth_time !== 0) {
							return h('span',this.getAge(params.row.birth_time))
						}
						return '-'
					},
					first_family_rel (h,params) {
						let row = params.row,
						rel = this.$filter('family_rel')(row.first_family_rel),
						name = row.first_family_name==''?'-':row.first_family_name,
						result = rel+' / '+name
						if(row.first_family_rel===1){
							result = rel
						}						
						return util.sprintf('%s',result) 
					},
					second_family_rel (h,params) {
						let row = params.row,
						rel = this.$filter('family_rel')(row.second_family_rel),
						name = row.second_family_name==''?'-':row.second_family_name,
						result = rel+' / '+name
						if(row.second_family_rel===1){
							result = rel
						}						
						return util.sprintf('%s',result) 
					},
					shool_grade (h,params) {
						return h('span',this.labelDicts(params.row.school_grade,'grade'))
					}
				},
				operation_keys:{
					reback: {
						title: '学员回流',
						type: '' 
					}					
				},
				operation_func: {
					reback(params) {
						this.reback(params.row)
					}
				}
			}
		},
		watch: {
			data_mode: function (val) {
				Vue.localStorage.set(this.rest_api+'_mode',val)
				this.pageSize = val=='avatar'?12:10
			}
		},
		mounted () {
			if(Vue.localStorage.get(this.rest_api+'_mode')){
				this.data_mode = Vue.localStorage.get(this.rest_api+'_mode')	
				this.pageSize = this.data_mode=='avatar'?12:10 
			}
			this.init_data()
		},
		methods: {
			reback(row) {
				this.$rest('students/'+row.sid+'/customer')
				.post()
				.success(data=>{
					this.$Message.success('学员回流成功！')
					this.init_data()
				})
			},
			studentDetail (sid) {
				this.$router.push({path:`/business/student/${sid}/lesson`})
			},
			hook_get_param (params) {
				let search_obj = util.copy(this.search_field)
				for(let o in search_obj) {
					let property = search_obj[o]
					if(o=='create_time') {
						if(property!=','&&property.length>0) {
							params[o] = util.sprintf('[Between,%s]',property.join(','))
						}
					}else{
						if(property&&property!=-1){
							params[o] = property
						}
					}
				}
			},
			resetSearch () {
				this.$r('ref_search').resetFields()
				this.init_data()
			}
		},
		computed: {
			pageSizeOptions () {
				let options = [10,20,30,40]
				if(this.data_mode=='avatar'){
					options = [12,24,36,48]
				}
				return options
			}
		}
	}
</script>
