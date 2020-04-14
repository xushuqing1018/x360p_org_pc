<template>
  <Modal
    v-drag-modal
    v-model="modal$.show"
    :title="modal$.title"
    width="500"
    :mask-closable="false"
    @on-cancel="close"
  >
    <Form :label-width="100">
      <Form-item label="学员" class="ivu-form-item-required">
        <select-student v-model="info.sid" clearable style="width:200px" @on-clear-all="clearSid"></select-student>
      </Form-item>
      <Form-item label="学员课时" v-if="info.sid>0" class="ivu-form-item-required">
        <div
          class="list-body-wrap mt-3"
          v-loading.like="'student_lesssons'"
          style="max-height:300px;overflow: auto;"
        >
          <table class="x-modal-table modal-table">
            <thead>
              <th>
                <div class="ivu-table-cell"></div>
              </th>
              <th>
                <div class="ivu-table-cell">课程</div>
              </th>
              <th>
                <div class="ivu-table-cell">可用科目</div>
              </th>
              <th>
                <div class="ivu-table-cell">课时状态</div>
              </th>
              <th>
                <div class="ivu-table-cell">是否停课</div>
              </th>
            </thead>
            <tr
              v-for="(item,index) in data"
              :key="index"
              :class="{'table-info':sl_ids.indexOf(item.sl_id)>-1}"
              @click="toggleSelected(item)"
            >
              <td>
                <div class="ivu-table-cell">
                  <Checkbox
                    readonly
                    :value="sl_ids.indexOf(item.sl_id)>-1"
                    @click="toggleSelected(item)"
                  ></Checkbox>
                </div>
              </td>
              <td>
                <div class="ivu-table-cell">{{item.lid|lesson_name}}</div>
              </td>
              <td>
                <div class="ivu-table-cell">{{item.sj_ids|sj_ids_text}}</div>
              </td>
              <td>
                <div class="ivu-table-cell">{{item.lesson_status|lesson_status_text}}</div>
              </td>
              <td>
                <div class="ivu-table-cell">{{item.is_stop|stop_status_text}}</div>
              </td>
            </tr>
            <tr v-if="!data||data.length===0">
              <td colspan="5">
                <div class="ivu-table-cell text-center">{{emptyText}}</div>
              </td>
            </tr>
          </table>
        </div>
      </Form-item>
      <Form-item label="学员班级" v-if="info.sid>0">
        <div
          class="list-body-wrap mt-3"
          v-loading.like="'classes'"
          style="max-height:300px;overflow: auto;"
        >
          <table class="x-modal-table modal-table">
            <thead>
              <th>
                <div class="ivu-table-cell"></div>
              </th>
              <th>
                <div class="ivu-table-cell">班级名称</div>
              </th>
              <th>
                <div class="ivu-table-cell">出入班时间</div>
              </th>
              <th>
                <div class="ivu-table-cell">操作类型</div>
              </th>
              <th>
                <div class="ivu-table-cell">经办人</div>
              </th>
            </thead>
            <tr
              v-for="(item, index) in classList"
              :key="index"
              :class="{'table-info':cids.indexOf(item.cid)>-1}"
              @click="classToggleSelected(item)"
            >
              <td>
                <div class="ivu-table-cell">
                  <Checkbox
                    readonly
                    :value="cids.indexOf(item.cid)>-1"
                    @click="classToggleSelected(item)"
                  ></Checkbox>
                </div>
              </td>
              <td>
                <div class="ivu-table-cell">{{item.class_name}}</div>
              </td>
              <td>
                <div class="ivu-table-cell">{{item.op_time}}</div>
              </td>
              <td>
                <div class="ivu-table-cell">{{map_event_type[item.op_type]}}</div>
              </td>
              <td>
                <div class="ivu-table-cell">{{item.create_uid}}</div>
              </td>
            </tr>
            <tr v-if="!classList || classList.length === 0">
              <td colspan="5">
                <div class="ivu-table-cell text-center">{{emptyText}}</div>
              </td>
            </tr>
          </table>
        </div>
      </Form-item>
      <Form-item prop="int_day" label="请假日期" class="ivu-form-item-required">
        <Date-picker
          type="date"
          :show-week-numbers="true"
          :value="format_day(info.int_day)"
          @on-change="info.int_day = $event"
          format="yyyy-MM-dd"
          placeholder="选择日期"
          :show-week-label="true"
        ></Date-picker>
      </Form-item>
      <Form-item label="时间段" class="ivu-form-item-required">
        <TimePicker
          v-model="info.int_start_hour"
          :steps="[1, 15]"
          format="HH:mm"
          placeholder="开始"
          size="small"
          style="width: 70px"
        ></TimePicker>~
        <TimePicker
          v-model="info.int_end_hour"
          :steps="[1, 15]"
          format="HH:mm"
          placeholder="结束"
          size="small"
          style="width: 70px"
        ></TimePicker>
      </Form-item>
      <Form-item label="请假原因" class="ivu-form-item-required">
        <Select v-model="info.leave_type" style="width:200px;">
          <Option :value="-1">请选择</Option>
          <Option
            v-for="(item, index) in dicts('leave_reason')"
            :value="item.did"
            :key="index"
          >{{item.title}}</Option>
        </Select>
      </Form-item>
      <Form-item label="备注" class="ivu-form-item-required">
        <Input type="textarea" v-model="info.reason" :row="3" placeholder="请输入请假备注..."></Input>
      </Form-item>
    </Form>
    <div slot="footer">
      <Button type="ghost" @click="close">取消</Button>
      <Button type="primary" @click="ok">确定</Button>
    </div>
  </Modal>
