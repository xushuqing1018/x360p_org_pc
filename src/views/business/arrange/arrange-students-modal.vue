<template>
	<Modal v-drag-modal v-model="modal$.show" :title="modal$.title" :width="800" :mask-closable="false">
		<Card dis-hover>
			<div class="x-card-title" slot="title">
				<label>排课学员</label>
				
				<Button type="ghost" icon="plus" size="small" class="pull-right" @click="showStudentModal">添加学员</Button>
			</div>
			<div class="row">
				<div class="col-md-3" v-for="id in selected.ids">					
					<Tag type="dot" :color="isNewStudent(id)?'blue':'green'" closable @on-close="delStudent(id)">
						<!--{{isNewStudent(id)?selected.map_ids[id].student.student_name:selected.map_ids[id].student.student.student_name}}-->
						{{selected.map_ids[id].student.student_name}}
					</Tag>
				</div>
			</div>
		</Card>
		
		<div slot="footer">
			<div class="pull-left">
				<Icon type="record" color="#0c6" class="ml-2"></Icon>
				<span>原排课学员</span>
				<Icon type="record" color="#3091f2"></Icon>
				<span>新增学员</span>				
			</div>
			<Button type="ghost" @click="close">关闭</Button>
			<Button type="primary" @click="ok" :loading="saving">确定</Button>
		</div>
		
		<teaching-object ref="teachingObject" mode="arrange" :allow-type="[2]" :condition="'&lid='+info.lid" @on-selected="studentChanged"></teaching-object>
	</Modal>
</template>

<script>
	import util,{_} from '@/libs/util'
	import common from '@/libs/common.mixin'
	import globals from '@/libs/globals.mixin'
	import modal from '@/libs/modal.mixin'
	
	import TeachingObject from '../attendance/teaching-object.vue'
	
	const emptyObject = {
		lid: 0,
		cr_id: 0,
		students: [],
		int_day: 0,
		int_start_hour: 0,
		int_end_hour: 0,
		teach_eid: 0,
		sj_id: 0
	}
	
	const emptySelected = {		
		type: 2,
		info: {},
		map_ids: {},
		ids: []	
	}
	
	export default{
		mixins: [ common,globals,modal ],
		components: {
			TeachingObject
		},
		data () {
			return {
				info: util.copy(emptyObject),				
				selected: util.copy(emptySelected)
			}
		},
		watch: {
			'modal$.show': function (val) {
				if(val){
					this.selected = util.copy(emptySelected)
					this.initSelectedLesson()
				}
			}
		},
		methods: {
			isNewStudent (id) {
				let list = this.info.students,
					result = true
				if(list.length){
					let obj = list.find(l=>l.sid==id) 
					if(obj){
						result = false
					}
				}
				return result
			},
			initSelectedLesson () {
				let students = this.info.students||[]
				
				if(students.length){					
					students.forEach(s=>{
						let obj = {
							student: s,
							$selected: true,
							lesson: this.lesson$
						}	
						if(!_.isEmpty(s.student)){
							obj.student = s.student
						}
						this.selected.map_ids[s.sid] = obj
						this.selected.ids.push(s.sid)
					})
				}
			},
			showStudentModal () {
				this.$r('teachingObject')
				.set('type',2)
				.set('selected',this.selected)
				.setSelected()
				.show(util.sprintf('选择一对多学员【%s】',this.$filter('lesson_name')(this.info.lid)),'add')
			},
			studentChanged (selected) {
				this.selected = util.copy(selected)
			},
			delStudent (id) {
				let index = this.selected.ids.indexOf(id)
				if(index>-1){
					this.selected.ids.splice(index,1)
					delete this.selected.map_ids[id]
				}
			},
			clearSelected () {
				this.selected.ids = []
				this.selected.map_ids = {}
				this.selected.info = {}
			},
			ok () {
				let params = this.initPostData()
				if(!this.selected.ids.length){
					this.$Message.error('请先选择排课学员！')
					return
				}else{
					this.$rest('course_arranges/update_students').post(params)
					.success(data=>{
						this.$Message.success('操作成功！')
						this.$emit('save')
						this.close()
					}).error(response=>{
						this.error(response.body.message||'操作失败')
					})
				}
			},
			initPostData () {
				let students = this.info.students,
					old_sids = [],
					new_sids = this.selected.ids,
					params = {
						add_sids: [],
						del_sids: [],
						ca_id: this.info.ca_id	
					}
				
				if(students.length){
					students.forEach(s=>{
						old_sids.push(s.sid)
					})					
				}
				
				if(old_sids.length&&new_sids.length){
					new_sids.forEach(s=>{
						let index = old_sids.indexOf(s)
						//老数组中不存在说明是新增的学员id
						if(index==-1){
							params.add_sids.push(s)
						}
					})
					
					//新数组中不包含老数组id说明删除老学员
					old_sids.forEach(o=>{
						let index = new_sids.indexOf(o)
						if(index==-1){
							params.del_sids.push(o)
						}
					})
				}
				
				return params				
			}
		},
		computed: {
			lesson$ () {
				let lid = this.info.lid||0,
					lessons = this.$store.state.gvars.lessons,
					result = {}
				if(lid&&lessons.length){
					result = lessons.find(l=>l.lid==lid)||{} 
				}
				
				return result
			}
		}
	}
	
</script>

<style lang="less">
	.x-card-title{
		display: flex;
		align-items: center;
		
		label{
			margin: 0;
			flex: 1
		}
	}
</style>