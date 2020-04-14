<template>
	<Row>
		<Col span="24">
			<table class="modal-table">
				<thead>
					<tr>
						<th width="50"><div class="ivu-table-cell">#</div></th>
						<th><div class="ivu-table-cell">日期
							<Badge :count="arrangeList.length"></Badge>
						</div></th>
						<th><div class="ivu-table-cell">时间段</div></th>
						<th><div class="ivu-table-cell">{{label_teacher}}</div></th>
						<th><div class="ivu-table-cell">{{label_secteacher}}</div></th>
						<th><div class="ivu-table-cell">教室</div></th>
						<th><div class="ivu-table-cell">课耗</div></th>
						<th><div class="ivu-table-cell">检测结果</div></th>
						<th width="120">
							<div class="ivu-table-cell">
								操作<Button type="text" size="small" icon="ios-trash" title="清空" @click="clearArrange"></Button>
							</div>
						</th>
					</tr>
				</thead>
				<tbody>
					<tr v-for="(item,index) in arrangeList">
						<td><div class="ivu-table-cell">{{index+1}}</div></td>
						<td>
							<div class="ivu-table-cell">
								<span>{{item.int_day|int_date}}</span>
								<span style="margin-left: 5px;">{{getWeekText(item.week_day)}}</span>
							</div>
						</td>
						<td><div class="ivu-table-cell">{{item.int_start_hour}}~{{item.int_end_hour}}</div></td>
						<td><div class="ivu-table-cell">{{item.eid|ename('-')}}</div></td>
						<td><div class="ivu-table-cell">{{item.second_eids|enames('-')}}</div></td>
						<td><div class="ivu-table-cell">{{item.cr_id|classroom_name('-')}}</div></td>
						<td>
							<div class="ivu-table-cell">
								{{item.consume_source_type?item.consume_lesson_hour:item.consume_lesson_amount}}
							</div>
						</td>
						<td>
							<div class="ivu-table-cell">
								<template v-if="item.is_check">
									<template v-if="item.is_error">
										<Tooltip transfer>
											<div slot="content">
												<p v-for="text in item.error_message">{{text}}</p>
											</div>
											<p v-for="field in item.error_fields" class="text-danger">{{map_field_text[field]}}冲突</p>
										</Tooltip>
									</template>
									<p class="text-success" v-else>检测通过</p>
								</template>
								<span v-else>待检测</span>
							</div>
						</td>
						<td>
							<div class="ivu-table-cell">
								<Button type="text" size="small" icon="edit" title="编辑" @click="editItem(item,index)"></Button>
								<Button type="text" size="small" icon="ios-copy" title="复制" @click="copyItem(item,index)"></Button>
								<Button type="text" size="small" icon="ios-trash" title="删除" @click="delItem(index)"></Button>
							</div>
						</td>
					</tr>
					<tr v-if="arrangeList.length==0">
						<td colspan="9" class="text-center">请在右边选择日期</td>
					</tr>
				</tbody>
			</table>
		</Col>
	</Row>
</template>
<script>
	import util from '@/libs/util'
	import common from '@/libs/common.mixin'
	import globals from '@/libs/globals.mixin'

	const emptyError = {
		error_fields: [],
		error_message: [],
		is_error: false,
		is_check: false
	}

	export default {
		mixins: [common,globals],
		props: {
			arrangeList: {
				type: Array,
				default:() => {
					return []
				}
			}
		},
		data() {
			return {
				map_field_text: {
					'teach_eid': this.$filter('translate')('老师'),
					'second_eid': this.$filter('translate')('助教'),
					'cr_id': '教室',
					'cid': '授课对象',
					'int_hour': '上课时段',
					'sids': '学员',
					'holiday':'节假日'
				}
			}
		},
		methods: {
			editItem(item,index) {
				this.$Modal.open('business/arrange/calendar/info-arrange.vue@modal',{
					props: {
						item: util.copy(item)
					},
					on: {
						'on-ok':(data) => {
							this.arrangeList.splice(index,1,data)
						}
					}
				})
				.then(modal => {
					modal.show('编辑')
				})
			},
			copyItem(item,index) {
				this.arrangeList.splice(index+1,0,Object.assign({},item,emptyError))
			},
			delItem(index) {
				this.arrangeList.splice(index,1)
			},
			clearArrange() {
				this.arrangeList.splice(0)
			},
			getWeekText(d) {
				let map = ['日','一','二','三','四','五','六']
				return '周'+map[d]
			}
		}
	}
</script>