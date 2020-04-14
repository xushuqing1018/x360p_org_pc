<template>
	<Modal v-drag-modal v-model="modal$.show" :mask-closable="true" :width="width" :title="title" @on-cancel="closeModal">
		<div :class="classes">
    		<div class="list-main">
                <div class="list-condition">
                	<Row>
                		<Col span="5">
	                		<Input 
	                			ref="nameInput"
	                			v-model="search_field.student_name" 
	                			placeholder="姓名" 
	                			size="small" 
	                			@keyup.native.enter="search">
	            			</Input>
                		</Col>
                		<Col span="5">
	                		<Input 
	                			ref="nickInput"
	                			v-model="search_field.nick_name" 
	                			placeholder="昵称/英文名" 
	                			size="small" 
	                			@keyup.native.enter="search">
	            			</Input>
                		</Col>
                		<Col span="14">
                			<ButtonGroup>
                				<Button type="primary" icon="ios-search" @click="search" size="small">查询</Button>
                				<Button type="primary" :icon="toggleSearchIcon" size="small" @click="toggleSearch"></Button>
                			</ButtonGroup>
                            <Button type="primary" icon="refresh" @click="resetSearch" size="small">重置</Button>
                            <div class="pull-right" v-if="perCheckAllStudent">
		                        <label>权限范围：</label>
		                        <ButtonGroup>
		                            <Button type="primary" size="small" icon="android-person">我的</Button>
		                            <Button type="ghost" size="small" icon="android-people" @click="turnAllStudent">所有</Button>
		                        </ButtonGroup>
		                    </div>
                		</Col>
                	</Row>
                	<template v-if="searchExpand">
	            		<Form ref="ref_search" :model="search_field" :label-width="50" class="filter-form row mt-2">
	            			<Form-item label="班级" prop="cid" class="col-sm-6 col-md-6">
	            				<select-class ref="ref_class" v-model="search_field.cid" clearable></select-class>
	            			</Form-item>
							<Form-item label="年级" prop="school_grade" class="col-md-6 col-sm-6">
								<Select v-model="search_field.school_grade">
									<Option :value="0">不限</Option>
									<Option v-for="(item,index) in dicts('grade')" :value="item.name">{{item.title}}</Option>
								</Select>
							</Form-item>
                            <Form-item label="学校" prop="school_id" class="col-md-6 col-sm-6" v-if="isEF('school_id','student')">
					            <select-public-school v-model="search_field.school_id" clearable></select-public-school>
				            </Form-item>
	            		</Form>
	            	</template>
                </div>
                <div class="list-body">
                    <div class="list-body-wrap" v-loading.like="'students'">
                        <table class="modal-table">
                            <thead>
                                <tr>
                                    <th width="50" v-if="multiple">
                                    	<div class="ivu-table-cell">
                                    		<Checkbox v-model="checkAll" @click.native="handleCheckAll"></Checkbox>
                                    	</div>
                                    </th>
                                    <th><div class="ivu-table-cell">学员</div></th>
                                    <th><div class="ivu-table-cell">年龄</div></th>
                                    <th><div class="ivu-table-cell">年级</div></th>
                                    <th><div class="ivu-table-cell">余额</div></th>
                                    <th><div class="ivu-table-cell">学习积分</div></th>
                                    <th><div class="ivu-table-cell">剩余/总课时</div></th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr :class="{'table-info':item.$selected}" @click="toggleSelected(item)" v-for="item in data">
                                    <td v-if="multiple">
                                        <div class="ivu-table-cell"><Checkbox v-model="item.$selected"></Checkbox></div>
                                    </td>
                                    <td>
                                    	<div class="ivu-table-cell">
	                                    	<avatar-and-name 
		                                    	:src="item.photo_url" 
		                                    	:name="item.student_name" 
		                                    	:nickname="item.nick_name"
		                                    	:sex="item.sex">
	                                    	</avatar-and-name>
                                    	</div>
                                   	</td>
                                    <td><div class="ivu-table-cell">{{getAge(item.birth_time)}}</div></td>
                                    <td><div class="ivu-table-cell">{{labelDicts(item.school_grade,'grade')||'-'}}</div></td>
                                    <td><div class="ivu-table-cell">{{Number(item.money)}}</div></td>
                                    <td><div class="ivu-table-cell">{{Number(item.credit)}}</div></td>
                                    <td>
                                    	<div class="ivu-table-cell">
                                    		{{Number(item.student_lesson_remain_hours)}} / {{Number(item.student_lesson_hours)}}
                                    	</div>
                                    </td>
                                </tr>
                                <tr v-if="data.length == 0">
                                    <td colspan="5" style="text-align: center"><p class="empty">没有找到学员</p></td>
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
                            <span>{{item.student_name}}</span>
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
            <Button type="default" @click="cancel">取消</Button>
            <Button type="primary" @click="ok">确定</Button>
        </div>
	</Modal>
