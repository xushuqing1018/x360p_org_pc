<style lang="less">
	.box.object-wrapper {
		padding-left: 15px;
		.ivu-form-item {
			margin-bottom: 10px;
		}
	}
	.situation-warpper {
		position: relative;
		.record-wrapper {
			position: absolute;
			width: 400px;
			top: 0;
			left: 0;
			.ivu-tabs-nav-container {
				font-size: 12px;
			}
			.situation-list,.lesson-list {
				p.empty{
					color: #999;
					text-align: center;
				}
				.item>a {
					display: block;
					line-height:26px;
				    padding-left:10px;
				    padding-right:10px;
			      	&:hover{
				        background:#eee;
			      	}
			       	&.selected{
				        background:#2D8CF0;
				        color:#fff;
		     		}
		     		.arrow-right {
		     			color: #fff;
		     		}
				}
			}
			.ivu-icon-chevron-left {
				position: absolute;
			    right: 10px;
			    top: 18px;
			    font-size: 16px;
			    cursor: pointer;
			}
			.menu-icon{
		        transition: all .3s ease;
		    }
		    .rotate-icon{
		        transform: rotateZ(180deg);
		    }
		    &.collapsed-record {
		    	width: 30px;
		    	transition: all .3s ease;
		    }
		}
	}
	.box.study-wrapper {
		margin-left: 415px;
		&.qt-empty {
			background: #fff url('../../img/nothing-qtype.jpg') no-repeat center;
		}
		&.collapsed-study {
			margin-left: 45px;
			transition: all .3s ease; 
		}
		.questionnaire {
			width: 410px;
			margin: 0 auto;
		}
		.questionnaire-type {
			text-align: center;
			margin-top: 10px;
			>.ivu-checkbox-group {
				display: inline-block;
			}
			>label {
				margin-right: 10px;
			}
		}
		.situation-title {
			margin-top: 15px;
		}
		.learn-plan {

		}
		.submit-btn {
			text-align: center;
			margin: 24px 0;
		}
		.situation-title,
		.situation-remark,
		.situation-status,
		.learn-plan-select,
		.learn-plan-content {
			margin-top: 15px;
			.ivu-card-body {
				font-size: 12px;
			}
		}
		.situation-title {
		    font-size: 14px;
		    color: #464c5b;
		    font-weight: 700;
		    margin-left: 16px;
		}
		.remark {
			textarea.ivu-input {
				font-size: 12px;
			}
		}
		.situation-pages {
			.situation-page {
				border: 1px solid #d7dde4;
				margin-top: 15px;
				&-title {
					position: relative;
					line-height: 34px;
					background: #d7dde4;
					padding-left: 15px;
					>input {
					    border: 0px;
					    background: #d7dde4;
					    outline: 0;
					}
					.speak-tag {
						position: absolute;
						right: 0;
						top: 3px;
					}
				}
				&-items {
					.situation-item {
						padding: 15px;
						border-bottom: 1px solid #e3e8ee;
						.detail {
							>p {
								display: inline-block;
								margin-bottom: 10px;
							}
							.choice {
								margin-right: 35px;
								margin-bottom: 0;
							}
						}
						.other {
							margin-top: 15px;
							.ivu-date-picker {
								width: 150px;
								margin-left: 20px;
							}
							label {
								margin-bottom: 0;
							}
						}
					}
					.nothing-item {
						padding: 30px;
						color: #ccc;
						text-align: center;
					}
				}
				&-footer {
					padding: 15px;
					margin-top: 5px;
					.intday-wrapper {
						display: inline-block;
						margin-top: 20px;
					}
					.eid-wrapper {
						display: inline-block;
						float: right;
						margin-top: 20px;
					}
				}
			}
		}
	}
