<template>
	<Modal v-drag-modal v-model="modal$.show" :title="modal$.title" :width="500" :mask-closable="false">
        <Form :label-width="80" :model="info" ref="form">
            <Form-item label="标签名称" class="ivu-form-item-required">
            	<Input v-model="info.tag_name"></Input>
            </Form-item>
            <Form-item label="标签颜色" class="ivu-form-item-required">
            	<Select v-model="info.color">
            		<Option :value="item.value" v-for="item in colorList">
            			<Icon type="record" :color="item.value"></Icon>
	            		{{item.alias}}
	            	</Option>
            	</Select>
            </Form-item>
        </Form>
		<div slot="footer">
			<Button type="ghost" @click="close">关闭</Button>
			<Button type="primary" :loading="saving" @click="ok">确定</Button>
		</div>
	</Modal>
</template>

<script>
	import util from '@/libs/util'
    import modal from '@/libs/modal.mixin'
    import common from '@/libs/common.mixin'
	const emptyObj = {
       tag_name:'',
       color: ''
	}
	export default{
		mixins: [ modal,common ],
		data () {
			return {
				info: util.copy(emptyObj),
				colorList: [
	                {
	                    alias: '红色',
	                    value: '#f5222d'
	                },
	                {
	                    alias: '橙色',
	                    value: '#fa8c16'
	                },
	                {
	                    alias: '金色',
	                    value: '#faad14'
	                },
	                {
	                    alias: '湖蓝色',
	                    value: '#13c2c2'
	                },
	                {
	                    alias: '蓝色',
	                    value: '#1890ff'
	                },
	                {
	                    alias: '紫色',
	                    value: '#722ed1'
	                }
	            ],
			}
		},
		methods: {
			ok () {
				this.$rest('tags').add_url_param(this.info.tag_id)
				.put({
					tag_name: this.info.tag_name,
					color: this.info.color
				})
				.success(res => {
					this.$Message.success('编辑成功')
					this.$emit('on-success')
					this.close()
				})
				.error(res => {
					this.$Message.error(res.body.message)
				})
            }
        }
	}
	
</script>