</template>

<script>
	import Vue from 'vue'
	import moment from 'moment'
	import {_} from '@/libs/util'
	import util from '@/libs/util'
	import grid from '@/libs/grid.mixin'
	import common from '@/libs/common.mixin'
	import globals from '@/libs/globals.mixin'
	import modal from '@/libs/modal.mixin'
	import selectStudent from 'c%/SelectStudent.vue'
  import dateRangePicker from 'c%/DateRangePicker.vue'
  import SelectTimeSection from 'c%/SelectTimeSection.vue'

  const emptyObject = {
		sid: 0,
		sl_id: 0,
    reason: '',
		leave_type: 2,
		cid: 0,
		int_day: '',
		int_start_hour: '',
		int_end_hour: ''
  }
  
	export default{
		mixins: [common, globals, grid, modal],
		components: {
			selectStudent,
      dateRangePicker,
      SelectTimeSection
		},
		data () {
			return {
				pk: 'lid',
				map_event_type: {1:'入班',2:'出班'},
				sl_ids: [],
				cids: [],
				classList: [],
        int_day: util.week_range(),
        info: util.copy(emptyObject)
			}
		},
		watch: {
			'info.sid': function (val) {
				if(val) {
					this.sl_ids = []
					this.rest_api = 'student_lessons/?sid='+val+''
					this.init_data()
					this.init_classes(val)
				}
			}		
		},
		methods: {
			init_classes (id) {
				let uri = `class_students/assign_class_logs`
				this.$rest(uri)
				.get({
					sid: id
				})
				.success(res => {
					this.classList = res.list
				})
				.error(res => {
					this.$Message.error(response.body.message||'获取数据失败！')
				})
			},
			ok () {
				this.info.sl_id = this.sl_ids[0]
				if(this.cids.length !== 0){
					this.info.cid = this.cids[0]
				}

				if(!this.info.sid){
					this.$Message.error('请先选择学员')
					return false
				}
				if(!this.info.sl_id){
					this.$Message.error('请先选择课时')
					return false
				}
				if(this.info.int_day === ''){
					this.$Message.error('请先选择请假日期')
					return false
				}
				if(this.info.int_day === ''){
					this.$Message.error('请先选择请假日期')
					return false
				}
				if(this.info.int_start_hour === '' && this.info.int_end_hour === ''){
					this.$Message.error('请先选择请假时间段')
					return false
				}

				let uri = `student_leaves/patch_leave`
				this.$rest(uri).post(this.info)
				.success(res => {
					this.$Message.success('添加成功！')
					this.$emit("on-success")
					this.close()
				})
				.error(res => {
					this.$Message.error(response.body.message||'添加失败！')
				})
      },
			clearSid() {
				this.info.sid = 0
			},    
			toggleSelected (item) {
				let index = this.sl_ids.indexOf(item.sl_id)
				if(index>-1){
					this.sl_ids.splice(index,1)
				}else{
					this.sl_ids = []
					this.sl_ids.push(item.sl_id)
				}
			},
			classToggleSelected (item) {
				let index = this.cids.indexOf(item.cid)
				if(index>-1){
					this.cids.splice(index,1)
				}else{
					this.cids = []
					this.cids.push(item.cid)
				}
			},
			getCourseArrange () {
				if(this.sid || this.info.sid) {
					this.init_data()
				}else{
					this.$Message.error('请先选择学员')
				}
			},
			hook_get_param (params) {				
				Vue.delete(params,'pagesize')
				Vue.delete(params,'page')
			},
		},
		computed: {
			emptyText() {
				return this.info.sid==0 ? '请先选择学员':'暂无课时记录'
			}
		}
	}
</script>

<style>
</style>