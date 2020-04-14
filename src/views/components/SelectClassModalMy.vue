<template>
	<Modal v-drag-modal v-model="modal$.show" :mask-closable="false" :width="width" :title="title">
		<div :class="classes">
    		<div class="list-main">
                <div class="list-condition">
                	<Row>
                		<Col span="6">
                			<Input 
	                			v-model="search_field.class_name" 
	                			placeholder="班级" 
	                			size="small" 
	                			icon="ios-search" 
	                			v-focusme="'searchkey'"
	                			@keyup.native.enter="search">
                			</Input>
                		</Col>
                		<Col span="18">                			
                			<ButtonGroup>
                				<Button type="primary" icon="ios-search" @click="search" size="small">查询</Button>
                				<Button type="primary" :icon="toggleSearchIcon" @click="toggleSearch" size="small"></Button>
                			</ButtonGroup>
                            <Button type="primary" icon="refresh" @click="resetSearch" size="small">重置</Button>
                            <Checkbox 
		                		class="mr-0" 
		                		v-model="search_field.class_type" 
		                		:disabled="disabledTemp" 
		                		:true-value="1" 
		                		:false-value="0">临时班
		                	</Checkbox>
		                	<span class="mr-0">|</span>
		                	<Checkbox 
		                		v-model="search_field.is_demo"
		                		:disabled="isDemoExtra===1" 
		                		:true-value="1" 
		                		:false-value="0">体验班
		                	</Checkbox>
                            <div class="pull-right" v-if="perCheckAllClass">
		                        <label>权限范围：</label>
		                        <ButtonGroup>
		                            <Button type="primary" size="small" icon="android-person">我的</Button>
		                            <Button type="ghost" size="small" icon="android-people" @click="turnAllClass">所有</Button>
		                        </ButtonGroup>
		                    </div>
                		</Col>
                	</Row>
                	<div class="mt-1" v-if="searchExpand">
            			<select-lesson
            				v-model="search_field.lid"
            				clearable
            				size="small"
            				style="width:200px;display: inline-block;"
            				placeholder="课程">
            			</select-lesson>
                	</div>
                </div>
                <div class="list-body">
                    <div class="list-body-wrap" v-loading.like="'classes'">
                        <table class="table-list">
                            <thead>
                                <tr>
                                    <th width="50" v-if="multiple">
                                    	<div class="ivu-table-cell"><Checkbox v-model="checkAll" @click.native="handleCheckAll"></Checkbox></div>
                                    </th>
                                    <th><div class="ivu-table-cell">班级&课程&满班率</div></th>
									<th><div class="ivu-table-cell">{{'老师'|translate}}&科目</div></th>
                                    <th width="25%"><div class="ivu-table-cell">上课日期</div></th>
                                    <th><div class="ivu-table-cell">校区</div></th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr :class="{'table-info':item.$selected}" @click="toggleSelected(item)" v-for="item in data">
                                    <td v-if="multiple">
                                        <div class="ivu-table-cell"><Checkbox v-model="item.$selected"></Checkbox></div>
                                    </td>
                                    <td><div class="ivu-table-cell">
                                    	<h6>{{item.class_name}}</h6>
                                    	<p class="short_name">{{item.lid|lesson_name}}</p>
                                    	<p class="short_name">
                                    		<Progress :percent="item.student_nums/item.plan_student_nums*100" :stroke-width="5">
                                    			<span>{{item.student_nums+'/'+item.plan_student_nums}}</span>
                                    		</Progress>
                                    	</p>
                                	</div></td>
                                    <td><div class="ivu-table-cell">
                                    	<h6>{{item.teach_eid|employee_name}}</h6>
	                                    <p class="short_name">{{item.sj_id|subject_name}}（级别{{item.subject_grade||'无'}}）</p>
	                                </div></td>
                                    <td>
                                    	<div class="ivu-table-cell">
                                    	<template v-if="item.schedules&&item.schedules.length>0">	                                    	
                                    		<p v-for="(s,sIndex) in orderBy(item.schedules,'week_day')">
                                    			<template v-if="sIndex>0">
                                    				<label style="width:30px;">
                                    					<span v-if="orderBy(item.schedules,'week_day')[sIndex].week_day!==orderBy(item.schedules,'week_day')[sIndex-1].week_day">
                                    						{{s.week_day|week_day_text}} 
                                    					</span>
                                    				</label>
                                    			</template>
                                    			<label style="width:30px;"v-else>
                                    				{{s.week_day|week_day_text}}	
                                    			</label>
                                    			{{s.int_start_hour}}~{{s.int_end_hour}}</p>
                                    	</template>                                    	
                                    	<p v-else>暂无上课时段~</p>
                                    	</div>
                                    </td>
                                    <td><div class="ivu-table-cell">{{item.bid|branch_name}}</div></td>
                                </tr>
                                <tr v-if="data.length == 0">
                                    <td colspan="5" style="text-align: center"><p class="empty">{{notFoundText}}</p></td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    <div class="list-page clearfix">
                        <Page 
	                        class="pull-right" 
	                        size="small" 
	                        :total="total" 
	                        :show-total="true" 
	                        :current="pageIndex" 
	                        :show-sizer="true" 
	                        :page-size="pageSize" 
	                        @on-change="pagenation" 
	                        @on-page-size-change="pagesize">
                        </Page>
                    </div>
                    
                </div>
            </div>
            <div class="multi-selected" v-if="this.multiple">
                <Card>
                    <div slot="title">
                        <span>已选择：<span class="badge">{{selectedTotal}}</span></span>
                        <Button 
	                        @click="clearSelectedId" 
	                        class="pull-right" 
	                        type="ghost" 
	                        shape="circle" 
	                        size="small" 
	                        icon="trash-a" 
	                        title="清空">
                        </Button>
                    </div>
                    <ul class="multi-selected-list">
                        <li v-for="item in selectedList">
                            <span>{{item.class_name}}</span>
                            <Button 
	                            @click="cancelSelectedId(item)" 
	                            class="pull-right" 
	                            type="ghost" 
	                            shape="circle" 
	                            size="small" 
	                            icon="trash-a" 
	                            title="移除">
                            </Button>
                        </li>
                    </ul>
                </Card>
            </div>
    	</div>
        <div slot="footer">
            <span class="footer-selected pull-left" v-if="!multiple"><i>已选择:</i>{{labelText}}</span>
            <Button type="default" @click="close">取消</Button>
            <Button type="primary" @click="ok">确定</Button>
        </div>
	</Modal>
