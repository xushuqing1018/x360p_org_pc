<template>
	<Modal v-drag-modal v-model="modal$.show" :title="modal$.title" :mask-closable="false" width="680" @on-cancel="cancel">
		
		<Form :label-width="80">
			<Form-item label="试听对象">
				<select-object v-model="params"></select-object>				
			</Form-item>
			<Form-item label="试听课">
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
					            <DropdownItem @click.native="showArrange(0)">跟班试听</DropdownItem>
					            <DropdownItem @click.native="addTrialArrange">新开试听课</DropdownItem>
					            <DropdownItem @click.native="showArrange(1)">已有试听课</DropdownItem>
					        </DropdownMenu>
					    </Dropdown>
					</div>
				</div>
			</Form-item>
			<Form-item label="忽略冲突" v-if="teachObject">
				<template v-if="!course_arrange.ca_id">
					<Checkbox v-model="ignore.ignore_class_cc" :true-value="1" :false-value="0">忽略教室冲突</Checkbox>
					<Checkbox v-model="ignore.ignore_class_ec" :true-value="1" :false-value="0">忽略老师冲突</Checkbox>
				</template>
				<Checkbox v-model="ignore.ignore_student_cc" :true-value="1" :false-value="0">忽略学员冲突</Checkbox>
			</Form-item>
		</Form>
		<!-- <follow-class ref="ref_follow" width="900" @on-select="chooseArrange"></follow-class>
		<trial-info-modal ref="ref_new" :add="false" @on-save-success="chooseArrange"></trial-info-modal>
		<trial-arrange-list ref="ref_add" @on-select="chooseArrange"></trial-arrange-list> -->
		
		<div slot="footer">
			<div class="pull-left">
				<!--<Icon type="record" color="#3091f2"></Icon>
				<span>意向客户</span>
				<Icon type="record" color="#0c6" class="ml-2"></Icon>
				<span>正式学员</span>-->
				<Checkbox v-model="is_push" class="mb-0">
					<span class="text-info">推送微信消息给上课{{'老师'|translate}}</span>
				</Checkbox>
			</div>
			<Button type="ghost" @click="cancel">取消</Button>
			<Button type="primary" @click="ok">确定</Button>
		</div>
	</Modal>
</template>

