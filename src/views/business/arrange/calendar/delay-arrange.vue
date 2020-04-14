<template>
	<Modal v-drag-modal v-model="modal$.show" :title="modal$.title" :mask-closable="false" width="850">
		<Form :label-width="80">
			<Row :gutter="30">
				<Col span="12" class="delay-arrange__left">
					<Form-item label="授课对象：" class="mb-0" style="border-bottom:1px solid #eee;">
						<Tag color="blue" v-if="info.lesson_type==0">{{info.one_class.class_name}}</Tag>
						<template v-else>
							<Tag color="blue" v-for="item in info.students">{{item.student_name}}</Tag>
						</template>
					</Form-item>
					<Row>
						<Col span="12">
							<Form-item label="日期：" class="mb-0">
								<span>{{info.int_day|int_date}} · 周{{week_map[info.week_day]}}</span>
							</Form-item>
						</Col>
						<Col span="12">
							<Form-item label="时段：" class="mb-0">
								<span>{{info.int_start_hour}}~{{info.int_end_hour}}</span>
							</Form-item>
						</Col>
					</Row>
					<Row>
						<Col span="12">
							<Form-item label="课程：" class="mb-0">
								<span>{{info.lid|lesson_name}}</span>
							</Form-item>
						</Col>
						<Col span="12">
							<Form-item label="科目：" class="mb-0">
								<span>{{info.sj_id|subject_name}}</span>
							</Form-item>
						</Col>
					</Row>
					<Row>
						<Col span="12">
							<Form-item :label="label_teacher+'：'" class="mb-0">
								<span>{{info.eid|ename}}</span>
							</Form-item>
						</Col>
						<Col span="12">
							<Form-item :label="label_secteacher+'：'" class="mb-0">
								<span>{{info.second_eids|enames}}</span>
							</Form-item>
						</Col>
					</Row>					
					<Row>
						<Col span="12">
							<Form-item label="教室：" class="mb-0">
								<span>{{info.cr_id|classroom_name}}</span>
							</Form-item>
						</Col>
						<Col span="12">
							<Form-item label="课耗：" class="mb-0">
								<span v-if="info.consume_source_type == 1">{{info.consume_lesson_hour}}</span>
								<span v-else>{{label_currency}}{{info.consume_lesson_amount}}</span>
							</Form-item>
						</Col>
					</Row>
				</Col>
				<Col span="12" style="margin-top:40px;">
					<Form-item label="顺延到：" class="mb-1">
						<RadioGroup v-model="week_day" type="button" size="small">
							<Radio v-for="(item,i) in week_map" :label="i">{{week_map[i]}}</Radio>
						</RadioGroup>
					</Form-item>
					<Form-item label="截止日期：" class="mb-1">
						<DatePicker :value="info.end_date" @on-change="info.end_date = $event" style="width: 160px"></DatePicker>
						<ButtonGroup>
							<Button type="text" size="small" @click="delayMonth(i)" v-for="i in 3">{{i}}</Button>
							<Button type="text" size="small">个月</Button>
						</ButtonGroup>
					</Form-item>
					<Form-item label="忽略冲突：" class="mb-1">
						<Checkbox v-model="info.ignore_class_cc" :true-value="1" :false-value="0">忽略教室</Checkbox>
						<Checkbox v-model="info.ignore_class_ec" :true-value="1" :false-value="0">忽略老师</Checkbox>
						<Checkbox v-model="info.ignore_student_cc" :true-value="1" :false-value="0">忽略学员</Checkbox>
					</Form-item>
				</Col>
			</Row>
		</Form>
		<conflict-table 
			:arrange-list="arrangeList"
			v-if="arrangeList.length" 
			style="max-height: 400px;overflow: auto;"
			>
		</conflict-table>
		<div slot="footer">
			<Button type="ghost" @click="close">关闭</Button>
			<template v-if="arrangeList.length">
				<Button type="primary" :loading="saving" @click="checkConfilct">检测冲突</Button>
				<Button type="primary" :loading="saving" @click="ok">确定排课</Button>
			</template>
			<Button type="primary" :loading="saving" @click="previewArrange" v-else>生成排课</Button>
		</div>
	</Modal>
