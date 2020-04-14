<template>
	<Modal v-drag-modal v-model="modal$.show" :title="modal$.title" width="800" :mask-closable="false">
		
		<Form :label-width="80">
			<Form-item label="调课对象" class="mb-1">
				<RadioGroup v-model="class_object.type" type="button">
			        <Radio :label="0">班级</Radio>
			        <Radio :label="1">一对一</Radio>
			        <Radio :label="2">一对多</Radio>
			    </RadioGroup>
			</Form-item>
			<Row>
				<Col span="12" v-if="class_object.type==0">
					<Form-item label="选择班级" class="mb-1">
						<select-class 
							v-model="class_object.cid" 
							style="width:260px" 
							clearable
							>
						</select-class>
					</Form-item>
				</Col>
				<Col span="12" v-else-if="class_object.type==1">
					<Form-item label="选择学员" class="mb-1">
						<select-student 
							v-model="class_object.sid" 
							style="width:260px"
							clearable
							>
						</select-student>
					</Form-item>
				</Col>
				<Col span="12" v-else>
					<Form-item label="选择课程" class="mb-1">
						<select-lesson 
							v-model="class_object.lid" 
							:allow-type="[2]" 
							:condition="{lesson_type:[2]}" 
							style="width:260px"
							clearable
							>
						</select-lesson>
					</Form-item>
				</Col>
				<template v-if="searchExpand">
					<Col span="12" v-if="class_object.type!==2">
						<Form-item label="课程" class="mb-1">
							<select-lesson 
								v-model="search_field.lid" 
								:allow-type="[0,1]" 
								:condition="{lesson_type:[0,1]}" 
								style="width:260px"
								clearable
								>
							</select-lesson>
						</Form-item>
					</Col>
					<Col span="12">
						<Form-item label="科目" class="mb-1">
							<select-subject v-model="search_field.sj_id" style="width:260px" clearable></select-subject>
						</Form-item>
					</Col>
					<Col span="12">
						<Form-item label="老师" class="mb-1">
							<select-employee 
								v-model="search_field.teach_eid" 
								:rid="1" 
								style="width:260px"
								clearable
								>
							</select-employee>
						</Form-item>
					</Col>
					<Col span="12">
						<Form-item label="日期" prop="int_day" class="mb-1">
		    				<date-range-picker 
		    					v-model="search_field.int_day" 
		    					label="选择日期" 
		    					placement="bottom" 
		    					style="width:260px"
		    					clearable
		    					>
	    					</date-range-picker>
		    			</Form-item>
					</Col>
					<Col span="12">
						<Form-item label="时段" prop="int_day" class="mb-1">
		    				<select-time-section 
	                            clearable
	                            :value="ts_array" 
	                            @on-change="changeTimeSection"
	                            placeholder="请选择上课时段"
	                            style="width:260px"
	                            >
	                        </select-time-section>
		    			</Form-item>
					</Col>
				</template>
			</Row>
		</Form>
		
		<div class="pl-3 clearfloatblock">
			<div class="pull-left" @click="searchExpand=!searchExpand" style="padding-left:4px;cursor:pointer;">
				{{searchExpand?'隐藏筛选':'更多筛选'}}
			</div>
			<Dropdown class="pull-right">
		        <Button type="ghost" size="small" icon="ios-gear" :disabled="notSelectObject">批量操作</Button>
		        <DropdownMenu slot="list">
		            <DropdownItem @click.native="arrangeChange('move')"><Icon type="ios-clock"></Icon> 调整时间</DropdownItem>		            
		            <DropdownItem @click.native="arrangeChange('teacher')"><Icon type="person"></Icon> 更换{{'老师'|translate}}</DropdownItem>
		            <DropdownItem @click.native="arrangeChange('ss')"><Icon type="person-stalker"></Icon> 更换{{'助教'|translate}}</DropdownItem>
		            <DropdownItem @click.native="arrangeChange('room')"><Icon type="ios-home"></Icon> 更换教室</DropdownItem>
		        </DropdownMenu>
		    </Dropdown>
		</div>
		<div class="m-t" v-if="notSelectObject">
			<Alert show-icon>
					请选择调课对象
			</Alert>
		</div>

		<div class="x-arrange-box mt-3">
			<table class="modal-table">
				<thead>
					<th>
						<div class="ivu-table-cell">
							<Checkbox v-model="check_all" @on-change="checkAll"></Checkbox>
						</div>
					</th>					
					<th>
						<div class="ivu-table-cell">调整前</div>
					</th>
					<th>
						<div class="ivu-table-cell">调整后</div>
					</th>
					<th>
						<div class="ivu-table-cell">操作</div>
					</th>
				</thead>
			</table>
		</div>
		<div class="x-arrange-box">
			<div class="ivu-table-cell text-center" v-if="loading">稍等，正在加载排课记录...~</div>
			<table class="modal-table" v-else>
				<tr v-for="i in data.length" @click.stop="arrangeCkeck(data[i-1])">
					<td style="width:4%">
						<div class="ivu-table-cell">
							<Checkbox :value="ca_ids.indexOf(data[i-1].ca_id)>-1" readonly @click.native.stop="arrangeCkeck(data[i-1])"></Checkbox>
						</div>
					</td>
					<td style="width:44%">
						<div class="x-arrange-item">							
							<div class="item-center">
								<Tag color="blue">周{{getWeekDay(data[i-1].int_day)}}</Tag>
								<span class="date">
									{{data[i-1].int_day|int_date}}
								</span>
								<span class="ml-3">
									<Icon type="ios-clock"></Icon> 
									{{data[i-1].int_start_hour|int_hour}}~{{data[i-1].int_end_hour|int_hour}}
								</span>
								<p>
									<span>
										<Icon type="person"></Icon> 
										{{getItemField(data[i-1],'teach_eid')}}
									</span>
									<span class="ml-3" v-if="data[i-1].second_eids.length">
										<Icon type="person-stalker"></Icon> 
										{{getItemField(data[i-1],'second_eids')}}
									</span>
									<span class="ml-3">
										<Icon type="home"></Icon>
										{{getItemField(data[i-1],'cr_id')}}
									</span>
								</p>
							</div>							
						</div>
					</td>
					<td style="width:44%">
						<div class="x-arrange-item">
							<div>
								<Tag color="blue">周{{getWeekDay(post_data[i-1].int_day)}}</Tag>
								<span class="date" :class="getClass(post_data[i-1],'int_day')">
									{{getItemField(post_data[i-1],'int_day')}}
								</span>
								<span class="ml-3" :class="getClass(post_data[i-1],'int_start_hour')">
									<Icon type="ios-clock"></Icon> 
									{{getItemField(post_data[i-1],'int_start_hour')}}~{{getItemField(post_data[i-1],'int_end_hour')}}
								</span>
								<p>
									<span :class="getClass(post_data[i-1],'teach_eid')">
										<Icon type="person"></Icon> 
										{{getItemField(post_data[i-1],'teach_eid')}}
									</span>
									<span class="ml-3" :class="getClass(post_data[i-1],'second_eids')" v-if="post_data[i-1].second_eids.length">
										<Icon type="person-stalker"></Icon> 
										{{getItemField(post_data[i-1],'second_eids')}}
									</span>
									<span class="ml-3" :class="getClass(post_data[i-1],'cr_id')">
										<Icon type="home"></Icon> 
										{{getItemField(post_data[i-1],'cr_id')}}
									</span>
								</p>
							</div>
						</div>
					</td>
					<td>
						<div class="ivu-table-cell">
							<Dropdown class="pull-right">
						        <Button type="ghost" size="small" icon="ios-gear" @click.stop>操作</Button>
						        <DropdownMenu slot="list">
						            <DropdownItem @click.native.stop="arrangeChange('time',data[i-1])"><Icon type="ios-clock"></Icon> 调整时间</DropdownItem>
						            <DropdownItem @click.native.stop="arrangeChange('teacher',data[i-1])"><Icon type="person"></Icon> 更换{{'老师'|translate}}</DropdownItem>
						            <DropdownItem @click.native.stop="arrangeChange('ss',data[i-1])"><Icon type="person-stalker"></Icon> 更换{{'助教'|translate}}</DropdownItem>
						            <DropdownItem @click.native.stop="arrangeChange('room',data[i-1])"><Icon type="ios-home"></Icon> 更换教室</DropdownItem>
						        </DropdownMenu>
						    </Dropdown>
						</div>
					</td>
				</tr>
				<tr v-if="!data||!data.length">
					<td colspan="4">
						<div class="ivu-table-cell text-center">无排课记录~</div>
					</td>
				</tr>
			</table>
		</div>		
		
		<div slot="footer">
			<Button type="ghost" @click="close" :loading="saving">关闭</Button>
			<Button type="primary" @click="ok" :loading="saving">确定</Button>
		</div>
		
		<change-info-modal ref="infoModal" :obj-type="class_object.type" :caIds="ca_ids" @on-ok="arrangeChanged"></change-info-modal>
	</Modal>
