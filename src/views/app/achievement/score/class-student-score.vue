<template>
	<Modal v-drag-modal :mask-closable="false" width="950" v-model="modal$.show" :title="modal$.title">
		<Form ref="ref_search" :label-width="70" class="filter-form row">
			<Form-item label="班级名称" prop="cid" class="col-sm-4">
				<Select v-model="cid" size="small" @on-change="query_one_class">
					<Option :value="-1"><请选择></Option>
					<Option v-for="item in classList" :value="item.value">{{item.name}}</Option>
				</Select>
			</Form-item>
			<Form-item label="学员姓名" prop="sid" class="col-sm-4">
				<select-student
					ref="ref_student" 
					size="small" 
					v-model="sid" 
					placeholder="请选择学员" 
					@select="init_data"
					clearable>
				 </select-student>
			</Form-item>
			<Form-item class="col-sm-4">

	            <export-button res="student_exam_scores" :params="params" v-per="'score.export'"></export-button> 

			</Form-item>
		</Form>
		<div class="list-body mt-3">
			<div class="list-body-wrap" v-loading.like="'query_class'">
				<table class="modal-table" ref="tableExcel">
					<thead>
						<tr>
							<th><div class="ivu-table-cell">班级</div></th>
							<th><div class="ivu-table-cell">姓名</div></th>
							<th><div class="ivu-table-cell">学号</div></th>
							<th><div class="ivu-table-cell">电话</div></th>
							<th v-for="item in table_subjects_head"><div class="ivu-table-cell">{{item.title}}</div></th>
							<th><div class="ivu-table-cell">备注</div></th>
							<th><div class="ivu-table-cell">操作</div></th>
						</tr>
					</thead>
					<tbody>
						<tr v-for="item in format_data">
							<td><div class="ivu-table-cell">
								{{item.one_class?item.one_class.class_name:'[未知]'}}
							</div></td>
							<td><div class="ivu-table-cell">{{item.student.student_name}}</div></td>
							<td><div class="ivu-table-cell">{{item.student.sno}}</div></td>
							<td><div class="ivu-table-cell">{{item.student.first_tel}}</div></td>
							<td v-for="subject in item._student_exam_subject_score">
								<div class="ivu-table-cell">
									<Input v-model="subject.score" size="small" v-if="item.$$edit"></Input>
									<span v-else>{{subject.score}}</span>
								</div>
							</td>
							<td><div class="ivu-table-cell">
								<Input v-model="item.remark" size="small" v-if="item.$$edit"></Input>
								<span v-else>{{item.remark}}</span>
							</div></td>
							<td>
								<div class="ivu-table-cell">
									<template v-if="!item.$$edit">
										<Button 
											type="ghost" 
											shape="circle" 
											icon="edit"
											size="small" 
											title="编辑"
											v-per="'score.edit'"
											:disabled="saving"
											@click="editScore(item)">
										</Button>
										<Poptip
									        confirm
									        title="确定删除吗？"
									        @on-ok="delScore(item)">
									        <Button 
												type="ghost" 
												shape="circle" 
												icon="trash-a"
												size="small" 
												title="删除"
												v-per="'score.delete'"
												:disabled="saving">
											</Button>
									    </Poptip>
								    </template>
								    <ButtonGroup v-else>
										<Button 
											type="primary" 
											size="small" 
											:loading="saving"
											@click="ok(item)">确定
										</Button>
										<Button 
											type="ghost" 
											size="small" 
											:disabled="saving"
											@click="cancel(item)">取消
										</Button>
									</ButtonGroup>
								</div>
							</td>
						</tr>
						<tr class="text-center" v-if="data.length==0">
							<td :colspan="table_subjects_head.length+6"><div class="ivu-table-cell">没有数据</div></td>
						</tr>
					</tbody>
					<tfoot>
						<tr class="text-right">
							<td :colspan="table_subjects_head.length+6">
								<Page 
				                	:total="total" 
				                	:current="pageIndex" 
				                	:show-sizer="true" 
				                	:page-size="pageSize" 
				                	:show-total="true" 
				                	@on-change="pagenation" 
				                	@on-page-size-change="pagesize">
				                </Page>
							</td>
						</tr>
					</tfoot>
				</table>
			</div>
		</div>
    	<div slot="footer">
            <Button type="ghost" @click="close">关闭</Button>
        </div>
    </Modal>
