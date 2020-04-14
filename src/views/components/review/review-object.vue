<template>
	<div :class="classes">
		<div
			:class="[prefixCls + '-selection']"
			ref="reference"
			@click="openModal">
			<span :class="[prefixCls + '-placeholder']" v-show="showPlaceholder">{{ localPlaceholder }}</span>
			<span :class="[prefixCls + '-selected-value']" v-show="!showPlaceholder" style="line-height: 30px;">{{ labelText }}</span>
			<Icon type="ios-close" :class="[prefixCls + '-arrow']" v-show="showCloseIcon" @click.native.stop="clearSelected"></Icon>
			<Icon type="arrow-down-b" :class="[prefixCls + '-arrow']" v-show="!showCloseIcon"></Icon>
		</div>
		<Modal v-drag-modal v-model="modalShow" :title="title" :mask-closable="false" width="800" @cancel="cancel">
			<div :class="type==2?'select-list-multiple':''" class="select-list" :style="style1">
				<div class="list-tab">
					<Row>
						<Col span="24">
							<RadioGroup v-model="type" type="button" size="small" class="mr-3">
								<Radio :label="0" v-if="allowType0">班级</Radio>
						        <Radio :label="1" v-if="allowType1">1对1</Radio>
						        <Radio :label="2" v-if="allowType2">1对多</Radio>
						    </RadioGroup>						  	
							<div class="pull-right" v-if="type==1||type==2">
		                        <label>权限范围：</label>
		                        <ButtonGroup>
		                            <Button 
			                            :type="student_default_value=='my'?'primary':'ghost'" 
			                            size="small" 
			                            icon="android-person" 
			                            @click="turnStudentLesson('my')">我的
			                        </Button>
		                            <Button 
			                            :type="student_default_value=='all'?'primary':'ghost'" 
			                            size="small" 
			                            icon="android-people" 
			                            :disabled="!perCheckAllStudent" 
			                            @click="turnStudentLesson('all')">所有
			                        </Button>
		                        </ButtonGroup>
		                    </div>
		                    <div class="pull-right" v-if="type==0">
		                        <label>权限范围：</label>
		                        <ButtonGroup>
		                            <Button 
			                            :type="class_default_value=='my'?'primary':'ghost'"  
			                            size="small" 
			                            icon="android-person" 
			                            @click="turnClass('my')">我的
			                        </Button>
		                            <Button 
			                            :type="class_default_value=='all'?'primary':'ghost'"  
			                            size="small" 
			                            icon="android-people" 
			                            :disabled="!perCheckAllClass" 
			                            @click="turnClass('all')">所有
			                        </Button>
		                        </ButtonGroup>
		                    </div>
	            		</Col>            		
	            	</Row>
	            	
			    </div>
		    	<div class="list-condition mt-3">
		    		<Form :label-width="70" class="filter-form row">
		    			<Form-item :label="type===0?'班级名称':'学员姓名'" class="col-sm-6 mb-2">
		    				<Input v-model="data[1].key" placeholder="请输入学员姓名" size="small" v-if="type===1"></Input>
			    			<Input v-model="data[2].key" placeholder="请输入学员姓名" size="small" v-if="type===2"></Input>
			    			<Input v-model="data[0].key" placeholder="请输入班级名称" size="small" v-if="type===0"></Input>
		    			</Form-item>
		    			<Form-item label="课程" class="col-sm-6 mb-2">
		    				<select-lesson v-model="data.lid" clearable class="x-ivu-select"></select-lesson>		
		    			</Form-item>
		    			<template v-if="searchExpand">
							<Form-item label="校区" prop="bid" class="col-md-6 col-sm-6">
								<Select v-model="data.bid">
									<Option :value="-1">不限制校区</Option>
									<Option v-for="(item,index) in branchs" :key="index" :value="item.bid">{{item.short_name||item.branch_name}}</Option>
								</Select>
							</Form-item>
			    			<Form-item label="排课状态" class="col-sm-6 mb-2" v-if="enable_arrange_status&&type!=0">
			    				<Select v-model="data.arrange_status">
									<Option :value="-1">不限</Option>
									<Option :value="2">已排满</Option>
									<Option :value="1">未排满</Option>
									<Option :value="0">未排课</Option>
								</Select>		
			    			</Form-item>
			    		</template>
		    		</Form>
		    		<ButtonGroup>
						<Button-group size="small">
							<Button class="ml-2" type="primary" @click="search" icon="ios-search">查询</Button>
							<Button type="primary" :icon="toggleSearchIcon" @click="toggleSearch"></Button>
						</Button-group>
			    		<Button 
			    			type="primary"
			    			size="small"
			    			:icon="searchExpand?'chevron-up':'chevron-down'" 
			    			@click="searchExpand=!searchExpand"
			    			v-if="enable_arrange_status&&type!=0"
			    			>
		    			</Button>
			    	</ButtonGroup>
		    		<Button type="primary" @click="resetSearch" size="small" icon="refresh">重置</Button>
		    		<template v-if="type===0">
					  	<Checkbox 
	                		class="ml-1" 
	                		v-model="class_type" 
	                		:disabled="disabledTemp" 
	                		:true-value="1" 
	                		:false-value="0">临时班
	                	</Checkbox>
	                	<span>|</span>
	                	<Checkbox
	                		class="ml-1" 
	                		v-model="is_demo" 
	                		:disabled="disabledDemo"
	                		:true-value="1" 
	                		:false-value="0">体验班
	                	</Checkbox>
	                </template>
		    	</div>
			    <div class="list-body">
			    	<div class="ivu-table-wrapper" v-loading.like="'student_lessons'" v-if="type!=0">
				    	<table class="table table-list">
				    		<thead>
	                            <tr>
	                            	<th>#</th>
	                                <th width="50" v-if="type===2">
	                                	<Checkbox v-model="checkAll" @click.native="handleCheckAll"></Checkbox>
	                                </th>
	                                <th>姓名</th>
	                                <th>课程</th>
	                                <th v-if="enable_arrange_status">已排/总课时</th>
	                                <th>剩余/总课时</th>
									<th v-if="forbid_uncheck_arrange">审核状态</th>
	                            </tr>
	                        </thead>
	                        <tbody>
	                            <tr 
								:class="{'table-info':item.$selected}" 
								@click="toggleSelected(item)" 
								v-for="(item,index) in filterList(type)" 
								:key="index"
								v-if="item.student">
	                            	<td><div class="ivu-table-cell">{{index+1}}</div></td>
	                                <td v-if="type===2">
	                                    <div class="ivu-table-cell">
	                                    	<Checkbox :value="item.$selected" @click="toggleSelected(item)" :readonly="true"></Checkbox>
	                                    </div>
	                                </td>
	                                <td>
	                                	<div class="ivu-table-cell">
	                                		<avatar-and-name 
	                                			:src="item.student.photo_url" 
	                                			:name="item.student.student_name" 
	                                			:sex="item.student.sex"
                                                :detailAction="2"
	                                			>
                                			</avatar-and-name>
											<span v-if="item.bid != bid$">
												({{item.bid|branch_name}})
											</span>
	                                	</div>
	                                </td>
	                                <td><div class="ivu-table-cell">{{item.lid|lesson_name}}</div></td>
	                                <td v-if="enable_arrange_status">
	                                	<div class="ivu-table-cell">
	                                		<span v-if="item.price_type==3">-</span>
		                                	<Progress :percent="studentLessonArrangePercent(item)" :stroke-width="5" v-else>
		                                		{{Number(item.arrange_hours)}}/{{Number(item.total_lesson_hours)}}
		                                	</Progress>
	                                	</div>
	                                </td>
	                                <td>
	                                	<div class="ivu-table-cell">
	                                		<template v-if="item.price_type==3">
	                                			<span>{{item.expire_time_text}}：{{item.expire_time}}</span>
	                                		</template>
		                                	<Progress :percent="studentLessonRemainPercent(item)" :stroke-width="5" v-else>
		                                		{{Number(item.remain_lesson_hours)}}/{{Number(item.total_lesson_hours)}}
		                                	</Progress>
	                                	</div>
	                                </td>
									<td v-if="forbid_uncheck_arrange">
										<div class="ivu-table-cell">
											<span class="text-success" v-if="isOrderCheck(item)">已审核</span>
											<span class="text-danger" v-else>未审核</span>
										</div>
									</td>
	                            </tr>
	                            <tr v-if="filterList(type).length == 0">
	                                <td :colspan="type==2?6:5" style="text-align: center"><p class="empty">没有找到学员</p></td>
	                            </tr>
	                        </tbody>                        
				    	</table>
			    	</div>
			    	<div class="ivu-table-wrapper" v-else v-loading.like="'classes'">
			    		<table class="table table-list">
			    			<thead>
	                            <tr>
	                            	<th>#</th>
	                                <th>班级</th>
	                                <th>学员数</th>      
	                                <th>课程</th>
	                                <th>排课次数/总次数</th>
	                                <th>考勤次数/总次数</th>
	                            </tr>
	                        </thead>
	                        <tbody>
	                            <tr :class="{'table-info':item.$selected}" @click="toggleSelected(item)" v-for="(item,index) in filterList(type)">
	                            	<td><div class="ivu-table-cell">{{index+1}}</div></td>
	                                <td><div class="ivu-table-cell">{{item.class_name}}</div></td>
	                                <td><div class="ivu-table-cell">{{item.student_nums}}</div></td>
	                                <td><div class="ivu-table-cell">{{item.lid|lesson_name}}</div></td>
	                                <td>
	                                	<div class="ivu-table-cell">
		                                	<Progress :percent="classArrangePercent(item)" :stroke-width="5">
		                                		{{item.arrange_times}}/{{item.lesson_times}}
		                                	</Progress>
	                                	</div>
	                                </td>
	                                <td>
	                                	<div class="ivu-table-cell">
		                                	<Progress :percent="classAttendancePercent(item)" :stroke-width="5">
		                                		{{item.attendance_times}}/{{item.lesson_times}}
		                                	</Progress>
	                                	</div>
	                                </td>
	                            </tr>
	                            <tr v-if="filterList(type).length == 0">
	                                <td colspan="6" style="text-align: center"><p class="empty">没有找到班级</p></td>
	                            </tr>
	                        </tbody>
			    		</table>
			    	</div>
			    	<div class="mt-3 text-right">
                        <Page :total="total" 
                        :current="pageIndex" 
                        :show-sizer="true" 
                        :page-size="pageSize" 
                        :show-total="true" 
                        @on-change="pagenation" 
                        @on-page-size-change="pagesize"
                        >
                        </Page>
                    </div>
			    </div>
		    	<div class="multi-selected" v-if="type===2" :style="style2">
	                <Card>
	                    <div slot="title">
	                        <span>已选择：<span class="badge">{{selectedTotal}}</span></span>
	                        <Button @click="clearSelectedId" class="pull-right" type="ghost" shape="circle" size="small" icon="trash-a" title="清空"></Button>
	                    </div>
	                    <ul class="multi-selected-list">
	                        <li v-for="item in selected.ids">
	                            <span>{{selected.map_ids[item].student.student_name}}</span>
	                            <Button @click="cancelSelectedId(item)" class="pull-right" type="ghost" shape="circle" size="small" icon="trash-a" title="移除"></Button>
	                        </li>
	                    </ul>
	                </Card>
	            </div>
			</div>
			<div slot="footer">
				<div class="pull-left" v-if="type!==2&&selected.ids.length>0">
					已选择：<span class="text-info">
						<label v-if="type===0">{{selected.map_ids[selected.ids[0]].class_name}}</label>
						<label v-else>{{selected.map_ids[selected.ids[0]].student.student_name}}</label>
					</span>
				</div>
				<Button type="ghost" @click="cancel">取消</Button>
				<Button type="primary" @click="ok">确定</Button>
	 		</div>
		</Modal>
	</div>