</template>
<script>
	import moment from 'moment'
	import util from '@/libs/util'
	import grid from '@/libs/grid.mixin'
	import modal from '@/libs/modal.mixin'
	import common from '@/libs/common.mixin'
	import directive from '@/libs/directive.mixin'
	import globals from '@/libs/globals.mixin'
	import store from '@/store'
	import AvatarAndName from 'c%/AvatarAndName.vue'
    import SelectClass from 'c%/SelectClass'
    import SelectPublicSchool from 'c%/SelectPublicSchool.vue'

	const prefixCls = 'select-list';
	const resName   = 'student'
	const idField   = 'sid'
	const textField = 'student_name'

	export default {
		name: 'MyStudentList',
		components:{
			AvatarAndName,
            SelectClass,
            SelectPublicSchool
		},
		mixins: [grid,common,directive,globals,modal],
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
				default: '选择我的学员'
			},
			multiple: {
				type: Boolean,
				default: false,
			},
			selected: {
				type: [Array, Number, String],
				default: []
			}
		},
		data() {
			return {
				rest_api: '',
				selIds: [],
				is_data_init:false,
	            search_field: {
	            	age: [0,0],
	            	school_grade: 0,
	            	bid: 0,
	            	cid: 0,
                    nick_name: '',
                    school_id: 0
	            },
	            checkAll: false
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
	        }
		},
		mounted() {
			this.search_field.bid = this.bid$
			this.rest_api = this.myStudentApi
		},
		methods: {
			turnAllStudent() {
				this.$emit('on-check','all')
				this.close()
			},
			ok(){
	            if(!this.selectedTotal){
	                this.$Message.error('没有选中任何学员')
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
	        hook_get_param (params) {
				let search_obj = util.copy(this.search_field)
				
				for(let o in search_obj) {
					let property = search_obj[o]
					if(o=='age'){
						if(property[1]>0){
							params.age_start = property[0]
							params.age_end = property[1]	
						}						
					}else if(o=='bid') {
						if(property!==this.bid$) {
							params.bid = property
						}
					}else{
						if(property&&property!=-1){
							params[o] = property
						}
					}
				}
			},
			search() {
				if(this.search_field.bid !== this.bid$) {
					if(this.search_field.student_name === '') {
						this.$Message.error('跨校区查询请输入学员姓名')
						return
					}
				}
				this.pagenation(1)
        	},
			resetSearch () {
				this.search_field.age = [0,0]
				this.search_field.school_grade = 0
				this.search_field.bid = this.bid$
				this.search_field.student_name = ''
				this.search_field.nick_name = ''
                this.search_field.cid = 0
                this.search_field.school_id = 0
				this.search()
			},
			toggleBranch(id) {
				this.pageIndex = 1
            	this.pageSize = 10
				this.search_field.bid = id
			}
		},
		watch: {

	         'modal$.show': function (val){
	        	if(val){
	                this.init_data_cache()
	            }else{
	                if(this.search_field.student_name != ''){
	                    this.search_field.student_name = ''
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
	                this.selIds = id
	                this.refreshData(this.data)
	            }else{
	                if(this.selIds.length == 0){
	                    this.selIds.push(id)
	                }else{
	                    this.selIds.splice(0,1,id)
	                }
	            }
	        }
		}
	}
</script>