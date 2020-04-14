<template>
	<div class="c-grid">
		<div class="box box-query">
			<Form ref="ref_search" :model="search_field" :label-width="70" class="filter-form row">
				<Form-item label="学员姓名" prop="student_name" class="col-md-3 col-sm-6">
					<Input v-model="search_field.student_name" placeholder="请输入学员姓名 / 拼音"></Input>
				</Form-item>
				<Form-item label="英文名" prop="nick_name" class="col-md-3 col-sm-6">
					<Input v-model="search_field.nick_name" placeholder="请输入昵称 / 英文名"></Input>
				</Form-item>
				<Form-item label="手机号" prop="first_tel" class="col-md-3 col-sm-6">
					<Input v-model="search_field.first_tel" placeholder="请输入手机号"></Input>					
				</Form-item>
				<Form-item label="学员状态" prop="status" class="col-md-3 col-sm-6">
					<Select v-model="search_field.status">
						<Option v-for="(value,key) in ss_map" :value="key" :key="key">{{value.text}}</Option>
					</Select>
				</Form-item>	
				<template v-if="searchExpand">
					<Form-item label="生日月份" prop="birth_month" class="col-md-3 col-sm-6">
						<Select v-model="search_field.birth_month">
							<Option :value="month" v-for="month in 12">{{month}}月</Option>
						</Select>
					</Form-item>
					<Form-item label="性别" prop="sex" class="col-md-3 col-sm-6">
						<Select v-model="search_field.sex">
							<Option v-for="item in sexOptions" :value="item.value">{{item.label}}</Option>							
						</Select>
					</Form-item>
					<Form-item label="卡号" prop="card_no" class="col-md-3 col-sm-6">
						<Input v-model="search_field.card_no"  placeholder="请输入卡号"></Input>
					</Form-item>
					<Form-item label="入学日期" prop="create_time" class="col-md-3 col-sm-6">
						<date-range-picker 
							v-model="search_field.create_time" 
							@on-change="search" 
							label="选择日期" 
							placement="bottom"
							style="width:100%">
						</date-range-picker>
					</Form-item>
					<Form-item label="学员年级" prop="school_grade" class="col-md-3 col-sm-6">
						<Select v-model="search_field.school_grade">
							<Option :value="0">不限</Option>
							<Option v-for="(item,index) in dicts('grade')" :value="item.name">{{item.title}}</Option>
						</Select>
					</Form-item>
					<Form-item 
					label="剩余课时" 
					prop="student_lesson_remain_hours" 
					v-if="show_lesson_hours"
					class="col-md-3 col-sm-6">
						<select-age v-model="search_field.student_lesson_remain_hours"></select-age>
					</Form-item>
					<Form-item 
					label="到期时段" 
					prop="expire_condition" 
					v-if="show_lesson_expire" 
					class="col-sm-6 col-md-3">
						<Select v-model="search_field.expire_condition">
							<Option v-for="(item,index) in expire_condition" :value="item.field" :key="index">{{item.label}}</Option>
						</Select>
					</Form-item>
				</template>			
			</Form>
			<Row class="basic">
                <Col span="24" class="mt-2" style="margin-left:0px;">                	
                	<Button-group>
                        <Button class="ml-2" type="primary" @click="search" icon="ios-search">查询</Button>
                        <Button type="primary" :icon="toggleSearchIcon" @click="toggleSearch"></Button>
                    </Button-group>
                	<Button type="primary" icon="refresh" @click="resetSearch">重置</Button>  
                	<export-button res="my_students" :params="params" v-per="'student.export'" :total="total" :max-sync-nums="1000"></export-button>
                	<div class="pull-right">
                        <per-scope per="student.checkAll" :show-my="true" @on-change="perScopeChange"></per-scope>
                    </div>
                </Col>
           </Row>			
		</div>
		<div class="box box-result">
			<div class="toolbar">		
				
				<import-button res="students" name="学员" @on-import-finish="init_data" v-per="'student.add'"></import-button>
				<Button class="ml-2" type="primary" icon="plus" @click="studentAdd" v-per="'student.add'">添加</Button>
				<Button class="ml-2" type="primary" icon="card" @click="issueCard" v-per="'student.issueCard'">发卡</Button>
				<filter-column class="ml-2 pull-right" :keys="column_keys" v-if="column_keys_ready"></filter-column>
				<RadioGroup v-model="data_mode" type="button" size="small" class="pull-right">
			        <Radio label="list"><Icon type="navicon"></Icon>　列表</Radio>
			        <Radio label="avatar"><Icon type="image"></Icon>　头像</Radio>
			   </RadioGroup>
			</div>
			<div class="content">
				<div class="content-body">
		            <Table 
		            	v-show="data_mode=='list'"
		            	ref="tableExcel"
		            	v-loading.like="'students'" 
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
			            			<operation-student-items class="pull-right" :info="item" :refs="$refs">
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
	import $rest from '@/libs/rest'
	import grid from '@/libs/grid.mixin'
	import common from '@/libs/common.mixin'
	import globals from '@/libs/globals.mixin'
	import letterAvatar from 'c%/LetterAvatar.vue'
	import operationStudentItems from './operation-items.vue'	
	import DateRangePicker from 'c%/DateRangePicker.vue'
	import ImportButton from 'c%/ImportButton.vue'
	import ExportButton from 'c%/ExportButton.vue'
	import IssueCard from 'c%/IssueCard.vue'
	import RichTel from 'c%/RichTel.vue'
	import SelectAge from 'c%/SelectAge.vue'
	import TagLabel from 'c%/TagLabel.vue'
	import listmixin from './list.mixin'
	
	Vue.component('rich-tel',RichTel)
	Vue.component('operation-student-items',operationStudentItems)
	export default{
		mixins: [grid,globals,common,listmixin],
		components: {
			ImportButton,
			ExportButton,
			letterAvatar,
			operationStudentItems,
			DateRangePicker,
			IssueCard,
			SelectAge
		},
		data () {
			return {
				rest_api: '',
				pk: 'sid',
				data_mode: 'list',				
				showIndex: false,
				search_field: {
					student_name: '',
					nick_name: '',
					first_tel: '',
					card_no: '',
					status: -1,
					create_time: [],
					age: [0,0],
					school_grade: 0,
					expire_condition:'',
					student_lesson_remain_hours: [0,0],
					birth_month: 0
				},
				column_keys_ready:false,
				column_render: {
					operate (h,params) {
						let operate = [
									h('operation-student-items',{
										props: {
											info: params.row,
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
									class: 'x-a-link text-info'
								},
								style: {
									display: 'inline-block'
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
						let filterList = [];
						if(params.row.tags && params.row.tags.length > 0) {
							filterList = params.row.tags.filter(item => {
								if(item.is_private == 0) {
									return true
								}
								else {
									let uid = this.uid$;
									if(uid == item.create_uid) {
										return true
									}
									else {
										return false
									}
								}
							})
						}
						let childEle = []
						childEle.push(nameElement)
						childEle.push(h(TagLabel, {
							props: {
								list: filterList,
								type: 1,
								id: params.row.sid,
								objName: params.row.student_name
							},
							style: {
								marginLeft: '5px'
							},
							on: {
								update: () => {
									this.init_data()
								}
							}
						}))
						if(this.is_app_chat_open){
							childEle.push(
								h('Icon',{
								props: {
									type:'chatbubble-working'
								},
								style: {
									marginLeft: '5px',
									cursor: 'pointer'
								},
								directives: [
									{
										name: 'per',
										value:'student.chat'
									}
								],
								nativeOn: {
									click:() => {
										this.chatbox
										.set('info',params.row)
										.reset()
										.show()
									}
								}
							})
							)
						}
						return h('span', childEle)
					},
					status(h,params) {
						let tag =  h('Tag',{
								props:{
									type:'border',
									color:this.ss_map[params.row.status].color
								}
							},
							this.ss_map[params.row.status].text
						)
						let result = [tag]
						if(params.row.status === 30) {
							let reason = params.row.stop_reason || '-'
							result.push(h('p','原因:'+reason))
						}
						return h('div',result)
					},
					lesson_rate (h,params) {						
						let row = params.row,
							percent = 0,
							status = 'normal',
							label = util.sprintf('%s/%s',row.student_lesson_remain_hours,row.student_lesson_hours)
						if(row.student_lesson_hours>0){
							percent = parseFloat(row.student_lesson_remain_hours/row.student_lesson_hours).toFixed(2)*100
						}
						if(row.student_lesson_remain_hours > 0 && row.student_lesson_remain_hours == row.student_lesson_hours) {
							status = 'success'
						}else{
							if(row.student_lesson_remain_hours <= this.lesson_warn_nums && row.student_lesson_hours > 0) {
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
						return h('span',map_sex[params.row.sex])
					},
					first_openid (h,params) {
						let label = '未绑定',
							color = '#657180';
						if(params.row.first_openid || params.row.second_openid) {
							label = '已绑定';
							color = '#19be6b';
						}
						return h('span', {
							style: {
								color: color
							}
						}, label)
					},
					age (h,params) {
						return h('span',util.age(params.row.birth_time))
					},
					birth_time (h,params) {
						return h('span',params.row.birth_time?params.row.birth_time:'-')
					},
					first_family_rel (h,params) {
						let row = params.row,
						rel = this.$filter('family_rel')(row.first_family_rel),
						name = row.first_family_name==''?'-':row.first_family_name,
						result = rel+' / '+name
						if(row.first_family_rel===1){
							result = rel
						}						
						return h('span',util.sprintf('%s',result)) 
					},
					second_family_rel (h,params) {
						let row = params.row,
						rel = this.$filter('family_rel')(row.second_family_rel),
						name = row.second_family_name==''?'-':row.second_family_name,
						result = rel+' / '+name
						if(row.second_family_rel===1){
							result = rel
						}						
						return h('span',util.sprintf('%s',result)) 
					},
					shool_grade (h,params) {
						return h('span',this.labelDicts(params.row.school_grade,'grade'))
					},
					ename (h,params) {
						return h('span',this.$filter('ename')(params.row.eid,'未分配'))
					},
					first_tel (h,params) {
						return h('rich-tel',{
							props: {
								sence: 'student',
								row: params.row
							},
							on: {
								'on-success': ()=>{
									this.init_data()
								}
							}
						})
					},
					vip_level (h,params) {
						if(params.row.vip_level === -1) {
							return h('span','非会员')
						}else{
							return h('span',this.vip_level_config[params.row.vip_level].name)
						}
					},
					service_level (h,params) {
						return h('Rate',{
							props: {
								count: params.row.service_level,
								value: params.row.service_level,
								disabled: true
							}
						})
					},
					referer_student_name(h,params) {
						return h('span',params.row.referer_student_name||'-')
					},
					from_did(h,params) {
						return h('span',this.$filter('dict_title')(params.row.from_did,'from','-'))
					},
					is_face_input(h,params) {
						return h('span',params.row.is_face_input==0?'否':'是')
					},
					in_time(h,params) {
						let in_time = params.row.in_time
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
									this.moneyDetail(params.row)
								}
							}
						},`${this.label_currency}${params.row.money}`)
					},
					lesson_expire(h,params) {
                    	let expire_time = params.row.expire_time
                    	let text = params.row.expire_time_text
                    	if(expire_time == null) {
                    		return h('span','-')
                    	}
                    	if(expire_time === 0) {
                    		return h('span',params.row.expire_time_text)
                    	}else{
                    		let label = h('span',{
                    			style:{
                    				color:text === '正常'?'#006600':'#c90808'
                    			}
                    		},text)
                    		return h('div',[label,`(${expire_time})`])
                    	}
                    }
				},
			}
		},
		watch: {
			data_mode: function (val) {
				Vue.localStorage.set(this.rest_api+'_mode',val)
				this.pageSize = val=='avatar'?12:10
			}
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
			if(!this.enable_project){
				delete this.column_keys['pj_ids']
			}
			if(!this.show_lesson_hours){
				delete this.column_keys['lesson_rate']
			}
			if(!this.show_lesson_expire){
				delete this.column_keys['lesson_expire']
			}else{
				this.column_keys['lesson_expire']['show'] = true
			}
			this.column_keys.ename.title = this.label_eduer
		},
		mounted () {
			if(Vue.localStorage.get(this.rest_api+'_mode')){
				this.data_mode = Vue.localStorage.get(this.rest_api+'_mode')	
				this.pageSize = this.data_mode=='avatar'?12:10 
			}
			this.rest_api = this.myStudentApi
			this.replaceSearchField()
			this.initOptionFieldsColumn()
			this.initDisableFieldCloumns('student')
			this.init_data()
		},
		beforeDestroy() {
	        this.setStateSearchDetail(false)
	    },
		methods: {
			perScopeChange(value) {
				this.$emit('on-check',value)
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
			deal_data(data){
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
				data.list.forEach(item=>{
					fields.forEach(f=>{
						item[f] = get_option_fields_default_value(item.option_fields,f)
					})
				})
				return data.list
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
			// 撤销休学成功后再休学
			deleteLeave (data) {
				this.$r('leave')
				.set('student',data)
				.show(util.sprintf('休学【%s】',data.name),'suspend')
			},
			hook_get_param (params) {
				let search_obj = util.copy(this.search_field)
				for(let o in search_obj) {
					let property = search_obj[o]
					if(o=='create_time') {
						if(property!=','&&property.length>0) {
							params[o] = util.sprintf('[Between,%s]',property.join(','))
						}
					}else if(o=='age'){
						if(property[1]>0){
							params.age_start = property[0]
							params.age_end = property[1]	
						}						
					}else if(o=='student_lesson_remain_hours') {
						let start = util.int(property[0])
						let end = util.int(property[1])
						if(start>=0&&end>0&&end>=start){
							params[o] = util.sprintf('[Between,%s,%s]',start,end)
						}						
					}
					else if(o=='sex'){
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
			},
			show_lesson_hours(){
				return this.$store.state.gvars.configs.params.student_list_show_lesson_hours
			},
			show_lesson_expire(){
				return this.$store.state.gvars.configs.params.student_list_show_lesson_expire
			}
		}
	}
</script>
