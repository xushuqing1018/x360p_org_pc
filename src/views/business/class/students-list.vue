<template>
	<div>
		<div class="row condition-filter">
			<div class="col-sm-9">
	    		<ButtonGroup>
					<Button type="primary" icon="plus" style="margin-left:5px;" @click="assignStudent">分班</Button>
					<Button type="primary" icon="refresh" @click="refreshData" :loading="loading" title="数据未更新？刷新试试~"></Button>
    			</ButtonGroup>
	    		<Button class="ml-2" type="ghost" icon="ios-loop" :disabled="!cs_ids.length" @click.native="resetInTime()">重置入班日期</Button>

				<export-button res="class_students" :params="export_params"></export-button>	    		
	    	</div>
	    	<div class="col-sm-3">
	    		<Input class="pull-right" v-model="student_name" icon="search" placeholder="输入学员姓名过滤"></Input>	    		
	    	</div>
	    </div>
		<div class="table-list-wrap" style="max-height: 600px;">
			<table class="modal-table class-list" v-if="setWidth">
				<thead>
					<th width="50px"><div class="ivu-table-cell">#</div></th>
					<th width="60px">
						<div class="ivu-table-cell">
							<Checkbox v-model="check_all" @on-change="checkAll"></Checkbox>
						</div>
					</th>
					<th width="160px"><div class="ivu-table-cell">
						姓名<Badge :count="data.length"></Badge>
					</div></th>
					<th width="140px"><div class="ivu-table-cell">电话</div></th>
					<th width="100px"><div class="ivu-table-cell">状态</div></th>
					<th width="100px"><div class="ivu-table-cell">剩余课时</div></th>
					<th width="120px"><div class="ivu-table-cell">入班日期</div></th>
					<th width="110px" v-per="permission"><div class="ivu-table-cell">操作</div></th>				
				</thead>
			</table>
			<table class="modal-table class-list" :style="tableStyle">
				<thead v-if="!setWidth">
					<th><div class="ivu-table-cell">#</div></th>
					<th>
						<div class="ivu-table-cell">
							<Checkbox v-model="check_all" @on-change="checkAll"></Checkbox>
						</div>
					</th>
					<th><div class="ivu-table-cell">
						姓名<Badge :count="data.length"></Badge>
					</div></th>
					<th><div class="ivu-table-cell">电话</div></th>
					<th><div class="ivu-table-cell">状态</div></th>
					<th><div class="ivu-table-cell">剩余课时</div></th>
					<th><div class="ivu-table-cell">入班日期</div></th>
					<th v-per="permission"><div class="ivu-table-cell">操作</div></th>				
				</thead>
				<tbody>
					<tr v-for="(item,key) in filterClassStudents">
						<td :width="setWidth?'50px':''">
							<div class="ivu-table-cell">
								{{key+1}}
							</div>
						</td>
						<td :width="setWidth?'60px':''">
							<div class="ivu-table-cell">
								<Checkbox :value="cs_ids.indexOf(item.cs_id)>-1" @click.native="toggleCheck(item.cs_id)"></Checkbox>
							</div>
						</td>
						<td :width="setWidth?'180px':''">
							<div class="ivu-table-cell">
								<avatar-and-name 
									style="display: inline-block"
									:src="item.student.photo_url" 
									:name="item.student.student_name" 
									:nickname="item.student.nick_name"
									:sex="item.student.sex"
									:detail-action="2"
									:sid="item.student.sid">						
								</avatar-and-name>
							</div>
						</td>
						<td :width="setWidth?'140px':''"><div class="ivu-table-cell">{{item.student.first_tel}}</div></td>
						<td :width="setWidth?'100px':''">
							<div class="ivu-table-cell">
								<Tag :color="getStudentStatus(item).color" type="border">{{getStudentStatus(item).text}}</Tag>
							</div>
						</td>
						<td :width="setWidth?'100px':''"><div class="ivu-table-cell">{{getRemainHour(item)}}</div></td>
						<td :width="setWidth?'120px':''"><div class="ivu-table-cell">{{item.in_time|date}}</div></td>
						<td :width="setWidth?'110px':''" v-per="permission">
							<div class="ivu-table-cell">
								<Dropdown trigger="click" :transfer="transfer">
							        <Button type="ghost" icon="gear-a" size="small"> 操作</Button>
							        <DropdownMenu slot="list">
							            <DropdownItem @click.native="deleteAssignStudent(item)"><Icon type="log-out"></Icon> 退班</DropdownItem>
							            <DropdownItem v-if="item.student.status!=1" @click.native="resetStutas(item)"><Icon type="ios-loop"></Icon> 恢复正常状态</DropdownItem>
							            <DropdownItem @click.native="resetInTime(item)"><Icon type="ios-loop"></Icon> 重置入班日期</DropdownItem>
							        </DropdownMenu>
							    </Dropdown>
						    </div>
						</td>
					</tr>
					<tr v-if="filterClassStudents.length == 0">
						<td style="width:848px" v-if="setWidth">
							<div class="text-center ivu-table-cell">{{data.length>0?'暂无符合条件学员~':'暂无学员~'}}</div>
						</td>
						<td colspan="8" v-else>
							<div class="text-center ivu-table-cell">{{data.length>0?'暂无符合条件学员~':'暂无学员~'}}</div>
						</td>
					</tr>
				</tbody>
			</table>
		</div>
		
		<Modal v-drag-modal v-model="modal$.show" :title="modal$.title" width="400" :mask-closable="false">
			<Form :label-width="80">
				<Form-item label="入班日期">
					<DatePicker 
						type="date" 
						:value="currentItem.in_time" 
						@on-change="currentItem.in_time=$event" 
						format="yyyy-MM-dd" 
						placeholder="请选择入班日期">
					</DatePicker>
				</Form-item>
			</Form>
			
			<div slot="footer">				
				<Button type="ghost" @click="close">关闭</Button>
				<Button type="primary" @click="ok">确定</Button>
			</div>
		</Modal>
	</div>