</template>
<script>
	import moment from 'moment'
	import util,{_} from '@/libs/util'
	import modal from '@/libs/modal.mixin'
	import common from '@/libs/common.mixin'
	import globals from '@/libs/globals.mixin'
	import ConflictTable from './conflict-table.vue'

	const emptyObject = {
		cid: 0,
		consume_lesson_amount: 0,
		consume_lesson_hour: 0,
		consume_source_type: 1,
		cr_id: 0,
		grade: 0,
		ignore_class_cc: 0,
		ignore_class_ec: 0,
		ignore_student_cc: 0,
		int_day: '',
		int_end_hour: '',
		int_start_hour: '',
		lesson_type: -1,
		lid: 0,
		second_eids: [],
		sid: 0,
		sids: [],
		sj_id: 0,
		eid: 0,
		one_class: {},
		students: [],
		week_day: '',
		end_date: moment().add(7,'days').format('YYYY-MM-DD')
	}

	const emptyError = {
		error_fields: [],
		error_message: [],
		is_error: false,
		is_check: false
	}

	export default {
		mixins: [modal,common,globals],
		components: {
			ConflictTable
		},
		props: {
			arrange: {
				type: Object,
				default:() => {
					return {}
				}
			}
		},
		data() {
			return {
				arrangeList: [],
				week_day: 0,
				info: util.copy(emptyObject),
				week_map: ['日','一','二','三','四','五','六']
			}
		},
		watch: {
			
		},
		mounted() {
			this.setInfoByArrange()
		},
		computed: {
	        ignore_class_cc () {
				let result = 0
				
				if(this.$store.state.gvars.configs.params.course_arrange){
					result = this.$store.state.gvars.configs.params.course_arrange.ignore_class_cc
				}
				
				return result
			},
			ignore_class_ec () {
				let result = 0
				
				if(this.$store.state.gvars.configs.params.course_arrange){
					result = this.$store.state.gvars.configs.params.course_arrange.ignore_class_ec
				}
				
				return result
			},
			ignore_student_cc(){
				return 0
			}
		},
		methods: {
			ok() {
				this.checkConfilctResult()
				.then(data => {
					if(data) {
						this.confirm(data)
						.then(() => {
							this.confirmArrange()
						})
					}else{
						this.confirmArrange()
					}
				})
			},
			setInfoByArrange() {
				if(!_.isEmpty(this.arrange)) {
					for(let k in emptyObject) {
						if(typeof this.arrange[k] !='undefined') {
							this.info[k] = this.arrange[k]
						}
					}
					if(this.arrange.students.length) {
						this.info.students = []
						this.arrange.students.forEach(s => {
							if(this.arrange.lesson_type == 1) {
								this.info.sid = s.sid
							}else if(this.arrange.lesson_type == 2) {
								this.info.sids.push(s.sid)
							}
							if(s.student&&s.student.student_lesson) {
								s.student.student_lesson.student_name = s.student.student_name
								this.info.students.push(s.student.student_lesson)
							}
						})
					}
				}
				this.info.eid = this.arrange.teach_eid
				if(this.arrange.student_limit > 0){
					this.info.student_limit = this.arrange.student_limit
				}
				this.info.int_start_hour = this.$filter('int_hour')(this.info.int_start_hour)
				this.info.int_end_hour = this.$filter('int_hour')(this.info.int_end_hour)
				this.info.week_day = new Date(this.$filter('int_date')(this.info.int_day)).getDay()
				this.week_day = this.info.week_day
				this.info.ignore_class_ec = this.ignore_class_ec
				this.info.ignore_class_cc = this.ignore_class_cc
				this.info.ignore_student_cc = this.ignore_student_cc

				
			},
			previewArrange() {
				let	start = this.$filter('int_date')(this.info.int_day),
					end = this.info.end_date,
					dateArr = this.getDateByWeekDay(this.week_day,start,end)
				if(dateArr.length == 0) {
					this.error('没有合适的数据')
					return
				}
				dateArr.forEach(d => {
					this.arrangeList.push(Object.assign({},this.info,{
						week_day: new Date(d).getDay(),
						int_day: this.$filter('format_int_day')(d)
					}))
				})
			},
			getDateByWeekDay(wd,sd,ed) {
				let ret = [],
					result = [],
					date = sd,
					diff = moment(ed).diff(sd,'days')
				while(diff > 0) {
					let next_date = moment(date).add(1,'days').format('YYYY-MM-DD')
					ret.push(next_date)
					date = next_date
					diff--
				}
				ret.forEach(r => {
					if(wd == new Date(r).getDay()) {
						result.push(r)
					}
				})
				return result
			},
			delayMonth(i) {
				this.info.end_date = moment(this.$filter('int_date')(this.info.int_day)).add(i,'months').format('YYYY-MM-DD')
			},
			confirmArrange() {
				this.$rest('course_arranges/law_course_arranges')
				.post(this.arrangeList)
				.success(response=>{
					let data = response.data,
						notice_type = 'success'							
					
					this.$Notice[notice_type]({
						title: '排课结果',
						duration: 6,
						render: h => {
							let desc = []
							if(data && data.success > 0) {
								desc.push(h('p',`${data.success}条排课创建成功`))
							}
							if(data && data.fail > 0){
								desc.push(h('p',`${data.fail}条排课创建失败`))
							}
							return h('div',desc)
						}
					})
					
					this.$emit('on-success')
					this.close()
					
				}).error(response=>{
					this.error(response.body.message)
				})
			},
			checkConfilct() {
				let list = util.copy(this.arrangeList)
				list.forEach(d => {
					d.teach_eid = d.eid
				})
				this.$rest('class_schedule_mains').add_url_param('check_conflict')
				.post(list)
				.success(res => {
					let data = res.data
					data.forEach(d => {
						d.is_check = true
					})
					this.arrangeList = data
				})
				.error(res => {
					this.error(res.body.message)
				})
			},
			checkConfilctResult() {
				return new Promise((resolve,reject) => {
					let list = this.orderBy(this.arrangeList,'int_day')
					let index1 = [],index2 = []
					list.forEach((l,i) => {
						if(l.is_check) {
							if(l.is_error) {
								index2.push(i+1)
							}
						}
						else {
							index1.push(i+1)
						}
					})
					if(index1.length) {
						resolve('第'+index1.join(',')+'行未检测冲突，确定直接排课吗?')
					} 
					else {
						if(index2.length) {
							resolve('第'+index2.join(',')+'行有冲突将不生成排课，确定排课吗?')
						} 
					}
					resolve()
				})
			}
		}
	}
</script>
<style lang="less">
	.delay-arrange__left {
		position: relative;
		&:after {
			content: ' ';
			position: absolute;
			width: 1px;
			height: 100%;
			top: 0;
			right: 0;
			background: #dddee1;
			transform: scaleX(0.5);
		}
	}
</style>