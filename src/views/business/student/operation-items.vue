<template>
	<Dropdown trigger="click">
		<slot>
			<Button type="primary" size="small">操作 <Icon type="arrow-down-b"></Icon></Button>
		</slot>
		<DropdownMenu slot="list" style="max-width:100px;">
			<DropdownItem v-per="'dashboard.sendsms'" @click.native="sendSms">
				<Icon type="chatbubble"></Icon>  发送短信
			</DropdownItem>
			<DropdownItem v-per="'student.backSchool'" @click.native="backSchool" v-if="info.status==30">
				<Icon type="university"></Icon>  复学
			</DropdownItem>
			<DropdownItem v-per="'student.admission'" @click.native="admission" v-else-if="info.status==90">
				<Icon type="ios-arrow-back"></Icon>  恢复入学
			</DropdownItem>
			<DropdownItem v-per="'student.unarchive'" @click.native="unarchive" v-else-if="info.status==100">
				<Icon type="ios-checkmark-outline"></Icon>  解封
			</DropdownItem>
			<template v-else>
				<Dropdown :placement="subPlacement">
	            	<DropdownItem><Icon type="university"></Icon> 档案 <Icon type="ios-arrow-right"></Icon></DropdownItem>
	            	<DropdownMenu slot="list">
	            		<DropdownItem v-per="'student.edit'" @click.native="editStudent">
			            	<Icon type="edit"></Icon>  修改资料
			            </DropdownItem>
			            <DropdownItem v-per="'student.edit'" @click.native="changeAvatar">
			            	<Icon type="camera"></Icon>  更换头像
			            </DropdownItem>
			            <DropdownItem v-per="'student.assign'" @click.native="assignTeacher" >
			            	<Icon type="university"></Icon> {{isCancel?'取消':'分配'}}{{'学管师'|translate}}
			            </DropdownItem>
			            <!-- <DropdownItem v-per="'app.faceatt'" @click.native="faceCollection">
			            	<Icon type="social-octocat"></Icon>  人脸采集
			            </DropdownItem> -->
			            <DropdownItem v-if="info.status == 1" v-per="'student.leaveSchool'" @click.native="leaveSchool">
			            	<Icon type="coffee"></Icon>  休学
			            </DropdownItem>
			            <DropdownItem v-per="'student.dropOut'" @click.native="dropOut">
			            	<Icon type="log-out"></Icon>  退学
			            </DropdownItem>
			            <DropdownItem v-if="bids_user&&bids_user.length>0" v-per="'student.transferschool'" @click.native="transferSchool">
			            	<Icon type="ios-redo"></Icon>  转校
			            </DropdownItem>
			            <DropdownItem v-if="info.status!==100" v-per="'student.delete'" @click.native="deleteStudent">
			            	<Icon type="ios-trash"></Icon>  删除
			            </DropdownItem>
			            <DropdownItem v-if="info.status!==100" v-per="'student.lock'" @click.native="lockStudent">
			            	<Icon type="locked"></Icon>  封存学员
			            </DropdownItem>
						<DropdownItem v-if="enable_project" @click.native="share_shuffle">
			            	<Icon type="ios-shuffle"></Icon>  共享项目
			            </DropdownItem>
	            	</DropdownMenu>
	            </Dropdown>
	            
	            <Dropdown :placement="subPlacement">
	            	<DropdownItem><Icon type="social-usd"></Icon>  费用 <Icon type="ios-arrow-right"></Icon></DropdownItem>
	            	<DropdownMenu slot="list">
	            		<DropdownItem v-per="'student.pay'" @click.native="payment">
			            	<Icon type="cash"></Icon>  缴费
			            </DropdownItem>
			            <DropdownItem v-per="'student.refund'" @click.native="refund">
			            	<Icon type="reply"></Icon>  退费
			            </DropdownItem>
			            <DropdownItem v-per="'student.transfer'" @click.native="transfer">
			            	<Icon type="arrow-shrink"></Icon>  结转
			            </DropdownItem>
			            <DropdownItem v-per="'hour.reg'" @click.native="regHour">
			            	<Icon type="ios-compose"></Icon></Icon>  登记课耗
			            </DropdownItem>
            		</DropdownMenu>
            	</Dropdown>
            	<Dropdown :placement="subPlacement">
	            	<DropdownItem><Icon type="ios-list-outline"></Icon>  课程 <Icon type="ios-arrow-right"></Icon></DropdownItem>
	            	<DropdownMenu slot="list">
	            		<DropdownItem v-per="'student.leave'" @click.native="leave">
			            	<Icon type="android-checkbox-outline"></Icon>  请假
			            </DropdownItem>
	            		<DropdownItem v-per="'student.transferclass'" @click.native="transferClass">
			            	<Icon type="arrow-swap"></Icon>  转班
			            </DropdownItem>
			            
			            <DropdownItem v-per="'student.closeLesson'" @click.native="closeLesson">
			            	<Icon type="close"></Icon>	结课
			            </DropdownItem>
			            <DropdownItem v-per="'student.stopLesson'" @click.native="stopLesson">
			            	<Icon type="stop"></Icon>	停课
			            </DropdownItem>
			            <DropdownItem v-per="'student.resumeLesson'" @click.native="resumeLesson">
			            	<Icon type="compose"></Icon>  复课
			            </DropdownItem>
			            <DropdownItem v-if="need_lha" @click.native="arrangeClassHours">
			            	<Icon type="shuffle"></Icon>  安排课时
			            </DropdownItem>			            
            		</DropdownMenu>
            	</Dropdown>
            	<Dropdown :placement="subPlacement">
	            	<DropdownItem><Icon type="shuffle"></Icon>  转让 <Icon type="ios-arrow-right"></Icon></DropdownItem>
	            	<DropdownMenu slot="list">
						<DropdownItem v-per="'student.transhour'" @click.native="transferLessonHour">
			            	<Icon type="shuffle"></Icon>  转让课时
			            </DropdownItem>
						<DropdownItem v-if="Number(info.money) > 0" v-per="'student.transmoney'" @click.native="transferMoney">			            	
			            	<Icon type="shuffle"></Icon>  转让金额
			            </DropdownItem>
            		</DropdownMenu>
            	</Dropdown>
            </template>
            <Dropdown placement="right-start">
                <DropdownItem>
            		<Icon type="ionic"></Icon> 服务
                    <Icon type="ios-arrow-right"></Icon>
                </DropdownItem>
                <DropdownMenu slot="list">
                    <DropdownItem @click.native="serviceRecord" v-per="'student.addrecord'"><Icon type="plus"></Icon> 记录</DropdownItem>
                    <DropdownItem @click.native="serviceTask" v-per="'student.addtask'"><Icon type="plus"></Icon> 安排</DropdownItem>
                </DropdownMenu>
            </Dropdown>
            
        </DropdownMenu>
	</Dropdown>
