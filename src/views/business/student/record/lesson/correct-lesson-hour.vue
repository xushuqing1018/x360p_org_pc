<template>
	<Modal v-drag-modal v-model="modal$.show" :title="modal$.title" width="800">
		<div class="student-lesson">
			<table class="table-list">
				<thead>
					<tr>
						<th></th>
						<th>课程/班级</th>
						<th>剩余课时</th>
						<th>可用科目</th>
						<th>课时状态</th>
            			<th>是否停课</th>
						<th>有效期</th>
						<th></th>
					</tr>
				</thead>
				<tbody>
					<tr>
						<td></td>
						<td colspan="7" style="padding-left: 8px;font-weight: bold;">已有<span style="font-weight: bolder;color:red;"> {{parseFloat(info.use_lesson_hours)}} </span>课时消耗扣除在以下课时记录：</td>
					</tr>
					<tr>
						<td></td>
						<td>
              				<div class="ivu-table-cell">
              					<span v-if="info.lid">
									<tag color="blue">课程</tag>
									{{info.lid|lesson_name}}
								</span>
								<span v-if="info.cid > 0&&info.one_class">
									<tag color="blue">班级</tag>
									{{info.one_class.class_name}}
								</span>
              				</div>
            			</td>
						<td><div class="ivu-table-cell">{{info.remain_lesson_hours}}</div></td>
						<td><div class="ivu-table-cell">{{info.sj_ids|sj_ids_text}}</div></td>
						<td><div class="ivu-table-cell">{{info.lesson_status|lesson_status_text}}</div></td>
						<td><div class="ivu-table-cell">{{info.is_stop|stop_status_text}}</div></td>
            			<td>
							<div class="ivu-table-cell">
                				{{info.expire_time_text}}<span v-if="info.expire_time">: {{info.expire_time}}</span>
							</div>
						</td>
						<td></td>
					</tr>
					<tr>
						<td></td>
						<td colspan="7" style="padding-left: 8px;font-weight: bold;">将其中的 <InputNumber v-model="change_hours" :step="1" :min="1" :max="info.use_lesson_hours" style="width:50px;"></InputNumber> 课时消耗转到其他课时记录上，请选择：</td>
					</tr>
					<tr v-for="(item, index) in filterData" @click="changeSelect(item)" :key="index">
						<td></td>
						<td>
              				<div class="ivu-table-cell">
              					<span v-if="item.lid">
									<tag color="blue">课程</tag>
									{{item.lid|lesson_name}}
								</span>
								<span v-if="item.cid > 0&&item.one_class">
									<tag color="blue">班级</tag>
									{{item.one_class.class_name}}
								</span>
              				</div>
            			</td>
						<td><div class="ivu-table-cell">{{item.remain_lesson_hours}}</div></td>
						<td><div class="ivu-table-cell">{{item.sj_ids|sj_ids_text}}</div></td>
						<td><div class="ivu-table-cell">{{item.lesson_status|lesson_status_text}}</div></td>
						<td><div class="ivu-table-cell">{{item.is_stop|stop_status_text}}</div></td>
            			<td>
							<div class="ivu-table-cell">
                				{{item.expire_time_text}}<span v-if="item.expire_time">: {{item.expire_time}}</span>
							</div>
						</td>
						<td>
							<div class="ivu-table-cell">
								<Radio v-model="item.selected$"></Radio>
							</div>
						</td>
					</tr>
					<tr v-if="data.length==0">
						<td colspan="8"><div class="text-center">没有其他课时记录</div></td>
					</tr>
				</tbody>
			</table>
		</div>
		<div slot="footer">
			<Button type="ghost" @click="close">关闭</Button>
			<Button type="primary" :loading="saving" @click="ok">确定</Button>
		</div>
	</Modal>
</template>
<script>
	import modal from '@/libs/modal.mixin'
	import common from '@/libs/common.mixin'
	import globals from '@/libs/globals.mixin'
	export default {
		mixins: [modal,common,globals],
		props: {
      		info: Object
		},
		data() {
			return {
        		sl_id: 0,
				data: [],
				change_hours: parseFloat(this.info.use_lesson_hours)
			}
    	},
    	computed: {
    	  	filterData () {
    	  	  	let data = this.data,
    	  	    	filterData = []
    	  	  	filterData =  data.filter(l => l.sl_id !== this.info.sl_id)
    	  	  	return filterData
    	  	}
    	},
		methods: {
			changeSelect(item) {
				this.data.forEach(d => {
					this.$set(d,'selected$',false)
				})
				this.$set(item,'selected$',true)
				this.sl_id = item.sl_id
			},
			ok() {
				if(this.filterData.length==0) {
					this.$Message.error('没有其他的课时记录，不能修正')
					return
				}
				if(this.sl_id==0) {
					this.$Message.error('请选择修正到哪个课时记录')
					return
				}

    			this.$rest('student_lessons').add_url_param('change_sl')
				.post({
					sl_id: this.info.sl_id,
					to_sl_id: this.sl_id,
					change_hours : this.change_hours
				})
				.success(res => {
					this.$Message.success('修正成功')
					this.$emit('on-success')
					this.close()
				})
				.error(res => {
					this.error(res.body.message)
				})	
			}
		}
	}
</script>
<style scoped>
	th {
		padding: 12px !important;
	}
</style>