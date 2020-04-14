<template>
	<Dropdown trigger="click">
		<slot>
			<Button type="primary" size="small">操作 <Icon type="arrow-down-b"></Icon></Button>
		</slot>
		<DropdownMenu slot="list">
            <DropdownItem v-per="'dashboard.sendsms'" @click.native="sendSms">
				<Icon type="chatbubble"></Icon>  群发班级短信
			</DropdownItem>
			<DropdownItem @click.native="edit" v-per="'class.edit'" v-if="info.status!==2">
            	<Icon type="edit"></Icon> 编辑
            </DropdownItem>
            <Dropdown :placement="subPlacement">
                <DropdownItem><Icon type="ios-list-outline"></Icon>  教务 <Icon type="ios-arrow-right"></Icon></DropdownItem>
                <DropdownMenu slot="list">
                    <DropdownItem @click.native="class_student" v-per="'class.students'" v-if="info.status!==2&&from=='list'&&info.class_type==0">
                        <Icon type="ios-people"></Icon> 学员管理
                    </DropdownItem>
                    <DropdownItem @click.native="arrange" v-per="'class.arrange'" v-if="info.status!==2&&info.class_type==0">
                        <Icon type="document"></Icon> 排课管理
                    </DropdownItem>	
                    <DropdownItem @click.native="attendance" v-per="'class.attend'">
                        <Icon type="calendar"></Icon> 考勤
                    </DropdownItem>
                    
                    <DropdownItem @click.native="up_grade" v-per="'class.up'" v-if="info.status==1&&from=='list'&&info.class_type==0">
                        <Icon type="arrow-up-c"></Icon> 升班
                    </DropdownItem>
                    <DropdownItem @click.native="close" v-per="'class.close'" v-if="info.status==1&&info.class_type==0">
                        <Icon type="close"></Icon> 结课
                    </DropdownItem>
                    <DropdownItem @click.native="unclose" v-per="'class.undo'" v-if="info.status==2&&info.class_type==0">
                        <Icon type="arrow-return-left"></Icon> 撤销结课
                    </DropdownItem>
                    <DropdownItem @click.native="textbook" v-per="'class.edit'">
                        <Icon type="ios-bookmarks-outline"></Icon> 教材管理
                    </DropdownItem>   	            
                </DropdownMenu>
            </Dropdown>
			
            <Dropdown placement="right-start" v-if="info.class_type==0">
                <DropdownItem>
            		<Icon type="ionic"></Icon> 服务
                    <Icon type="ios-arrow-right"></Icon>
                </DropdownItem>
                <DropdownMenu slot="list">
                    <DropdownItem @click.native="serviceRecord"><Icon type="plus"></Icon> 记录</DropdownItem>
                    <DropdownItem @click.native="serviceTask"><Icon type="plus"></Icon> 安排</DropdownItem>
                </DropdownMenu>
            </Dropdown>
            <DropdownItem @click.native="del" v-per="'class.delete'" v-if="from=='list'&&info.class_type==0">
            	<Icon type="ios-trash"></Icon> 删除班级
            </DropdownItem>
            <DropdownItem @click.native="chargeSetting" v-per="'class.edit'" v-if="info.status!==2&&info.class_type==0">
                <Icon type="pricetags"></Icon> 收费及课耗设置
            </DropdownItem>
        </DropdownMenu>
        <select-class 
            ref="ref_class" 
            v-model="up.cid"
            :url="up.url" 
            :notFoundText="up.empty_text" 
            @selected="selectClass" 
            v-show="false"
            >
        </select-class>
	</Dropdown>
</template>

