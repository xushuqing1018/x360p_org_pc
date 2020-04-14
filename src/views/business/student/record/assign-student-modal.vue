<template>
	<Modal v-drag-modal :mask-closable="false" v-model="modal$.show" :title="modal$.title" width="450">
    	<Form :label-width="100" v-if="modal$.show" label-position="left" :model="search_field">    	
    		<Form-item label="入班日期">
          <DatePicker type="date" placeholder="选择入班日期" format="yyyy-MM-dd" v-model="info.in_time"></DatePicker>
        </Form-item>   
        <Form-item label="入班对象：">
					{{student_name}}
        </Form-item>
				<Form-Item label="选择班级："  prop="cid">
					<select-class v-model="search_field.cid" clearable></select-class>
				</Form-Item>
    	</Form>
		<!-- <Alert class="mb-3" show-icon v-if="classInfo.class_type==0">
			<span class="mr-3">剩余名额：{{max}}</span>
		</Alert> -->
    	<div slot="footer">
        <Button type="ghost" @click="close" :loading="saving">取消</Button>
        <Button type="primary" @click="doAssignStudent" :loading="saving">确定</Button>
      </div>
   </Modal>
</template>

<script>
	import modal from '@/libs/modal.mixin'
	import common from '@/libs/common.mixin'
	import SelectClass from 'c%/SelectClass.vue'
	
	export default{
		mixins: [modal,common],
		components: {
			SelectClass
		},
		props: {
			// classInfo: {
			// 	type: Object,
			// 	default: ()=>{
			// 		return {}	
			// 	}
			// },
			sid: {
				type: [Number,String],
				default: 0
			},
			student_name: {
				type: String,
				default: ""
			}
		},		
		data () {
			return {
				search_field:{
					cid: 0
				},
				order_sids: [],
				info: {
					sids: [],
					cu_ids: [],					
					in_time: ''
				}				
			}
		},
		mounted () {
			this.info.in_time = this.$filter('moment')(new Date(),'YYYY-MM-DD')
			this.info.sids.push(Number(this.sid))
		},
		computed: {
			// max () {
			// 	let info = this.classInfo,
			// 			result = 0
			// 	if(info){
			// 		result = info.plan_student_nums - info.student_nums 
			// 	}
			// 	return result
			// },
		},
		methods: {			
			doAssignStudent () {
				if(this.info.in_time == ''){
					this.$Message.error('请选择入班日期')
					return false
				}
				if(this.search_field.cid == ''){
					this.$Message.error('请选择班级')
					return false
				}
				// if(this.classInfo.class_type==0){
				// 	if(this.info.sids.length+this.info.cu_ids.length>this.max){
				// 		this.$Message.error('该班级剩余名额不足，请选择其他班级')
				// 		return false
				// 	}
				// }
				this.$rest('classes/'+this.search_field.cid+'/doassign').post(this.info)
				.success(data=>{
					this.$Message.success('分班操作成功')
					this.$emit("on-success")
					this.close()
				}).error(response=>{
					this.$Notice.error({
						title:'分班操作失败',
						desc:response.body.message||'分班失败'
					})
				})			
			}
		}
	}
</script>