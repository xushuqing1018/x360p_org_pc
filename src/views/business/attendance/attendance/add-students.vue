<template>
	<Modal v-drag-modal v-model="modal$.show" :title="modal$.title" :mask-closable="false" :width="600">
		
		<Form :label-width="80" v-if="modal$.show">
			<Form-item label="选择学员">
				<select-student v-model="sids"></select-student>	
			</Form-item>
		</Form>
		
		<div slot="footer">
			<Button type="ghost" @click="close">关闭</Button>
			<Button type="primary" @click="joinArrange">仅加入这节课</Button>
			<Button type="primary" @click="joinClass" v-if="cid>0">加入此班</Button>
		</div>
	</Modal>
</template>

<script>
	import moment from 'moment'
	import common from '@/libs/common.mixin
	import util from '@/libs/util'
	import modal from '@/libs/modal.mixin'
	import SelectStudent from 'c%/SelectStudent.vue'
	export default{
		mixins: [ modal,common ],
		components: {
			SelectStudent
		},
		props: {
			list: {
				type: Array,
				default: ()=>{
					return []
				}
			}
		},
		data () {
			return {
				sids: [],
				ca_id: 0,
				cid: 0,
			}
		},
		methods: {
			joinClass () {
				if(this.check()){
					let params = {
						sids: this.sids,
						cu_ids: [],					
						in_time: moment(new Date()).format('YYYY-MM-DD')		
					}
					
					this.$rest('classes/'+this.cid+'/doassign').post(params)
					.success(data=>{
						this.$Message.success('分班操作成功')
						this.$emit('on-success')
						this.close()
					}).error(response=>{
						this.$Notice.error({
							title:'分班操作失败',
							desc:response.body.message||'分班失败'
						})
					})
				}
			},
			joinArrange () {
				if(this.check()){
					let uri = util.sprintf('course_arrange_students?ca_id=%s',this.ca_id),
						params = {
							ca_id: this.ca_id,
							list: []
						}
						
					this.sids.forEach(s=>{
						params.list.push({
							sid: s,
							cu_id: 0
						})
					})
					
					this.$rest(uri).post(params)
					.success(data=>{
						this.$Message.success('操作成功~')
						this.$emit('on-success')
						this.close()
					}).error(response=>{
						this.error(response.body.message||'操作失败~')
					})
				}
			},
			check () {
				let list = this.list,
					errorText = []
				if(this.sids.length==0){
					this.$Message.error('请先选择学员！')
					return false
				}
				
				this.sids.forEach(s=>{
					let obj = list.find(l=>l.sid==s)
					if(obj){
						errorText.push(obj.student.student_name) 
					}
				})
				if(errorText.length>0){
					let tip = util.sprintf('以下学员已在排课中，请勿重复添加：<br/> %s',errorText.join(','))
					this.$Notice.error({
						title: '提示',
						desc: tip
					})
					return false
				}
								
				return true
			}
		}
		
	}
</script>