</style>
<template>
	<div class="c-grid">
		<div class="box object-wrapper">
			<Form :label-width="60" class="row">
				<Form-item label="服务对象" class="col-sm-3">
					<Input 
						v-model="service.name" 
						readonly>
						<Dropdown slot="append">
							<Button type="ghost" icon="arrow-down-b">请选择</Button>		        
					        <DropdownMenu slot="list">
					            <DropdownItem>
						            <select-student 
						            	v-model="info.sid" 
						            	@on-selected="selectS">
						            	<Button type="ghost">正式学员</Button>
						            </select-student>
						        </DropdownItem>
					            <DropdownItem>
						            <select-customer 
						            	v-model="info.cu_id" 
						            	@on-selected="selectC">
						            	<Button type="ghost">意向客户</Button>
						            </select-customer>
						        </DropdownItem>
					        </DropdownMenu>
						</Dropdown>
					</Input>
				</Form-item>
				<Form-item 
					label="" 
					:label-width="1" 
					class="col-sm-2" 
					v-if="service.sid||service.cu_id">
					<Tag 
						type="border" 
						:color="service.sid?'green':'blue'">
						{{service.sid>0?'正式学员':'意向学员'}}
					</Tag>
				</Form-item>
			</Form>
			<div class="row">
				<div class="col-lg-1 col-md-3 col-sm-6" v-if="service.sid">
					<span>学号：</span>
					<span>{{service.sno||'-'}}</span>
				</div>
				<div class="col-lg-1 col-md-3 col-sm-6">
					<span>性别：</span>
					<span>{{service.sex|sex}}</span>
				</div>
				<div class="col-lg-2 col-md-3 col-sm-6">
					<span>年龄：</span>
					<span>{{age()}}</span>
				</div>
				<div class="col-lg-2 col-md-3 col-sm-6">
					<span>所属校区：</span>
					<span>{{service.bid|branch_name}}</span>
				</div>
				<div class="col-lg-2 col-md-3 col-sm-6">
					<span>手机号码：</span>
					<span>{{service.first_tel}}</span>
				</div>
			</div>
		</div>
		<div class="situation-warpper">
			<div :class="recordClasses" :style="{height:maxHeight+'px'}">
				<situation-record 
					ref="record" 
					:edit-ss-id="edit_ss_id"
					:sid="info.sid" 
					:cu-id="info.cu_id"
					@on-select="changeAction"
					v-show="!isCollapsed">
				</situation-record>
				<Icon @click.native="collapsedSider" :class="rotateIcon" type="chevron-left"></Icon>
			</div>
			<div :class="situationClasses" 
				 :style="{height:maxHeight+'px',overflow:'auto'}">
				<div class="questionnaire">
					<label>选问卷：</label>
					<Select 
						ref="questionnaire_select"
						:clearable="true"
						v-model="info.qid" 
						@on-change="selectQt" 
						style="width: 350px;" 
						:placeholder="service.name!==''?'请选择问卷':'请先选择服务对象'"
						:disabled="service.name===''"
						v-if="action=='add'">
						<OptionGroup label="当前校区" v-if="ques_local.length>0">
							<Option 
								:value="item.qid" 
								v-for="item in ques_local">{{item.name}}
							</Option>
						</OptionGroup>
						<OptionGroup label="所有校区" v-if="ques_all.length>0">
							<Option 
								:value="item.qid" 
								v-for="item in ques_all">{{item.name}}
							</Option>
						</OptionGroup>
					</Select>
					<Input v-model="ques_name_edit" disabled style="width: 350px" v-else></Input>
				</div>
				
				<div class="questionnaire-type" v-if="info.qid>0">
					<label>类型</label>
					<CheckboxGroup v-model="qt_dids">
						<Checkbox 
							v-for="item in qt_types" 
							:label="item.did">
							{{item.title}}
						</Checkbox>
					</CheckboxGroup>
				</div>
				<template v-if="qt_dids.length">
					<div class="situation-title">
						<label>学情标题：</label>
						<Input 
							v-model="info.title" 
							style="width: 250px;"
							placeholder="请输入学情标题">
						</Input>
						<Button 
							class="pull-right" 
							type="ghost" 
							icon="paper-airplane" 
							v-if="action=='edit'"
							style="line-height: 24px;"
							@click="send">推送给家长
						</Button>
					</div>
					<div class='situation-pages'>
						<situation-page 
							v-for="data in info.content" 
							v-if="qt_dids.indexOf(data.qt_did)>-1"
							:data="data">
						</situation-page>
					</div>
					<Card dis-hover class="remark situation-remark">
						<p slot="title">学情总结</p>
						<Input 
							type="textarea" 
							v-model="info.remark" 
							:rows="4"
							placeholder="请输入学情总结...">
						</Input>
					</Card>
					<div class="learn-plan">
						<Card dis-hover class="learn-plan-select">
							<p slot="title">学习方案</p>
							<select-lesson-buy-suit 
								v-model="info.lbs_id" 
								:name="service.name"
								:sid="info.sid"
								:cu-id="info.cu_id"
								@select="selectLbs"
								@clear="clearLbs">
							</select-lesson-buy-suit>
							<div v-for="item in info.lbs_define">
								<p v-for="(lesson,index) in item.lessons" class="mt-2 ml-2">
									<span :style="{color:index!=0?'#fff':'#657180'}">
										{{item.product_level_did|dict_title('product_level')}}：
									</span>
									<span>{{lesson.lid|lesson_name}}，课时数{{lesson.nums}}</span>
								</p>
							</div>
						</Card>
					</div>
					<Card dis-hover class="situation-status" v-if="action=='edit'">
						<p slot="title">服务跟踪</p>
						<table class="modal-table">
							<thead>
								<tr>
									<th><div class="ivu-table-cell">推送</div></th>
									<th><div class="ivu-table-cell">查询</div></th>
									<th><div class="ivu-table-cell">查看</div></th>
								</tr>
							</thead>
							<tbody>
								<tr>
									<td>
										<div class="ivu-table-cell">
											<template v-if="info.is_push">
												<p class="text-success">已推送</p>
												<p>{{info.push_time}}&nbsp;&nbsp;{{info.short_id}}</p>
											</template>
											<span class="text-danger" v-else>待推送</span>
										</div>
									</td>
									<td>
										<div class="ivu-table-cell">
											<template v-if="info.is_query">
												<p class="text-success">已查询</p>
												<p>{{info.query_time}}&nbsp;&nbsp;微信ID: {{info.query_openid}}</p>
											</template>
											<span class="text-danger" v-else>待查询</span>
										</div>
									</td>
									<td>
										<div class="ivu-table-cell">
											<template v-if="info.is_view">
												<p class="text-success">已查看</p>
												<p>{{info.view_time}}</p>
											</template>
											<span class="text-danger" v-else>待查看</span>
										</div>
									</td>
								</tr>
							</tbody>
						</table>
					</Card>
					<div class="submit-btn">
						<Button 
							type="primary" 
							size="large" 
							@click="save" 
							:loading="saving"
							style="width: 140px;padding: 6px 15px 7px">保存
						</Button>
					</div>
				</template>
			</div>
		</div>
	</div>
