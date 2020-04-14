<template>
	<Modal v-drag-modal v-model="modal$.show" :title="modal$.title" :mask-closable="false" width="680" @on-cancel="cancel">
		<Form :label-width="80" v-if="modal$.show">
			<Form-item label="补课对象">
				<select-object ref="object" v-model="params" :lid="lid$" :sj-id="sjId$" :selected="selected"></select-object>				
			</Form-item>
			<Form-item label="排课信息">
				<div class="x-multiple-select-container">
					<div class="x-multiple-select">
						<p>授课对象：{{teachObject}}</p>
						<p>上课日期：{{course_arrange.int_day|int_date}}</p>
						<p>上课时段：{{course_arrange.int_start_hour|int_hour}}--{{course_arrange.int_end_hour|int_hour}}</p>
						<p>教室：{{course_arrange.cr_id|classroom_name('未知')}}</p>
						<i style="top:0" class="ivu-icon ivu-icon-ios-close ivu-input-icon ivu-input-icon-clear ivu-input-icon-normal" @click="clearClass"></i>		
					</div>
					<div class="x-multiple-select-after">
						<Dropdown class="x-drop-menu">
							<Button type="ghost" icon="arrow-down-b">请选择</Button>		        
					        <DropdownMenu slot="list">
					            <DropdownItem @click.native="showArrange()">跟班补课</DropdownItem>
					            <DropdownItem @click.native="showClass('add')">新创建一次排课补课</DropdownItem>
					            <DropdownItem @click.native="showClass('append')">添加到已有补课安排</DropdownItem>
					        </DropdownMenu>
					    </Dropdown>
					</div>
				</div>
			</Form-item>
		</Form>
		<div class="hide">
			
			<add-class-arrange type="is_makeup" :lid="lid$" ref="ref_add" @on-save-success="chooseArrange"></add-class-arrange>
			<trial-arrange-list ref="ref_append" mode="makeup" @on-select="chooseArrange"></trial-arrange-list>
		</div>
		<div slot="footer">			
			<Button type="ghost" @click="cancel">取消</Button>
			<Button type="primary" @click="ok" :loading="saving">确定</Button>
		</div>
	</Modal>
</template>

