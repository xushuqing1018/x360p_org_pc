<template>
	<Modal 
	v-model="modal$.show" 
	:title="modal$.title" 
	:width="width" 
	:mask-closable="false" 
	v-drag-modal 
	>	
		<Form :label-width="80" ref="form">
			<Form-item label="课程" class="mb-0">
				{{info.course_name}}
			</Form-item>
			<Form-item label="授课对象" class="mb-0">
				{{attendanceName}}
			</Form-item>
			<Form-item label="授课时间" class="mb-0">
				{{info.int_day|int_date}} {{info.int_start_hour|int_hour}} ~ {{info.int_end_hour|int_hour}}
			</Form-item>
			<Form-item label="取消原因" class="mb-1">
				<Input v-model="reason" placeholder="请输入取消原因" :autosize="{minRows: 1,maxRows: 3}"></Input>
			</Form-item>
			<Form-item label="缺课记录" v-help="'产生缺课记录以后，家长可以在移动端申请补课.'" class="mb-0">
				<RadioGroup v-model="create_sa" type="button">
			        <Radio :label="1">产生</Radio>
			        <Radio :label="0">不产生</Radio> 
			    </RadioGroup>
			</Form-item>

		</Form>
		<div slot="footer">
			<Button type="ghost" @click="close" :loading="saving">关闭</Button>
			<Button type="primary" @click="ok" :loading="saving">确定</Button>
		</div>
	</Modal>
</template>

<script>
	import util from '@/libs/util'
	import modal from '@/libs/modal.mixin'
	import common from '@/libs/common.mixin'
	import globals from '@/libs/globals.mixin'
	
	export default{
		mixins: [common,globals,modal],
		data () {
			return {
				width:460,
				info:{
					course_name:'',
					int_day:0,
					int_start_hour:0,
					int_end_hour:0,
					lesson_type:0
				},
				create_sa:1,
				reason:''
			}
		},
		computed:{
			attendanceName () {
				let arrange = this.info,
					mapTitle = {1:'一对一',2:'一对多'},
					result = ''
				if(arrange.lesson_type===0){	
					if(arrange._class_name){
						result = arrange._class_name
					}else{
						result = arrange.one_class!=null?arrange.one_class.class_name:arrange.name	
					}				
				}else{					
					result = mapTitle[arrange.lesson_type]										
				}
				
				return result
			}
		},
		methods: {
			ok(){
				if(/^\s*$/.test(this.reason)){
					this.$Message.error('请输入取消原因!')
					return false
				}

				this.$rest('course_arranges')
				.add_url_param(this.info.ca_id,'docancel_course')
				.post({
					ca_id:this.info.ca_id,
					reason:this.reason,
					create_sa:this.create_sa
				})
				.success(response=>{
					this.$Message.success('排课已取消！')
					this.$emit('on-success')
					this.close()
				}).error(response=>{
					this.error(response.body.message||'取消排课失败~')
				})
			}
		}
	}
</script>
