<template>
	<div class="mt-2" v-if="show_delay">
		<Form>
			<Form-item label="顺延补课" class="mb-0">
				<i-switch v-model="delayArrange.is_delay" @on-change="delayChange"></i-switch>
			</Form-item>
			<template v-if="delayArrange.is_delay">
				<Form-item :label="delay_title" class="mb-0">
					<DatePicker transfer :value="delayArrange.int_day" @on-change="delayArrange.int_day=$event"></DatePicker>
				</Form-item>
				<Form-item label="基于最后一次排课日期" class="mb-0">
					<span>{{delayArrange.last_arrange_day}}</span>
					<Button type="primary" size="small" @click="next_day">+1天</Button>
					<Button type="primary" size="small" @click="next_week">+1周</Button>
				</Form-item>
			</template>
		</Form>
	</div>
</template>
<script>
	import moment from 'moment'
	import common from '@/libs/common.mixin'
	export default {
		mixins: [common],
		props: {
			delayArrange: {
				type: Object
			},
			arrange: {
				type: Object,
				default: ()=>{
					return {}
				}
			},
			list: {
				type: Array,
				default: ()=>{
					return []
				}
			}
		},
		data() {
			return {

			}
		},
		computed: {
			show_delay() {
				return this.arrange.lesson_type==1
					&&this.arrange.is_attendance==0
					&&this.list.length
					&&this.list[0].is_leave==1
					&&(this.list[0].leave==null||this.list[0].leave&&this.list[0].leave.ma_id==0)
			},
			delay_title () {
				return '顺延到周'+this.$filter('int_week')(this.$filter('format_int_day')(this.delayArrange.int_day))
			}
		},
		methods: {
			delayChange(v) {
				if(v) {
					this.get_final()
				}
			},
			next_day() {
				this.delayArrange.int_day = moment(this.delayArrange.last_arrange_day).add(1,'days').format('YYYY-MM-DD')
			},
			next_week() {
				this.delayArrange.int_day = moment(this.delayArrange.last_arrange_day).add(7,'days').format('YYYY-MM-DD')
			},
			get_final() {
				this.$rest('course_arranges').add_url_param('get_final_course_arrange')
				.get({
					ca_id: this.arrange.ca_id,
					sid: this.list[0].sid
				})
				.success(res => {
					this.delayArrange.last_arrange_day = this.$filter('int_date')(res.int_day)
					this.next_day()
				})
				.error(res => {
					this.$Message.error(res.body.message)
				})
			}
		}
	}
</script>