<template>
	<Modal v-drag-modal :mask-closable="false" :width="modalWidth" v-model="modal$.show" :title="modal$.title">
		<Row>
			<Col span="24">
				<Button type="primary" class="mr-2" @click="clickClass">选择班级</Button>
				<Button type="primary" class="mr-2" @click="clickStudent">选择学员</Button>				
				<Button type="primary" class="mr-2" @click="clickCustomer">选择意向客户</Button>
			</Col>
		</Row>
		<Row class="mt-2">
			<Col span="24">
				<table class="modal-table">
					<thead>
						<tr>
							<th><div class="ivu-table-cell">学员</div></th>
							<th v-for="item in table_head"><div class="ivu-table-cell">{{item.title}}</div></th>
							<th><div class="ivu-table-cell">备注</div></th>
						</tr>
					</thead>
				</table>
				<div class="entry-table-body">
					<table class="modal-table">
						<tbody>
							<tr v-for="student in post_data">
								<td><div class="ivu-table-cell">{{student.name}}</div></td>
								<td v-for="subject in student.score_info">
									<div class="ivu-table-cell">
										<Input v-model="subject.score" size="small" style="width:80%"></Input>
									</div>
								</td>
								<td>
									<div class="ivu-table-cell">
										<Input v-model="student.remark" size="small" style="width:80%"></Input>
									</div>
								</td>
							</tr>
							<tr v-if="post_data.length==0" :colspan="table_head.length+2">
								<td class="text-center"><div class="ivu-table-cell">请选择学员</div></td>
							</tr>
						</tbody>
					</table>
				</div>
			</Col>
		</Row>
		<div slot="footer">
			<Button type="ghost" @click="close">取消</Button>
			<Button type="primary" @click="ok" :loading="saving">确定</Button>
		</div>
		<select-class ref="ref_class" v-model="select.cid" style="display:none" @selected="selectClass"></select-class>
		<select-student ref="ref_student" v-model="select.sids" style="display:none" @select="selectStudent"></select-student>
		<select-customer ref="ref_customer" v-model="select.cu_ids" style="display:none" @select="selectCustomer"></select-customer>
	</Modal>
</template>

<script>
	import util,{_} from '@/libs/util'
	import modal from '@/libs/modal.mixin'
	import common from '@/libs/common.mixin'
	import globals from '@/libs/globals.mixin'
	import SelectClass from 'c%/SelectClass.vue'
	import SelectStudent from 'c%/SelectStudent.vue'
	import SelectCustomer from 'c%/SelectCustomer'

	export default {
		mixins: [modal,common,globals],
		components: {
			SelectCustomer,
			SelectStudent,
			SelectClass
		},
		data() {
			return {
				item: {},
				select: {
					cid: 0,
					sids: [],
					cu_ids: []
				},
				post_data: []
			}
		},
		methods: {
			clickClass() {
				this.$r('ref_class').openModal()
			},
			clickStudent() {
				this.$r('ref_student').openModal()
			},
			clickCustomer() {
				this.$r('ref_customer').openModal()
			},
			selectClass() {
				this.$rest('classes').add_url_param(this.select.cid,'students')
				.get()
				.success(res => {
					this.post_data.splice(0)
					let students = res.list
					this.structureStudentData(students)
				})
				.error(res => {
					this.$Message.error(res.body.message)
				})
			},
			selectStudent() {
				let students = []
				this.select.sids.forEach(sid=>{
					students.push(this.$store.getters.getMapObject(sid,'student'))
				})
				this.structureStudentData(students)
			},
			structureStudentData(students) {
				students.forEach(s=>{
					let student = {
						sid:s.sid,
						name:s.student?s.student.student_name:s.student_name,
						cid:s.cid?s.cid:0,
						score_info:[],
						se_id:this.item.se_id,
						remark:''
					}
					this.table_head.forEach(h=>{
						let subject = {
							score:'',
							exam_subject_did:h.did,
							name:h.title
						}
						student.score_info.push(subject)
					})
					this.post_data.push(student)
				})
			},
			selectCustomer() {
				let customers = []
				this.select.cu_ids.forEach(cu_id=>{
					customers.push(this.$store.getters.getMapObject(cu_id,'customer'))
				})
				customers.forEach(c=>{
					let customer = {
						cu_id:c.cu_id,
						name:c.name,
						cid:0,
						score_info:[],
						se_id:this.item.se_id,
						remark:''
					}
					this.table_head.forEach(h=>{
						let subject = {
							score:'',
							exam_subject_did:h.did,
							name:h.title
						}
						customer.score_info.push(subject)
					})
					this.post_data.push(customer)
				})
			},
			ok () {
				if(!this.checkScore()) {
					return false
				}
				this.$rest('student_exam_scores')
				.post(this.post_data)
				.success(res=>{
					this.$Message.success('保存成功')
					this.close()
				})
				.error(res=>{
					this.error(res.body.message)
				})
			},
			checkScore() {
				for(let i=0,len=this.post_data.length;i<len;i++){
					let student = this.post_data[i]
					for(let j=0,len=student.score_info.length;j<len;j++) {
						let subject = student.score_info[j]
						if(subject.score==='') {
							this.$Message.error(util.sprintf('%s的%s成绩不能为空',student.name,subject.name))
							return false
						}else{
							if(!(/^(((\d|[1-9]\d|1[0-4]\d)(\.\d{1,2})?)|100|100.0|100.00|150|150.0|150.00)$/).test(subject.score)) {
								this.$Message.error(util.sprintf('%s的%s成绩输入不合法',student.name,subject.name))
								return false
							}
						}
					}
				}
				return true
			}
		},
		computed: {
			table_head() {
				let dids,
					subjects = this.dicts('exam_subject'),
					result = []
				if(!_.isEmpty(this.item)) {
					dids = this.item.exam_subject_dids
					dids.forEach(did=>{
						result.push({
							title:subjects.find(item=>item.did==did).title,
							did:did
						})
					})
				}
				return result
			},
			modalWidth() {
				if(this.table_head.length>1) {
					return '850px'
				}else{
					return '650px'
				}
			}
		},
		watch: {
			'modal$.show': function(val) {
				if(val) {
					this.post_data.splice(0)
				}
			}
		}
	}
</script>
<style lang="less">
	.entry-table-body {
		min-height: 100px;
		max-height: 500px;
		overflow-y: auto;
		overflow-x: hidden;
	}
</style>