<template>
	<Modal v-drag-modal :mask-closable="false" v-model="modal$.show" :title="modal$.title" width="600">
		<Form :modal="info" :label-width="100">
			<Form-item label="服务对象">
				<RadioGroup v-model="info.object" type="button" @on-change="objectChange">
					<Radio :label="1" :disabled="info.system==1">个人</Radio>
					<Radio :label="0" :disabled="info.system==1">班级</Radio>
				</RadioGroup>
			</Form-item>						
			<Form-item label="服务类型" class="custom-form-item-required" v-if="info.system==0">
				<Select 
					ref="select0" 
					v-model="service_did" 
					@on-change="serviceDidChange" 
					v-show="info.object == 0"
					clearable>
					<Option 
						v-for="item in class_service_type" 
						:value="item.did" 
						>
						{{item.title}}
					</Option>
				</Select>
				<Select 
					ref="select1" 
					v-model="service_did" 
					@on-change="serviceDidChange" 
					v-show="info.object == 1"
					clearable>
					<Option 
						v-for="item in student_service_type" 
						:value="item.did" 
						>
						{{item.title}}
					</Option>
				</Select>
			</Form-item>
			<Form-item label="服务名称" class="custom-form-item-required">
				<Input v-model="info.title" :disabled="info.system==1"></Input>
			</Form-item>
			<Form-item label="完成角色" class="custom-form-item-required">
				<Tag 
					v-for="r in info.rids" 
					:key="r" 
					:name="r" 
					closable 
					color="blue" 
					@on-close="handClose">{{r|role_name}}
				</Tag>
				<Button 
					icon="ios-plus-empty" 
					type="dashed" 
					size="small" 
					@click="handleAdd">添加角色
				</Button>
			</Form-item>
			<Form-item label="服务星级" v-if="info.object==1">
				<Rate v-model="info.service_level" :count="service_level_config" clearable></Rate>（0星表示不限制）
			</Form-item>
			<Form-item label="是否上传附件">
				<i-switch v-model="info.need_attach" :true-value="1" :false-value="0"></i-switch>
			</Form-item>
			<Form-item label="启用">
				<i-switch v-model="info.enable" :true-value="1" :false-value="0"></i-switch>
			</Form-item>
		</Form>
		<div slot="footer">
			<Button type="ghost" @click="close">关闭</Button>
			<Button type="primary" @click="ok">确定</Button>
		</div>
	</Modal>
</template>
<script>
	import util from '@/libs/util'
	import modal from '@/libs/modal.mixin'
	import common from '@/libs/common.mixin'
	import globals from '@/libs/globals.mixin'

	const emptyObj = {
		name: '',
		title: '',
		system: 0,
		rids: [],
		enable: 1,
		object: 1, // 0:班级服务 1:个性服务
		service_level: 0,
		need_attach: 0
	}
	export default {
		mixins: [modal,common,globals],
		data() {
			return {
				service_did: 0,
				info: util.copy(emptyObj)
			}
		},
		computed: {
			service_type() {
				let type = 'class'
				if(this.info.object == 1) {
					type = 'student'
				}
				return this.dicts(type+'_service_type').filter(item => item.is_system==0) 
			},
			class_service_type() {
				return this.dicts('class_service_type').filter(item => item.is_system==0) 
			},
			student_service_type() {
				return this.dicts('student_service_type').filter(item => item.is_system==0) 
			}
		},
		methods: {
			handClose(event,r) {
				const index = this.info.rids.indexOf(r)
				this.info.rids.splice(index,1)
			},
			handleAdd() {
				this.$Modal.open('system/configs/service-standard/select-rid-modal.vue',{
					props: {
						value: this.info.rids
					},
					on: {
						'on-change':(data) => {
							this.info.rids = data
						}
					}
				})
				.then(modal => {
					modal.show('添加角色')
				})
			},
			objectChange(v) {
				this.info.name = ''
				this.info.title = ''
				this.info.service_level = 0
				this.service_did = 0
				if(this.info.object == 1) {
					this.$refs.select1.clearSingleSelect()
				}else{
					this.$refs.select0.clearSingleSelect()
				}
			},
			serviceDidChange(v) {
				if(!v) return
				let option = this.service_type.find(item => item.did == v)
				this.info.title = option.title		
				this.info.name = 'did_' + v
			},
			ok() {
				if(this.info.name === '') {
					this.$Message.error('服务类型不能为空')
					return
				}
				if(this.info.title === '') {
					this.$Message.error('服务名称不能为空')
					return
				}
				if(this.info.rids.length == 0) {
					this.$Message.error('至少选一个授权角色')
					return
				}
				this.$emit('save',this.info)
				this.close()
			}
		}
	}
</script>