</template>
<script>
	import moment from 'moment'
	import util,{_} from '@/libs/util'
	import common from '@/libs/common.mixin'
	import grid from '@/libs/grid.mixin'
	import modal from '@/libs/modal.mixin'
	import directive from '@/libs/directive.mixin'
	import globals from '@/libs/globals.mixin'
	import store from '@/store'
	import selectEmployee from 'c%/SelectEmployee.vue'
	import SelectLesson from 'c%/SelectLesson.vue'

	const prefixCls = 'select-list';
	const resName   = 'class'
	const idField   = 'cid'
	const textField = 'class_name'

	export default {
		name: 'MyClassList',
		mixins: [grid,modal,directive,globals,common],
		components: {
			selectEmployee,
			SelectLesson
		},		
		props: {
			value: {
				type: Boolean,
				default: false
			},			
			width: {
				type: String,
				default: ''
			},
			title: {
				type: String,
				default: '选择我的班级'
			},
			multiple: {
				type: Boolean,
				default: false,
			},
			selected: {
				type: [Array, Number, String],
				default(){
					return []
				}
			},
			notFoundText: {
				type: String,
				default:''
			},
			url: {
				type: String,
				default: ''
			},
			disabledTemp:{
				type: Boolean,
				default: false
			},
			isDemoExtra:{
				type: Number,
				default: 0
			}
		},
		data() {
			return {
				rest_api: '',
				selIds: [],
				is_data_init:false,
				search_field: {
					week_day: '',
					teach_eid: 0,
					class_name: '',
					lid: 0,
					class_type: 0,
					is_demo: this.isDemoExtra
				},	            
	            checkAll: false,
	            mySearchKey: '',
	            weekDay: [
	            	{label:'周一',value: 1},
	            	{label:'周二',value: 2},
	            	{label:'周三',value: 3},
	            	{label:'周四',value: 4},
	            	{label:'周五',value: 5},
	            	{label:'周六',value: 6},
	            	{label:'周日',value: 7}
	            ]
			}
		},
		computed: {
			classes () {
	            return [
	                `${prefixCls}`,
	                {
	                    [`${prefixCls}-multiple`]: this.multiple,
	                    [`${prefixCls}-single`]: !this.multiple
	                }
	            ];
	        },
	        labelText() {
	        	if(this.selIds.length > 0) {
	        		return this.$store.getters.getMapText(this.selIds[0], resName)
	        	}
	        },
	        selectedTotal(){
	            return this.selIds.length 
	        },
	        selectedList(){
	            let list = []
	            this.selIds.forEach(id=>{
	                if(id > 0){
	                    list.push(this.$store.getters.getMapObject(id, resName))
	                }
	            })
	            return list
	        },
	        fromUp() {
	        	return this.url.indexOf('subject_grade') > -1
	        },
            filterData() {
        		let filter_condition = item => item.class_name.indexOf(this.mySearchKey) > -1
        		if(!/^\s*$/.test(this.mySearchKey)) {
        			return this.data.filter(filter_condition)
        		}else{
        			return this.data
        		}
            }
		},
		methods: {
			turnAllClass() {
				this.$emit('on-check','all')
				this.close()
			},
			hook_get_param (params) {				
				if(this.search_field.week_day > 0){
					params.week_day = this.search_field.week_day 
				}
				if(!/$\s*^/.test(this.search_field.class_name)){
					params.class_name = this.search_field.class_name 
				}
				if(this.search_field.teach_eid > 0){
					params.teach_eid = this.search_field.teach_eid 
				}
				if(this.search_field.lid > 0){
					params.lid = this.search_field.lid 
				}			
				if(this.search_field.class_type==1) {
					params.class_type = '[GT,0]'
				}
				else {
					params.class_type = 0
				}
				params.is_demo = this.search_field.is_demo
				// params.with = 'lesson'
			},
			search () {
				this.pagenation(1)
			},
			resetSearch () {
				this.search_field.week_day = ''
				this.search_field.teach_eid = 0				
				this.search_field.class_name = ''
				this.search_field.lid = 0
				this.searchExpand = false
				this.search()
			},
			getWeekDays (data) {
				let result = []
				
				data.forEach(d=>{
					if(result.indexOf(d.week_day)===-1){
						result.push(d.week_day)
					}
				})
				return result
			},
			ok(){
	            if(!this.selectedTotal){
	                this.$Message.error('没有选中任何班级')
	                return
	            }
	            if(this.multiple){
	                this.$emit('on-select',this.selectedList)
	            }else{
	                let row = this.$store.getters.getMapObject(this.selIds[0],resName)
	                this.$emit('on-select',row)
	            }
	            this.$emit('input',false);
	            this.close()
	        },
	        cancel(){
	            if(this.multiple) {
		            this.selIds = []
	            	this.selected.forEach((item) => {
	            		this.selIds.push(item)
	            	})
	            	this.refreshData(this.data)
	            }else{
	            	this.selIds = []
	            	this.selIds.push(this.selected)
	            	this.refreshData(this.data)
	            }
	            this.$emit('input',false);
	            this.close()
	        },
	        closeModal() {
	        	this.cancel()
	        },
	        clearSelectedId(){
	            this.selIds.splice(0,this.selIds.length)
	            this.refreshData(this.data)
	        },
	        cancelSelectedId(item){
	            let index = this.selIds.indexOf(item[idField])
	            if(index !== -1){
	                this.selIds.splice(index,1)
	                this.refreshData(this.data)
	            }
	        },
	        deal_data(data){
	            if(data.list.length > 0){
	                this.$store.commit('buildIdTextMap',{
	                   list:data.list,
	                   name:resName,
	                   ifield:idField,
	                   tfield:textField
	                })
	                //this.refreshData()
	                this.refreshData(data.list)
	            }else{
	            	if(this.multiple && this.checkAll) {
	            		this.checkAll = false
	            	}
	            }
	            return data.list
	        },
	        checkSelectAll(item, index, arr) {
	        	if(this.selIds.indexOf(item[idField]) !== -1) {
	        		return true
	        	} else {
	        		return false
	        	}
	        },
			refreshData(data) {
				data.forEach((item) => {
					if(this.selIds.indexOf(item[idField]) !== -1) {
						item.$selected = true
					} else {
						item.$selected = false
					}
				})
				if(this.multiple) {
					this.checkAll = data.every(this.checkSelectAll)
				}
			},
			addSelectedId(id) {
				if(this.selIds.indexOf(id) === -1) {
					this.selIds.push(id)
					this.refreshData(this.data)
				}
			},
			removeSelectedId(id) {
				let index = this.selIds.indexOf(id)
	            if(index !== -1){
	                this.selIds.splice(index,1)
	                this.refreshData(this.data)
	            }
			},
			replaceSelectedId(id){
	           if(this.selIds.length == 0){
	                this.selIds.push(id)
	            }else{
	                this.selIds.splice(0,1,id)
	            }
	        },
			toggleSelected(item) {
				if(this.multiple){
	                if(!item.$selected){
	                    this.addSelectedId(item[idField])
	                }else{
	                    this.removeSelectedId(item[idField])
	                }
	            }else{
	                if(item.$selected){
	                    this.ok()
	                }else{
	                    this.data.forEach(item=>{
	                        item.$selected = false
	                    })
	                    item.$selected = true
	                    this.replaceSelectedId(item[idField])
	                }
	            }
			},
	        init_data_cache(){
	            if(!this.is_data_init){
	                this.init_data()
	                this.is_data_init = true
	            }
	        },
	        handleCheckAll() {
	        	this.data.forEach((item)=>{
	        		let index = this.selIds.indexOf(item[idField])
	        		if(this.checkAll === false) {
	        			if(index == -1) {
		        			this.selIds.push(item[idField])
		        			item.$selected = true
		        		}
	        		} else {
	        			if(index > -1) {
	        				this.selIds.splice(index,1)
	        				item.$selected = false
	        			}
	        		}
	        	})
	        },
	        readOnly(val,field) {
	            let arr = this.search_field[field]
	            if(arr.length===1 && arr[0]===val) {
	                return true
	            }
	            return false
	        }
		},
		watch: {
			'modal$.show': function (val) {
				if(this.url.indexOf('search')>-1) {
					this.rest_api = this.myClassApi
				}else{
					this.rest_api = this.url
				}
	            if(val){
	                this.init_data_cache()
	            }else{
	                if(this.search_field.class_name != ''){
	                    this.search_field.class_name = ''
	                    this.is_data_init = false
	                }
	            }
	        },
	        selected(id){
	        	if(id.length === 0 || id === '' || id === 0) {
	        		this.selIds = []
	        		this.refreshData(this.data)
	        	}
	            if(this.multiple){
	                id.forEach(_id=>{
	                    if(this.selIds.indexOf(_id) == -1){
	                        this.selIds.push(_id)
	                    }
	                })
	            }else{
	                if(this.selIds.length == 0){
	                    this.selIds.push(id)
	                }else{
	                    this.selIds.splice(0,1,id)
	                }
	            }
	        },
	        '$store.state.branch.id': {
	            handler: function(bid, old_bid) {
	            	this.pageIndex = 1
	                this.init_data()
	            }
	        },
	        isDemoExtra(v) {
	        	// console.log(v)
	        	this.search_field.is_demo = v
	        }
		}
	}
</script>