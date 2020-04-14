<template>
	<Modal v-drag-modal v-model="modal$.show" :title="modal$.title" :mask-closable="false" width="600">
		<Form ref="form" :label-width="140">
			<fieldset class="section m-b-15">
				<legend class="title m-b-15">满校人数定义</legend>
				<Form-item label="周平均上课时段数">
					<InputNumber v-model="info.full_school_student_nums.week_ts_nums" :min="0"></InputNumber>
				</Form-item>
				<Form-item label="教室平均上课人数">
					<InputNumber v-model="info.full_school_student_nums.classroom_per_nums" :min="0"></InputNumber>
				</Form-item>
				<Form-item label="统计标准教室数">
					<InputNumber v-model="info.full_school_student_nums.room_nums" :min="0"></InputNumber>
				</Form-item>
			</fieldset>
			<fieldset class="section m-b-15">
				<legend class="title m-b-15">转介绍人数定义</legend>
				<Form-item label="包括的招生来源类型" v-if="info.transfer_student_nums" class="ivu-form-item-required">
					<dictionary-from v-model="info.transfer_student_nums.from_dids" style="width:326px"></dictionary-from>
				</Form-item>
			</fieldset>
			<fieldset class="section m-b-15">
				<legend class="title m-b-15">市场名单定义</legend>
				<Form-item label="包括的招生来源类型" v-if="info.mc_student_nums" class="ivu-form-item-required">
					<dictionary-from v-model="info.mc_student_nums.from_dids" style="width:326px"></dictionary-from>
				</Form-item>
			</fieldset>
			<fieldset class="section m-b-15">
				<legend class="title m-b-15">周上课率</legend>
				<Form-item label="校区每间教室每周上课基数" :label-width="180">
					<InputNumber v-model="info.cr_arrange_rate.class_room_base_nums" :min="0"></InputNumber>
				</Form-item>
			</fieldset>
		</Form>
		<div slot="footer">
			<Button type="ghost" @click="close">关闭</Button>
			<Button type="primary" @click="ok">确定</Button>
		</div>
	</Modal>
</template>
<script>
	import util,{_} from '@/libs/util'
	import modal from '@/libs/modal.mixin'
	import common from '@/libs/common.mixin'
	import globals from '@/libs/globals.mixin'
	import DictionaryFrom from 'c%/DictionaryFrom.vue'

	const emptyObject = {
		full_school_student_nums: { //满校人数定义
			week_ts_nums: 14, //周平均上课时段数
			classroom_per_nums: 6, //教室平均上课人数
			room_nums: 6	//统计标准教室数
		},
		transfer_student_nums: {	//转介绍人数定义
			from_dids: [],	//招生来源类型
		},
		mc_student_nums: {	//市场名单定义
			from_dids: [],	//招生来源类型
		},
		cr_arrange_rate: {	//周上课率
			class_room_base_nums: 20 //校区每间教室每周上课基数
		}
	}

	export default {
		mixins: [modal,common,globals],
		components: {
			DictionaryFrom
		},
		data() {
			return {
				info: util.copy(emptyObject)
			}
		},
		mounted() {
			this.init_data()
		},
		methods: {
			init_data() {
				this.$rest('configs').add_url_param(0,'branch')
				.get({
					key: 'ki',
					section: 'report'
				})
				.success(res => {
					this.info = res
				})
				.error(res => {
					this.$Message.error(res.body.message)
				})
			},
			ok() {
				if(this.info.mc_student_nums&&
					this.info.mc_student_nums.from_dids.length==0) {
					this.$Message.error('市场名单统计需要定义招生来源')
					return
				}
				if(this.info.transfer_student_nums&&
					this.info.transfer_student_nums.from_dids.length==0) {
					this.$Message.error('转介绍人数统计需要定义招生来源')
					return
				}

				this.$rest('configs').add_url_param(0,'branch')
				.post({
					key: 'ki',
					section: 'report',
					val: this.info
				})
				.success(res => {
					this.$Message.success('保存成功')
					this.$emit('success')
					this.close()
				})
				.error(res => {
					this.error(res.body.message)
				})
			}
		}
	}
</script>