<script>
	import util,{_} from '@/libs/util'
	import modal from '@/libs/modal.mixin'
	import common from '@/libs/common.mixin'
	import globals from '@/libs/globals.mixin'
	import SelectObject from './object.vue'
	
	export default{
		name:'auditionInfoModal',
		mixins: [modal,common,globals],
		components: {
			SelectObject
		},
		props:{
			
		},		
		data(){
			return {
				student_type: '',
				course_arrange: {},
				is_push: true,
				params: {
					sids: [],
					cu_id: [],			
				},
				ignore: {
					ignore_student_cc:0,
					ignore_class_cc:0,
					ignore_class_ec:0
				}
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
			ignore_class_cc () {
				let result = 0
				
				if(this.$store.state.gvars.configs.params.course_arrange){
					result = this.$store.state.gvars.configs.params.course_arrange.ignore_class_cc
				}
				
				return result
			},
			ignore_class_ec () {
				let result = 0
				
				if(this.$store.state.gvars.configs.params.course_arrange){				
					result = this.$store.state.gvars.configs.params.course_arrange.ignore_class_ec				
				}
				
				return result
			}
		},
		watch: {
			'modal$.show'(v) {
				if(v) {
					this.ignore.ignore_class_ec = this.ignore_class_ec
					this.ignore.ignore_class_cc = this.ignore_class_cc
				}
			}
		},
		methods: {
			clearClass () {
				this.course_arrange = {}
			},
			clearCustomer () {
				this.params.sids = []
				this.params.cu_id = []				
			},
			cancel () {
				this.close()
				this.clearCustomer()
				this.course_arrange = {}
			},
			ok () {
				let params = this.init_param()				
				if(params) {
					this.$rest('trial_listen_arranges').post(params)
					.success(data=>{
						this.$Message.success('添加成功')
						this.$emit('on-save-success')
						this.cancel()
					}).error(response=>{
						this.error(response.body.message||'添加失败')
					})
				}
			},
			init_param () {
				let params = {
					is_push: this.is_push,
					students: [],
					course: {}
				}
				let course_arrange = this.course_arrange
				if(this.params.sids.length>0){
					this.params.sids.forEach(s=>{
						params.students.push({sid:s})
					})
				}
				if(this.params.cu_id.length>0){
					this.params.cu_id.forEach(c=>{
						params.students.push({cu_id:c})
					})
				}
				
				if(params.students.length===0){
					this.$Message.error('请先选择试听学员')
					return false
				}
				if(_.isEmpty(course_arrange)){
					this.$Message.error('请先选择试听班级')
					return false
				}	
				
				params.course = {
					lid: course_arrange.lid,
					sj_id: course_arrange.sj_id,
					cr_id: course_arrange.cr_id,
					int_day: course_arrange.int_day,
					int_start_hour: course_arrange.int_start_hour,
					int_end_hour: course_arrange.int_end_hour,
					second_eid: course_arrange.second_eid,
					second_eids: course_arrange.second_eids
				}

				if(course_arrange.ca_id){
					params.course.ca_id = course_arrange.ca_id
					params.course.eid = course_arrange.teach_eid
					if(course_arrange.cid){
						params.course.cid = course_arrange.cid
					}
					params.course.ignore_student_cc = this.ignore.ignore_student_cc
				}else{
					params.course.teach_eid = course_arrange.teach_eid
					params.course.name = course_arrange.name
					params.course.is_trial = 1
					params.course.ignore_class_cc = this.ignore.ignore_class_cc
					params.course.ignore_class_ec = this.ignore.ignore_class_ec
					params.course.ignore_student_cc = this.ignore.ignore_student_cc
				}

				if(course_arrange.start_day){
					params.course.start_day = course_arrange.start_day
					params.course.end_day = course_arrange.end_day
				}
				if(course_arrange.student_limit){
					params.course.student_limit = course_arrange.student_limit
				}
				
				return params
			},
			chooseArrange (ca) {
				this.course_arrange = ca
			},	
			showModal (type) {
				let ref = 'ref_'+type
				this.$r(ref).openModal()
			},
			showClass (type) {				
				let ref = 'ref_'+type,
					map_title = {'follow':'选择常规班','new':'添加试听课','add':'选择试听课'}
				this.$r(ref)
				.show(map_title[type],'select')
			},
			addStudents(items){
				this.params.sids = items
			},
			addCustomer(items) {
				this.params.cu_id = items
			},
			setArrange(ca){
				this.course_arrange = ca
			},
			showArrange(t) {
				this.$Modal.open('recruiting/audition/select-arrange.vue@modal',{
					props: {
						'is-trial':t
					},
					on: {
						'on-select':(row) => {
							this.chooseArrange(row)
						}
					}
				})
				.then(modal => {
					modal.show(t?'选择已有试听课':'选择已有排课')
				})
			},
			addTrialArrange() {
				this.$Modal.open('recruiting/audition/trial-info-modal',{
					on: {
						'on-save-success':(data) => {
							this.chooseArrange(data)
						}
					}
				})
				.then(modal =>{
					modal.show('添加试听课','select')
				})
			}
		}
	}
</script>

<style lang="less">
	.x-multiple-select-container{
		display: flex;
		.x-multiple-select {
		    padding: 0 10px;
		    flex: 1;
		    border: 1px solid #e2e2e2;
		    position: relative;
		    &.inline{
		    	display: flex;
		    	flex-wrap: wrap;
		    	align-items: center;
		    }
		    &:hover .ivu-input-icon-clear{
		    	display: inline-block;
		    }
		}
		.x-multiple-select-after{
		    padding: 4px 7px;
		    font-size: inherit;
		    font-weight: 400;
		    line-height: 1;
		    color: #657180;
		    text-align: center;
		    background-color: #eee;
		    border: 1px solid #d7dde4;
		    border-radius: 6px;
		    height: 32px;
		    border-left: 0;
		    border-bottom-left-radius: 0!important;
		    border-top-left-radius: 0!important;
		    
		    .ivu-btn{
	    	    border-color: transparent;
			    background-color: transparent;
			    color: inherit;
			    margin: -6px -7px;
		    }
		}
		
	}
</style>
