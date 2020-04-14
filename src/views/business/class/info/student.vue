<template>
	<div>
		<class-students-list 
			ref="studentList" 
			:class-info="classInfo" 
			:filter="true" 
			:setWidth="setWidth"
			@assignStudent="assignStudent"
			@on-student-delete-success="refreshData">
		</class-students-list>
	</div>
</template>

<script>
	import classStudentsList from '../students-list.vue'
	import modal from '@/libs/modal.mixin'
	import common from '@/libs/common.mixin'
	
	export default{
		mixins: [modal,common],
		components:{
			classStudentsList
		},
		props: {
			classInfo: {
				type: Object,
				default: ()=>{
					return {}
				}
			},
			setWidth: {
				type: Boolean,
				default: true
			},
		},
		methods: {
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
			refreshData () {
				this.$r('studentList').refreshData()
				this.$emit('refreshInfo')
			}
		},
		computed: {
			max () {
				let info = this.classInfo,
					result = 0
				if(info){
					result = info.plan_student_nums - info.student_nums 
				}
				return result
			}
		}
	}
	
</script>