</template>
<script>
	import moment from 'moment'
	import util,{_} from '@/libs/util'
	import common from '@/libs/common.mixin'
	import globals from '@/libs/globals.mixin'
	import SelectStudent from 'c%/SelectStudent.vue'
	import SelectCustomer from 'c%/SelectCustomer.vue'
	import SituationPage from '../service/situation/study-situation.vue'
	import SituationRecord from '../service/situation/situation-record.vue'
	import SelectLessonBuySuit from '../service/situation/SelectLessonBuySuit.vue'
	export default {
		name: 'dashboard_situation',
		mixins: [common,globals],
		components: {
			SelectStudent,
			SelectCustomer,
			SituationPage,
			SituationRecord,
			SelectLessonBuySuit
		},
		data() {
			return {
				service: {					// 服务对象
					name: ''
				},
				qt_dids: [],				// 问卷类型id
				qt_types: [],				// 问卷类型
				questionnaires: [],			// 问卷
				questionnaire_items: [],	// 问卷条目
				study_situation_items: [],	// 学情记录所有条目
				info: {						// 学情记录
					qid: 0,
					sid: 0,
					cu_id: 0,
					title: '',
					remark: '',
					content: [],
					lbs_id: 0,
					lbs_define: []
				},
				action: 'add',
				editData: {},
				isCollapsed: false,
				edit_ss_id: 0
			}
		},
		mounted() {
			this.getQueryParams()
			this.getQuestionnaires()
		},
		methods: {
			getQueryParams() {
				let data = this.$route.params.data
				if(typeof data!=='undefined') {
					this.info.sid = data.sid
					this.info.cu_id = data.cu_id
					this.select(data.student||data.customer)
					this.edit_ss_id = data.ss_id
				}
			},
			send() {
				this.$rest('study_situations')
				.add_url_param(this.info.ss_id,'push_preview')
				.post()
				.success(res => {
					this.$Modal.open('service/situation/push-info-modal.vue',{
						on: {
							'on-success':() => {
								this.refreshAfterPush()
							}
						}
					})
					.then(modal => {
						modal.vuec
						.set('ssId',this.info.ss_id)
						.set('data',res.data)
						.show('推送学情服务给【'+this.service.name+'】家长','view')
					})
				})
				.error(res => {
					this.error(res.body.message)
				})
			},
			refreshAfterPush() {
				this.$rest('study_situations')
				.get({
					ss_id: this.info.ss_id
				})
				.success(res => {
					if(res.list.length > 0) {
						let info = res.list[0]
						this.info.is_push = 1
						this.info.push_time = info.push_time
						this.info.short_id = info.short_id
					}
				})
				.error(res => {
					this.$Message.error(res.body.message)
				})
			},
			selectS(data) {
				this.info.cu_id = 0
				this.select(data)
			},
			selectC(data) {
				this.info.sid = 0
				this.select(data)
			},
			select(data) {
				this.service = data
				this.service.name = data.student_name || data.name
				if(this.action == 'edit') {
					this.action = 'add'
					this.reset()
				}else{
					this.$nextTick(() => {
						this.info.title = this.service.name+'的学情现状'
					})
				}
			},
			changeAction({action,data}) {
				this.action = action
				if(action == 'edit') {
					this.info = util.copy(data)
					let infoContent = util.copy(this.info.content)
					this.qt_dids.splice(0)
					infoContent.forEach(c => {
						this.qt_dids.push(c.qt_did)
					}) 
					if(this.info.lesson_buy_suit&&this.info.lesson_buy_suit.define) {
						this.info.lbs_define = this.info.lesson_buy_suit.define
					}
					if(this.info.questionnaire&&this.info.questionnaire.questionnaire_item.length) {
						this.getCurrentQtType(this.info.questionnaire)
						this.questionnaire_items = this.info.questionnaire.questionnaire_item
						this.builtQuestions()
						this.buildSituationData()
					}
					
					infoContent.forEach(c => {
						let index = this.info.content.findIndex(item => c.qt_did == item.qt_did)
						if(index > -1) {
							this.info.content.splice(index,1,c)
						}else{
							this.info.content.push(c)
						}
					})
				}else{
					this.reset()
				}
			},
			selectLbs(data) {
				this.info.lbs_define = data.define
			},
			clearLbs() {
				console.log('clear')
				this.info.lbs_define.splice(0)
			},
			collapsedSider() {
				this.isCollapsed = !this.isCollapsed
			},
			age() {
				let time = this.service.birth_time
				if(_.isUndefined(time)) {
					return ''
				}
				return this.getAge(time)
			},
			getQuestionnaires() {
				this.$rest('questionnaires')
				.get({
					pagesize:1000,
					order_field:'qid',
					order_sort:'asc'
				})
				.success(res => {
					this.questionnaires = res.list
				})
				.error(res => {
					this.$Message.error(res.body.message)
				})
			},
			// 获取当前问卷类型
			getCurrentQtType(data) {
				this.qt_types.splice(0)
	        	if(data&&data.qt_dids.length) {
	        		data.qt_dids.forEach(item => {
		        		let qobj = this.dicts('questionnaire_type').find(q => q.did == item)
		        		if(qobj) {
		        			this.qt_types.push(qobj)
		        		}
		        	})
	        	}
			},
			// 选择问卷
			selectQt(value) {
				if(this.action == 'edit' || !this.info.qid) return false;
				let	questionnaire = this.questionnaires.find(item => item.qid == value)
				this.qt_dids.splice(0)
				this.getCurrentQtType(questionnaire)
				this.$rest('questionnaire_items')
				.get({
					pagesize:1000,
					qid:value,
					order_field:'qi_id',
					order_sort:'asc'
				})
				.success(res => {
					this.questionnaire_items = res.list
					this.builtQuestions()
					this.buildSituationData()
				})
				.error(res => {
					this.$Message.error(res.body.message)
				})
			},
			builtQuestions() {
				this.study_situation_items.splice(0)
				this.questionnaire_items.forEach(item => {
					this.study_situation_items.push(this.buildQuestionItem(item))
				})
			},
			// 构造一条问卷题目
			buildQuestionItem(item) {
				let obj = {}
				obj.qid = item.qid
				obj.qi_id = item.qi_id
				obj.choices = []
				obj.is_multi = item.is_multi
				obj.qt_did = item.qt_did
				obj.title = item.title

				obj.answer = []
				obj.score = 0
				obj.is_unknown = 0
				obj.next_int_day = ''
				obj.is_parent_focus = 0

				item.choices.forEach(item => {
					obj.choices.push({
						value:item,
						select$:false
					})
				})

				return obj
			},
			// 构造学情记录content的item
			buildContentItem(item) {
				let obj = {}
				obj.qid = this.info.qid
				obj.questions = this.study_situation_items.filter(qi => qi.qt_did == item.did)
				obj.title = item.title
				obj.qt_did = item.did
				obj.int_day = moment().format('YYYY-MM-DD')
				obj.sid = this.sid
				obj.cu_id = this.cu_id
				obj.name = this.service.name
				obj.create_eid = this.eid$
				obj.remark = ''

				return obj
			},
			// 构造学情记录
			buildSituationData() {
				let content = []
				this.qt_types.forEach(item => {
					content.push(this.buildContentItem(item))
				})
				this.info.content = content
			},
			checkAnswer(data) {
				for(let i=0,len=data.length;i<len;i++) {
					for(let j=0,len_item=data[i].questions.length;j<len_item;j++) {
						let item = data[i].questions[j]
						if(item.answer.length==0&&!item.is_unknown) {
							this.$Message.error(`【${data[i].title}】的【${item.title}】没有选择`)
							return false
						}
					}
				}
				return true
			},
			save() {
				let [method,message] = this.action == 'add' ? ['post','保存成功'] : ['put','编辑成功']
				let $rest = this.$rest('study_situations')
				let data = util.copy(this.info),rest_data = {}
				data.content = data.content.filter(data => this.qt_dids.indexOf(data.qt_did) > -1)

				if(data.sid==0&&data.cu_id==0) {
					this.$Message.error('请选择服务对象')
					return false
				}
				if(!this.checkAnswer(data.content)) return false

				if(this.action == 'edit') {
					$rest.add_url_param(this.info.ss_id)
					for(let key in data) {
						if(['qid','sid','lbs_id','cu_id','title','remark','content'].indexOf(key) > -1) {
							rest_data[key] = data[key]
						}
					}
				}else{
					rest_data = data
				}
				$rest[method](rest_data)
				.success(res => {
					this.$Message.success(message)
					this.$r('record').getSituation()
					if(this.action == 'add') {
						this.reset()
					}
				})
				.error(res => {
					this.error(res.body.message)
				})
			},
			reset() {
				for(let key in this.info) {
					if(['qid','sid','lbs_id','lbs_define','cu_id','title','remark','content'].indexOf(key) === -1) {
						delete this.info[key]
					}
				}
				this.info.remark = ''
				this.info.lbs_id = 0
				this.qt_dids.splice(0)
				this.info.title = this.service.name+'的学情现状'
				this.$nextTick(() => {
					this.$r('questionnaire_select').clearSingleSelect()
				})
				if(this.info.lbs_id&&this.info.lbs_define.length) {
					this.info.lbs_define.splice(0)	
				}
			}
		},
		computed: {
			maxHeight() {
				let client = util.get_client_height()
				return client - 301
			},
			ques_name_edit () {
				let ques = this.questionnaires.find(q => q.qid==this.info.qid),
					name = ''
				if(ques) {
					name = ques.name
				}
				return name
			},
			ques_local() {
				return this.questionnaires.filter(q => q.bid==this.bid$)
			},
			ques_all() {
				return this.questionnaires.filter(q => q.bid==0)
			},
			rotateIcon () {
                return [
                    'menu-icon',
                    this.isCollapsed ? 'rotate-icon' : ''
                ]
            },
            situationClasses () {
                return [
                	'box',
                	'study-wrapper',
                	this.isCollapsed ? 'collapsed-study': '',
                	this.qt_dids.length==0&&this.info.qid>0&&this.action=='add'?'qt-empty':''
            	]
            },
            recordClasses () {
            	return [
            		'box',
            		'record-wrapper',
            		this.isCollapsed ? 'collapsed-record' : ''
            	]
            }
		}
	}
</script>