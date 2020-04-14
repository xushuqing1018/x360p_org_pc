<template>
	<Modal v-drag-modal v-model="modal$.show" :mask-closable="false" :width="width" :title="modal$.title" @on-cancel="cancel">	
		<div :class="classes">
    		<div class="list-main" v-if="step===0">
                <div class="list-condition">
                	<Row>
                		<Col span="8">
                			<Input v-model="search_field.class_name" placeholder="班级名称" size="small" v-focusme="'searchkey'"></Input>
                		</Col>
                		<Col span="10">
                			<ButtonGroup>
                				<Button type="primary" icon="ios-search" @click="search" size="small">查询</Button>
                			</ButtonGroup>
                            <Button type="primary" icon="refresh" @click="resetSearch" size="small">重置</Button>
                		</Col>
                	</Row>
                </div>
                <div class="list-body">
                    <div class="list-body-wrap" v-loading.like="'classes'">
                        <table class="table-list">
                            <thead>
                                <tr>                                 
                                    <th><div class="ivu-table-cell">班级名称</div></th>
                                    <th><div class="ivu-table-cell">所属课程</div></th>
                                    <th><div class="ivu-table-cell">人数(实际/预招)</div></th>
                                    <th><div class="ivu-table-cell">{{'老师'|translate}}</div></th>
                                    <th><div class="ivu-table-cell">{{'学管师'|translate}}</div></th>
                                    <th><div class="ivu-table-cell">上课进度</div></th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr :class="{'table-info':item.$selected}" @click="toggleSelected(item)" v-for="item in filter_data">                                   
                                    <td><div class="ivu-table-cell">{{item.class_name}}</div></td>
                                    <td><div class="ivu-table-cell">{{item.lid|lesson_name}}</div></td>
                                    <td><div class="ivu-table-cell">{{item.student_nums}}/{{item.plan_student_nums}}</div></td>
                                    <td><div class="ivu-table-cell">{{item.teach_eid|employee_name}}</div></td>
                                    <td><div class="ivu-table-cell">{{item.edu_eid|employee_name}}</div></td>
                                    <td><div class="ivu-table-cell">{{item.attendance_times}}/{{item.lesson_times}}</div></td>
                                </tr>
                                <tr v-if="filter_data.length == 0">
                                    <td colspan="5">                                    	
                                    	<div class="ivu-table-cell text-center">
                                    		{{data.length>0?'未找到符合班级~':'无数据~'}}
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
    		<arrange-list :cid="active_item.cid" @on-select="onSelect" v-if="step===1"></arrange-list>
    	</div>
        <div slot="footer">
            <span class="pull-left">已选择：{{labelText}}</span>
            <span class="pull-left ml-3" v-if="arrange&&arrange.int_start_hour">时段：{{arrange.int_start_hour|int_hour}} -- {{arrange.int_end_hour|int_hour}}</span>
            <Button type="primary" @click="pre_step" :disabled="pre_disabled" v-if="step>0">上一步</Button>
            <Button type="primary" @click="next_step" :disabled="next_disabled" v-if="step<1">下一步</Button>
            <Button type="primary" @click="ok" v-if="step==1">确定</Button>
        </div>
	</Modal>
</template>

<script>
	import { _ } from '@/libs/util'
	import store from '@/store'
	import moment from 'moment'	
	import common from '@/libs/common.mixin'
	import grid from '@/libs/grid.mixin'
	import modal from '@/libs/modal.mixin'
	import globals from '@/libs/globals.mixin'
	import directive from '@/libs/directive.mixin'
	import arrangeList from './arranges.vue'	

	const prefixCls = 'select-list';
	const resName   = 'classes'
	const idField   = 'cid'
	const textField = 'class_name'

	export default {
		name: 'FollowClass',
		mixins: [grid,directive,modal,globals,common],
		components: {
			arrangeList
		},
		props: {
			width: {
				type: String,
				default: ''
			},
			lid: {
				type: [Number,String],
				default: ()=>{
					return 0
				}
			},
			title: {
				type: String,
				default: '选择试听班级'
			},
		},
		data() {
			return {
				rest_api: 'classes',
				modalShow: false,
				selIds: [],
				is_data_init:false,
				active_item: {},
				arrange: {},
	            params:{
	                search_field:textField
	            },
	            checkAll: false,
	            step: 0,
	            search_field: {
	            	class_name: ''
	            }       
			}
		},
		computed: {
			filter_data () {			
				return this.data
			},
			next_disabled () {
				return this.selIds.length===0
			},
			pre_disabled () {
				return this.step===0				
			},
			classes () {
	            return [
	                `${prefixCls} ${prefixCls}-single`	               
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
		},		
		methods: {		
			onSelect (item) {
				this.arrange = item
			},
			pre_step () {
				this.arrange = {}
				this.step = this.step - 1			
			},
			next_step () {
				if(this.step == 0){
                    this.step = this.step + 1;
               } 
			},
			ok(){				
	            if(_.isEmpty(this.arrange)) {
	            	this.$Message.error('没有选中任何排课')
	                return
	            }
	           
                this.$emit('on-select',this.arrange)	          
	            this.close()
	        },
	        cancel(){
	            this.close()	           
            	this.selIds = []
            	this.step = 0
            	this.arrange = {}
            	this.refreshData(this.data)
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
	            }
	            return data.list
	        },
	        hook_get_param (params) {
	        	// is_attendance是什么
	        	params.is_attendance = 0
	        	params.status = '[In,0,1]'
	        	params.is_demo = 0
	        	params.class_type = 0
	        	if(this.lid>0){
	        		params.lid = this.lid
	        	}
	        	if(this.search_field.class_name !== '') {
	        		params.class_name = this.search_field.class_name
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
			},
			replaceSelectedId(id){
	           if(this.selIds.length == 0){
	                this.selIds.push(id)
	            }else{
	                this.selIds.splice(0,1,id)
	            }
	        },
			toggleSelected(item) {
                if(item.$selected){
                	item.$selected = false
                    this.active_item = {}
                }else{
                	this.active_item = item
                    this.data.forEach(item=>{
                        item.$selected = false
                    })
                    item.$selected = true
                    this.replaceSelectedId(item[idField])
                }	            
			},
	        init_data_cache(){
	            if(!this.is_data_init){
	                this.init_data()
	                this.is_data_init = true
	            }
	        },
	        resetSearch() {
	        	this.search_field.class_name = ''
	        	this.init_data()
	        }       
		},
		watch: {
			'modal$.show' (val) {
	            if(val){
	                this.init_data_cache()
	            }else{
	                if(this.search_field.class_name != ''){
	                    this.search_field.class_name = ''
	                    this.is_data_init = false
	                }
	            }
	        },
	        '$store.state.branch.id': {
	            handler: function(bid, old_bid) {
	            	this.pageIndex = 1
	            	this.pageSize = 10
	                this.init_data()
	            }
	        }
		}
	}
</script>