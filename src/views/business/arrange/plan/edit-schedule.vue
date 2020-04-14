<template>
	<Modal v-drag-modal v-model="modal$.show" :mask-closable="false" :title="modal$.title" width="500">
		<Form :label-width="80">
			<Form-item label="时段" class="ivu-form-item-required">
				<select-time-section
					:value="ts_array" 
					@on-change="changeTimeSection"
					placeholder="请选择上课时间段"
					>
				</select-time-section>
			</Form-item>
			<Form-item :label="label_teacher" class="ivu-form-item-required" v-if="scheduleType!==1">
				<select-employee v-model="item.eid" :rid="1" :limit-per="false" clearable></select-employee>
			</Form-item>
			<Form-item :label="label_secteacher">
				<select-employee v-model="item.second_eids" :rid="2" :limit-per="false" clearable></select-employee>
			</Form-item>
			<Form-item label="教室">
				<select-class-room v-model="item.cr_id"></select-class-room>
			</Form-item>
			<Form-item label="人数" v-if="scheduleType!==0&&from==='plan'">
				<InputNumber v-model="item.student_limit" :min="1" :readonly="lessonType==1"></InputNumber>
			</Form-item>
			<Form-item label="课消">
				<template v-if="item.consume_source_type==1">
					<InputNumber v-model="item.consume_lesson_hour" :min="0"></InputNumber> 课时
				</template>
				<template v-else>
					<InputNumber v-model="item.consume_lesson_amount" :min="0"></InputNumber> 元
				</template>
			</Form-item>
			<Form-item label="授课主题" v-if="enable_type2_bk&&scheduleType==2">
				<Input v-model="item.name"></Input>
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
	import SelectEmployee from 'c%/SelectEmployee.vue'
	import SelectClassRoom from 'c%/SelectClassRoom.vue'
	import SelectTimeSection from 'c%/SelectTimeSection.vue'

	export default {
		mixins: [modal,common],
		components: {
			SelectEmployee,
			SelectTimeSection,
			SelectClassRoom
		},
		props: {
			item: Object,
			scheduleType: {
				type: Number,
				default: 0
			},
			lessonType: {
				type: Number,
				default: 0
			},
			from: {
				type: String,
				default: 'plan'
			}
		},
		data() {
			return {
				ts_array: []
			}
		},
		methods: {
			ok() {
				if(this.item.eid==0&&this.scheduleType!==1) {
					this.$Message.error('请选择'+this.label_teacher)
					return
				}
				this.$emit('on-ok',this.item)
				this.close()
			},
			onModalOpen() {
				this.ts_array = [this.item.int_start_hour,this.item.int_end_hour]
			},
			changeTimeSection (arr) {
				if(arr && arr.length > 0){
					this.item.int_start_hour = arr[0]
					this.item.int_end_hour = arr[1]
				}
				this.ts_array = arr
			}
		}
	}
</script>