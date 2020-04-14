<template>
	<Modal v-drag-modal :mask-closable="false" v-model="modal$.show" :title="modal$.title" width="500">
		<Form :model="info" :label-width="100">
			<Form-item label="">
				<RadioGroup v-model="info.field" type="button" v-if="enable_company">
					 <Radio label="bid">按校区</Radio>
					 <Radio label="dept_id">按分公司</Radio>
				</RadioGroup>
			</Form-item>
			<Form-item label="适用校区" v-if="info.field==='bid'" class="custom-form-item-required">
				<Select v-model="info.bid" multiple>
					<Option v-for="branch in branchs" :value="branch.bid">{{branch.branch_name}}</Option>
				</Select>
			</Form-item>
			<Form-item label="适用分公司" v-else class="custom-form-item-required">
				<Select v-model="info.dept_id" multiple>
					<Option v-for="company in companys" :value="company.dpt_id">{{company.dpt_name}}</Option>
				</Select>
			</Form-item>
			<Form-item label="值" class="custom-form-item-required">
				<Input v-model="info.value"></Input>
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
		field: 'bid',
		value: '',
		bid: [],
		dept_id: []
	}

	export default {
		mixins: [modal,common,globals],
		data() {
			return {
				info: util.copy(emptyObj)			
			}
		},
		computed: {
			companys() {
				return this.$store.state.gvars.departments.filter(d => d.dpt_type==2)
			}
		},
		methods: {
			ok() {
				if(this.info.field === 'bid' && this.info.bid.length === 0) {
					this.$Message.error('适用校区不能为空')
					return
				}
				if(this.info.field === 'dept_id' && this.info.dept_id.length === 0) {
					this.$Message.error('适用分公司不能为空')
					return
				}
				if(this.info.value === '') {
					this.$Message.error('值不能为空')
					return
				}
				let info = util.copy(this.info)
				if(info.field === 'bid') {
					delete info['dept_id']
				}else{
					delete info['bid']
				}
				this.$emit('save',info)
				this.close()
			}
		}
	}
</script>