<style>
	.max-height300{
		max-height:300px;
		overflow: auto;
	}
</style>

<template>
	<div class="c-grid" style="min-height: 400px;">
		<div class="box box-query" v-if="filter">
			<Form ref="ref_search" :label-width="70" :model="info" class="filter-form row">
				<Form-item label="学员" prop="sid" class="col-md-3 col-sm-6">
					<select-student v-model="info.sid" clearable></select-student>
				</Form-item>
				<Form-item label="上课日期" prop="int_day" class="col-md-3 col-sm-6">
					<date-range-picker v-model="info.int_day" @on-change="search" style="width:100%"></date-range-picker>				
				</Form-item>
				<Form-item label="班级" prop="cid" class="col-md-3 col-sm-6">
    				<select-class v-model="info.cid" clearable></select-class>
    			</Form-item>
    			<Form-item label="课程" prop="lid" class="col-md-3 col-sm-6">
    				<select-lesson v-model="info.lid" clearable></select-lesson>
    			</Form-item>
    			<template v-if="searchExpand">	
    				
	    			<!-- <Form-item label="科目" prop="sj_id" class="col-md-3 col-sm-6">
	    				<Select v-model="info.sj_id">
	    					<Option :value="0">不限</Option>
	    					<Option :value="item.sj_id" v-for="(item,index) in subjects" :key="index">{{item.subject_name}}</Option>
	    				</Select>
	    			</Form-item> -->
	    			
	    			<Form-item label="扣课时" prop="is_consume" class="col-md-3 col-sm-6">
	    				<Select v-model="info.is_consume">
	    					<Option :value="-1">不限</Option>
	    					<Option :value="1">扣</Option>
	    					<Option :value="0">不扣</Option>
	    				</Select>
	    			</Form-item>
					<Form-item label="课时ID" prop="sl_id" class="col-md-3 col-sm-6">
	    				<Select v-model="info.sl_id">
	    					<Option :value="-1">不限</Option>
	    					<Option :value="0">未关联</Option>
							<Option :value="1">有关联</Option>
	    				</Select>
	    			</Form-item>
	    			
	    			    			
    			</template>
			</Form>
			<Row class="basic">
                <Col span="24" class="mt-2" style="margin-left:0px;">  
                	<Button-group>
                        <Button class="ml-2" type="primary" @click="search" icon="ios-search">查询</Button>
                        <Button type="primary" :icon="toggleSearchIcon" @click="toggleSearch"></Button>
                    </Button-group>
                   
                    <Button type="primary" icon="refresh" @click="resetSearch">重置</Button>
                    
	            	<export-button res="student_leaves" :params="params" v-per="'leave.export'"></export-button>
	            	
	            	<RadioGroup v-model="info.status" class="ml-3" v-if="showToolBar">
                		<Radio :label="0" class="m-0">				            
				            <span>未安排补课</span>
				        </Radio>
				        <Radio :label="1" class="m-0">
				            <span>已安排补课</span>
				        </Radio>				       
			        </RadioGroup>
                </Col>
           </Row>	
		</div>
		
		<div class="box box-result">
			<div class="toolbar" v-if="showToolBar">	
				<Button type="primary" @click="makeup" icon="plus">批量补课</Button>
				<Button type="primary" @click="supplement" icon="plus" style="margin-left:5px;">请假补录</Button>
				<import-button res="student_leaves" name="请假记录" @on-import-finish="init_data"></import-button>
			</div>
			<div class="content">
				<div class="content-body" :class="modalList?'max-height300':''">
					<div class="ivu-table-wrapper" v-loading.like="'student_leaves'">
        				<table class="table-list" ref="tableExcel">
							<thead>		
								<th><div class="ivu-table-cell">操作</div></th>						
								<th v-if="showToolBar&&info.status==0">
									<div class="ivu-table-cell">
										<Checkbox v-model="check_all" @on-change="checkAll"></Checkbox>
									</div>
								</th>
								<th><div class="ivu-table-cell">请假人</div></th>
								<th>
									<div class="ivu-table-cell">
										<span class="ivu-table-cell-sort">上课时间</span>
										<span class="ivu-table-sort">
											<i class="ivu-icon ivu-icon-arrow-up-b" :class="{'on':params.order_field='int_day'&&params.order_sort=='asc'}" @click="sortChange({key:'int_day',order:'asc'})"></i>
											<i class="ivu-icon ivu-icon-arrow-down-b" :class="{'on':params.order_field='int_day'&&params.order_sort=='desc'}" @click="sortChange({key:'int_day',order:'desc'})"></i>
										</span>
									</div>
								</th>	
								<th>
									<div class="ivu-table-cell">
										<span class="ivu-table-cell-sort">请假时间</span>
										<span class="ivu-table-sort">
											<i class="ivu-icon ivu-icon-arrow-up-b" :class="{'on':params.order_field='create_time'&&params.order_sort=='asc'}" @click="sortChange({key:'create_time',order:'asc'})"></i>
											<i class="ivu-icon ivu-icon-arrow-down-b" :class="{'on':params.order_field='create_time'&&params.order_sort=='desc'}" @click="sortChange({key:'create_time',order:'desc'})"></i>
										</span>
									</div>
								</th>
								<th><div class="ivu-table-cell">补课安排</div></th>
								<th><div class="ivu-table-cell">课程/班级/关联课时ID</div></th>
								<th><div class="ivu-table-cell text-nowrap">上课{{'老师'|translate}}</div></th>
								
								<th><div class="ivu-table-cell text-nowrap">请假原因</div></th>
								<th><div class="ivu-table-cell text-nowrap">扣课时</div></th>
							</thead>	
							<tr v-for="(item,index) in data" :key="index">
								<td>
									<div class="ivu-table-cell">
										<Dropdown>
											<Button type="primary">操作 <Icon type="arrow-down-b"></Icon></Button>
											<DropdownMenu slot="list">
												<DropdownItem 
													@click.native="makeupItem(item)"
													v-if="item.ma_id==0&&!item.makeup"
													>
													<Icon type="plus"></Icon> 补课
												</DropdownItem>
												<DropdownItem 
													@click.native="delay(item)" 
													v-if="item.ma_id==0&&!item.makeup&&item.lesson_type==1"
													>
													<Icon type="plus"></Icon> 顺延补课
												</DropdownItem>
												<DropdownItem @click.native="changeSl(item)"><Icon type="shuffle"></Icon> 更改课时ID</DropdownItem>
												<DropdownItem @click.native="del(item)"><Icon type="ios-trash"></Icon> 删除</DropdownItem>
											</DropdownMenu>
										</Dropdown>
									</div>
								</td>
								<td v-if="showToolBar&&info.status==0">
									<div class="ivu-table-cell">
										<Checkbox :value="selected.findIndex(s=>s.slv_id==item.slv_id)>-1" readonly @click.native="toggleSelect(item)"></Checkbox>
									</div>
								</td>
								<td>
									<div class="ivu-table-cell">{{item.student.student_name}}</div>
								</td>
								<td>
									<div class="ivu-table-cell">{{item.int_day|int_date}}　{{item.int_start_hour|int_hour}}</div>
								</td>
								<td>
									<div class="ivu-table-cell">{{item.create_time}}</div>
								</td>
								<td>
									<div class="ivu-table-cell">
										<span v-if="!item.makeup" class="text-gray">未安排</span>
										<span v-if="item.makeup" :class="{'text-success':item.makeup.attendance}">
											{{item.makeup.int_day|int_date}} {{item.makeup.int_start_hour|int_hour}}
										</span>
									</div>
								</td>
								<td>
									<div class="ivu-table-cell">
										<template v-if="item.lesson_type===0">
											<Tag color="yellow">班</Tag>{{item.one_class?item.one_class.class_name:''}}
										</template>
										<template v-else>
											<Tag color="blue">{{item.lesson_type==1?'一':'多'}}</Tag>{{item.lid|lesson_name}}
										</template>
										<p>关联课时ID:{{item.sl_id}}</p>
									</div>
								</td>
								<template v-if="item.course_arrange !== null">
								<td>
									<div class="ivu-table-cell">
										{{item.course_arrange.teach_eid|employee_name}}
									</div>
								</td>
								</template>
								<template v-else>
								<td>
									<div class="ivu-table-cell">
										{{"-"}}
									</div>
								</td>
								</template>
								<td>
									<div class="ivu-table-cell">
										<p v-if="item.leave_type>0">{{item.leave_type|dict_title('leave_reason')}}</p>
										<p>{{item.reason||'-'}}</p>
									</div>
								</td>
								<td>
									<div class="ivu-table-cell">
										<span style="color:#f00;" v-if="item.is_consume == 1">扣</span>
										<span style="color:#999;" v-else>不扣</span>
									</div>
								</td>
							</tr>
							<tr v-if="!data||data.length===0">
								<td :colspan="10">
									<div class="ivu-table-cell text-center">没有数据</div>
								</td>
							</tr>
						</table>
	            	</div>					
				</div>
				<div class="content-footer">
		            <div class="pagenation">
		                <Page 
		                	:total="total" 
		                	:current="pageIndex" 
		                	:show-sizer="true" 
		                	:page-size="pageSize" 
		                	:show-total="true" 
		                	@on-change="pagenation" 
		                	@on-page-size-change="pagesize">
		                </Page>
		            </div>
		        </div>
			</div>
		</div>
		
		<make-up-modal ref="makeup" @on-success="makeupSuccess"></make-up-modal>
	</div>