<script>
	import util,{_} from '@/libs/util'
	import modal from '@/libs/modal.mixin'
	import globals from '@/libs/globals.mixin'
	import common from '@/libs/common.mixin'
    import SelectClass from 'c%/SelectClass.vue'
	
	const CLASS_SCHEDULES_URL = 'classes/%s/schedules'
    const NOT_FOUND_TEXT = '没有找到科目相同的班级，请选择升级到新班级'

	export default{
		mixins: [modal,globals,common],
        components: {
            SelectClass
        },
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
			listObj: {
				type: Object,
				default: () => {
					return {}
				}
			},
			from: {
				type:String,
				default: 'list'
			},
            isDetail:Boolean,
            subPlacement: {
				type: String,
				default: 'right-start'
			}
		},
		data() {
			return {
				up: {   // 升班信息
                    cid: 0, 
                    url: '',
                    empty_text: NOT_FOUND_TEXT
                }
			}
		},
		methods: {
            attendance() {
                this.$Modal.open('business/attendance/attendance-list.vue@modal',{
                    autoShow:false,
                    props: {
                        searchParams: {
                            cid: this.info.cid
                        }
                    }
				})
                .then(modal=>{
                    modal.vuec.set('mode','view')
                    .show(`按班级排课考勤【${this.info.class_name}】`,'add')
                })
            },
			serviceTask () {
                this.$Modal.open('service/service/task-modal.vue',{
                    props: {
                        cid: this.info.cid,
                        type: 2
                    },
                    on:{
                        'on-success':()=>{
                            this.$emit('success','service_task')
                        }
                    }
                })
                .then(modal=>{
                    modal
                    .show('添加服务安排','add')
                })
			},
			serviceRecord () {
                this.$Modal.open('service/service/record-modal.vue',{
                    props: {
                        cid: this.info.cid,
                        type: 2
                    },
                    on:{
                        'on-success':()=>{
                            this.$emit('success','service_record')
                        }
                    }
                })
                .then(modal=>{
                    modal
                    .show('添加服务记录','add')
                })
			},
			edit(){
                let info = util.copy(this.info)
                info.sj_id = util.int(info.sj_id)
                info.sg_id = util.int(info.sg_id)
                if(info.class_type==0){
	                this.$Modal.open('business/class/info-modal.vue',{
	                    on:{
	                        'save':()=>{
	                            this.$emit('success','edit')
	                        }
	                    }
	                })
	                .then(modal=>{
	                    modal.set('info',info)
	                    .show(util.sprintf('编辑班级【%s】',this.info.class_name),'edit')
	                })
                }else{
	                 this.$Modal.open('business/class/temp-info-modal.vue',{
	                    on:{
	                        'save':()=>{
	                            this.$emit('success','edit')
	                        }
	                    }
	                })
	                .then(modal=>{
	                    modal.set('info',info)
	                    .show(util.sprintf('编辑班级【%s】',this.info.class_name),'edit')
	                })
                }
            },
            chargeSetting() {
                let info = util.copy(this.info)
                this.$Modal.open('business/class/charge-set-modal.vue',{
                	on: {
                		'save':() => {
                			this.$emit('success')
                		}
                	}
                })
                .then(modal => {
                	modal
                	.set('info',info)
                	.show(util.sprintf('收费及课耗设置【%s】',this.info.class_name),'edit')
                })
            },
            up_grade(){
                let remine_times = this.info.arrange_times - this.info.attendance_times
                if(remine_times) {
                    this.confirm(util.sprintf('该班级还有%s次未上课的排课记录，是否强制升班？',remine_times)).then(() => {
                        this.upGrade()
                    })
                    .catch(() => {

                    })
                }else{
                    this.upGrade()
                }
            },
            upGrade() {
                this.up.url = util.sprintf('classes?sj_id=%s&with=schedules',this.info.sj_id)
                this.$Modal.open('business/class/up/up-confirm-modal.vue',{
                    on: {
                        'on-ok':(v) => {
                            if(v == 'newClass') {
                                this.newClass()
                            }else {
                                this.oldClass()
                            }
                        }
                    }
                })
                .then(modal => {
                    modal.show(util.sprintf('升班【%s】',this.info.class_name))
                })
            },
            newClass() {
                let info = {}

                info.lid = this.info.lid
                info.sj_id = this.info.sj_id
                info.lesson_times = this.info.lesson_times
                info.plan_student_nums = this.info.plan_student_nums
                info.teach_eid = this.info.teach_eid
                info.second_eid = this.info.second_eid
                info.second_eids = this.info.second_eids
                info.edu_eid = this.info.edu_eid
                info.cr_id = this.info.cr_id
                info.parent_cid = this.info.cid

                this.$Modal.open('business/class/info-modal.vue',{
                    props:{
                        'up-info': info
                    },
                    on:{
                        save:(obj)=>{
                            this.up.cid = obj.data.cid
                            this.selectClass()
                        }
                    }
                }).then(modal=>{
                    modal.show('创建新班级')
                })
            },
            selectClass() {
                if(this.info.cid == this.up.cid) {
                    this.$Message.error('不能升班到自身，请选择其他班级')
                    return
                }
                this.$Modal.open('business/class/up/student-up-list.vue@modal',{
                    on: {
                        'on-success':() => {
                            this.info.cid = 0
                            this.$emit('success')
                        }
                    }
                })
                .then(modal => {
                    modal
                    .set('toCid',this.up.cid)
                    .set('classInfo',this.info)
                    .set('rest_api','classes/'+ this.info.cid + '/students?with=student_lesson')
                    .show(util.sprintf('升班【%s】',this.info.class_name),'up')
                })
            },
            oldClass() {
                this.$r('ref_class').openModal()
            },
            close(){
                let remine_times = this.info.arrange_times - this.info.attendance_times
                if(remine_times) {
                    this.confirm(util.sprintf('该班级还有%s次未上课的排课记录，是否强制结课？',remine_times)).then(() => {
                        this.closeGrade()
                    })
                    .catch(() => {

                    })
                }else{
                    this.closeGrade()
                }
            },
            closeGrade() {
                this.$Modal.open('business/class/up/student-up-list.vue@modal',{
                    on: {
                        'on-success':() => {
                            this.$emit('success')
                        }
                    }
                })
                .then(modal => {
                    modal
                    .set('classInfo',util.copy(this.info))
                    .set('rest_api','classes/'+ this.info.cid + '/students?with=student_lesson')
                    .show(util.sprintf('结课【%s】',this.info.class_name),'close')
                })
            },
            class_student(){
                let info = util.copy(this.info)
                this.$Modal.open('business/class/students-modal.vue',{
                	props: {
                        transfer: false,
                        listObj: this.listObj
                	},
                	on: {
                		'save':() => {
                			this.$emit('success')
                        },
                        'on-success':() => {
                            this.$emit('success')
                        }
                	}
                })
                .then(modal => {
                	modal
                	.set('classInfo',info)
                	.show(util.sprintf('班级学员【%s】',this.info.class_name),'list')
                })
            },
            textbook(){
                this.$Modal.open('business/class/list/bind-textbook-modal.vue',{
                	props: {
                        cid: this.info.cid
                	},
                	on: {
                		'save':() => {
                			this.$emit('success')
                        },
                        'on-success':() => {
                            this.$emit('success')
                        }
                	}
                })
                .then(modal => {
                	modal
                	.show(util.sprintf('教材绑定【%s】',this.info.class_name))
                })
            },
            arrange(){
                let info = util.copy(this.info)
                this.$Modal.open('business/class/arranges-modal.vue',{
                    on: {
                        'on-success':() => {
                            this.$emit('success')
                        }
                    }
                })
                .then(modal => {
                    modal
                    .set('classInfo',info)
                    .show(util.sprintf('班级排课【%s】',this.info.class_name),'list')
                })      
            },
            del(){
                this.confirm(util.sprintf('您确定要删除班级【%s】吗?',this.info.class_name))
                .then(()=>{
                    this.$rest('classes')
                    .delete(this.info.cid)
                    .success(res => {
                    	this.$emit('success')
                    	this.$Message.success('删除成功')
                    })
                    .error(res => {
                    	this.error(res.body.message)
                    })
                })       
            },
            unclose() {
                this.confirm(util.sprintf('【%s】确定撤销结课吗?',this.info.class_name))
                .then(() => {
                    this.$rest('classes').add_url_param(this.info.cid,'dounclose')
                    .post()
                    .success(res => {
                        this.$emit('success')
                        this.$Message.success('撤销结课成功')
                    })
                    .error(res => {
                        this.error(res.body.message)
                    })
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
					modal.show('发送班级短信')
				})
            },
            collecetStudents(cs_list){
                let ret = []
                cs_list.forEach(item=>{
                    ret.push(util.copy(item.student))
                })
                return ret
            },
            sendSms() {
                this.$rest('classes')
                .add_url_param(this.info.cid,'students')
                .get()
                .success(res=>{
                    if(res.list.length == 0){
                        this.$Message.error('班级还没有任何学员')
                        return
                    }
                    let student_list = this.collecetStudents(res.list)
                    this.batSendSms(student_list)
                })
            }
		}
	}
</script>

<style>
</style>