</template>

<script>
	import Vue from 'vue'
	import util from  '@/libs/util'
	import common from '@/libs/common.mixin'
	import modal from '@/libs/modal.mixin'
	import globals from '@/libs/globals.mixin'
	import selectLesson from 'c%/SelectLesson.vue'
	import { oneOf, findComponentDownward } from '@/libs/assist';
	
	const prefixCls = 'ivu-select';
	var ALLURL = []
	var MYURL = []
	
	export default{
		mixins: [modal,common,globals],
		components: {
			selectLesson
		},
		props: {
			value: {
                type: [Number, String, Array],
                default: 0
            },
            disabled: {
                type: Boolean,
                default: false
            },
            clearable: {
                type: Boolean,
                default: false
            },
            placeholder: {
                type: String
            },
            loading: {
                type: Boolean,
                default: false
            },
            loadingText: {
                type: String
            },
            size: {
                validator (value) {
                    return oneOf(value, ['small', 'large', 'default']);
                }
            },
            notFoundText: {
                type: String
            },
            placement: {
                validator (value) {
                    return oneOf(value, ['top', 'bottom']);
                },
                default: 'bottom'
            },
            toFormal: {
                type: Boolean,
                default: false
            },
            title: {
            	type: String,
            	default: '选择授课对象'
            },
            disabledTemp: {
                type: Boolean,
                default: false
            },
            disabledDemo: {
            	type: Boolean,
            	default: false
            },
            allowLessonType:{
            	type:Array,
            	default(){
            		return [0,1,2]
            	}
            },
            multiple: { //一对多多选
            	type: Boolean,
            	default: true
			},
			is_homework_task:{
				type: Boolean,
            	default: false
			}
		},
		data () {
			return {
				class_type: 0,
				is_demo: 0,
				type: 0,
				checkAll: false,
				checkMy: false,
				pageIndex:1,
            	pageSize:10,
            	total: 0,
				selected: {
					type: 0,
					info: {},
					map_ids: {},
					ids: [],
					pks: []
				},				
				data:{
					lid: 0,
					bid:'',
					arrange_status:-1,
					0:{
						url:'',
						key:'',						
						total:0,
						list:[]
					},
					1: {
						url:'',
						key:'',
						total:0,
						list:[]
					},
					2: {
						url:'',
						key:'',
						total:0,
						list:[]
					}
				},
				student_default_value: 'all',
				class_default_value: 'all',
				labelText: '',
				modalShow: false,
				prefixCls: prefixCls,
				definedAllowLessonType:[],
				searchExpand: false
			}
		},
		watch: {
			type: function (val) {	
				//0:班级，1：1对1，2：1对多
				this.initSelected(val)
			},
			'modalShow': function (val) {
				if(val) {
					this.get_data_list(0)		
				}
			},
			'data.lid': function (val) {
				
			}
		},
		created(){
			let allow_lesson_types = this.$store.state.gvars.configs.params.lesson.enable_lesson_type
			if(this.allowLessonType.length == 3 && allow_lesson_types.length < 4){
				this.allowLessonType.splice(0,3)
				allow_lesson_types.forEach(i=>{
					if(i<3){
						this.allowLessonType.push(i)
					}
				})
			}

			this.data.bid = this.bid$

			ALLURL = ['classes?status=[<,2]'+(this.is_homework_task ? '&htts=1' : '')+'',
					 'student_lessons?lesson_type=1&is_package=[OR,EQ,1]&with=student'+(this.is_homework_task ? '&htts=1' : '')+'',
					 'student_lessons?lesson_type=2&is_package=[OR,EQ,1]&with=student'+(this.is_homework_task ? '&htts=1' : '')+'']

			MYURL = ['',
					'student_lessons?lesson_type=1&is_package=[OR,EQ,1]&my=1&with=student'+(this.is_homework_task ? '&htts=1' : '')+'',
					'student_lessons?lesson_type=2&is_package=[OR,EQ,1]&my=1&with=student'+(this.is_homework_task ? '&htts=1' : '')+'']
		},
		mounted () {
			this.setUrl()
			this.setType()
		},
		methods: {
			isOrderCheck(item){
				if(!item.order_items){
					return true
				}
				if(item.order_items[0].order && item.order_items[0].order.is_check == 1){
					return true
				}
				return false
			},
			toggleSearch(){
				this.searchExpand = !this.searchExpand
			},
			setTeachObject(to){
				this.setAllowLessonType(to.lesson_type)
				let [type,ids,index] = [this.type,this.selected.ids,-1]
				let lesson_type = to.lesson_type
				let item = util.copy(to)
				if(lesson_type!==2){
					this.selected.info = item					
					if(lesson_type===0){
						this.selected.ids.push(item.cid)		
						this.selected.pks.push(item.cid)		
						this.selected.map_ids[item.cid] = item
					}else{
						this.selected.map_ids[item.student.sid] = item
						this.selected.ids.push(item.student.sid)
					}	
				}else{
					this.selected.info = {}
					this.selected.map_ids[item.student.sid] = item
					this.selected.ids.push(item.student.sid)
					this.checkAll = false				
				}
				this.initLabelText(lesson_type)
				this.$emit('on-selected',this.selected)
			},
			setAllowLessonType(val){
				this.definedAllowLessonType[0] = val
				this.initSelected(val)
			},
			initSelected(val){
				this.pageIndex = 1
				this.data.lid = 0
				this.selected.type = val
				this.selected.pks = []
				this.selected.map_ids = {}
				this.get_data_list(val)
				this.clearSelectedId()
			},
			initLabelText(lesson_type){
	        	if(lesson_type==2) {
	        		let students = []
	        		this.selected.ids.forEach(id => {
	        			students.push(this.selected.map_ids[id].student.student_name)
	        		})
	        		this.labelText = students.join('，')
	        	}else{
	        		if(lesson_type==0) {
	        			this.labelText = this.selected.map_ids[this.selected.ids[0]].class_name
	        		}else{
	        			this.labelText = this.selected.map_ids[this.selected.ids[0]].student.student_name
	        		}
	        	}
	        },
			openModal() {
				this.modalShow = true
			},
			clearSelected () {
				this.labelText = ''
                this.$emit('on-clear')
            },
			setUrl() {
				if(!this.perCheckAllClass) {
					this.data[0].url = this.myClassApi
					this.class_default_value = 'my'
				}else{
					this.data[0].url = ALLURL[0]
				}
				if(!this.perCheckAllStudent) {
					this.data[1].url = MYURL[1]
					this.data[2].url = MYURL[2]
					this.student_default_value = 'my'
				}else{
					this.data[1].url = ALLURL[1]
					this.data[2].url = ALLURL[2]
				}
			},
			setType(){
				this.type = this.allowLessonType[0]
			},
			turnStudentLesson(value) {
				if(this.student_default_value==value) return
				if(value=='my') {
					this.data[1].url = MYURL[1]
					this.data[2].url = MYURL[2]
				}else{
					this.data[1].url = ALLURL[1]
					this.data[2].url = ALLURL[2]
				}
				this.student_default_value = value
				this.refresh(this.type)
			},
			turnClass(value) {
				if(this.class_default_value==value) return
				if(value=='my') {
					this.data[0].url = this.myClassApi
				}else{
					this.data[0].url = ALLURL[0]
				}
				this.class_default_value = value
				this.refresh(this.type)
			},
			refreshAll () {
				let types = [0,1,2]
				types.forEach(t=>{
					this.refresh(t)
				})
			},
			refresh (type) {
				let url = this.data[type].url
				this.dr().refreshData(url)
				.then(data=>{
					if(type!==0){
						this.data[type].list = data.list.filter(l=>l.student!==null)
					}else{
						this.data[type].list = data.list						
					}
					this.data[type].total = data.total
					this.total = data.total
				})
			},
			search () {
				this.pagenation(1)
			},
			resetSearch () {
				this.data[0].key = ''
				this.data[1].key = ''
				this.data[2].key = ''
				this.data.lid = 0
				this.data.arrange_status = -1
				this.is_demo = 0
				this.class_type = 0
				this.pagenation(1)
			},
			pagenation(page){
	            this.pageIndex = page            
	            this.get_data_list(this.type)           
	        },
	        pagesize(pagesize){
	            this.pageSize = pagesize
	            if(this.init_page_size == 0){
	                this.init_page_size = 1
	                return
	            }
	            this.get_data_list(this.type)
	        },
	        hook_get_param (url) {
	        	let type = this.type,
	        		map_name = {0:'class_name',1:'student_name',2:'student_name'}
	        	if(!/$\s*^/.test(this.data[type].key)){
	        		url += `&${map_name[type]}=${this.data[type].key}`
	        	}
	        	if(this.data.lid > 0){
	        		url += `&lid=${this.data.lid}`
				}
				
				if(this.data.bid != '' && this.data.bid != this.bid$){
					url += `&bid=${this.data.bid}`
				}
	        	
	        	if(type == 0) {
	        		if(this.class_type > 0){
	        			url += '&class_type=[in,1,2]'
	        		}else{
	        			url +='&class_type=0'
	        		}
	        		url += `&is_demo=${this.is_demo}`
				}else{
					if(this.data.arrange_status != -1) {
						url += `&arrange_status=${this.data.arrange_status}`
					}
				}
				
	        	// url +='&with=students'
	        	return url
	        },
			get_data_list(type){
				let url = this.data[type].url
				
				url = `${url}&page=${this.pageIndex}&pagesize=${this.pageSize}`
				
				url = this.hook_get_param(url)
				
				this.dr().refreshData(url)
				.then(response=>{
					if(type!==0){
						this.data[type].list = response.list.filter(l=>l.student!==null)
						this.rewriteSelected(this.data[type].list,'sl_id')
					}else{
						this.data[type].list = response.list
						this.rewriteSelected(this.data[type].list,'cid')						
					}
					this.data[type].total = response.total
					this.total = response.total
				})
			},
			rewriteSelected(data,field) {
				data.forEach(d => {
					let index = this.selected.pks.indexOf(d[field])
					if(index > -1) {
						this.$set(d,'$selected',true)
					}else{
						this.$set(d,'$selected',false)
					}
				})
			},
			studentLessonArrangePercent(item){
				return item.arrange_hours*100/item.total_lesson_hours
			},
			studentLessonRemainPercent(item){
				return item.remain_lesson_hours*100/item.total_lesson_hours
			},
			classAttendancePercent(item){
				return item.attendance_times * 100 / item.lesson_times
			},
			classArrangePercent(item){
				return item.arrange_times * 100 / item.lesson_times
			},
			addSelectedIds (item) {
				let [type,ids,index] = [this.type,this.selected.ids,-1]
				if(type!==2){
					this.selected.map_ids = {}
					this.selected.info = item					
					this.clearSelectedId()
					
					if(type===0){
						this.selected.ids.push(item.cid)		
						this.selected.pks.push(item.cid)		
						this.selected.map_ids[item.cid] = item
					}else{
						this.selected.map_ids[item.student.sid] = item
						this.selected.ids.push(item.student.sid)
						this.selected.pks.push(item.sl_id)
					}
					
				}else{
					this.selected.info = {}
					index = ids.indexOf(item.student.sid)
					
					if(index>-1){
						this.selected.ids.splice(index,1)
						this.selected.pks.splice(index,1)
						Vue.delete(this.selected.map_ids,item.student.sid)
					}else{
						this.selected.map_ids[item.student.sid] = item
						this.selected.ids.push(item.student.sid)
						this.selected.pks.push(item.sl_id)
					}				
					
					this.checkAll = this.data[2].list.filter(l=>l.$selected).length===this.data[2].list.length					
				}
			},
			toggleSelected(item) {
				let type = this.type
				if(this.forbid_uncheck_arrange){
					if(type == 1 || type == 2){
						if(!this.isOrderCheck(item)){
							this.$Message.error('订单未审核不能选择!')
							return false
						}
					}
				}
				if(type===2){
					let sids = this.selected.ids
					
					if(sids.length>0){
						if(!this.allow_different_lesson_makeup && item.lid!==this.selected.map_ids[sids[0]].lid){
							this.$Message.error('只能选择相同课程学员')
							Vue.set(item,'$selected',false)
							return false
						}
					}					
					
					if(!item.$selected){
						Vue.set(item,'$selected',true)		
					}else{
						Vue.set(item,'$selected',false)
					}
	            }else{
                    this.data[type].list.forEach(item=>{
                        Vue.set(item,'$selected',false)
                    })
                    item.$selected = true
	            }
	            this.addSelectedIds(item)
			},
			clearSelectedId () {				
				this.selected.ids = []
				this.selected.pks = []
				this.data[2].list.forEach((item)=>{
					item.$selected = false
				})
				this.checkAll = false
			},
			cancelSelectedId(id){
	           	this.selected.info = {}
				let index = this.selected.ids.indexOf(id)
				this.selected.ids.splice(index,1)
				this.selected.pks.splice(index,1)
				Vue.delete(this.selected.map_ids,id)
				this.rewriteSelected(this.data[2].list,'sl_id')
				this.checkAll = this.data[2].list.filter(l=>l.$selected).length===this.data[2].list.length	
	        },
			handleCheckAll() {
				let checkAll = this.checkAll				
	        	this.data[2].list.forEach((item)=>{
    				if(!checkAll){
    					this.selected.ids.push(item.student.sid)
    					item.$selected = true
    					this.selected.map_ids[item.student.sid] = item
    				}else{
    					this.selected.map_ids = {}
    					this.clearSelectedId()
    				}
	        	})
	        },
	        formatSex(sex) {
				let map = {0: '未确定', 1: '男', 2: '女'}
				return map[sex]
			},
			filterList (type) {				
				let list = this.data[type].list
				return list
			},
	        cancel () {
	        	this.modalShow = false
	        	this.clearSelectedId()
	        	this.data[0].list.forEach(item=>{
                    Vue.set(item,'$selected',false)
                })
	        	this.data[1].list.forEach(item=>{
                    Vue.set(item,'$selected',false)
                })
	        },
	        ok () {
	        	if(this.selected.ids.length==0){
	        		this.$Message.error('请先选择对象')
	        		return false
	        	}
	        	if(!this.multiple && this.type == 2) {
	        		if(this.selected.ids.length>1) {
	        			this.$Message.error('请选择一个学员')
	        			return
	        		}
				}
				
				this.data[2].list.forEach((item)=>{
					if(item.$selected){
						this.selected.info.homework_task_tpl = item.homework_task_tpl
					}
				})
	        	this.$emit('on-selected',this.selected)
	        	this.initLabelText(this.type)
	        	this.modalShow = false
	        }
	        
		},
		computed: {
			toggleSearchIcon(){
				if(this.searchExpand){
					return 'chevron-up'
				}
				return 'chevron-down'
			},
			selectedTotal(){
	            return this.selected.ids.length
	        },
			classes () {
                return [
                    `${prefixCls}`,
                    {
                        [`${prefixCls}-visible`]: this.visible,
                        [`${prefixCls}-disabled`]: this.disabled,
                        [`${prefixCls}-single`]: true,
                        [`${prefixCls}-show-clear`]: this.showCloseIcon,
                        [`${prefixCls}-${this.size}`]: !!this.size
                    }
                ];
            },
			showPlaceholder() {
                let status = false;

                if (this.selected.ids.length==0&&this.labelText=='') {
                	status = true
                }

                return status;
            },
            localPlaceholder() {
            	if(this.placeholder === undefined) {
            		return '请选择'
            	} else {
            		return this.placeholder
            	}
            },
            showCloseIcon() {
            	return this.clearable && !this.showPlaceholder
            },
            style1() {
            	let style = {}
            	if(this.type == 2) {
            		style['padding-right'] = '200px'
            	}
            	return style
            },
            style2() {
            	let style = {}
            	if(this.type == 2) {
            		style['width'] = '190px'
            	}
            	return style
            },
            allowType0(){
            	if(this.definedAllowLessonType.length > 0){
            		return this.definedAllowLessonType[0] ===0
            	}
            	return this.allowLessonType.indexOf(0) !== -1
            },
            allowType1(){
            	if(this.definedAllowLessonType.length > 0){
            		return this.definedAllowLessonType[0] == 1
            	}
            	return this.allowLessonType.indexOf(1) !== -1
            },
            allowType2(){
            	if(this.definedAllowLessonType.length > 0){
            		return this.definedAllowLessonType[0] == 2
            	}
            	return this.allowLessonType.indexOf(2) !== -1
            }
		}
	}
</script>
