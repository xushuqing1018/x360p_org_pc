<style scoped>
.studentTable >>> .x-avatar-name {
	display: inline-block;
}
</style>


<template>
	<div class="c-grid">
		<div class="box box-query">
			<Form ref="ref_search" :model="search_field" :label-width="70" class="filter-form row">
				<Form-item label="学员姓名" prop="student_name" class="col-md-3 col-sm-6">
					<Input v-model="search_field.student_name" placeholder="请输入学员姓名 / 拼音" @keyup.native.enter="init_data"></Input>
				</Form-item>
				<Form-item label="昵称/英文名" :label-width="80" prop="nick_name" class="col-md-3 col-sm-6">
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
					<Form-item label="学号" prop="sno" class="col-md-3 col-sm-6" v-if="isEF('sno','student')">
						<Input v-model="search_field.sno"  placeholder="请输入学号"></Input>
					</Form-item>
					<Form-item label="身份证号" prop="id_card_no" class="col-md-3 col-sm-6" v-if="isEF('id_card_no','student')">
						<Input v-model="search_field.id_card_no"  placeholder="请输入身份证号"></Input>
					</Form-item>
					<Form-item label="报名时间" prop="in_time" class="col-md-3 col-sm-6">
						<date-range-picker 
							v-model="search_field.in_time" 
							@on-change="search" 
							label="选择日期" 
							placement="bottom"
							style="width:100%">
						</date-range-picker>
					</Form-item>
					<Form-item label="学员年龄" prop="age" class="col-md-3 col-sm-6">
						<select-age v-model="search_field.age"></select-age>
					</Form-item>
					<Form-item label="学员年级" prop="school_grade" class="col-md-3 col-sm-6" v-if="isEF('school_grade','student')">
						<Select v-model="search_field.school_grade">
							<Option :value="0">不限</Option>
							<Option v-for="(item,index) in dicts('grade')" :value="item.name">{{item.title}}</Option>
						</Select>
					</Form-item>
					<Form-item label="分配学管师" :label-width="100" prop="is_assign" class="col-md-3 col-sm-6">
						<Select v-model="search_field.is_assign">
							<Option :value="-1">不限</Option>
							<Option :value="1">已分配</Option>
							<Option :value="0">未分配</Option>
						</Select>
					</Form-item>
					<Form-item label="学管师" prop="is_assign" class="col-md-3 col-sm-6">
						<select-employee v-model="search_field.eid" :rid="4"></select-employee>
					</Form-item>
					<Form-item label="会员等级" prop="vip_level" class="col-md-3 col-sm-6" v-if="enable_vip">
						<Select v-model="search_field.vip_level">
							<Option :value="-2">不限</Option>
							<Option :value="-1">非会员</Option>
							<Option v-for="(item,index) in vip_level_config" :value="index">{{item.name}}</Option>
						</Select>
					</Form-item>
					<Form-item label="服务星级" prop="service_level" class="col-md-3 col-sm-6" v-if="enable_service_level">
						<Select v-model="search_field.service_level">
							<Option :value="0">0星</Option>
							<Option v-for="item in service_level_config" :value="item">{{item}}星</Option>
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
					<Form-item label="公立学校" prop="school_id" class="col-md-3 col-sm-6" v-if="isEF('school_id','student')">
						<select-public-school v-model="search_field.school_id" clearable></select-public-school>
					</Form-item>
					<Form-item label="介绍人" prop="referer_sid" class="col-md-3 col-sm-6">
						<select-student v-model="search_field.referer_sid" clearable></select-student>
					</Form-item>
					<Form-item label="市场渠道" prop="mc_id" class="col-md-3 col-sm-6">
						<select-channel v-model="search_field.mc_id" :show-add="false" clearable></select-channel>
					</Form-item>
					<Form-item label="招生来源" prop="from_did" class="col-md-3 col-sm-6">
						<dictionary-from v-model="search_field.from_did" clearbale></dictionary-from>
					</Form-item>
					<Form-item label="人脸采集" prop="is_face_input" class="col-md-3 col-sm-6" v-per="'app.faceatt'">
						<Select v-model="search_field.is_face_input">
							<Option :value="-1">不限</Option>
							<Option :value="1">是</Option>
							<Option :value="0">否</Option>
						</Select>
					</Form-item>
					<Form-item label="绑定微信" prop="wechat_bind" class="col-md-3 col-sm-6">
						<Select v-model="search_field.wechat_bind">
							<Option :value="-1">不限</Option>
							<Option :value="0">未绑定</Option>
							<Option :value="1">已绑定</Option>
						</Select>
					</Form-item>
					<Form-item label="校区" prop="bid" class="col-md-3 col-sm-6" v-if="hasPer('student.allbid')">
						<Select v-model="search_field.bid">
							<Option :value="-1">不限校区</Option>
							<Option :value="0">当前校区</Option>
							<Option v-for="(item,index) in branchs" :key="index" :value="item.bid">{{item.short_name||item.branch_name}}</Option>
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
   
                	<export-button res="students" :params="params" :ex-params="export_field" v-per="'student.export'" :total="total" :max-sync-nums="1000">
						<div class="text-center" slot="aparams">
							<Checkbox v-model="export_field.append_class" :true-value="1" :false-value="0">导出班级</Checkbox>
						</div>
					</export-button>
                	<ButtonGroup class="ml-2">
	                	<Button type="ghost" @click="getStopLessonRecord">停课记录</Button>
	                	<Button type="ghost" @click="getStudentSuspendRecord">休学记录</Button>
	                	<Button type="ghost" @click="getStudentDropoutRecord">退学记录</Button>
	                	<Button type="ghost" @click="getCloseLessonRecord">结课记录</Button>
	                	<Button type="ghost" @click="negativeStudentRecord" v-if="allow_debt_att && hasPer('student.negativeHours')">负课时学员</Button>
	                </ButtonGroup>
					<Button type="default" icon="status" @click="studentStatusInfo">学员状态预警</Button>
					<Button type="default" icon="status" @click="cross_campus_registration_student">跨校区报名学员</Button>
                	<div class="pull-right">
                        <per-scope per="student.checkAll" @on-change="perScopeChange"></per-scope>
                    </div>
                </Col>
           </Row>			
		</div>
		<div class="box box-result">
			<div class="toolbar">		
				
			    <import-button res="students" name="学员" @on-import-finish="init_data" v-per="'student.add'"></import-button>
				<Button class="ml-2" type="primary" icon="plus" @click="studentAdd" v-per="'student.add'">添加</Button>
				<Button class="ml-2" type="primary" icon="card" @click="issueCard" v-per="'student.issueCard'">发卡</Button>
				<Button class="ml-2" type="default" icon="printer" @click="printAttQrCodes" v-if="enable_qrcode_attendance">打印考勤二维码</Button>
				
				<filter-column class="ml-2 pull-right" :keys="column_keys" v-if="column_keys_ready"></filter-column>

				<RadioGroup class="pull-right" v-model="data_mode" type="button" size="small">
			        <Radio label="list"><Icon type="navicon"></Icon>　列表</Radio>
			        <Radio label="avatar"><Icon type="image"></Icon>　头像</Radio>
			    </RadioGroup>
			</div>
			<div class="content">
				<div class="content-body">
		            <Table
						class="studentTable"
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
	import operationStudentItems from './operation-items.vue'	
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
	import listmixin from './list.mixin'
	
	Vue.component('rich-tel',RichTel)
	Vue.component('operation-student-items',operationStudentItems)
	export default{
		mixins: [grid,globals,common,listmixin],
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
		data () {
			return {
				rest_api: 'students',
				pk: 'sid',
				data_mode: 'list',
				showIndex: false,
				search_field: {
					student_name: '',
					nick_name: '',
					first_tel: '',
					card_no: '',
					sno:'',
					id_card_no:'',
					status: -1,
					in_time: [],
					age: [0,0],
					school_grade: 0,
					is_assign: -1,
					vip_level: -2,
					sex: -1,
					service_level: -1,
					student_lesson_remain_hours: [0,0],
					school_id: 0,
					referer_sid: 0,
					mc_id: 0,
					from_did: 0,
					is_face_input: -1,
					eid: 0,
					wechat_bind: -1,
					expire_condition:'',
					birth_month:0,
					bid:0
					
				},
				export_field:{
					append_class:0
				},
				column_keys_ready:false,
				tag_id: 0,
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
									class: 'x-avatar-name'
								},
								on: {
									click: ()=>{
										this.studentDetail(params.row.sid)						
									}
								},
								props: {
									src: params.row.photo_url,
									name: params.row.student_name,
									sex: params.row.sex,
									nickname: params.row.nick_name
								} 
							}
						)
						//过滤私人标签
						let filterList = [];
						if(params.row.tags.length > 0) {
							filterList = params.row.tags.filter(item => {
								if(item.is_private == 0) {
									return true
								}
								else {
									let uid = this.uid$;
									if(uid == item.create_uid || this.ia_admin) {
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
			},
			'$route'(to,from) {
				this.tag_id = to.query.tag_id
	        	this.init_data()
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
			let tag_id = this.$route.query.tag_id
    		if(tag_id) {
    			this.tag_id = tag_id
    		}
			this.replaceSearchField()
			this.initOptionFieldsColumn()
			this.initDisableFieldCloumns('student')
			this.init_data()
		},
		beforeDestroy() {
	        this.setStateSearchDetail(false)
	    },
		methods: {
			getStopLessonRecord(){
				this.$Modal.open('business/student/student-suspend-record.vue@modal')
				.then(modal => {
					modal.show('学员停课记录')
				})
			},
			getStudentSuspendRecord(){
				this.$Modal.open('business/student/stop-lesson-record.vue@modal')
				.then(modal => {
					modal.show('学员休学记录')
				})
			},
			getCloseLessonRecord(){
				this.$Modal.open('business/student/close-lesson-record.vue@modal')
				.then(modal => {
					modal.show('学员结课记录')
				})
			},
			getStudentDropoutRecord() {
				this.$Modal.open('business/student/dropout-record.vue@modal',{
					on: {
						'on-success':() => {
							this.init_data()
						}
					}
				})
				.then(modal => {
					modal.show('学员退学记录')
				})
			},
			negativeStudentRecord() {
				this.$Modal.open('business/student/negative-hour-student.vue@modal',{
					on: {
						'on-success':() => {
							this.init_data()
						}
					}
				})
				.then(modal => {
					modal.show('负课时学员')
				})
			},
			studentStatusInfo() {
				this.$Modal.open('business/student/student-status-info.vue@modal',{
					on: {
						'on-success':() => {
							this.init_data()
						}
					}
				})
				.then(modal => {
					modal.show('学员状态预警')
				})
			},
			cross_campus_registration_student() {
				this.$Modal.open('business/student/cross-campus-registration-student.vue@modal',{
					on: {
						'on-success':() => {
							this.init_data()
						}
					}
				})
				.then(modal => {
					modal.show('跨校区报名学员')
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
					}else if(o=='wechat_bind'){
						if(property!==-1) {
							params[o] = property
						}
					}else if(o=='sex'||o=='is_face_input'){
						if(property!==-1) {
							params[o] = property
						}
					}else if(o == 'bid'){
						if(property > 0){
							params[o] = property
						}else if(property ==-1){
							params['skipBid'] = 1
						}
					}else{
						if(property&&property!=-1){
							params[o] = property
						}
					}
				}
				if(this.tag_id > 0) {
					params.tag_id = this.tag_id
				}
			},
			resetSearch () {
				if(this.tag_id > 0) {
					this.$router.replace('/business/student/archive')
				}else{
					this.$r('ref_search').resetFields()
					this.search_field.age = [0,0]
					this.search_field.student_lesson_remain_hours = [0,0]
				}
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
			printAttQrCodes(){
				this.$Modal.open('business/student/print-att-qrcode@modal',{
					props:{
						'data':this.data
					},
					on:{
						'on-next':()=>{

						}
					}
				})
				.then(modal => {
					modal
					.show('打印考勤二维码')
				})
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