</template>

<script>
	import util from '@/libs/util'
	import modal from '@/libs/modal.mixin'
	import common from '@/libs/common.mixin'
	import globals from '@/libs/globals.mixin'
	
	import SelectClass from 'c%/SelectClass.vue'
	import SelectLesson from 'c%/SelectLesson.vue'
	import SelectStudent from 'c%/SelectStudent.vue'
	import ChangeInfoModal from './change-info-modal.vue'
	import SelectEmployee from 'c%/SelectEmployee.vue'
	import DateRangePicker from 'c%/DateRangePicker.vue'
	import SelectTimeSection from 'c%/SelectTimeSection.vue'
	import SelectSubject from 'c%/SelectSubject.vue'
	
	const emptyObject = {
		type: 0,
		cid: 0,
		sid: 0,
		lid: 0
	}
	
	export default{
		mixins: [ modal,common,globals ],
		components: {
			SelectClass,
			SelectLesson,
			SelectStudent,
			ChangeInfoModal,
			SelectTimeSection,
			SelectSubject,
			DateRangePicker,
			SelectEmployee
		},
		data () {
			return {
				class_object: util.copy(emptyObject),
				check_all: false,
				ca_ids: [],
				data: [],
				post_data: [],
				loading:false,
				search_field: {
					int_day: [],
					int_start_hour: '',
					int_end_hour: '',
					lid: 0,
					sj_id: 0,
					teach_eid: 0
				},
				ts_array:[],
				searchExpand: false
			}
		},
		computed:{
			notSelectObject(){
				return this.class_object.cid==0 && this.class_object.sid==0 && this.class_object.lid==0
			}
		},
		watch: {
			'class_object.cid': function (val) {
				this.getCourseArrange()	
			},
			'class_object.sid': function (val) {
				this.getCourseArrange()
			},
			'class_object.lid': function (val) {
				this.getCourseArrange()
			},
			'class_object.type': function (val) {
				this.typeChange()
			},
			'modal$.show': function (val) {
				if(val){
					this.reset()		
				}
			},
			search_field: {
				handler(v) {
					this.getCourseArrange()
				},
				deep: true
			}
		},
		methods: {
			changeTimeSection(event) {
	            if(event.length) {
	                this.search_field.int_start_hour = this.$filter('format_int_hour')(event[0])
	                this.search_field.int_end_hour   = this.$filter('format_int_hour')(event[1])
	            }else{
	                this.search_field.int_start_hour = ''
	                this.search_field.int_end_hour   = ''
	            }
	        },
			getWeekDay (int_day) {
				let time = new Date(this.$filter('int_date')(int_day))
				let week = util.get_week_day(time)
				let map_week = {'1': '一','2':'二','3':'三','4':'四','5':'五','6':'六','7':'日'}
				return map_week[week]
			},
			getItemField (item,field) {
				let type = this.class_object.type,
					result = '',
					map_filter = {
						'int_day':'int_date',
						'int_start_hour':'int_hour',
						'int_end_hour':'int_hour',
						'teach_eid':'ename',
						'second_eids':'enames',
						'cr_id':'classroom_name'
					}
					
				result = this.$filter(map_filter[field])(item[field])
					
				return result
			},
			reset () {				
				this.typeChange()
				this.class_object = util.copy(emptyObject)
			},
			typeChange () {
				this.data = []
				this.post_data = []
				this.ca_ids = []
				this.class_object.cid = 0
				this.class_object.sid = 0
				this.check_all = false
			},
			getClass (item,type) {
				let result = '',
					index = -1
				
				if(item._change_field){
					index = item._change_field.indexOf(type)
					result = index>-1?'text-primary':''
				}				
				return result
			},
			getCourseArrange () {
				let uri = ''
				let type = this.class_object.type
				let id = 0
				let suffix = ''
				let search_field = util.copy(this.search_field)
				switch(type){
					case 0:
						id = this.class_object.cid
						uri = 'course_arranges?cid=%s&is_attendance=0&is_cancel=0&order_field=int_day&order_sort=asc&page=1&pagesize=200'
						break;
					case 1:
						id = this.class_object.sid
						uri = 'course_arranges?sid=%s&lesson_type=1&is_attendance=0&order_field=int_day&order_sort=asc&is_cancel=0&page=1&pagesize=200'
						break;
					case 2:
						id = this.class_object.lid
						this.search_field.lid = 0
						uri = 'course_arranges?lid=%s&is_attendance=0&is_cancel=0&order_field=int_day&order_sort=asc&page=1&pagesize=200'
						break;				
				}
				if(id == 0) {
					this.data = []
					return false
				}
				uri = util.sprintf(uri,id)
				for(let i in search_field) {
					const property = search_field[i]
					if(i=='int_day') {
						if(property!=','&&property.length) {
							suffix += `&${i}=[between,${property[0]},${property[1]}]`
						}
					} else {
						if(property&&property!==-1) {
							suffix += `&${i}=${property}`
						}
					}
				}
				if(suffix) {
					uri += suffix
				}
				this.loading = true
				this.$rest(uri)
				.get()
				.success(response=>{
					this.loading = false
					this.data = response.list
					this.post_data = response.list 
				})
				.error(response=>{
					this.loading = false
				})
			},
			checkAll (checked) {
				this.ca_ids = []
				if(checked){
					this.data.forEach(d=>{
						this.ca_ids.push(d.ca_id)
					})
				}
			},
			arrangeCkeck (item) {
				let ca_ids = this.ca_ids,
					index = ca_ids.indexOf(item.ca_id)
				
				if(index>-1){
					ca_ids.splice(index,1)
				}else{
					ca_ids.push(item.ca_id)
				}
				
				this.check_all = (ca_ids.length == this.data.length)
			},
			arrangeChange (type,item) {
				let map_title = {
					'time':'调整上课时间', 
					'move':'调整上课时间',
					'teacher':'更换上课'+this.$filter('translate')('老师'),
					'ss':'更换'+this.$filter('translate')('助教'),
					'room':'更换上课教室'},
					title = map_title[type]		
				
				if(!item){
					if(!this.ca_ids.length){						
						this.$Message.error('请先选择排课')
						return
					}				 
					this.$r('infoModal')
					.set('type',type)
					.set('data',util.copy(this.data))
					.set('copyData',util.copy(this.post_data))
					.show(title,'add')
										
				}else{
					this.$r('infoModal')
					.set('type',type)
					.set('data',util.copy(this.data))
					.set('copyData',util.copy(this.post_data))
					.set('info',item)
					.show(title,'add')
				}
			},
			arrangeChanged (data) {
				this.post_data = data
			},
			ok () {				
				let params = this.initPostData()
				
				if(params.length){
					this.$rest('course_arranges/update_course').post(params)
					.success(data=>{
						this.$Message.success('调课成功')
						this.$emit('save')
						this.close()
					}).error(response=>{
						this.error(response.body.message||'调课失败~','调课操作提示')
						
					})
				}else{
					this.$Message.error('请先选择排课')
					return
				}
			},
			initPostData () {
				let post_data = util.copy(this.post_data),
					result = [],
					ca_ids = this.ca_ids
				
				if(ca_ids.length&&post_data.length){
					ca_ids.forEach(c=>{
						let obj = post_data.find(p=>p.ca_id==c)
						result.push(obj)						
					})
				}
					
				return result
			}
		}
	}
	
</script>

<style lang="less">
	.x-arrange-box{
		max-height: 500px;
		overflow: auto;
	}
	.x-arrange-item{
		display: flex;
		font-size: 14px;
		align-items: center;
		padding: 0 20px;
		span, p{
			line-height: 1.5em;
		}
		.item-center{
			flex: 1
		}
	}
</style>