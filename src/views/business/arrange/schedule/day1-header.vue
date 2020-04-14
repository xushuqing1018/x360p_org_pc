<template>
	<thead class="week-schedule-table-head day_table_header">
		<tr>
			<th width="80" rowspan="2" style="background: #fff;border-top: 1px solid #e7e7eb">时间点</th>
			<th colspan="12" style="background: #d2e7fd">
				<Button type="text" class="pull-left" icon="chevron-left" @click="prevDate"></Button>
				<span style="cursor: pointer" @click="changeDate">{{formatDate}}</span>
				<Button type="text" class="pull-right" icon="chevron-right" @click="nextDate"></Button>
			</th>
		</tr>
		<tr>
			<th v-for="(item,index) in data">
				<Button 
					class="ivu-btn-prev" 
					type="text" 
					icon="chevron-left" 
					@click="prevPage" 
					:disabled="page==1"
					v-if="index==0"
					>
				</Button>
				<letter-avatar
					size="30"
					:src="item.photo_url"
					:name="item.ename"
					:rounded="true"
					style="display: inline-block">
				</letter-avatar>
				<span>{{item.ename}}</span>
				<Button 
					class="ivu-btn-next" 
					type="text" 
					icon="chevron-right" 
					@click="nextPage" 
					:disabled="isLastPage"
					v-if="index==data.length-1"
					>
				</Button>
			</th>
			<th v-for="i in (10-data.length)"></th>
		</tr>
	</thead>
</template>
<script>
	import moment from 'moment'
	import util from '@/libs/util'
	import common from '@/libs/common.mixin'
	import LetterAvatar from 'c%/LetterAvatar.vue'

	export default {
		mixins: [common],
		components: {
			LetterAvatar
		},
		props: {
			eid: {
				type: Number,
				default: 0
			},
			view: {
				type: String,
			},
			date: {
				type: String
			},
			year:{
				type:Number,
				default:0
			},
			week:{
				type:Number,
				default:1
			},
			data:{
				type:Array,
				default:() => {
					return []
				}
			},
			page:{
				type:Number,
				default:1
			},
			total:{
				type:Number,
				default:0
			}
		},
		data() {
			return {
				week_day_map: ['日','一','二','三','四','五','六']
			}
		},
		methods: {
			prevPage() {
				this.$emit('on-prev')
			},
			nextPage() {
				this.$emit('on-next')
			},
			prevDate() {
				this.$emit('on-prev-date')
			},
			nextDate() {
				this.$emit('on-next-date')
			},
			changeDate() {
				this.$Modal.open('business/attendance/set-day-modal.vue',{
					props: {
					},
					on: {
						'on-ok': (date)=>{
							this.$emit('on-change-date',date)
						}
					}
				})
				.then(modal=>{
					modal.show('选择日期')
				})
			}
		},
		computed: {
			isLastPage() {
				return (Math.floor(this.total/10) + 1) == this.page
			},
			formatDate() {
				return moment(this.date).format('MM/DD')+'（周'+this.week_day_map[moment(this.date).day()]+'）'
			}
		}
	}
</script>