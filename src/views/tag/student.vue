<style scoped>
.studentTable >>> .x-avatar-name {
	display: inline-block;
}

.table-title {
	font-weight: bold;
	margin-right: 15px
}
</style>


<template>
	<div class="c-grid">
		<div class="box box-result">
			<div class="toolbar" style="margin: 10px 0px">
				<p class="x-tag-title">
                    <Tag class="x-tag" :color="tagColor">{{this.tagName}}</Tag>
                    <span>标签的学员列表</span>
                </p>
				<!-- <Button class="ml-2" type="primary" icon="card" @click="issueCard" v-per="'student.issueCard'">发卡</Button> -->
				<filter-column :keys="column_keys" v-if="column_keys_ready"></filter-column>
			</div>
			<div class="content">
				<div class="content-body">
		            <Table
						class="studentTable"
		            	v-show="data_mode=='list'"
		            	ref="tableExcel"
		            	v-loading="'tag_relations'" 
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
			            			<operation-student-items class="pull-right" :info="item" :refs="$refs" @success="init_data">
			            				<Button type="ghost" icon="ios-gear">操作</Button> 	
			            			</operation-student-items>
			            		</div>	
			            		<div class="text-center">
			            			<Tooltip placement="top">
			            				<span slot="content">总课时：{{item.student_lesson_hours}} <br>消耗课时：{{item.student_lesson_hours-item.student_lesson_remain_hours}} <br>剩余课时：{{item.student_lesson_remain_hours}}</span>
				            			<i-circle 
				            			:percent="circlePercent(item)" 
				            			:stroke-color="circleColor(item)"
				            			:stroke-width="5" 
				            			:size="130">
									        <letterAvatar 
					            				title="点击查看详情"
					            				size='120' 
					            				:src="item.photo_url" 
					            				:name='item.student_name' 
					            				@click.native="studentDetail(item.sid)" 
					            				:rounded="true">
					            			</letterAvatar>
									    </i-circle>			
								    </Tooltip>
			            			<h5 class="mt-2">
			            				<a @click="studentDetail(item.sid)">
											<Icon :type="item.sex=='1'?'man':'woman'"></Icon>
											{{item.student_name}}
										</a>
										<Tag color="blue">
											{{getAge(item.birth_time)}}
										</Tag>
									</h5>
			            		</div>
			            	</Card>
		            	</div>
		            	<div class="text-center col-sm-12" v-if="!data.length">
		            		<p class="py-2" style="border-bottom:1px solid #e3e8ee">没有数据</p>
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
		
		<issue-card 
			ref="issue_card" 
			:list="data" 
			:page-size="pageSize"
			@on-prevpage="prev_page" 
			@on-nextpage="next_page" 
			@on-card-update="updateCardNo">
		</issue-card>
	</div>
</template>

