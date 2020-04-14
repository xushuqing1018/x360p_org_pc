<template>
	<Modal v-drag-modal :mask-closable="false" width="880" v-model="modal$.show" :title="modal$.title" @on-cancel="close">
		<template v-if="modal$.show">
			<fieldset style="padding: 15px;">
				<legend style="text-align: center; font-size: 18px;">班级排课计划</legend>
				<class-arrange-table 
					v-model="info.schedules" 
					:cr-id="info.cr_id" 
					:cid="info.cid" 
					:eid="info.teach_eid" 
					:second-eids="info.second_eids" 
					:season="info.season"
					from="schedule"
					@on-success="$emit('on-success')"
					>
				</class-arrange-table>
			</fieldset>
	    </template>
    	<div slot="footer">
    		<Checkbox class="pull-left" v-model="is_check" :true-value="1" :false-value="0">检测上课冲突</Checkbox>
            <Button type="ghost" @click="close">关闭</Button>
            <Button 
            	type="primary"
            	:loading="saving" 
            	:disabled="info.schedules.length==0"
            	@click="createClassArranges"
            	>
            	按排课计划生成排课
            </Button>
        </div>
    </Modal>
</template>

<script>
	import Vue from 'vue'
	import moment from 'moment'
	import util,{_} from '@/libs/util'
	import globals from '@/libs/globals.mixin'
	import modal from '@/libs/modal.mixin'
	import common from '@/libs/common.mixin'
	import SeasonSchedule from 'c%/SeasonSchedule'
	import ClassArrangeTable from './class-arrange-table.vue'
	
	const INFO_NAME = '班级'
	const INFO_PK_ID = 'cid'
	const INFO_URL   = 'classes'

	const classObject = {
		cid: 0,
		class_name: '',
		class_no: '',
		year: moment(new Date()).format('YYYY'),
		season: 'C',
		lid: 0,
		sj_id:0,
		sg_id:0,
		bid: 0,
		teach_eid: 0,
		second_eid:0,
		second_eids:[],
		edu_eid: 0,
		start_lesson_time: '',
		end_lesson_time: '',
		plan_student_nums: 0,
		lesson_times: 0,
		cr_id: 0, 
		schedules: [],
		course_arrange:0,
		is_check:1,
		exclude_holidays:1,
		subject_grade:0,
		unit_price:0.00,
		per_lesson_hour_minutes:0,
		consume_lesson_hour:1.00
	}
	
	export default{
		name:'classInfoModal',
		mixins:[ globals, modal, common ],
		components: {
			SeasonSchedule,
			ClassArrangeTable
		},
		data () {
			return {
				roomList: [],
				is_check: 1,
				info: util.copy(classObject),
			}
		},
		mounted () {
			
		},
		methods: {
			roomAdd(){
				this.$refs['dr'].refreshData('classroms?pagesize=1000').then(response=>{
					this.roomList = response.list
				})
			},
			//创建班级排课记录
			createClassArranges(){
				let param = {
					cids: [this.info.cid],
					is_check: this.is_check,
				}
				this.$http.post('course_arranges',param)
				.then(response=>{
					this.$Message.success('创建成功！')
					this.$emit('on-success')	
					this.close()				
				},response=>{
					this.error(response.body.message)
				})				
			}
		},
		computed: {
			season () {
				return this.$store.state.gvars.dicts['season']
			},
			info_url$(){
            	return INFO_URL
	        },
	        info_name$(){
	            return INFO_NAME
	        },
	        info_pk_id$(){
	            return INFO_PK_ID
	        }
		}
	}
</script>
