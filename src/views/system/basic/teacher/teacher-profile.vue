<template>
	<Card dis-hover>
		<div slot="title">
			<Icon size="24" type="ios-person" style="vertical-align: middle;"></Icon>
			{{'老师'|translate}}信息
		</div>
		<template v-if="!isEmptyObj">
			<div class="row" style="align-items:center;justify-content:center">
				<div class="col-sm-4">
					<div class="row" style="align-items:center;justify-content:center">
						<div class="avatar-wrap col-sm-6">
							<letter-avatar 
								:name='info.ename' 
								:src="info.photo_url" 
								size='120' 
								:rounded="true">
							</letter-avatar>
							<Button 
								class="mt-4 mb-1" 
								type="ghost" 
								icon="ios-camera-outline" 
								size="small"
								@click="changeAvatar">更换头像
							</Button>
						</div>
						<div class="profile-wrap col-sm-6">
							<h3>
								{{info.ename}}
								<span v-if="info.nick_name">/&nbsp;{{info.nick_name}}</span>
							</h3>
							<div class="item">
								{{info.sex|sex}}
								<span v-if="info.birth_year">·&nbsp;{{age}}</span>
							</div>
						</div>
					</div>
				</div>
				<div class="col-sm-8">
					<Card dis-hover>
						<div slot="title">
							<Icon type="information-circled" style="vertical-align: middle;" size="24"></Icon>
							基础信息
						</div>
						<div class="clearfix">
							<Form :label-width="80" class="row">
								<Form-item label="昵称：" class="mb-0 col-sm-4">
									{{info.nick_name || '未设置'}}
								</Form-item>
								<Form-item label="联系电话：" class="mb-0 col-sm-4">
									{{info.mobile}}
								</Form-item>
								<Form-item label="出生日期：" class="mb-0 col-sm-4">
									{{info.birth_time || '未设置'}}
								</Form-item>
								<Form-item label="邮箱：" class="mb-0 col-sm-4" :title="info.email">
									<div class="notwrap">
										{{info.email || '未设置'}}
									</div>
								</Form-item>
								<Form-item label="银行卡号：" class="mb-0 col-sm-4">
									{{info.bank_card_no || '未设置'}}
								</Form-item>
								<Form-item label="身份证号：" :title="info.id_card_no" class="mb-0 col-sm-4">
									<div class="notwrap">
										{{info.id_card_no || '未设置'}}
									</div>
								</Form-item>
								<Form-item label="状态：" class="mb-0 col-sm-4">
									{{info.is_on_job==0?'离职':'在职'}}
								</Form-item>
								<Form-item label="入职日期：" class="mb-0 col-sm-4">
									{{join_int_day}}
								</Form-item>
								<Form-item label="转正日期：" class="mb-0 col-sm-4">
									{{official_int_day}}
								</Form-item>
								<Form-item label="教师星级：" class="mb-0 col-sm-4" v-if="enable_teacher_level">
									{{teacherLevelText(info.teacher_level)}}
								</Form-item>
								<Form-item label="账号：" class="mb-0 col-sm-4">
									<span class="text-warning" v-if="info.uid==0">未开通</span>
									<div v-else>
										{{info.account}}&nbsp;·
										<span class="text-success" v-if="info.user_status==1">已开启</span>
										<span class="text-danger" v-else>已禁用</span>
									</div>
								</Form-item>
								<template v-for="item in option_fields">
									<Form-item :label="item.label+':'" class="mb-0 col-sm-4" v-if="item.type != 'textarea'">
										{{item.value}}
									</Form-item>
									<Form-item :label="item.label+':'" class="mb-0 col-sm-12" v-if="item.type == 'textarea'">
										{{item.value}}
									</Form-item>
								</template>	
							</Form>
							<operation-items 
								class="pull-right" 
								:info="info" 
								@edit="edit"
								@open-account="openAccount"
								@edit-account="editAccount"
								@disable-account="disableAccount"
								@active-account="activeAccount"
								@leave="leave"
								@checkout-free-time="checkoutFreeTime">
							</operation-items>
						</div>
					</Card>
				</div>
			</div>
			<avatar-upload 
				ref="avatarUpload"
				@on-save-success="refresh">
			</avatar-upload>
			<info-modal 
				ref="ref_info" 
				@save="refresh">
			</info-modal>
			<account-modal 
		        :employee="current_teacher"
		        @save="refresh" 
		        ref="accountModal">
	        </account-modal>
	        <leave-modal
		        @save="refresh"
		        ref="leaveModal">
	        </leave-modal>
	        <teacher-free-time ref="freeModal" :eids="extEids">
	        </teacher-free-time>
		</template>
		<template v-else>
			<p class="text-center p-4">没有数据</p>
		</template>
	</Card>
