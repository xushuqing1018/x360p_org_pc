<template>
	<Modal v-drag-modal :mask-closable="false" v-model="modal$.show" :title="modal$.title" width="800">
    	<Form :label-width="100" v-if="modal$.show" label-position="left">    	
    		<Form-item label="入班日期">
            	<DatePicker type="date" placeholder="选择入班日期" format="yyyy-MM-dd" v-model="info.in_time"></DatePicker>
            </Form-item>   
            <Form-item label="入班对象">
            	<assign-object v-model="info" :lid="classInfo.lid"></assign-object>
            </Form-item>
    	</Form>
    	
		<Alert class="mb-3" show-icon v-if="classInfo.class_type==0">
			<span class="mr-3">剩余名额：{{max}}</span>
			已选择：{{studentNums}}
		</Alert>
    	
    	<div slot="footer">
    		<div class="pull-left">
				<Icon type="record" color="#3091f2"></Icon>
				<span>意向客户</span>
				<Icon type="record" color="#0c6" class="ml-2"></Icon>
				<span>正式学员</span>
			</div>
            <Button type="ghost" @click="close" :loading="saving">取消</Button>
            <Button type="primary" @click="doAssignStudent" :loading="saving">确定</Button>
        </div>
   </Modal>
</template>

<script>
	import modal from '@/libs/modal.mixin'
	import common from '@/libs/common.mixin'
	import AssignObject from './assign-object.vue'
	
	export default{
		mixins: [modal,common],
		props: {
			classInfo: {
				type: Object,
				default: ()=>{
					return {}	
				}
			},
			max: {
				type: Number,
				default: 0
			}
		},		
		components: {
			AssignObject
		},
		data () {
			return {
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
		},
		computed: {
			studentNums () {
				return this.info.sids.length + this.info.cu_ids.length
			}
		},
		methods: {			
			clearAll () {
				this.info.sids = []
				this.info.cu_ids = []
			},
			getMapText(id,name) {
				let result = this.$store.getters.getMapText(id,name)
				return this.$store.getters.getMapText(id,name)
			},
			doAssignStudent () {
				if(this.info.in_time==''){
					this.$Message.error('请选择入班日期')
					return false
				}
				if((this.info.sids.length+this.info.cu_ids.length) == 0){
					this.$Message.error('请选择要分班的学员')
					return false
				}
				
				if(this.classInfo.class_type==0){
					if(this.info.sids.length+this.info.cu_ids.length>this.max){
						this.$Message.error('该班级剩余名额不足，请选择其他班级')
						return false
					}
				}
				let studentNums = this.studentNums
				
				this.$rest('classes/'+this.classInfo.cid+'/doassign').post(this.info)
				.success(data=>{
					this.$Message.success('分班操作成功')
					this.$emit('on-success',studentNums);
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