</template>

<script>
	import util,{_} from '@/libs/util'
	import common from '@/libs/common.mixin'
	import globals from '@/libs/globals.mixin'
	export default{
		name: 'operationItems',
		mixins: [common,globals],
		props: {
			info: {
				type: Object,
				default: function () {
					return {}
				}
			},
			refs: {
				type: Object,
				default: () => {
					return {}
				}
			},
			subPlacement: {
				type: String,
				default: 'right-start'
			}
		},
		computed: {
			isCancel () {
				let isCancel = false  
				if(!this.enable_multi_eid && this.info.employees && this.info.employees.length > 0){
					isCancel = true 
				}
				return isCancel
			}
		},
		methods: {
			serviceTask () {
				this.$Modal.open('service/service/task-modal.vue',{
                    props: {
                        sid: this.info.sid,
                        type: 1
                    },
                    on:{
                        'on-success':()=>{
                            this.$emit('success')
                        }
                    }
                })
                .then(modal=>{
                    modal
                    .show('添加服务安排','add')
                })
			},
			arrangeClassHours () {
				this.$Modal.open('business/student/order-items-modal.vue',{
					props: {
						sid: this.info.sid
					},
					on: {
						'on-success':()=>{
							this.$emit('success')
						}
					}
				})
				.then(modal=>{
					modal.show('查看学员报名项目【'+this.info.student_name+'】')
				})
			},
			serviceRecord () {
				this.$Modal.open('service/service/record-modal.vue',{
					props: {
						sid: this.info.sid,
						type: 1
					},
					on:{
						'on-success':()=>{
							this.$emit('success')
						}
					}
				})
				.then(modal=>{
					modal
					.show('添加服务记录','add')
				})
			},
			unarchive () {
				this.confirm('确定解封该学员吗？')
				.then(() => {
					this.$rest('students/unseal')
					.get({
						sid: this.info.sid
					})
					.success(res=>{
						this.$Message.success('解封成功')
						this.$emit('success')
					})
					.error(res=>{
						this.error(res.body.message)
					})
				})
			},
			editStudent () {
				let info = util.copy(this.info)
				if(info.birth_time === 0) {
					info.birth_time = ''
				}
				this.$Modal.open('business/student/info-modal.vue',{
					on:{
						'on-save-success':(e)=>{
							this.$emit('success','editStudent')
						}
					}
				}).then(modal=>{
					modal.set('info',info)
					.show('编辑学员档案【'+info.student_name+'】','edit')
				})
				
			},
			preview (src) {
				if(src) {
					this.preview_src = src
					this.modal_preview = true
				}
			},
			changeAvatar () {
				this.$Modal.open('components/AvatarUpload.vue@modal',{
					on: {
						'on-save-success': () => {
							this.$emit('success')
						}
					}
				})
				.then(modal => {
					modal
					.set('sid',this.info.sid)
					.show('更换头像','add')
				})
			},
			addLessonHour () {
				this.$Modal.open('business/hour/info-modal-student.vue@modal',{
					on: {
						'on-success': () => {
							this.$emit('success')
						}
					},
					props: {
						sid: this.info.sid
					}
				})
				.then(modal => {
					modal.show('登记课耗【'+this.info.student_name+'】','add')
				})
			},
			payment () {
				this.$router.push({name:'dashboard_payment',params:{sid:this.info.sid}})
				this.$emit('route-jump')
			},
			transfer () {
				this.$router.push({name:'dashboard_transfer',params:{sid:this.info.sid}})
				this.$emit('route-jump')
			},
			refund () {
				this.$router.push({name:'dashboard_refund',params:{sid:this.info.sid}})
				this.$emit('route-jump')		
			},
			transferMoney () {
				this.$Modal.open('business/student/transfer-money-modal.vue',{
					props: {
						student: this.info
					},
					on: {
						'on-success': ()=>{
							this.$emit('success')
						}
					}
				}).then(modal=>{
					modal.show('转让余额')
				})
			},
			transferClass () {
				this.$rest('students').add_url_param(this.info.sid,'class')
				.get()
				.success(data=>{
					if(!data.length){
						this.$Message.error('该学员暂无分班记录，无法转班')
						return
					}else{
						this.$Modal.open('business/student/transfer-class.vue@modal',{
							on: {
								'on-success':() => {
									this.$emit('success')
								}
							}
						})
						.then(modal => {
							modal
							.set('info',this.info)
							.set('data',data)
							.show('转班【'+this.info.student_name+'】','add')
						})
					}
				}).error(response=>{
					this.$Notice.error({
						title: '失败',
						desc: response.body.message||'获取班级失败'
					})
				})
			},
			transferSchool () {
				this.$Modal.open('business/student/transfer-school.vue@modal',{
					on:{
						'on-success': ()=>{
							this.$emit('success')
						}
					}
				}).then(modal=>{
					modal.set('info',this.info)
					.show(`【${this.info.student_name}】转校区`)
				})
			},
			closeLesson () {
				this.$rest('students')
				.add_url_param(this.info.sid,'student_lessons')
				.get()
				.success(response => {
					let data = []
					response.list.forEach(item => {
						if(item.lesson_status < 2) {
							data.push(item)
						}
					})
					if(data.length==0) {
						this.$Message.error('该学员未上课，无法结课')
					}else{
						this.$Modal.open('business/student/close-lesson.vue@modal',{
							on: {
								'on-success':() => {
									this.$emit('success')
								}
							}
						})
						.then(modal => {
							modal
							.set('info',this.info)
							.set('data',data)
							.show(util.sprintf('结课【%s】',this.info.student_name),'close')
						})
					}
				})
			},
			stopLesson () {
				this.$rest('students')
				.add_url_param(this.info.sid,'student_lessons')
				.get({is_stop:0})
				.success(response => {
					let data = []
					response.list.forEach(item => {
						if(item.lesson_status < 2) {
							data.push(item)
						}
					})
					if(data.length==0) {
						this.$Message.error('该学员未上课，无法停课')
					}else{
						this.$Modal.open('business/student/stop-lesson.vue@modal',{
							on: {
								'on-success':() => {
									this.$emit('success')
								}
							}
						})
						.then(modal => {
							modal
							.set('info',this.info)
							.set('data',data)
							.show(util.sprintf('停课【%s】',this.info.student_name),'stop')
						})
					}
				})
				.error(response => {
					this.error(response.body.message)
				})
			},
			resumeLesson () {
				this.$rest('students')
				.add_url_param(this.info.sid,'student_lessons')
				.get({is_stop:1})
				.success(response => {
					let data = []
					response.list.forEach(item => {
						if(item.lesson_status < 2) {
							data.push(item)
						}
					})
					if(data.length==0) {
						this.$Message.error('该学员没有停课记录')
					}else{
						this.$Modal.open('business/student/resume-lesson.vue@modal',{
							on: {
								'on-success':() => {
									this.$emit('success')
								}
							}
						})
						.then(modal => {
							modal.set('info',this.info)
							.set('data',data)
							.show(util.sprintf('复课【%s】',this.info.student_name),'resume')
						})
					}
				})
				.error(response => {
					this.error(response.body.message)
				})
			},
			leaveSchool () {
				this.$rest('students').add_url_param(this.info.sid,'lessonstops')
				.get({
					stop_type:1,
					stop_time:0,
					expired_time:0
				})
				.success(res => {
					let lessonstops = res.list
					if(lessonstops.length) {
						this.$Modal.open('business/student/leave-record.vue@modal',{
							on: {
								'on-success':() => {
									this.$emit('success')
								}
							}
						})
						.then(modal => {
							modal
							.set('list',lessonstops)
							.set('name',this.info.student_name)
							.show(util.sprintf('休学记录【%s】',this.info.student_name),'list')
						})
					}else{
						this.$Modal.open('business/student/leave-school-info.vue@modal',{
							on: {
								'on-success':() => {
									this.$emit('success')
								}
							}
						})
						.then(modal => {
							modal
							.set('student',this.info)
							.show(util.sprintf('休学【%s】',this.info.student_name),'suspend')
						})
					}
				})
				.error(res => {
					this.error(res.body.message)
				})
			},
			dropOut () {
				this.$Modal.open('business/student/dropout-info.vue@modal',{
					on: {
						'on-success':() => {
							this.$emit('success')
						}
					}
				})
				.then(modal => {
					modal
					.set('student',this.info)
					.show(util.sprintf('退学【%s】',this.info.student_name),'dropout')
				})
			},
			backSchool () {
				this.confirm(util.sprintf('确定要将【%s】复学吗？',this.info.student_name)).then(() => {
					this.$rest('students').add_url_param(this.info.sid,'doback')
					.post()
					.success(response => {
						this.$Message.success('复学成功')
						this.$emit('success')
					})
					.error(response => {
						this.error(response.body.message)
					})
				})
			},
			admission () {
				this.confirm(util.sprintf('确定要将【%s】恢复入学',this.info.student_name)).then(() => {
					this.$rest('students').add_url_param(this.info.sid,'doenrol')
					.post()
					.success(response => {
						this.$Message.success('恢复入学成功')
						this.$emit('success')
					})
					.error(response => {
						this.error(response.body.message)
					})
				})
			},
			// 请假
			leave () {
				this.$Modal.open('business/leave/info-modal.vue')
				.then(modal => {
					modal
					.set('sid',this.info.sid)
					.set('name',this.info.student_name)
					.show(util.sprintf('请假【%s】',this.info.student_name),'add')
				})
			},
			// 删除学员
			deleteStudent() {
				this.confirm(util.sprintf('确认删除学员【%s】吗？',this.info.student_name))
				.then(() => {
					this.$rest('students')
					.delete(this.info.sid,{params:{force:0}})
					.success(res => {
						this.$Message.success('操作成功')
						this.$emit('success')
					})
					.error(res => {
						this.error(res.body.message)
					})
				})
			},
			// 删除学员
			lockStudent() {
				this.confirm(util.sprintf('确认封存学员【%s】吗？',this.info.student_name))
				.then(() => {
					this.$rest('students')
					.add_url_param(this.info.sid,'dolock')
					.post({lock:1})
					.success(res=>{
						this.$Message.success('操作成功')
						this.$emit('success')
					})
					.error(res => {
						this.error(res.body.message)
					})
				})
			},
			share_shuffle (){
				this.$Modal.open('recruiting/select-projects.vue@modal',{
					props:{
						props_pj_ids:this.info.pj_ids
					},
					on: {
						"on-success": (pj_ids) => {
							let params = {pj_ids : pj_ids}
							this.$rest('students/'+this.info.sid+'/dopj_ids').post(params)
							.success(data=>{
								this.$Message.success('共享成功！')
								this.$emit('success')
							}).error(response=>{ 
								this.error(response.body.message||'共享失败~','error')
							})
						}
					}
				})
				.then(modal =>{
					modal.show('共享给其他项目')
				})
			},
			// 分配学管师
			assignTeacher() {
				let student_name = this.info.student_name,
					role_name = this.$filter('translate')('学管师')
				if(this.isCancel) {
					let es_ids = []
					this.info.employees.forEach(item =>{
						es_ids.push(item.es_id)
					})					
					this.confirm(util.sprintf('确定取消【%s】的%s【%s】吗？',student_name,role_name,this.$filter('ename')(this.info.eid)))
					.then(() => {
						this.$rest('employee_students')
						.add_url_param('delete_employee_student')
						.post({
							es_ids
						})
						.success(res => {
							this.$emit('success')
							this.$Message.success('取消成功')
						})
						.error(res => {
							this.error(res.body.message)
						})
					})
				}else{
					let modal = 'business/student/assign-teacher/assign-modal.vue'
					this.$Modal.open(modal,{
						on: {
							'on-success': () => {
								this.$emit('success')
							}
						}
					})
					.then(modal => {
						modal
						.set('info',this.info)
						.show(`分配${role_name}【${student_name}】`,'add')
					})
				}
			},
			transferLessonHour() {
				this.$Modal.open('business/student/transfer-lesson-hour.vue@modal',{
					props: {
						student: this.info
					},
					on: {
						success:() => {
							this.$emit('success')
						}
					}
				})
				.then(modal => {
					modal.show(util.sprintf('转让课时【%s】',this.info.student_name))
				})
			},
			faceCollection() {
				this.$Modal.open('app/faceatt/qr-modal.vue',{
					props: {
						sid: this.info.sid
					}
				})
				.then(modal => {
					modal.show('人脸采集二维码')
				})
			},
			regHour(){
				this.$Modal.open('business/hour/info-modal-student.vue@modal',{
					props: {
						student: this.info
					},
					on: {
						'on-success':() => {
							this.$emit('success')
						}
					}
				})
				.then(modal => {
					modal.show(util.sprintf('登记学员课耗【%s】',this.info.student_name),'edit')
				})
			},
			batSendSms(list){
				if(_.isUndefined(list) || !_.isArray(list))	{
					list = this.selectedList
				}
				if(list.length == 0){
					return
				}
				this.$Modal.open('app/modal/sms-template-modal.vue',{
					props:{
						objectType:'student',
						sendObject:list
					}
				})
				.then(modal=>{
					modal.show('发送短信')
				})
			},
			sendSms(){
				this.batSendSms([this.info])
			}
		}
	}
</script>

