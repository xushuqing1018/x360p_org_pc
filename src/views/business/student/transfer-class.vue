<template>
	<Modal v-drag-modal v-model="modal$.show" :title="modal$.title" :mask-closable="false" width="800">
		<p>【{{info.student_name}}】报读的班级</p>
		<div class="mt-3">
			<table class="modal-table">
				<thead>
					<th><div class="ivu-table-cell">班级名称</div></th>
					<th><div class="ivu-table-cell">上课时间</div></th>
					<th><div class="ivu-table-cell">上课教室</div></th>
					<th><div class="ivu-table-cell">{{'老师'|translate}}</div></th>
					<th><div class="ivu-table-cell"></div></th>
				</thead>
				<tr v-for="item in filter_data" :class="item.one_class.cid==post.cid?'table-info':''">
					<td><div class="ivu-table-cell">{{item.one_class.class_name}}</div></td>
					<td><div class="ivu-table-cell">{{item.one_class.class_name}}</div></td>
					<td><div class="ivu-table-cell">{{item.one_class.cr_id|classroom_name}}</div></td>
					<td><div class="ivu-table-cell">{{item.one_class.teach_eid|employee_name}}</div></td>	
					<td><div class="ivu-table-cell"><Button type="primary" @click="transferClass(item)">转班</Button></div></td>
				</tr>
			</table>
		</div>
		<div class="mt-3">
			<Form :label-width="80">
				<Form-item label="转出班级">
					<Tag>{{post._class_name}}</Tag>
				</Form-item>
				<Form-item label="转入班级">
					<Tag>{{post._new_class_name}}</Tag>
				</Form-item>
			</Form>
		</div>
		<div slot="footer">
			<Button type="ghost" @click="cancel">取消</Button>
			<Button type="primary" @click="ok" :loading="saving" :disabled="disabled">确定</Button>
		</div>
		<select-class ref="class" @on-select="selectToClass"></select-class>
	</Modal>
</template>

<script>
	import grid from '@/libs/grid.mixin'
	import modal from '@/libs/modal.mixin'
	import common from '@/libs/common.mixin'
	import globals from '@/libs/globals.mixin'
	import selectClass from './select-class.vue'
	
	export default{
		mixins: [grid,common,globals,modal],
		components: { selectClass },
		data () {
			return {				
				data: [],
				info: {
					sid: 0,
					student_name: ''
				},
				currentItem: {},
				post: {
					old_cid: 0,
					_class_name: '',
					new_cid: 0,
					_new_class_name: ''
				},				
			}
		},
		watch: {
					
		},
		methods: {
			transferClass (row) {
				this.post.old_cid = row.one_class.cid
				this.post._class_name = row.one_class.class_name				
				this.post.new_cid = 0
				this.post._new_class_name = ''
				
				this.currentItem = row
				this.$refs['class']
				.set('info',row)
				.set('cids',this.cids)
				.getData()
				
			},	
			deal_data (data) {
				let list = data.list
				if(list&&list.length>0){
					list = list.filter(l=>l.one_class!=null)
				}
				return list
			},
			selectToClass (row) {
				
				this.post.new_cid = row.cid
				this.post._new_class_name = row.class_name
			},
			cancel () {
				this.close()
				this.post._class_name = ''
				this.post._new_class_name = ''
				this.post.old_cid = 0
				this.post.new_cid = 0
			},
			ok () {
				let params = {}
				params.sid = this.info.sid
				params.old_cid = this.post.old_cid
				params.new_cid = this.post.new_cid

				if(this.transfer_limit_lesson && params.old_cid == params.new_cid){
						this.$Message.error('转出班级与原班级相同，请选择其他班级！')
						return
				}

				this.$rest('classes/do_transfer').post(params)
				.success(data=>{
					this.$Message.success('转班成功！')
					this.$emit('on-success')
					this.cancel()
				}).error(response=>{
					this.$Notice.error({
						title: '失败',
						desc: response.body.message||'转班失败'
					})
				})
			}
		},
		computed: {
			filter_data () {
				let data = this.data
				if(data&&data.length>0){
					data = data.filter(d=>d.one_class!=null)
				}
				return data
			},
			disabled () {
				return this.post.old_cid===0||this.post.new_cid===0
			},
			cids () {
				let data = this.data,
					result = []
				if(data.length>0){
					data.forEach(d=>{
						result.push(d.cid)
					})
				}
				return result
			}
		}
	}
</script>