</template>

<script>
	import util,{_} from '@/libs/util'
	import grid from '@/libs/grid.mixin'
	import common from '@/libs/common.mixin'
	import globals from '@/libs/globals.mixin'
	import selectStudent from 'c%/SelectStudent.vue'
	import dateRangePicker from 'c%/DateRangePicker.vue'
	import makeUpModal from '../makeup/info-modal.vue'
	import selectClass from 'c%/SelectClass.vue'
	import selectLesson from 'c%/SelectLesson.vue'

	import ExportButton from 'c%/ExportButton.vue'
	import ImportButton from 'c%/ImportButton.vue'
	
	export default{
		mixins: [grid,common,globals],
		components: {
			makeUpModal,
			selectStudent,
			dateRangePicker,
			ExportButton,
			selectClass,
			selectLesson,
			ImportButton
		},
		props: {
			sid: {
				type: [Number,String],
				default:  0
			},
			filter: {
				type: Boolean,
				default:　()=>{
					return true
				}
			},
			modalList: {
				type: Boolean,
				default: ()=>{
					return false
				}
			},
			modalLeave: {
				type: Object,
				default: ()=>{
					return {}
				}
			}
		},
		data () {
			return {
				rest_api: 'student_leaves',
				pk: 'slv_id',
				check_all: false,
				selected: [],
				info: {
					sid: 0,
					status: 0,
					cid:0,
					lid:0,
					sj_id:0,
					sl_id:-1,
					is_consume:-1,
					int_day: []
				}
			}
		},
		computed:{
			showToolBar () {
				return this.$route.path=='/business/attendance/leave'
			},
			id(){
				try{
					if(!this.$x_in_modal){
						if(this.$route.params.id){
							return this.$route.params.id
						}
					}
				}catch(e){
					
				}
				return this.sid
			}
		},
		watch:  {
			'modalLeave.show': function (val,oldval) {
				if(val && val != oldval) {
					this.info.sid = this.id
					this.init_data()
				}
			},
			'info.status': function (val) {
				this.init_data()
			},
			'info.sid': function (val) {
				this.page = 1
				this.init_data()
			}
		},
		mounted () {
			this.info.sid = this.id
			this.init_data()
		},
		methods: {
			supplement () {
				this.$Modal.open('business/leave/supplement-modal.vue',{
					on: {
						"on-success": ()=> {
							this.init_data()
						}
					}
				})
				.then(modal => {
					modal.show('请假补录')
				})
			},
			makeupSuccess () {
				this.init_data()
				this.selected = [] 
			},
			checkAll (val) {				
				this.selected = []
				if(val){					
					this.data.forEach(i=>{
						this.selected.push(i)
					})
				}
			},
			toggleSelect (item) {
				let index = -1
				
				if(this.selected.length>0){
					index = this.selected.findIndex(s=>s.slv_id==item.slv_id)
				}
							
				if(index>-1){
					this.selected.splice(index,1)
				}else{
					if(this.checkItem(item)){
						this.selected.push(item)						
					}					
				}
				this.check_all = (this.selected.length == this.data.length)
			},
			checkItem (item) {
				let desc = '',
					selected = this.selected,
					err = 0

				if(selected.length>0){
					if(!this.allow_different_lesson_makeup){
						if(item.lid != this.selected[0].lid){
							desc = util.sprintf('【%s】与其它学员课程不同，不能同时补课',item.student.student_name)
							err ++
						}
					}
					if(this.selected.filter(s=>s.sid==item.sid).length > 0){
						desc = util.sprintf('【%s】学员已存在，请选择其他学员',item.student.student_name)
						err ++
					}
					if(err>0){
						this.$Notice.warning({
							title: '提示',
							desc: desc
						})
						return false
					}
				}
				return true
				
			},
			makeupItem(item) {
				let params = {
					sa_ids: [],
					slv_ids: [item.slv_id]
				}
				this.$Modal.open('business/makeup/info-modal.vue',{
					on:{
						'on-success':()=>{
							this.makeupSuccess()
						}
					}
				})
				.then(modal => {
					modal
					.set('params',params)
					.set('selected',[item])
					.show('补课','add')
				})
			},
			makeup () {
				if(this.check()){
					let [slv_ids,sids,student_names]= [[],[],'']
						
					if(this.selected.length>0){
						this.selected.forEach(d=>{
							if(sids.indexOf(d.student.sid)===-1){
								sids.push(d.student.sid)
								slv_ids.push(d.slv_id)	
							}else{
								student_names += util.sprintf('【%s】,',d.student.student_name)
							}
									
						})
					}
					student_names = student_names.substring(0,student_names.length-1)
					
					if(student_names){
						this.$Message.error(student_names+'学员重复！')
						return false
					}
					let params = {
						sa_ids: [],
						slv_ids: slv_ids
					}
					
					this.$Modal.open('business/makeup/info-modal.vue',{
						on:{
							'on-success':()=>{
								this.makeupSuccess()
							}
						}
					})
					.then(modal => {
						modal
						.set('params',params)
						.set('selected',this.selected)
						.show('补课','add')
					})
				}
			},
			check () {				
				let data = this.selected,
					err = [],
					lids = []
				if(!this.allow_different_lesson_makeup){	
					if(data.length>0){
						data.forEach((d,index)=>{
							lids.push(d.lid)
							if(index>0&&d.lid!=data[index-1].lid){
								err.push(d)		
							}
						})
					}
				}
					
				if(err.length>0){
					let desc = ''
					err.forEach(e=>{
						desc += e.student.student_name+','
					})
					desc = desc.substring(0,desc.length-1)
					desc += '与其它学员课程不同，不能同时补课'
					this.$Notice.warning({
						title: '提示',
						desc: desc
					})
					return false
				}
				return true
			},
			del (item) {
				if(this.info.status==0){
					this.confirm('确定删除【'+item.student.student_name+'】的请假记录吗？')
					.then(()=>{
						this.delete(item)
					})				
				}else{
					this.confirm('确定删除【'+item.student.student_name+'】的补课安排吗？')
					.then(()=>{
						this.$rest('makeup_arranges')
						.delete(item.ma_id)
						.success(data=>{
							this.$Message.success('删除成功！')
							this.init_data()
						}).error(response=>{
							this.error(response.body.message||'删除失败！')
						})
					})
				}
			},
			delay (item) {
				this.$Modal.open('business/leave/delay-modal.vue',{
					props: {
						arrange: item.arrange,
						sid: item.sid,
						'slv-id': item.slv_id
					}
				})
				.then(modal => {
					modal.show('顺延补课')
				})
			},
			hook_get_param (params) {
				params.with = 'student'
				
				if(this.showToolBar) {
					if(this.info.status == 0){
						params.ma_id = 0
					}else if(this.info.status == 1){
						params.ma_id = '[>,0]'
					}
				}
				
				if(this.info.sid>0){
					params.sid = this.info.sid
				}else{
					if(this.id>0) {
						params.sid = this.id
					}
				}

				if(this.info.cid >0){
					params.cid = this.info.cid
				}

				if(this.info.lid > 0){
					params.lid = this.info.lid
				}

				if(this.info.sj_id > 0){
					params.sj_id = this.info.sj_id
				}

				if(this.info.is_consume != -1){
					params.is_consume = this.info.is_consume
				}

				if(this.info.sl_id != -1){
					if(this.info.sl_id == 1){
						params.sl_id = '[GT,0]'
					}else{
						params.sl_id = 0
					}
				}

				if(this.info.int_day.length>0){
					params.int_day = util.sprintf('[BETWEEN,%s,%s]',util.format_int_day(this.info.int_day[0]),util.format_int_day(this.info.int_day[1]))
				}
			},
			resetSearch () {
				this.$r('ref_search').resetFields()
				this.init_data()
			},
			changeSl(item) {
				this.$Modal.open('business/leave/change-sl-modal.vue',{
					props:{
						info:util.copy(item)
					},
					on:{
						'on-success':()=>{
							this.init_data()
						}
					}
				})
				.then(modal => {
					modal
					.show('更改请假关联课时ID','add')
				})
			},
		}
	}
</script>
