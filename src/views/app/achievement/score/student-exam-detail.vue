<template>
	<Modal v-drag-modal :mask-closable="false" width="550" v-model="modal$.show" :title="modal$.title">
        <table class="modal-table">
			<thead>
				<tr>
					<th><div class="ivu-table-cell">项目</div></th>
					<th><div class="ivu-table-cell">分数</div></th>
					<th width="150px"><div class="ivu-table-cell">操作</div></th>
				</tr>
			</thead>
			<tbody>
				<tr v-for="item in studend_exam_data">
					<td><div class="ivu-table-cell">{{labelDicts(item.exam_subject_did,'exam_subject')}}</div></td>
					<template v-if="!item.$$edit">
						<td><div class="ivu-table-cell">{{item.score}}</div></td>
						<td><div class="ivu-table-cell">
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
						    </Poptip></div>
						</td>
					</template>
					<template v-else>
						<td><div class="ivu-table-cell">
							<Input v-model="item.score" size="small" style="width:150px"></Input>
						</div></td>
						<td>
							<div class="ivu-table-cell">
								<ButtonGroup>
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
					</template>
				</tr>
			</tbody>
		</table>
    	<div slot="footer">
            <Button type="ghost" @click="close">关闭</Button>
        </div>
    </Modal>
</template>

<script>
	import util from '@/libs/util'
	import modal from '@/libs/modal.mixin'
    import globals from '@/libs/globals.mixin'
    import common from '@/libs/common.mixin'
	
	export default{
		mixins:[modal,globals,common],
		props: {
			data: {
				type: Array,
				default:()=>{
					return []
				}
			}
		},
		data () {
			return {
				studend_exam_data: [],
				copy_data: [],
				action: '',
				rest_api: 'student_exam_scores'
			}
		},
        methods: {
        	editScore(item) {
        		if(this.action=='') {
        			item.$$edit = true
        			this.action = 'edit'	
        		}
        	},
        	delScore(item) {
        		this.$rest(this.rest_api).add_url_param(item.ses_id,'subject_score')
        		.delete(item.sess_id)
        		.success(res=>{
        			this.$Message.success('删除成功')
        			this.$emit('on-success')
        		})
        		.error(res=>{
        			this.error(res.body.message)
        		})
        	},
        	ok(item) {
        		let data = []
        		data.push({
        			exam_subject_did: item.exam_subject_did,
        			score: item.score
        		})
        		this.$rest(this.rest_api).add_url_param(item.ses_id)
        		.put({score_info:data})
        		.success(res=>{
        			this.$Message.success('编辑成功')
        			this.$emit('on-success')
        			item.$$edit = false
        			this.action = ''
        		})
        		.error(res=>{
        			this.error(res.body.message)
        		})
        	},
        	cancel(item) {
        		this.action = ''
        		this.studend_exam_data = util.copy(this.copy_data)
        	}
        },
        watch: {
        	data(data) {
        		this.studend_exam_data = util.copy(data)
        		this.copy_data = util.copy(data)
        	}
        }
	}
</script>