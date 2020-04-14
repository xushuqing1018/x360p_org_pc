<template>
	<Modal v-drag-modal v-model="modal$.show" :title="modal$.title" :mask-closable="false" width="500">
		<Form ref="form" :model="info" :label-width="80">
			<Form-item label="预约日期" prop="title">
				<DatePicker type="date" placeholder="请选择日期" :value="info.int_day" @on-change="info.int_day=$event"></DatePicker>
			</Form-item>
            <Form-item label="时间段" prop="desc">
				<TimePicker format="HH:mm" type="timerange" placeholder="请选择时间段" :value="info.int_hour" @on-change="info.int_hour=$event"></TimePicker>
			</Form-item>
            <Form-item label="限制人数" prop="desc">
				<InputNumber :min="1" v-model="info.limit_nums"></InputNumber>
			</Form-item>
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

	export default {
		mixins: [modal,common],
		data() {
			return {
				info: {}
			}
		},
		methods: {
			ok() {
                this.info.int_start_hour = this.info.int_hour[0]
                this.info.int_end_hour = this.info.int_hour[1]

                if(this.info.int_day == '' || this.info.int_start_hour == '' || this.info.int_end_hour == ''){
                    this.$Message.error("预约时段信息填写不完整")
                    return
				}
				
                this.$rest('appointment_time_sections/' + this.info.ats_id)
                .put(this.info)
				.success(response=>{
                    this.$Message.success('修改成功')
                    this.$emit('on-success')
                    this.close()
				}).error(response=>{
					this.error(response.body.message||'操作失败~')
				})
			}
		}
	}
</script>