<script>
	import {_} from '@/libs/util'
	import $rest from '@/libs/rest'
	import modal from '@/libs/modal.mixin'
	import common from '@/libs/common.mixin'
	import globals from '@/libs/globals.mixin'
	
	
	import addClassArrange from '@/views/recruiting/audition/add-class-arrange.vue'
	import TrialArrangeList from '@/views/recruiting/customer/trial-arrange.vue'
	import SelectObject from './select-object.vue'
	
	export default{
		name:'makeupInfoModal',
		mixins: [modal,common,globals],
		components: {
			SelectObject,
			addClassArrange,
			TrialArrangeList
		},
		props:{
			
		},		
		data(){
			return {
				student_type: '',
				course_arrange: {},
				selected: [],
				params: {
					sa_ids: [],
					slv_ids: []
				},
			}
		},		
		computed: {
			teachObject() {
				let ca = this.course_arrange
				let result = '-'
				if(!_.isEmpty(ca)){
					if(ca.cid){
						result = ca.one_class.class_name
					}else if(ca.name){
						result = ca.name
					}else{
						let ret = []
						ca.students.forEach(s=>{
							if(s.student){
								ret.push(s.student.student_name)
							}else if(s.customer){
								ret.push(s.customer.name)
							}
						})

						result = ret.join(',')

						if(ca.lesson_type == 1){
							result = '1对1:'+result
						}else if(ca.lesson_type == 2){
							result = '1对多:'+result
						}
					}
				}				
				return result
			},
			className () {
				let [result,course_arrange] = ['',this.course_arrange]
				if(!_.isEmpty(course_arrange)){
					if(course_arrange.cid){
						result = '班级('+this.course_arrange.one_class.class_name+')'
					}else{
						result = course_arrange.name
					}
				}				
				return result
			},
			lid$ () {
	        	let [id,mapName,lid] = [0,'',0]
	        	
	        	if(this.params.sa_ids.length>0){
	        		id = this.params.sa_ids[0]
	        		mapName = 'student_absence'
	        	}
	        	else if(this.params.slv_ids.length>0){
	        		id = this.params.slv_ids[0]
	        		mapName = 'student_leave'
	        	}
	        	
	        	if(id>0){
	        		let obj = this.$store.getters.getMapObject(id,mapName)||{}
	        		lid = obj.lid||0
	        	}
	        	return lid
	        },
	        sjId$ () {
	        	let [id,mapName,sj_id] = [0,'',0]
	        	
	        	if(this.params.sa_ids.length>0){
	        		id = this.params.sa_ids[0]
	        		mapName = 'student_absence'
	        	}
	        	else if(this.params.slv_ids.length>0){
	        		id = this.params.slv_ids[0]
	        		mapName = 'student_leave'
	        	}
	        	
	        	if(id>0){
	        		let obj = this.$store.getters.getMapObject(id,mapName)||{}
	        		sj_id = obj.sj_id||0
	        	}
	        	return sj_id
	        }
		},
		methods: {
			clearClass () {
				this.course_arrange = {}
			},
			clearCustomer () {
				this.params.sa_ids = []
				this.params.slv_ids = []
			},
			cancel () {
				this.clearCustomer()
				this.course_arrange = {}
				this.close()
			},
			ok () {
				let params = this.init_param()	
				
				if(params) {
					this.$rest('makeup_arranges').post(params)
					.success(data=>{
						this.$Message.success('添加成功')
						this.$emit('on-success')
						this.cancel()
					}).error(response=>{
						this.error(response.body.message||'添加失败')
					})
				}
			},
			init_param () {
				let params = {
					sa_ids: [],
					slv_ids: []
				}
				let course_arrange = this.course_arrange
				
				if(this.params.sa_ids.length>0){
					this.params.sa_ids.forEach(s=>{
						params.sa_ids.push(s)
					})
				}
				if(this.params.slv_ids.length>0){
					this.params.slv_ids.forEach(s=>{
						params.slv_ids.push(s)
					})
				}
				
				if(params.sa_ids.length===0&&params.slv_ids.length===0){
					this.$Message.error('请先选择补课学员')
					return false
				}
				if(_.isEmpty(course_arrange)){
					this.$Message.error('请先选择排课')
					return false
				}	
				
				if(course_arrange.cid){
					params.course = {
						lid: course_arrange.lid,
						cid: course_arrange.cid,
						ca_id: course_arrange.ca_id,
						teach_eid: course_arrange.teach_eid,
						second_eid: course_arrange.second_eid,
						int_day: course_arrange.int_day,
						int_start_hour: course_arrange.int_start_hour,
						int_end_hour: course_arrange.int_end_hour				
					}
				}else{
					params.course = course_arrange
				}				
				
				return params
				
			},
			chooseArrange (ca) {
				this.course_arrange = ca
			},
			getMapText(id,name) {
				let result = this.$store.getters.getMapText(id,name)
				return this.$store.getters.getMapText(id,name)
			},
			showAbsenceModal () {
				this.$r('absence')
				.show('选择学员','add')
			},
			showClass (type) {
				let ref = 'ref_'+type,
					map_title = {'follow':'跟班补课','add':'新排课补课安排','append':'已有补课安排'}
				let action = 'add'
				if(type == 'append'){
					action = 'select'
				}
				this.$r(ref)
				.show(map_title[type],action)
			},
			showArrange() {
				this.$Modal.open('business/makeup/select-arrange.vue@modal',{
					props: {
						'lid':this.lid$
					},
					on: {
						'on-select':(row) => {
							this.chooseArrange(row)
						}
					}
				})
				.then(modal => {
					modal.show('选择已有排课跟班补课')
				})
			},
		}
	}
</script>