</template>

<script>
	import moment from 'moment'
	import util,{_} from '@/libs/util'
	import grid from '@/libs/grid.mixin'
	import modal from '@/libs/modal.mixin'
	import common from '@/libs/common.mixin'
	import SelectStudent from 'c%/SelectStudent.vue'

	import ExportButton from 'c%/ExportButton.vue'
	
	export default{
		mixins:[grid,modal,common],
		components: {
			SelectStudent,
			ExportButton
		},
		data () {
			return {
				info: {},
				cid: -1,
				sid: 0,
				classList: [],
				copy_data: [],
				action: '',
				rest_api: 'student_exam_scores/query_class_student'
			}
		},
		watch: {
			'modal$.show': function(val) {
            	if(val) {
            		this.init_data()
        		}		            
	        }
        },
        methods: {
        	hook_get_param(param) {
        		param.se_id = this.info.se_id
        		if(this.cid>-1) {
        			param.cid = this.cid
        		}
        		if(this.sid>0) {
        			param.sid = this.sid
        		}
        	},
        	query_one_class(val) {
        		if(val == -1) {
        			this.data.splice(0)
        			this.total = 0
        			return
        		}
        		this.init_data()
        	},
        	deal_data(data) {
        		data.list.forEach(item => {
        			item.$$edit = false
        		})
        		this.copy_data = util.copy(data.list)
        		return data.list
        	},
        	editScore(item) {
        		if(this.action=='') {
        			item.$$edit = true
        			this.action = 'edit'	
        		}
        	},
        	delScore(item) {
        		this.$rest('student_exam_scores')
        		.delete(item.ses_id)
        		.success(res=>{
        			this.$Message.success('删除成功')
        			this.$emit('on-success')
        			this.init_data()
        		})
        		.error(res=>{
        			this.error(res.body.message)
        		})
        	},
        	ok(item) {
        		let data = []
        		item._student_exam_subject_score.forEach(subject=>{
        			data.push({
	        			exam_subject_did: subject.exam_subject_did,
	        			score: subject.score
	        		})
        		})
        		this.$rest('student_exam_scores').add_url_param(item.ses_id)
        		.put({remark:item.remark,score_info:data})
        		.success(res=>{
        			this.$Message.success('编辑成功')
        			this.$emit('on-success')
        			item.$$edit = false
        			this.action = ''
        			this.init_data()
        		})
        		.error(res=>{
        			this.error(res.body.message)
        		})
        	},
        	cancel(item) {
        		this.action = ''
        		this.data = util.copy(this.copy_data)
        	}
        },
        computed: {
        	table_subjects_head() {
				let scores,
					subjects = this.dicts('exam_subject'),
					result = []
				if(!_.isEmpty(this.info)) {
					scores = this.info.exam_subject_dids
					scores.forEach(score=>{
						let subject = subjects.find(item=>item.did==score)
						if(subject) {
							result.push({
								title:subject.title,
								did:subject.did
							})
						}
					})
				}
				return result
			},
			format_data() {
				this.data.forEach(item => {
					item._student_exam_subject_score = []
					this.table_subjects_head.forEach(th => {
						let obj = {},
							subject_score = item.student_exam_subject_score.find(score => score.exam_subject_did==th.did)
						if(subject_score) {
							obj.score = subject_score.score
						}else{
							obj.score = ''
						}
						obj.exam_subject_did = th.did
						item._student_exam_subject_score.push(obj)
					})
				})
				return this.data
			}
        }
	}
</script>
