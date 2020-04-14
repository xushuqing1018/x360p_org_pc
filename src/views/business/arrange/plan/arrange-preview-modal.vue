<template>
	<Modal v-drag-modal v-model="modal$.show" :title="modal$.title" :width="800">
		<div v-if="modal$.show" class="modal-wrap">
			<Alert show-icon>先检测冲突再确定排课，冲突的排课将会跳过，不生成排课</Alert>
			<table class="table-list">
				<thead>
					<th width="60px"><div class="ivu-table-cell">#</div></th>
					<th width="160px"><div class="ivu-table-cell">日期</div></th>
					<th><div class="ivu-table-cell">上课时段</div></th>
					<th><div class="ivu-table-cell">{{label_teacher}}/{{label_secteacher}}</div></th>
					<th><div class="ivu-table-cell">教室</div></th>
					<th><div class="ivu-table-cell">课消</div></th>
					<th width="100px"><div class="ivu-table-cell">冲突</div></th>
				</thead>
				<tr v-for="(item,index) in data" :key="index">
					<td>
						<div class="ivu-table-cell">{{index+1}}</div>
					</td>
					<td>
						<div class="ivu-table-cell">
							<tag color="green">{{map_week_day[item.week_day]}}</tag>
							{{item.int_day|int_date}}
						</div>
					</td>
					<td>
						<div class="ivu-table-cell">
							<p :class="getFieldClass('int_hour',item)">
								{{item.int_start_hour}}~{{item.int_end_hour}}
							</p>
						</div>
					</td>
					<td>
						<div class="ivu-table-cell">
							<p :class="getFieldClass('teach_eid',item)">
								{{item.eid,'-'|ename}}/{{item.second_eids,'-'|enames('-')}}
							</p>
						</div>
					</td>
					<td>
						<div class="ivu-table-cell">
							<p :class="getFieldClass('cr_id',item)">
								{{item.cr_id,'-'|classroom_name}}
							</p>
						</div>
					</td>
					<td>
						<div class="ivu-table-cell">
							<p v-if="item.consume_source_type==1">
								{{item.consume_lesson_hour}}
							</p>
							<p v-else>
								{{item.consume_lesson_amount}}元
							</p>
						</div>
					</td>
					<td>
						<div class="ivu-table-cell" v-if="item.is_error!==undefined">
							<template v-if="item.is_error">
								<Tooltip transfer>
									<div slot="content">
										<p class="text-danger" v-for="text in item.error_message">{{text}}</p>
									</div>
									<p v-for="field in item.error_fields" class="text-danger">{{map_field_text[field]}}冲突</p>
								</Tooltip>
							</template>
							<p class="text-success" v-else>无冲突</p>
						</div>
					</td>
				</tr>
			</table>
			<Spin fix v-if="checking">
				<Icon type="load-c" size=18 class="demo-spin-icon-load"></Icon>
				<p>检测中...</p>
			</Spin>
		</div>
		<div slot="footer">
			<div class="pull-left" style="line-height: 40px;">
				<Checkbox v-model="ignore.ignore_class_cc" :true-value="1" :false-value="0">忽略教室冲突</Checkbox>
				<Checkbox v-model="ignore.ignore_class_ec" :true-value="1" :false-value="0">忽略老师冲突</Checkbox>
				<Checkbox v-model="ignore.ignore_student_cc" :true-value="1" :false-value="0">忽略学员冲突</Checkbox>
			</div>
			<Button type="ghost" @click="close" :loading="saving">关闭</Button>
			<Button type="primary" @click="checkConflict" :loading="saving">检测冲突</Button>
			<Button type="primary" @click="confirmArrange" :loading="saving" :disabled="filter_data.length==0">确定排课</Button>
		</div>
	</Modal>
</template>

<script>
	import moment from 'moment' 
	import util,{_} from '@/libs/util'
	import modal from '@/libs/modal.mixin'
	import common from '@/libs/common.mixin'
	import globals from '@/libs/globals.mixin'	
	
	export default{
		mixins: [ globals, common, modal ],
		props: {			
			list: {
				type: Array,
				default: ()=>{
					return []
				}
			},
			loopCheck: {
				type: Boolean,
				default: true
			}
		},
		data () {
			return {
				ignore: {
					ignore_class_cc:0,
					ignore_class_ec:0,
					ignore_student_cc:0
				},
				data: util.copy(this.list),
				checking: false,
				map_week_day: {1:'周一',2:'周二',3:'周三',4:'周四',5:'周五',6:'周六',7:'周日'},
			}
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
			},
			map_field_text () {
				return {
						'teach_eid': this.$filter('translate')('老师'),
						'second_eid': this.$filter('translate')('助教'),
						'cr_id': '教室',
						'cid': '授课对象',
						'int_hour': '上课时段',
						'sid': '学员',
						'holiday':'节假日'
						}
			},
			filter_data () {
				return this.data.filter(d => d.is_error==false)
			}
		},
		watch: {
			list(l) {
				this.data = util.copy(l)
			}
		},
		mounted() {
			this.ignore.ignore_class_ec = this.ignore_class_ec
			this.ignore.ignore_class_cc = this.ignore_class_cc
			this.ignore.ignore_student_cc = this.ignore_student_cc
		},
		methods: {
			getWeekNo (day) {
				return util.get_date_week_no(new Date(this.$filter('int_date')(day)))
			},
			getFieldClass (field,item) {
				if(
					item.error_fields
					&& item.error_fields.length > 0 
					&& item.error_fields.indexOf(field) > -1
				){
					return 'text-danger'
				}
				return ''
			},
			checkConflict() {
				this.data.forEach(d => {
					this.$set(d,'ignore_class_cc',this.ignore.ignore_class_cc)
					this.$set(d,'ignore_class_ec',this.ignore.ignore_class_ec)
					this.$set(d,'ignore_student_cc',this.ignore.ignore_student_cc)
					this.$set(d,'teach_eid',d.eid)
				})
				this.checking = true
				this.$rest('class_schedule_mains').add_url_param('check_conflict')
				.post(this.data)
				.success(res => {
					this.checking = false
					this.data = res.data
				})
				.error(res => {
					this.checking = false
					this.error(res.body.message)
				})
			},
			confirmArrange () {
				this.$rest('course_arranges/law_course_arranges')
				.post(this.filter_data)
				.success(response=>{
					let data = response.data,
						notice_type = 'success'							
					
					this.$Notice[notice_type]({
						title: '排课结果',
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
			}
		}
	}
</script>

<style lang="less" scoped>
	.modal-wrap {
		position: relative;
		max-height: 650px;
		overflow-y: auto;
	}
</style>