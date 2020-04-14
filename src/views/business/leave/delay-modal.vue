<template>
	<Modal v-drag-modal v-model="modal$.show" :title="modal$.title" width="600" :mask-closable="false">
		<Form class="ml-4">
			<Form-item :label="delay_title" class="mb-0">
				<DatePicker transfer :value="delayArrange.int_day" @on-change="delayArrange.int_day=$event"></DatePicker>
			</Form-item>
			<Form-item label="基于最后一次排课日期" class="mb-0">
				<span>{{last_arrange_day}}</span>
				<Button type="primary" size="small" @click="next_day">+1天</Button>
				<Button type="primary" size="small" @click="next_week">+1周</Button>
			</Form-item>
		</Form>		
		<div slot="footer">
			<Button type="ghost" :loading="saving" @click="close">取消</Button>
			<Button type="primary" :loading="saving" @click="ok">确定</Button>
		</div>
	</Modal>
</template>

<script>
	import moment from 'moment'
	import modal from '@/libs/modal.mixin'
	import common from '@/libs/common.mixin'
	import globals from '@/libs/globals.mixin'
	export default{
		mixins: [modal,common,globals],
		props: {
			arrange: {
				type: Object,
				default: ()=>{
					return {}
				}
			},
			slvId: {
				type: Number
			},
			sid: {
				type: Number
			}
		},
		data () {
			return {
				delayArrange: {
					int_day: '',
					int_start_hour: '',
					int_end_hour: ''
				},
				last_arrange_day: ''
			}
		},
		computed: {
			delay_title () {
				return '顺延到周'+this.$filter('int_week')(this.$filter('format_int_day')(this.delayArrange.int_day))
			}
		},
		methods: {
			ok () {

			},
			onModalOpen() {
				this.get_final()
				this.delayArrange.int_start_hour = this.$filter('int_hour')(this.arrange.int_start_hour)
				this.delayArrange.int_end_hour = this.$filter('int_hour')(this.arrange.int_end_hour)
			},
			next_day() {
				this.delayArrange.int_day = moment(this.delayArrange.last_arrange_day).add(1,'days').format('YYYY-MM-DD')
			},
			next_week() {
				this.delayArrange.int_day = moment(this.delayArrange.last_arrange_day).add(7,'days').format('YYYY-MM-DD')
			},
			get_final() {
				this.$rest('course_arranges')
				.add_url_param('get_final_course_arrange')
				.get({
					ca_id: this.arrange.ca_id,
					sid: this.sid
				})
				.success(res => {
					this.last_arrange_day = this.$filter('int_date')(res.int_day)
					this.next_day()
				})
				.error(res => {
					this.$Message.error(res.body.message)
				})
			}
		}
	}
</script>

<style>
</style>