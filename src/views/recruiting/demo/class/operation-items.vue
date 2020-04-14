<template>
	<Dropdown trigger="click">
		<slot>
			<Button type="primary" size="small">操作 <Icon type="arrow-down-b"></Icon></Button>
		</slot>
		<DropdownMenu slot="list">
			<DropdownItem @click.native="edit" v-per="'democlass.edit'" v-if="info.status!==2">
            	<Icon type="edit"></Icon> 编辑
            </DropdownItem>
            <DropdownItem @click.native="chargeSetting" v-per="'democlass.edit'" v-if="info.status!==2">
            	<Icon type="pricetags"></Icon> 收费及课耗设置
            </DropdownItem>
            <DropdownItem @click.native="close" v-per="'democlass.close'" v-if="info.status==1">
            	<Icon type="close"></Icon> 结课
            </DropdownItem>
            <DropdownItem @click.native="class_student" v-per="'democlass.students'" v-if="info.status!==2&&from=='list'">
            	<Icon type="ios-people"></Icon> 学员管理
            </DropdownItem>
            <DropdownItem @click.native="arrange" v-per="'democlass.arrange'" v-if="info.status!==2">
            	<Icon type="document"></Icon> 排课管理
            </DropdownItem>
            <Dropdown placement="right-start">
                <DropdownItem>
            		<Icon type="ionic"></Icon> 服务
                    <Icon type="ios-arrow-right"></Icon>
                </DropdownItem>
                <DropdownMenu slot="list">
                    <DropdownItem @click.native="serviceRecord"><Icon type="plus"></Icon> 记录</DropdownItem>
                    <DropdownItem @click.native="serviceTask"><Icon type="plus"></Icon> 安排</DropdownItem>
                </DropdownMenu>
            </Dropdown>
            <DropdownItem @click.native="del" v-per="'democlass.delete'" v-if="from=='list'">
            	<Icon type="ios-trash"></Icon> 删除班级
            </DropdownItem>
        </DropdownMenu>
	</Dropdown>
</template>

<script>
	import util from '@/libs/util'
	import modal from '@/libs/modal.mixin'
	import globals from '@/libs/globals.mixin'
	import common from '@/libs/common.mixin'
	
	const CLASS_SCHEDULES_URL = 'classes/%s/schedules'

	export default{
		mixins: [modal,globals,common],
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
			from: {
				type:String,
				default: 'list'
			},
			isDetail:Boolean
		},
		data() {
			return {
				
			}
		},
		methods: {
			serviceTask () {
				let info = {
						sid: 0,
						cu_id: 0,
						cid: this.info.cid,
						object_type: 2,
						st_did: 0,
						int_day: '',
						int_hour: '',
						own_eid: 0,
						remark: '',
						status: 0	
					},
					title = util.sprintf('添加服务安排【%s】',this.info.class_name)
				
				this.$Modal.open('service/service/task-modal.vue',{
					on:{
						'on-success':()=>{
							this.$emit('on-success','service_task')
						}
					}
				})
				.then(modal=>{
					modal.set('info',info)
					.set('name',this.info.class_name)
					.show(title,'add')
				})
			},
			serviceRecord () {
				let info = {
						sid: 0,
						cu_id: 0,
						cid: this.info.cid,
						object_type: 2,
						st_did: 0,
						int_day: '',
						int_hour: '',
						is_push: true,
						rel_id: 0,
						contnet: '',
						eid: 0,
						student_nums: 0,
						service_record_file: []
					},
					title = util.sprintf('添加服务记录【%s】',this.info.class_name)
				
				this.$Modal.open('service/service/record-modal.vue',{
					on:{
						'on-success':()=>{
							this.$emit('on-success','service_record')
						}
					}
				})
				.then(modal=>{
					modal.set('info',info)
					.set('name',this.info.class_name)
					.show(title,'add')
				})
			},
			edit(){
                let info = util.copy(this.info)
                info.sj_id = util.int(info.sj_id)
                info.sg_id = util.int(info.sg_id)
                this.$Modal.open('business/class/info-modal.vue',{
                    on:{
                        'save':()=>{
                            this.$emit('success','edit')
                        }
                    }
                })
                .then(modal=>{
                    modal.set('info',info)
                    .show(util.sprintf('编辑体验班【%s】',this.info.class_name),'edit')
                })
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
                this.confirm(util.sprintf('您确定要删除体验班【%s】吗?',this.info.class_name))
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
            }
		}
	}
</script>

<style>
</style>