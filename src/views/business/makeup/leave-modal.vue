<template>
	<Modal v-drag-modal v-model="modal$.show" :mask-closable="false" width="900" :title="modal$.title" @on-cancel="cancel">
		<div :class="classes" v-if="modal$.show">
    		<div class="list-main">
                <div class="list-condition">                	
                	<Row>
                		<Col span="8">
                			<Input 
                				v-model="search_field.student_name" 
                				placeholder="姓名" 
                				size="small" 
                				icon="ios-search">
                			</Input>
                		</Col>
                		<Col span="16">                			
                			<ButtonGroup>
                				<Button type="primary" icon="ios-search" @click="search" size="small">查询</Button>
                				<Button type="primary" :icon="toggleSearchIcon" @click="toggleSearch" size="small"></Button>
                			</ButtonGroup>
                            <Button type="primary" icon="refresh" @click="resetSearch" size="small">重置</Button>                            
                		</Col>
                	</Row>
                	<Form :label-width="50" class="row mt-1" :model="search_field" label-position="left" ref="form" v-show="searchExpand">
                		<Form-item label="日期：" class="col-sm-4 mb-2" prop="int_day">
                			<date-range-picker 
                				v-model="search_field.int_day" 
                				@on-change="init_data" 
                				label="选择日期" 	
                				placement="bottom" 
                				size="small"
                				style="width:100%">                				
                			</date-range-picker>
                		</Form-item>
                		<Form-item label="班级：" class="col-sm-4 mb-2" prop="cid">
                			<select-class v-model="search_field.cid" size="small" placeholder="请选择班级"></select-class>
                		</Form-item>
                		<Form-item label="科目：" class="col-sm-4 mb-2" prop="sj_id">
                			<Select v-model="search_field.sj_id" size="small">
		    					<Option :value="0">全部(科目)</Option>
		    					<Option :value="item.sj_id" v-for="item in filter_subjects">{{item.subject_name}}</Option>
		    				</Select>
                		</Form-item>
                	</Form>
                </div>
                <div class="list-body">
                    <div class="list-body-wrap" v-loading.like="'student_leaves'">
                        <table class="x-modal-table modal-table">
                            <thead>
                                <tr>
                                    <th width="50" v-if="multiple"  @click="handleCheckAll">
                                    	<div class="ivu-table-cell">
                                    		<Checkbox v-model="checkAll"></Checkbox>
                                    	</div> 
                                    </th>
                                    <th><div class="ivu-table-cell">姓名</div></th>
                                    <th><div class="ivu-table-cell">课程/班级</div></th>                                    
                                    <th><div class="ivu-table-cell">上课{{'老师'|translate}}</div></th>
                                    <th><div class="ivu-table-cell">请假时间</div></th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr :class="{'table-info':item.$selected}" @click="toggleSelected(item)" v-for="item in data">
                                    <td v-if="multiple">
                                        <div class="ivu-table-cell"><Checkbox v-model="item.$selected" readonly></Checkbox></div>
                                    </td>
                                    <td>
                                    	<div class="ivu-table-cell">
                                    		<avatar-and-name 
                                    			:src="item.student.photo_url" 
                                    			:name="item.student.student_name"
                                    			:sex="item.student.sex" 
                                    			:nickname="item.student.nick_name">
                                    		</avatar-and-name>
                                    	</div>
                                    </td>
                                    <td><div class="ivu-table-cell">{{item.cid>0?item.one_class.class_name:$filter('lesson_name')(item.lid)}}</div></td>
                                    <td>
                                    	<div class="ivu-table-cell">
                                    		<span v-if="item.course_arrange">
                                    			{{item.course_arrange.teach_eid|employee_name}}
                                    		</span>
                                    		<span v-else>-</span>
                                    	</div>
                                    </td>
                                    <td><div class="ivu-table-cell">{{item.int_day|int_date}} {{item.int_start_hour|int_hour}}</div></td>
                                </tr>
                                <tr v-if="data.length == 0">
                                    <td colspan="5">                                    	
                                    	<div class="ivu-table-cell text-center">
                                    		{{data.length>0?'未找到符合学员~':'无数据~'}}
                                    	</div>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    <div class="list-page clearfix">
                        <Page class="pull-right" size="small" :total="total" :show-total="true" :current="pageIndex" :show-sizer="true" :page-size="pageSize" @on-change="pagenation" @on-page-size-change="pagesize"></Page>
                    </div>
                    
                </div>
            </div>
            <div class="multi-selected" v-if="this.multiple">
                <Card>
                    <div slot="title">
                        <span>已选择：<span class="badge">{{selectedTotal}}</span></span>
                        <Button @click="clearSelectedId" class="pull-right" type="ghost" shape="circle" size="small" icon="trash-a" title="清空"></Button>
                    </div>
                    <ul class="multi-selected-list">
                        <li v-for="item in selectedList">
                            <span>{{item.student.student_name}}</span>
                            <Button @click="cancelSelectedId(item)" class="pull-right" type="ghost" shape="circle" size="small" icon="trash-a" title="移除"></Button>
                        </li>
                    </ul>
                </Card>
            </div>
    	</div>
        <div slot="footer">
            <Button type="default" @click="cancel">取消</Button>
            <Button type="primary" @click="ok" :loading="saving">确定</Button>
        </div>
	</Modal>
</template>
<script>
	import {_} from '@/libs/util'
	import util from '@/libs/util'
	import makeup from './makeup.mixin'
	import grid from '@/libs/grid.mixin'
	import modal from '@/libs/modal.mixin'
	import common from '@/libs/common.mixin'
	import globals from '@/libs/globals.mixin'
	
	import SelectClass from 'c%/SelectClass.vue'	
	import SelectStudent from 'c%/SelectStudent.vue'
	import dateRangePicker from 'c%/DateRangePicker.vue'

	const prefixCls = 'select-list'
	const resName   = 'student_leave'
	const idField   = 'slv_id'
	const textField = 'student'

	export default {
		name: 'StudentLeave',
		mixins: [grid,modal,common,globals,makeup],
		components: {
			SelectClass,
			SelectStudent,
			dateRangePicker
		},
		props: {
			value: {
				type: [Array],
				default: ()=>{
					return []
				}
			},
			saIds: {
				type: [Array],
				default: ()=>{
					return []
				}
			},
			sids: {
				type: Array,
				default: ()=>{
					return []
				}
			},
			lid: {
				type: [Number,String],
				default: ()=>{
					return 0
				}
			},
			multiple: {
				type: Boolean,
				default: true,
			},
		},
		data() {
			return {
				rest_api: 'student_leaves',
				modalShow: false,
				selIds: [],
				is_data_init:false,
				search_value: '',
				search_field: {
					sid: 0,
					cid: 0,
					sj_id: 0,
					int_day: [],
					student_name: ''
				},
				currentLid: 0, 
	            checkAll: false,
	            resName: resName,
				idField: idField,
				textField: textField
			}
		},
		watch: {
			'modal$.show': function (val) {
				if(val) {
					this.init_data()
				}
			}
		},
		mounted () {
			
		},
		methods: {
			hook_get_param (params) {
				params.with = 'student,one_class'
				let search_obj = util.copy(this.search_field)
				params.ma_id = 0
				for(let o in search_obj) {
					let property = search_obj[o]
					if(o=='int_day'){
						if(property!=','&&property.length>0){
							params[o] = util.sprintf('[Between,%s]',property.join(','))
						}												
					}else{
						if(property&&property!=-1){
							params[o] = property	
						}		
					}									
				}
			},
		}
	}
</script>