</template>
<script>
import {oneOf} from '@/libs/util'
import util from '@/libs/util'
import moment from 'moment'
import modal from '@/libs/modal.mixin'
import common from '@/libs/common.mixin'
import globals from '@/libs/globals.mixin'
import dataReady from 'c%/DataReady.vue'
import ExportButton from 'c%/ExportButton.vue'

export default {
	name:'classStudentsList',
	mixins:[common,modal,globals],
	components:{
		dataReady,
		ExportButton
	},
	props:{
		setWidth: {
			type: Boolean,
			default: true
		},
		classInfo:{
			type:Object,
			default(){
				return {
					cid:0
				}
			}
		},
		filter: {
			type: Boolean,
			default: ()=>{
				return true
			}
		},
		transfer: {
			type: Boolean,
			default: true
		},
		listObj: {
			type: Object,
			default: () => {
				return {}
			}
		}
	},
	watch: {
		'modal$.show': function (val) {
			if(!val){
				this.in_time = ''
			}
		}
	},
	data(){
		return {
			permission:'class.students',
			student_name:'',
			loading: false,
			data:[],
			cs_ids: [],
			isMultiOperate: false,
			check_all: false,
			currentItem: {
				cs_id: 0,
				in_time: ''
			},
			fromCloseClassInfo: null,
			model: [],
			export_params:{
				cid:0,
				status:1
			}
		}
	},
	mounted() {
		this.getStudentData()
		this.init_export_params()
	},
	methods:{
		init_export_params(){
			this.export_params.cid = this.classInfo.cid
		},
		fromCloseClass() {
			this.$Modal.open('components/SelectClassModal.vue@modal',{
				props:{
					multiple:false,
					width:'750',
					url: 'classes?status=2',
					title: '选择结课班级'
				},
				on:{
					'on-select':(row)=>{
						this.fromCloseClassInfo = row;
						this.selectCloseClassStudents();
					}
				}
			}).then(modal=>{
				modal.show()
			})
		},
		selectCloseClassStudents() {
			var vm = this;
			this.$Modal.open('components/SelectClassStudentModal.vue@modal',{
				props:{
					multiple:true,
					width:'900',
					title:'选择已结课班级学员【'+vm.fromCloseClassInfo.class_name+'】',
					cid: vm.fromCloseClassInfo.cid
				},
				on:{
					'on-select':(list)=>{
						this.updateSelected(list);
						var sids = [];
						list.forEach((item,index) => {
							sids.push(item.sid);
						})
						this.assignCloseClassStudent(sids);
					}
				}
			}).then(modal=>{
				modal.show()
			})
		},
		updateSelected(selected){
			if(this.model.length > 0){
				this.model.splice(0,this.model.length)
			}
			selected.forEach(item=>{
				this.model.push(item['sid'])
			})
			this.updateLabelText()
		},
		updateLabelText(){
			if(this.model.length > 0 && this.model[0] > 0){
				this.$store.dispatch('getMapText',{
					id:this.model[0],
					name:'student',
					idf:'sid',
					txf:'student_name'
				}).then(text=>{
					let txt = text
					if(this.model.length > 1){
						txt += '等'+this.model.length+'个学员'
					}
				})
			}
		},
		assignCloseClassStudent(sids) {
			this.$Modal.open('business/class/assign-student.vue@modal',{
				props: {
					'class-info': this.classInfo,
					max: this.max
				},
				on: {
					'on-success': () => {
						this.refreshData()
					}
				}
			})
			.then(modal=>{
				modal
				.set('info',{
					sids: sids,
					cu_ids: [],
					in_time: moment().format('YYYY-MM-DD')
				})
				.show('选择分班学员','add')
			})
		},
		toggleCheck (cs_id) {
			let index = this.cs_ids.indexOf(cs_id)
			if(index > -1){
				this.cs_ids.splice(index,1)
			}else{
				this.cs_ids.push(cs_id)
			}
			this.check_all = (this.data.length==this.cs_ids.length)
		},
		checkAll (val) {
			this.cs_ids = []
			if(val){
				this.data.forEach(d=>{
					this.cs_ids.push(d.cs_id)
				})
			}
		},
		ok () {
			let params = {
				in_time: this.currentItem.in_time
			}
			
			if(params.in_time==''){
				this.$Message.error('请选择入班日期')
				return false
			}
			if(this.isMultiOperate){
				this.multiResetTime()
			}
			else{
				this.$rest('class_students/'+this.currentItem.cs_id)
				.put(params)
				.success(data=>{
					this.$Message.success('重置成功！')
					this.close()
					this.refreshData()
					this.currentItem = {
						cs_id: 0,
						in_time: ''
					}
				}).error(response=>{
					this.error(response.body.message||'重置失败！')
				})			
			}
		},
		multiResetTime () {
			let params = []

			if(this.cs_ids.length==0){
				this.$Message.error('请先选择学员！')
				return
			}
			this.cs_ids.forEach(c=>{
				let obj = {
					cs_id: c,
					in_time: this.currentItem.in_time
				}
				params.push(obj)
			})

			this.$rest('class_students/update_list')
			.post(params)
			.success(data=>{
				this.$Message.success('重置成功！')
				this.close()
				this.refreshData()
				this.currentItem = {
					cs_id: 0,
					in_time: ''
				}
			}).error(response=>{
				this.$Message.error(response.body.message||'重置失败！')
			})
		},
		getStudentStatus (row) {
			return this.ss_map[row.student.status]
		},
		assignStudent () {
			this.$emit('assignStudent',this.max)
		},
		dataReady(rs){
			if(rs[0] != ''){
				this.data = rs[0].list
			}
		},
		refresh (rs) {
			this.data = rs.response.list
		},
		getStudentData() {
			this.loading = true
			this.$http.get(this.classStudentsUrl,{
				params: {
					pagesize: 100
				}
			})
			.then(function(res) {
				this.data = res.body.data.list;
				this.loading = false
			})
		},
		refreshData () {
			this.getStudentData();
			// this.loading = true
			// this.dr().refreshData(this.classStudentsUrl)
			// .then(response=>{
			// 	this.data = response.list
			// 	this.$Message.success('刷新成功！')
			// 	setTimeout(()=>{
			// 		this.loading = false
			// 	},300)
			// },response=>{
			// 	this.$Notice.error({
			// 		title: '失败',
			// 		desc: response.body.message||'获取数据失败'
			// 	})
			// })			
		},
		resetInTime (item) {
			let title = '重置入班日期'
			this.isMultiOperate = true
			if(item){
				title = util.sprintf('重置【%s】入班日期',item.student.student_name)				
				this.currentItem = util.copy(item)
				this.isMultiOperate = false
			}
			this.show(title,'add')
		},
		resetStutas (item) {
			let title = util.sprintf('恢复学员【%s】为正常状态',item.student.student_name)
			this.$Modal.confirm({
				content: title,
				onOk: () => {
					this.resetStutasAction(item);
				}
			})
		},
		resetStutasAction(item) {
			let params = {
				status: 1
			}
			
			this.$rest('class_students/'+item.cs_id)
			.put(params)
			.success(data=>{
				this.$Message.success('重置成功！')
				this.close()
				this.refreshData()
			}).error(response=>{
				this.error(response.body.message||'重置失败！')
			})
		},
		//退班操作
		deleteAssignStudent(cs){
			let tip = util.sprintf('您确认对【%s】进行退班操作吗？',cs.student.student_name)
			
			this.confirm(tip)
			.then(() => {
				this.$rest('classes').add_url_param(this.classInfo.cid,'students')
				.delete(cs.sid)
				.success(response=>{
					this.$emit('on-student-delete-success')
					this.listObj.init_data()
					this.$Message.success('退班成功')
				})
				.error(response=>{
					this.$Notice.error({
						title:'退班操作失败',
						desc:response.body.message
					})
				})
			})
		},
		//search
		search(key){
			this.student_name = key
		},
		getRemainHour(item) {
			let result = 0
			if(item.student_lesson){
				result = item.student_lesson.remain_lesson_hours
			}
			return result
		}
	},
	computed:{
		tableStyle () {
			let style = {overflowY: 'auto'}
			
			if(this.setWidth){
				style.display = 'block'
				style.height = '400px'
			}
			
			return style
		},
		disabledOptions () {
			//学员入班日期必须大于开课日期小于当前日期
			let start_lesson_time = new Date(this.classInfo.start_lesson_time).getTime()			
            return { 
            	disabledDate (date) {
                	return date && date.valueOf() > Date.now() || date.valueOf() < start_lesson_time - 86400000
            	}
        	}
        },
		max () {
			let num = 0
			if(this.classInfo){
				num = this.classInfo.plan_student_nums - this.classInfo.student_nums
			}
			return num
		},
		filterClassStudents(){
			let key = this.student_name
			if(!/^\s*$/.test(key)){
				return this.data.filter(s=>{
					if(s.student.pinyin_abbr.indexOf(key) !== -1 || s.student.pinyin.indexOf(key) !== -1 || s.student.student_name.indexOf(key) !== -1){
						return true
					}
					return false
				})
			}
			return this.data
		},
		classStudentsUrl(){
			if(this.classInfo.cid == 0){
				return ''
			}
			return 'classes/'+ this.classInfo.cid + '/students?with=student_lesson'
		}
	}
}
</script>