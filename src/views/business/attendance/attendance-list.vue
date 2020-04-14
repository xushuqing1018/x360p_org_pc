<template>
	<Modal v-drag-modal v-model="modal$.show" width="950" :mask-closable="false">
		<div slot="header">
			<strong>{{modal$.title}}</strong>
		</div>
		<div class="schedule-main m-0" style="min-height: 500px;">
			<div class="clear">
				<ButtonGroup>
					<Button 
						:type="mode=='view'?'primary':'ghost'" 
						icon="calendar" 
						@click="changeMode('view')">
					</Button>
					<Button 
						:type="mode=='list'?'primary':'ghost'" 
						icon="navicon" 
						@click="changeMode('list')">
					</Button>
				</ButtonGroup>	
				<template v-if="enable_online_lesson">
					<RadioGroup v-model="is_online" type="button">
						<Radio :label="0">线下课</Radio>
						<Radio :label="1">线上课</Radio>
					</RadioGroup>
				</template>
				<Button
					class="pull-right"
					type="primary"
					v-if="enable_free_attendance"
					icon="ios-keypad"
					@click="showFreeAttendanceModal">
					自由考勤
				</Button>
			</div>
			<course-arrange-view 
				ref="view" 
				:modal-show="modal$.show"
				:is-online="is_online"
				:search-params="searchParams"
				@date-change="dateChange"
				@on-success="handleSuccess"
				@on-condition-change="conditionChange"
				@on-clear-condition="clearCondition"
				v-if="mode=='view'"
				>
			</course-arrange-view>
			<course-arrange-list
				:search-params="searchParams"
				:is-online="is_online"
				:no-attend="noAttend"
				@on-success="handleSuccess"
				v-else
				>
			</course-arrange-list>		
		</div>
		<div slot="footer">
		    <export-button res="class_arranges" :params="ex_params" v-if="mode=='view'">
		    	导出签到表
		    </export-button>
			<Button 
				type="ghost" 
				@click="close">
				关闭
			</Button>
		</div>		
	</Modal>
</template>

<script>
	import Vue from 'vue'
	import moment from 'moment'
	import util from '@/libs/util'
	import modal from '@/libs/modal.mixin'
	import common from '@/libs/common.mixin'
	import globals from '@/libs/globals.mixin'
	import courseArrangeList from './list.vue'
	import courseArrangeView from './view.vue'
	import ExportButton from 'c%/ExportButton.vue'
	export default{
		mixins: [modal,common,globals],
		components: {
			courseArrangeList,
			courseArrangeView,
			ExportButton
		},
		props: {
			noAttend: {
				type: Boolean,
				default: false
			},
			searchParams: {
				type: Object,
				default: () => {
					return null
				}
			}
		},
		data () {
			return {
				mode: 'view',
				is_same: true,
				ex_params:{
					teach_eid:0,
					cr_id:0,
					int_start_hour:0,
					int_end_hour:0,
					int_day:moment().format('YYYYMMDD'),
					bid:this.$store.state.branch.bid
				},
				is_online:0
			}
		},
		watch: {
			
		},
		mounted(){
			let mode = Vue.localStorage.get('__ATTENDANCE__LIST_MODE__')
			if(mode) {
				this.mode = mode
			}
		},
		methods: {
			handleSuccess () {
				this.$emit('on-success')
			},
			changeMode (type) {
				this.mode = type
				Vue.localStorage.set('__ATTENDANCE__LIST_MODE__',type)
			},
			attendCustom () {
			
			},
			batchAttend() {
				this.$r('view').batchAttend()
			},
			dateChange(date) {
				this.ex_params.int_day = moment(date).format('YYYYMMDD')
				this.is_same = moment(moment().format('YYYY-MM-DD')).isSame(moment(date).format('YYYY-MM-DD'))
			},
			clearCondition(){
				this.ex_params.teach_eid = 0;
				this.ex_params.cr_id = 0;
				this.ex_params.int_start_hour = 0;
				this.ex_params.int_end_hour = 0;
			},
			conditionChange({view_type,key}){
				if(view_type == ''){
					this.ex_params.teach_eid = 0;
					this.ex_params.cr_id = 0;
					this.ex_params.int_start_hour = 0;
					this.ex_params.int_end_hour = 0;
				}else{
					switch(view_type){
						case 1:
							this.ex_params.teach_eid = key;
							this.ex_params.cr_id = 0;
							this.ex_params.int_start_hour = 0;
							this.ex_params.int_end_hour = 0;
							break;
						case 2:
							this.ex_params.teach_eid = 0;
							this.ex_params.cr_id = key;
							this.ex_params.int_start_hour = 0;
							this.ex_params.int_end_hour = 0;
							break;
						case 3:
							let arr = key.split(' -- ')
							this.ex_params.teach_eid = 0;
							this.ex_params.cr_id = 0;
							this.ex_params.int_start_hour = arr[0];
							this.ex_params.int_end_hour = arr[1];
							break;
					}
				}
			},
			attendanceSuccess(){
				this.$refs.view.init_data()
			},
			showFreeAttendanceModal(){
				this.$Modal.open('business/attendance/free-attendance-modal.vue',{
					on:{
						'on-success':()=>{
							this.attendanceSuccess()
						}
					}
				})
				.then(modal=>{
					modal.show('自由登记考勤')
				})
			}

			
		}
	}
</script>