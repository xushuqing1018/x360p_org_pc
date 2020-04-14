<template>
	<Modal v-drag-modal :mask-closable="false" width="880" v-model="modal$.show" :title="modal$.title" @on-cancel="close">
		<template v-if="modal$.show">
			<class-students-list 
				ref="studentList" 
				:class-info="classInfo" 
				@assignStudent="assignStudent" 
				@on-student-delete-success="refreshData"
				:transfer="transfer"
				:listObj="listObj">
			</class-students-list>
		</template>
		<div slot="footer">
			<Button type="ghost" @click="close">关闭</Button>
		</div>
	</Modal>
</template>

<script>
	
	import util from '@/libs/util'
	import modal from '@/libs/modal.mixin'
	import common from '@/libs/common.mixin'
	import globals from '@/libs/globals.mixin'
	import classStudentsList from './students-list.vue'
    
	export default{
		name:'classStudentsModal',
		mixins: [common,globals,modal],
		components:{
			classStudentsList
		},
		props:{
			transfer: {
				type: Boolean,
				default: true
			},
			listObj: {
				type: Object,
				default() {
					return {}
				}
			}
		},
		data(){
			return {
				classInfo:{
					cid:0
				},
				key:''
			}
		},
		methods: {
			setClassInfo(info){				
				this.classInfo = util.copy(info)
				return this
			},
			assignStudent(){
				this.$Modal.open('business/class/assign-student.vue@modal',{
					props: {
						'class-info': this.classInfo,
						max: this.max
					},
					on: {
						'on-success': () => {
							this.refreshData()
						}
					}
				})
                .then(modal=>{
                    modal.show('选择分班学员','add')
                })
			},
			refreshData (studentNums) {
				this.classInfo.student_nums += studentNums
				this.$r('studentList').refreshData()
			}
		},
		computed: {
			max () {
				let num = 0
				if(this.classInfo){
					num = this.classInfo.plan_student_nums - this.classInfo.student_nums
				}
				return num
			}
		}
	}
</script>
