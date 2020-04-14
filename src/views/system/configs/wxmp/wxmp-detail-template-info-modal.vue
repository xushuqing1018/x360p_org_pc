<template>
	<Modal v-drag-modal v-model="modal$.show" :title="modal$.title" :width="550" :mask-closable="false">
		<Form :label-width="100" ref="form" :model="info">
    		<Form-item label="业务名称:" class="col-sm-12">
				<strong><span>{{info.name}}</span></strong>
				<p class="text-gray">{{info.desc}}</p>								
				
			</Form-item>
			<Form-item label="配置参考:" class="col-sm-12">
				<ul class="no-li">
					<li>行业:{{info.tpl_industry}}</li>
					<li>标题:{{info.tpl_title}}</li>
					<li>编号:{{info.short_id}}</li>
				</ul>							
			</Form-item>
	        <Form-item label="微信模板ID" prop="template_id" class="ivu-form-item-required">
    			<Input v-model="info.template_id" placeholder="输入公众号服务号的微信模板消息ID"></Input>
    		</Form-item>
	       
    		
        </Form>
		
		<div slot="footer">
			<Button type="ghost" @click="close">取消</Button>
			<Button type="primary" :loading="saving" @click="ok">确定</Button>
		</div>
	</Modal>
</template>

<script>
	import util from '@/libs/util'
	import modal from '@/libs/modal.mixin'
	import common from '@/libs/common.mixin'
	
	
	const emptyObject = {
		name:'',
		desc:'',
		short_id:'',
		tpl_industry:'',
		tpl_title:'',
		wxmp_id:0,
		scene:'',
		template_id:''
	}
	
	export default{
		mixins: [ modal,common ],
		data () {
			return {
				info: util.copy(emptyObject),
			}
		},
		methods: {
			ok () {
				if(this.info.template_id==='') {
					this.$Message.error('请输入模板ID')
					return
				}
				
				this.$rest('wxmp_templates')
				.post(this.info)
				.success(()=>{
					this.$emit('on-success')	
					this.close()
				})
				.error(res => {
					this.error(res.body.message)
				})			
			}
		}
	}
</script>