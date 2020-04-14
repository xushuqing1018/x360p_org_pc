<template>
	<Modal v-model="modal$.show" title="排课计划" :width="800" v-drag-modal>
		<div v-if="modal$.show" style="max-height: 500px;overflow-y: auto;">
			<table class="modal-table">
				<thead>
					<th width="60px"><div class="ivu-table-cell">#</div></th>
					<th width="180px"><div class="ivu-table-cell">日期</div></th>
					<th width="80px"><div class="ivu-table-cell">周数</div></th>
					<th><div class="ivu-table-cell">排课要素</div></th>
					<th><div></div></th>
				</thead>
				<tr v-for="(item,index) in list" :key="index">
					<td>
						<div class="ivu-table-cell">{{index+1}}</div>
					</td>
					<td>
						<div class="ivu-table-cell">
							<tag color="green">{{map_week_day[item.week_day]}}</tag>
							{{item.int_day}}
						</div>
					</td>
					<td>
						<div class="ivu-table-cell">{{getWeekNo(item.int_day)}}</div>
					</td>
					<td>
						<div class="ivu-table-cell">
							<p :class="getFieldClass('int_hour',item)">
								时段：{{item.int_start_hour}} ~ {{item.int_end_hour}}
							</p>
							<p :class="getFieldClass('teach_eid',item)">
								{{'老师'|translate}}：{{item.teach_eid,'-'|ename}}
							</p>
							<p :class="getFieldClass('second_eid',item)">
								{{'助教'|translate}}：{{item.second_eids,'-'|enames}}
							</p>
							<p :class="getFieldClass('cr_id',item)">
								教室：{{item.cr_id,'-'|classroom_name}}
							</p>
							<p v-if="item.consume_source_type==1">
								扣课时数：{{item.consume_lesson_hour}}
							</p>
							<p v-else>
								扣余额：{{item.consume_lesson_amount}} （元）
							</p>
						</div>
					</td>			
					<td>
						<div class="ivu-table-cell x-flex-cell">
							<div v-if="loopCheck && item._loading">
								<Spin fix>
									<Icon type="load-c" size=18 class="spin-icon-load"></Icon>
									<div>冲突检测中...</div>
								</Spin>
							</div>
							<!-- 检测失败 -->
							
							<Tooltip transfer v-if="item._fail">
								<div slot="content">
									<p v-for="text in item.error_message">{{text}}</p>
								</div>
								<p v-for="field in item._error_fields" class="text-danger">【{{map_field_text[field]}}】冲突</p>
							</Tooltip>
							
							<!-- 排课成功 -->
							<p class="text-success" v-if="item._success">无冲突 <Icon type="checkmark-circled"></Icon></p>
						</div>
					</td>
				</tr>
			</table>
		</div>
		<div slot="footer">
			<span class="pull-left text-info" v-if="loopCheck">*冲突的排课将会跳过，不生成排课</span>
			<Button type="ghost" @click="close" :loading="saving">关闭</Button>
			<Button type="primary" @click="submit" :loading="saving" :disabled="disabledOK" v-if="loopCheck">确定排课</Button>
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
				default: false
			}
		},
		data () {
			return {
				map_week_day: {1:'星期一',2:'星期二',3:'星期三',4:'星期四',5:'星期五',6:'星期六',7:'星期天'},
			}
		},
		computed: {
			map_field_text () {
				return {
						'teach_eid': this.$filter('translate')('老师'),
						'second_eid': this.$filter('translate')('助教'),
						'cr_id': '教室',
						'cid': '授课对象',
						'int_hour': '上课时段',
						'sid': '学员'
						}
			},
			disabledOK () {
				let list = this.list,
					filter1 = (item) => {
						return item._loading == false
					},
					filter2 = (item) => {
						return item._success == true
					}
									
				return list.length != list.filter(filter1).length || list.filter(filter2).length == 0
			},
		},
		methods: {
			getWeekNo (day) {
				return util.get_date_week_no(util.new_date(day))
			},
			getFieldClass (field,item) {
				if(
					item._error_fields
					&& item._error_fields.length > 0 
					&& item._error_fields.indexOf(field) > -1
				){
					return 'text-danger'
				}
				return ''
			},
			submit () {
				let list = this.list.filter(l=>l._success)
				
				if(list && list.length > 0) {
					
					this.$rest('course_arranges/law_course_arranges')
					.post(list)
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
						this.error(response.body.message||'排课失败~')
					})
				}
			}
		}
	}
</script>

<style lang="less">
	.x-flex-cell{
		position: relative;
		min-height: 50px;
		width: 140px;
		display: flex;
		justify-content: center;
		align-items: center;
		flex-direction: column;
	}
	.ivu-tooltip-inner {
		max-width: none;
	}
	.spin-icon-load{		
		animation: ani-demo-spin 1s linear infinite;		
	}
	
	@keyframes ani-demo-spin {
		from { transform: rotate(0deg);}
		50%  { transform: rotate(180deg);}
		to   { transform: rotate(360deg);}
	}
</style>