<script>
	import Vue from 'vue'
	import util from '@/libs/util'
	import grid from '@/libs/grid.mixin'
	import common from '@/libs/common.mixin'
	import globals from '@/libs/globals.mixin'

	import letterAvatar from 'c%/LetterAvatar.vue'
	import operationStudentItems from '../business/student/operation-items.vue'	
	import DateRangePicker from 'c%/DateRangePicker.vue'
	import SelectPublicSchool from 'c%/SelectPublicSchool.vue'

	import IssueCard from 'c%/IssueCard.vue'
	import SelectAge from 'c%/SelectAge.vue'
	import ImportButton from 'c%/ImportButton.vue'
	import RichTel from 'c%/RichTel.vue'
	import SelectStudent from 'c%/SelectStudent.vue'
	import SelectChannel from 'c%/SelectChannel.vue'
	import SelectEmployee from 'c%/SelectEmployee.vue'
	import ExportButton from 'c%/ExportButton.vue'
	import DictionaryFrom from 'c%/DictionaryFrom.vue'
	import TagLabel from 'c%/TagLabel.vue'
	
	Vue.component('rich-tel',RichTel)
	Vue.component('operation-student-items',operationStudentItems)
	export default{
		mixins: [grid,globals,common],
		components: {
			letterAvatar,
			ImportButton,
			operationStudentItems,
			DateRangePicker,
			IssueCard,
			SelectAge,
			SelectPublicSchool,
			ExportButton,
			SelectStudent,
			SelectChannel,
			SelectEmployee,
			DictionaryFrom
		},
		props: {
			tagId: {
				type: Number,
				default: 0
			},
			tagName: {
				type: String,
				default: ''
			},
			tagColor: {
                type: String,
                default: ''
            }
		},
		data () {
			return {
				rest_api: 'tag_relations',
				pk: 'sid',
				data_mode: 'list',
				showIndex: false,
				tagList: [],
				search_field: {
					tag_id: 0,
					tag_type: 1
				},
				column_keys_ready:false,
				column_keys: {
					operate: {
						title: '操作',
						width: 80,
						disabled:true
					},
					row_number: {
						type: 'index',
						title:'#',
	                    width: 60,
	                    align: 'center',
	                    disabled:true
					},
					student_name: {
						title: '姓名',
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
					lesson_rate: {
						title: '剩余课时/总课时',
						show: true
					},
					money: {
						title: '钱包余额',
						show: false,
						sortable: 'custom'
					},
					sno: {
						title: '学号',
						show: false,
						sortable: 'custom'
					},
					card_no: {
						title: '卡号',
						show: false
					},
					nick_name: {
						title: '昵称/英文名',
						show: false
					},
					first_tel: {
						title: '手机号',
						show: true
					},
					vip_level: {
						title: '会员等级',
						show:true
					},
					service_level: {
						title: '服务星级',
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
					},
					ename: {
						title: '学管师',
						show: false
					},
					referer_student_name: {
						title: '介绍人',
						show: false,
						width: 120
					},
					in_time:{
                        title: '报名时间',
                        show: false,
					},
					mc_name: {
						title: '市场渠道',
						show:false
					},
					from_did: {
						title: '招生来源',
						show:false,
						sortable: 'custom'
					},
					is_face_input: {
						title: '人脸采集',
						show: false
					}
				},
				column_render: {
					operate (h,params) {
						let operate = [
									h('operation-student-items',{
										props: {
											info: params.row.student,
											refs: this.$refs
										},
										on: {
											success: () => {
												this.init_data()
											}
										}
									},
									[
										h('Button',{
											props: {
												type:'primary',
												size: 'small'
											}
										},[
											'操作  ',
											h('Icon',{
												props: {
													type: 'arrow-down-b'
												}
											})
										])
									])
								]
						return h('div',operate)
					},
					student_name (h,params) {
						let map = {0:{icon:'help',text:'-'},1:{icon:'male',text:'男'},2:{icon:'female',text:'女'}}
						let nameElement = h('avatar-and-name',{
								attrs: {
									class: 'x-avatar-name'
								},
								on: {
									click: ()=>{
										this.studentDetail(params.row.student.sid)						
									}
								},
								props: {
									src: params.row.student.photo_url,
									name: params.row.student.student_name,
									sex: params.row.student.sex,
									nickname: params.row.student.nick_name
								} 
							}
						)
						return h('span', [
							nameElement
						])
					},
					status(h,params) {
						let tag =  h('Tag',{
								props:{
									type:'border',
									color:this.ss_map[params.row.student.status].color
								}
							},
							this.ss_map[params.row.student.status].text
						)
						let result = [tag]
						if(params.row.student.status === 30) {
							let reason = params.row.student.stop_reason || '-'
							result.push(h('p','原因:'+reason))
						}
						return h('div',result)
					},
					lesson_rate (h,params) {						
						let row = params.row.student,
							percent = 0,
							status = 'normal',
							label = util.sprintf('%s/%s',row.student_lesson_remain_hours,row.student_lesson_hours)
						if(row.student_lesson_hours>0){
							percent = parseFloat(row.student_lesson_remain_hours/row.student_lesson_hours).toFixed(2)*100
						}
						if(row.student_lesson_remain_hours > 0 && row.student_lesson_remain_hours == row.student_lesson_hours) {
							status = 'success'
						}else{
							if(row.student_lesson_remain_hours <= 3 && row.student_lesson_hours > 0) {
								status = 'wrong'
							}
						}						
						
						return h('Progress',{
							props: {
								percent: percent,
								status: status
							}
						},label)
					},
					sex (h,params) {
						let map_sex = {0:'-',1:'男',2:'女'}
						return h('span',map_sex[params.row.student.sex])
					},
					age (h,params) {
						return h('span',util.age(params.row.student.birth_time))
					},
					first_family_rel (h,params) {
						let row = params.row.student,
						rel = this.rel_list[row.first_family_rel],
						name = row.first_family_name==''?'-':row.first_family_name,
						result = rel+' / '+name
						if(row.first_family_rel===1){
							result = rel
						}						
						return h('span',util.sprintf('%s',result)) 
					},
					second_family_rel (h,params) {
						let row = params.row.student,
						rel = this.rel_list[row.second_family_rel],
						name = row.second_family_name==''?'-':row.second_family_name,
						result = rel+' / '+name
						if(row.first_family_rel===1){
							result = rel
						}						
						return h('span',util.sprintf('%s',result)) 
					},
					shool_grade (h,params) {
						return h('span',this.labelDicts(params.row.student.school_grade,'grade'))
					},
					ename (h,params) {
						return h('span',this.$filter('ename')(params.row.student.eid,'未分配'))
					},
					first_tel (h,params) {
						return h('rich-tel',{
							props: {
								sence: 'student',
								row: params.row.student
							},
							on: {
								'on-success': ()=>{
									this.init_data()
								}
							}
						})
					},
					vip_level (h,params) {
						if(params.row.student.vip_level === -1) {
							return h('span','非会员')
						}else{
							return h('span',this.vip_level_config[params.row.student.vip_level].name)
						}
					},
					service_level (h,params) {
						return h('Rate',{
							props: {
								count: params.row.student.service_level,
								value: params.row.student.service_level,
								disabled: true
							}
						})
					},
					referer_student_name(h,params) {
						return h('span',params.row.student.referer_student_name||'-')
					},
					from_did(h,params) {
						return h('span',this.$filter('dict_title')(params.row.student.from_did,'from','-'))
					},
					is_face_input(h,params) {
						return h('span',params.row.student.is_face_input==0?'否':'是')
					},
					in_time(h,params) {
						let in_time = params.row.student.in_time
						if(in_time=='1970-01-01' || in_time==0) {
							return h('span','-')
						}
						return h('span',in_time)
					},
					money(h,params) {
						return h('a',{
							class:'text-info',
							on: {
								click:() =>{
									this.moneyDetail(params.row.student)
								}
							}
						},`${this.label_currency}${params.row.student.money}`)
					}
				},
			}
		},
		watch: {
			data_mode: function (val) {
				Vue.localStorage.set(this.rest_api+'_mode',val)
				this.pageSize = val=='avatar'?12:10
			},
			tagId(val) {
				this.search_field.tag_id = val;
				this.init_data();
			},
		},
		created () {
			if(!this.enable_vip) {
				delete this.column_keys['vip_level']
			}
			if(!this.enable_service_level) {
				delete this.column_keys['service_level']
			}
			if(!this.hasPer('app.faceatt')) {
				delete this.column_keys['is_face_input']
			}
		},
		mounted () {
			if(Vue.localStorage.get(this.rest_api+'_mode')){
				this.data_mode = Vue.localStorage.get(this.rest_api+'_mode')	
				this.pageSize = this.data_mode=='avatar'?12:10 
			}
			this.search_field.tag_id = this.tagId;
			this.replaceSearchField()
			this.initTagList()
			this.initOptionFieldsColumn()
			this.init_data()
		},
		beforeDestroy() {
	        this.setStateSearchDetail(false)
	    },
		methods: {
			
			initTagList() {
				this.$http.get('tags',{
					params: {
						tag_type: 1
					}
				})
				.then(res => {
					var list = res.body.data.list;
					this.tagList = list;
				},res => {
					this.$Message.error(res.body.message);
				})
			},
			getStopLessonRecord(){
				this.$Modal.open('business/student/stop-lesson-record.vue@modal')
				.then(modal => {
					modal.show('学员停课记录')
				})
			},
			getCloseLessonRecord(){
				this.$Modal.open('business/student/close-lesson-record.vue@modal')
				.then(modal => {
					modal.show('学员结课记录')
				})
			},
			initOptionFieldsColumn(){
				let student_option_fields = this.$store.state.gvars.configs.student_option_fields
				student_option_fields.forEach(f=>{
					if(f.enable == 1){
						this.$set(this.column_keys,f.name,{title:f.label,show:false})
					}
				})
				this.column_keys_ready = true
			},
			deal_student_data(data){
				let student_option_fields = this.$store.state.gvars.configs.student_option_fields
				let fields = []
				student_option_fields.forEach(f=>{
					if(f.enable == 1){
						fields.push(f.name)
					}
				})
				function get_option_fields_default_value(obj,f){
					if(obj && obj[f]){
						return obj[f]
					}
					return ''
				}
				data.forEach(item=>{
					fields.forEach(f=>{
						item[f] = get_option_fields_default_value(item.option_fields,f)
					})
				})
				return data
			},
			perScopeChange(value) {
				this.$emit('on-check',value)
			},
			circlePercent (row) {
				let percent = 0 
				if(row.student_lesson_hours > 0){					
					percent = parseFloat(row.student_lesson_remain_hours / row.student_lesson_hours).toFixed(2) * 100
				}
				return percent
			},
			circleColor(row){
				let color = '#2db7f5'
				let percent = this.circlePercent(row)
                if (percent == 100) {
                    color = '#5cb85c'
                }else if(percent > 50){
                	color = '#2db7f5'
                }else if(percent > 25){
                	color = '#ff9900'
                }else{
                	color = '#ff0000'
                }
                return color;
			},
			studentDetail (sid) {
				this.setStateSearchInfo()
				this.$router.push({path:`/business/student/${sid}/lesson`})
			},				
			studentAdd () {
				this.$Modal.open('business/student/info-modal.vue',{
					on:{
						'on-save-success': ()=> {
							this.init_data()
						}
					}
				})
				.then(modal=>{
					modal.show('添加学员档案','add')
				})
			},
			issueCard () {
				if(this.data.length==0) {
					this.$Message.error('当前页没有学生')
					return
				}
				this.$r('issue_card').show('批量发放学员卡','card')
			},
			prev_page () {
				this.pageIndex--
				this.init_data()
			},
			next_page () {
				this.pageIndex++
				this.init_data()
			},
			updateCardNo (e) {
				Vue.set(this.data[e.index],'card_no',e.card_no)
			},
			hook_get_param (params) {
				let search_obj = util.copy(this.search_field)
				for(let o in search_obj) {
					let property = search_obj[o]
					if(o=='in_time') {
						if(property!=','&&property.length>0) {
							params[o] = util.sprintf('[Between,%s]',property.join(','))
						}
					}else if(o=='age'){
						let start = util.int(property[0])
						let end = util.int(property[1])
						if(start>=0&&end>0&&end>=start){
							params.age_start = start
							params.age_end = end
						}						
					}else if(o=='student_lesson_remain_hours') {
						let start = util.int(property[0])
						let end = util.int(property[1])
						if(start>=0&&end>0&&end>=start){
							params[o] = util.sprintf('[Between,%s,%s]',start,end)
						}						
					}else if(o=='is_assign') {
						if(property==0) {
							params.eid = 0
						}else if(property==1) {
							params.eid = '[>,0]'
						}
					}else if(o=='vip_level'){
						if(property!==-2) {
							params[o] = property
						}
					}else if(o=='service_level'){
						if(property!==-1) {
							params[o] = property
						}
					}else if(o=='sex'||o=='is_face_input'){
						if(property!==-1) {
							params[o] = property
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
				this.search_field.age = [0,0]
				this.search_field.student_lesson_remain_hours = [0,0]
				this.init_data()
			},
			moneyDetail (row) {				
				let data = row
				let post = {
					sid: data.sid,
					amount: 0,
					remark: '',
					business_type: 12
				}
				this.$Modal.open('business/student/money@modal')
				.then(modal => {
					modal
					.set('money',data.money)
					.set('sid',data.sid)
					.set('post',post)
					.show(util.sprintf('【%s】的余额变动历史记录',data.student_name),'add')
				})
			},
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