</template>
<script>
	import moment 			from 'moment'
	import common 			from '@/libs/common.mixin'
	import globals 			from '@/libs/globals.mixin'
	import {_}				from '@/libs/util'
	import util 			from '@/libs/util'
	import letterAvatar     from 'c%/LetterAvatar.vue'
	import AvatarUpload 	from 'c%/AvatarUpload.vue'
	import OperationItems 	from './operation-items.vue'
	import InfoModal    	from '@/views/system/staff/employee/info-modal.vue'
	import AccountModal 	from '@/views/system/staff/employee/account-modal.vue'
	import LeaveModal 		from './leave-modal.vue'
	import TeacherFreeTime  from 'c%/TeacherFreeTime.vue'

	export default {
		mixins: [common,globals],	
		components: {
			letterAvatar,
			AvatarUpload,
			OperationItems,
			InfoModal,
			AccountModal,
			LeaveModal,
			TeacherFreeTime
		},
		props: {
			eid: {
				type: Number,
				default:() => {
					return 0
				}
			}
		},
		data() {
			return {
				info: {},
				pk:'eid',
				rest_api: 'employees',
				current_teacher:{
                    eid:0,
                    uid:0
                },
                extEids: []
			}
		},
		computed: {
			age() {
				return this.info.birth_year == 0 ? '未设置' : moment(new Date()).format('YYYY')-this.info.birth_year + '岁'
			},
			isEmptyObj() {
				return _.isEmpty(this.info)
			},
			official_int_day() {
				return this.info.official_int_day == 0 ? '未设置' : this.$filter('int_date')(this.info.official_int_day)
			},
			join_int_day() {
				return this.info.join_int_day == 0 ? '未设置' : this.$filter('int_date')(this.info.join_int_day)
			},
			option_fields(){
				let fields = []
				let fields_map = {}
				let employee_option_fields = this.$store.state.gvars.configs.employee_option_fields
				let employee_option_value  = this.info.option_fields

				let get_field_value = function(obj,f){
					if(obj && obj[f]){
						return obj[f]
					}
					return ''
				}
				employee_option_fields.forEach(f=>{
					if(f.enable == 1){
						fields.push({
							label:f.label,
							value:get_field_value(employee_option_value,f.name),
							type:f.type
						})
					}
				})				

				return fields
			},
		},
		methods: {
			changeAvatar() {
				let post = {
        			eid: this.info.eid,
	        		_name: '',
	        		mod: 'employee_avatar',
	        		_b64file: ''
        		}
        		
        		this.$refs['avatarUpload']
        		.set('post',post)
        		.show('修改头像','add')
			},
			edit() {
				
				let row = util.copy(this.info)
                let join = row.join_int_day,
                    official = row.official_int_day
                if(join!==0) {
                    row.join_int_day = this.$filter('int_date')(join)
                }
                if(official!==0) {
                    row.join_int_day = this.$filter('int_date')(official)
                }
                this.$r('ref_info')
                .set('info',{employee:row})
                .show(util.sprintf('编辑员工:%s',row.ename),'edit')
			},
			openAccount() {
				this.current_teacher = util.copy(this.info)
                this.$r('accountModal')
                .show(util.sprintf('开启账号:%s',this.info.ename),'add')
			},
			editAccount() {
				this.$rest('employees').add_url_param(this.info.eid,'user')
				.get()
				.success(res => {
					this.modify_account(res.account)
				})
				.error(res => {
					this.error(res.body.message)
				})
				
			},
			modify_account(account) {
				this.current_teacher = util.copy(this.info)
                let param = {
                    account: account,
                    password: ''
                }
                this.$r('accountModal')
                .set('info',param)
                .show(util.sprintf('修改账号:%s',this.info.ename),'edit')
			},
			disableAccount() {
				this.confirm(util.sprintf('您确定要禁用【%s】的账号吗?',this.info.ename))
				.then(()=>{
					this.do('disable',this.info).then(response=>{
	                    this.$Message.success('禁用账号成功!')
	                })
				})
				.catch(()=>{})
			},
			activeAccount() {
				this.do('active',this.info).then(response=>{
                    this.$Message.success('启用账号成功!')
                })
			},	
			leave() {
				this.$r('leaveModal')
                .set('info',this.info)
                .show(util.sprintf('离职:%s',this.info.ename),'leave')
			},
			do(action,row,params){
	        	return new Promise((resolve,reject)=>{
	                this.$rest(this.rest_api)
	                .add_url_param(row[this.pk],'do'+action)
	                .post(params)
	                .success(response=>{
	                    this.refresh()
	                    resolve(response)
	                })
	                .error(response=>{
	                    this.error(response.body.message)
	                    reject(response)
	                })
	        	})
	        },
	        checkoutFreeTime() {
	        	this.$r('freeModal')
	        	.show(this.$filter('translate')('老师')+'空闲时间查询','free')
	        },
			get_current_data() {
				this.$rest(this.rest_api)
                .get({eid: this.eid})
                .success(response=>{
                	this.info = response.list[0]
                })
                .error(response=>{
                    this.$Message.error(response.body.message)
                })
			},
			refresh() {
				this.get_current_data()
				this.$store.dispatch('updateGlobalVar','employees')
			},
			getEmployee(eid) {
				return this.$store.state.gvars.employees.find(item=>item.eid == eid)
			},
			teacherLevelText(v){
	            if(v == -1){
	                return '-'
	            }
	            let txt = v
	            try{
	            	txt = this.$store.state.gvars.configs.params.teacher_level.level[v].name
	        	}catch(e){

	        	}
	        	return txt
			}
		},
		watch: {
			eid(id) {
				this.info = util.copy(this.getEmployee(id))
				if(this.extEids.length == 0) {
					this.extEids.push(id)
				}else{
					this.extEids.splice(0,1,id)
				}
			}
		}
	}
</script>
<style lang="less">
	.avatar-wrap {
		text-align: center;
	}
	.profile-wrap {
		>h3{
			font-weight: 500;
			color: #3e3a3a;
			>span {
				font-size: 18px;
			}
		}
		>.item {
			margin-top: 10px;
		} 
	}
</style>