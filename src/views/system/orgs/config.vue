<template>
	<Modal v-drag-modal v-model="modal$.show" :title="modal$.title" :mask-closable="false" width="600">
		<Form :model="info" :label-width="80">
			<Form-item label="目标机构">
				<Tag color="green">{{name}}</Tag>
			</Form-item>
			<Form-item label="源机构" class="custom-form-item-required">
				<RadioGroup v-model="org_from" type="button" @on-change="changeFrom">
					<Radio :label="-1">系统配置校区</Radio>
					<Radio :label="0">总部</Radio>
					<Radio :label="1">其他加盟商</Radio>
				</RadioGroup>
			</Form-item>
			<Form-item label="加盟商" class="custom-form-item-required" v-if="org_from==1">
				<select-org v-model="info.og_id" placeholder="请选择加盟商" clearable></select-org>
			</Form-item>
			<Form-item label="配置项" class="custom-form-item-required">
				<Checkbox v-model="all" @on-change="selectAll">全选</Checkbox>
				<CheckboxGroup v-model="info.fields">
					<Checkbox 
						v-for="item in config_fields" 
						:label="item.value"
						>
						{{item.label}}
					</Checkbox>
				</CheckboxGroup>
			</Form-item>
		</Form>
		<div slot="footer">
			<Button type="ghost" @click="close">关闭</Button>
			<Button type="primary" :loading="saving" @click="ok">确定</Button>
		</div>
	</Modal>
</template>
<script>
	import modal from '@/libs/modal.mixin'
	import common from '@/libs/common.mixin'
	import SelectOrg from 'c%/SelectOrg.vue'
	export default {
		mixins: [modal,common],
		components: {
			SelectOrg
		},
		props: {
			id: {
				type: Number,
				default: 0
			},
			name: String
		},
		data() {
			return {
				info: {
					og_id: 0,
					fields: []
				},
				all: false,
				org_from: -1,
				config_fields: [
					{value: 'params',label: '系统参数'},
					{value: 'org_pc_ui',label: 'PC端界面'},
					{value: 'student_mobile_ui',label: '学习管家界面'},
					{value: 'org_mobile_ui',label: '教育助手界面'},
					{value: 'student_option_fields',label: '学员自定义字段'},
					{value: 'org_role',label: '角色名称自定义'},
					{value: 'lessons',label:'课程科目教室班级'},
					{value: 'employees',label:'部门员工'},
					{value: 'time_sections',label:'时间段'},
					{value: 'print_tpls',label:'打印模板设置'}
				]
			}
		},
		watch: {
			'info.fields':function(f) {
				if(f.length == this.config_fields.length) {
					this.all = true
				}else{
					this.all = false
				}
			}
		},
		methods: {
			ok() {
				if(this.info.og_id == this.id) {
					this.$Message.error('源机构必须与目的机构不一致')
					return false
				}
				if(this.org_from==1&&this.info.og_id==0) {
					this.$Message.error('请选择加盟商')
					return false
				}
				if(this.info.fields.length == 0) {
					this.$Message.error('至少选一个配置项')
					return false
				}
				if(this.org_from = -1) {
					this.info.og_id = -1
				}
				this.$rest('orgs').add_url_param(this.id,'doconfig')
				.post(this.info)
				.success(res => {
					this.$Message.success('配置复制成功')
					this.$emit('success')
					this.close()
				})
				.error(res => {
					this.error(res.body.message||'操作失败')
				})
			},
			changeFrom(v) {
				if(v == 0) {
					this.info.og_id = 0
				}
				else if(v == -1)
				{
					this.info.og_id = -1
				}
			},
			selectAll(v) {
				if(v) {
					let ret = []
					this.config_fields.forEach(f => {
						ret.push(f.value)
					})
					this.info.fields = ret
				}else{
					this.info.fields.splice(0)
				}
			}
		}
	}
</script>