<template>
	<div class="c-grid">
		<div class="box box-query">
			<Form ref="ref_search" :model="search_field" :label-width="70" class="filter-form mt-3 row">
				<Form-item label="学员姓名" prop="student_name" class="col-md-3 col-sm-6">
					<Input v-model="search_field.student_name" placeholder="请输入学员姓名 / 拼音"></Input>
				</Form-item>				
				<Form-item label="账号" prop="first_tel" class="col-md-3 col-sm-6">
					<Input v-model="search_field.first_tel" placeholder="请输入账号"></Input>					
				</Form-item>
				<Form-item label="微信" prop="wechat_bind" class="col-md-3 col-sm-6">
					<Select v-model="search_field.wechat_bind">
						<Option :value="-1">不限</Option>
						<Option :value="0">未绑定</Option>
						<Option :value="1">已绑定</Option>
					</Select>
				</Form-item>
				<Form-item label="学员状态" prop="status" class="col-md-3 col-sm-6">
					<Select v-model="search_field.status">
						<Option v-for="(value,key) in ss_map" :value="key" :key="key">{{value.text}}</Option>
					</Select>
				</Form-item>	
				<template v-if="searchExpand">
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
				</template>			
			</Form>
			<Row class="basic">
                <Col span="24" class="mt-2" style="margin-left:0px;">                	
                	<Button-group>
                        <Button class="ml-2" type="primary" @click="search" icon="ios-search">查询</Button>
                        <Button type="primary" :icon="toggleSearchIcon" @click="toggleSearch"></Button>
                    </Button-group>
                	<Button type="primary" icon="refresh" @click="resetSearch">重置</Button>  

                	<export-button res="students" :params="params"></export-button>             	           	
                </Col>
           </Row>			
		</div>
		<div class="box box-result">
			<div class="toolbar">		
				<RadioGroup v-model="data_mode" type="button">
			        <Radio label="list"><Icon type="navicon"></Icon>　列表</Radio>
			        <Radio label="avatar"><Icon type="image"></Icon>　头像</Radio>
			    </RadioGroup>
			    <Button 
    				type="primary" 
    				class="ml-3"
    				@click="batchIssueCard" 
    				icon="more" 
    				:disabled="users.length==0"
    				v-per="'student.issue'" 
    				title="勾选后操作"
    				>
    				批量发放会员卡 {{users.length?users.length:''}}
				</Button>
				<filter-column :keys="column_keys"></filter-column>
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
		            	@on-select="selectOne"
		            	@on-select-cancel="cancelSelect"
		            	@on-select-all="selectAll"
		            	@on-selection-change="selectChange"
		            	@on-sort-change="sortChange"
		            	> 
		            </Table>
		            
		            <div class="row" v-show="data_mode=='avatar'">
		            	<div class="col-lg-2 col-md-3 col-sm-4 mb-3 padder-sm" v-for="(item,index) in data">
			            	<Card dis-hover>
			            		<div slot="title" class="clearfloat">
			            			<Button type="text" icon="ios-telephone">{{item.first_tel||item.second_tel}}</Button>
			            			<Tag class="pull-right" :color="item.first_openid=='' || item.first_openid == undefined ?'default':'green'">
			            				<Icon type="chatbubble"></Icon>
			            				{{item.first_openid == undefined || item.first_openid=='' ? '未绑定' : '已绑定'}}
			            			</Tag>
			            		</div>	
			            		<div class="text-center">
			            			<letter-avatar 
			            				title="点击查看详情"
			            				size='120' 
			            				:src="item.photo_url" 
			            				:name='item.student_name' 
			            				@click.native="studentDetail(item.sid)" 
			            				:rounded=true>
			            			</letter-avatar>
			            			<h5 class="mt-2">
			            				<a @click="studentDetail(item.sid)">
											<Icon :type="item.sex=='1'?'man':'woman'"></Icon>
											{{item.student_name}}
										</a>
										<Tag color="blue">
											{{getAge(item.birth_time)||'-'}}
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
				rest_api: 'students',
				pk: 'sid',
				users:[], 
				showCheckbox: true,
				data_mode: 'list',
				showIndex: false,
				search_field: {
					student_name: '',
					nick_name: '',
					first_tel: '',
					card_no: '',
					status: -1,
					create_time: [],
					wechat_bind: -1
				},
				column_keys: {
					index: {
						type: 'index',
	                    width: 60,
	                    align: 'center'
					},
					student_name: {
						title: '姓名',
						show: true
					},					
					account: {
						title: '账号',
						show: true
					},
					is_bind_wx: {
						title: '微信',
						show: true
					},
					status: {
						title: '状态',
						show: true
					},
					nick_name: {
						title: '英文名/昵称',
						show: true
					},
					sex: {
						title: '性别',
						show: false
					},									
					age: {
						title: '年龄',
						show: true
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
									sex: params.row.sex,
									'detail-action': 2,
									sid: params.row.sid
								}
							}
						)
					},
					account (h,params) {
						let row = params.row,
							result = []
						if(row.first_tel!=''){
							result.push(
								h('Tag',row.first_tel)
							)
						}
						if(row.second_tel != ''){
							result.push(
								h('Tag',row.second_tel)
							)
						}
						
						return h('div',result)
					},
					is_bind_wx (h,params) {
						let row = params.row,
							tag = {color: 'default',label: '未绑定'}
						if(
							(row.first_openid && row.first_openid != '') ||
							(row.second_openid && row.second_openid != '')
						){
							tag.color = 'green'
							tag.label = '已绑定'
						}
						return h('Tag',{
							props:{
								type:'border',
								color: tag.color	
							}							
						},tag.label)
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
						let map_sex = {0:'未设置',1:'男',2:'女'}
						return h('span',map_sex[params.row.sex])
					},
					age (h,params) {
						if(params.row.birth_time !== 0) {
							return h('span',this.getAge(params.row.birth_time)||'-')
						}
					},
					first_family_rel (h,params) {
						let row = params.row,
						rel = this.$filter('family_rel')(row.first_family_rel),
						name = row.first_family_name==''?'未填写':row.first_family_name,
						result = rel+' / '+name
						if(row.first_family_rel===1){
							result = rel
						}						
						return util.sprintf('%s',result) 
					},
					second_family_rel (h,params) {
						let row = params.row,
						rel = this.$filter('family_rel')(row.second_family_rel),
						name = row.second_family_name==''?'未填写':row.second_family_name,
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
				operation_keys: {
					editPwd: {
						title: '重置密码',
						type: 'edit'
					},
					bind: {
						title: '绑定微信',
						type: 'qr-scanner',
						condition: '!params.row.first_openid'
					},
					unBind: {
						title: '取消绑定微信',
						type: '"close-circled',
						condition: 'params.row.first_openid'
					},
					issue: {
						title: '发放会员卡',
						type: 'card',
						per: 'student.issue'
					},
					mobile: {
						title: '登录手机端',
						type: 'ipad'
					}
				},
				operation_func: {
					editPwd (params) {
						this.editPwd(params);
					},
					bind (params) {
						this.bind(params);
					},
					unBind (params) {
						this.unBind(params);
					},
					mobile (params) {
						this.openMobile(params);
					},
					issue (params) {
						this.issueCard(params.row)
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
			issueCard(row) {
				this.$Modal.open('service/sm/tab-card/issue-modal.vue',{
					props: {
						users: [row]
					},
					on: {
						'on-success':() => {
							this.init_data()
						}
					}
				})
				.then(modal => {
					modal.show('发放会员卡【'+row.student_name+'】')
				})
			},
			batchIssueCard() {
				this.$Modal.open('service/sm/tab-card/issue-modal.vue',{
					props: {
						users: this.users
					},
					on: {
						'on-success':() => {
							this.init_data()
						}
					}
				})
				.then(modal => {
					modal.show('批量发放会员卡')
				})
			},
			bind(params) {
				let uid = params.row.first_uid;
				this.$rest('users')
				.add_url_param(uid,'wechat_qrcode')
				.get()
				.success(data=>{
					this.$Modal.open('business/student/qr-modal')
					.then(modal=>{
						modal.set('uri',data.url)
						.show('绑定微信')
					})
				})
				.error(response=>{
					this.$Notice.error({
						title: '失败',
						desc: response.body.message||'绑定失败'
					})
				})
			},
			unBind (params) {
				let uid = params.row.first_uid;
				this.$rest('users')
				.add_url_param(uid,'dounbind')
				.post()
				.success(data=>{
					this.$Message.success('解绑成功')
					this.refreshData()
				}).error(response=>{
					this.$Notice.error({
						title: '失败',
						desc: response.body.message||'绑定失败'
					})
				})
			},
			openMobile(params) {
				this.$rest('students')
				.add_url_param(params.row.sid,'domktoken')
				.post()
				.success(response=>{
					this.$Modal.open('service/sm/browser-modal.vue')
					.then(modal=>{
						modal
						.set('url',response.data.url)
						.show(params.row.student_name +'的学习管家')
					})
				})
				.error(response=>{
					this.$Notice.error({
						title: '失败',
						desc: response.body.message||'登录失败'
					})
				})
			},
			editPwd(params) {
				let info = {
					account: params.row.first_tel,
					password: ''
				}
				this.$Modal.open('business/student/info-password.vue@modal',{
					on:{
						'on-success': ()=>{
							this.init_data()
						}
					}
				})
				.then(modal=>{
					modal.set('info',info)
					.set('uid',params.row.first_uid)
					.show('修改密码')
				})
			},
			studentDetail (sid) {
				this.$router.push({path:'/business/student/'+sid})
			},
			addUids(row) {
	        	let index = this.users.findIndex(user => user.first_uid == row.first_uid)
	        	if(index==-1) {
	        		this.users.push(row)
	        	}
	        },
	        removeUids(row) {
	        	let index = this.users.findIndex(user => user.first_uid == row.first_uid)
	        	this.users.splice(index,1)
	        },
	        deal_data(data) {
	        	data.list.forEach(item => {
	        		if(this.users.findIndex(user => user.first_uid == item.first_uid)>-1) {
	        			item._checked = true
	        		}
	        		if(item.status !== 1) {
	        			item._checked = false
	        			item._disabled = true
	        		}
	        	})
	        	return data.list
	        },
	        selectOne (selection,row) {
				this.addUids(row)
			},
			cancelSelect (selection,row) {
				this.removeUids(row)
			},
			selectAll (selection) {
				selection.forEach(item => {
					this.addUids(item)
				})
			},
			selectChange (selection) {
				if(selection.length == 0){
					this.data.forEach(item => {
						this.removeUids(item)
					})
				}
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
						if(o=='wechat_bind'){
							if(property!=-1){
								params[o] = property								
							}
						}else{
							if(property&&property!=-1){
								params[o] = property								
							}
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

