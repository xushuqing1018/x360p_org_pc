<template>
	<Modal v-drag-modal v-model="modal$.show" :mask-closable="false" :width="width" :title="title" @on-cancel="closeModal">
		<div :class="classes">
    		<div class="list-main">
                <div class="list-condition">
                	<!-- <Row>
                		<Col span="8">
                		<Input 
                			ref="nameInput"
                			v-model="search_field.name_and_card" 
                			placeholder="请输入姓名或卡号" 
                			size="small" 
                			icon="ios-search" 
                			@keyup.native.enter="search">
            			</Input>
                		</Col>
                		<Col span="16">
                			<ButtonGroup>
                				<Button type="primary" icon="ios-search" @click="search" size="small">查询</Button>
                				<Button type="primary" :icon="toggleSearchIcon" size="small" @click="toggleSearch"></Button>
                			</ButtonGroup>
                            <Button type="primary" icon="refresh" @click="resetSearch" size="small">重置</Button>
                            <div class="pull-right" v-if="perCheckAllStudent">
		                        <label>权限范围：</label>
		                        <ButtonGroup>
		                            <Button type="ghost" size="small" icon="android-person" @click="turnMyStudent">我的</Button>
		                            <Button type="primary" size="small" icon="android-people">所有</Button>
		                        </ButtonGroup>
		                    </div>
                		</Col>
                	</Row> -->
                	<!-- <template v-if="searchExpand">             	
	            		<Form ref="ref_search" :model="search_field" :label-width="50" class="filter-form row mt-2">
							<Form-item label="班级" prop="cid" class="col-md-6 col-sm-6">
								<select-class ref="ref_class" v-model="search_field.cid" clearable></select-class>
							</Form-item> 
							<Form-item label="分配学管师" prop="is_assign" :label-width="100" class="col-md-6 col-sm-6">
								<Select v-model="search_field.is_assign">
									<Option :value="-1">不限</Option>
									<Option :value="1">已分配</Option>
									<Option :value="0">未分配</Option>
								</Select>
							</Form-item>
							<Form-item label="年级" prop="school_grade" class="col-md-6 col-sm-6">
								<Select v-model="search_field.school_grade">
									<Option :value="0">不限</Option>
									<Option v-for="(item,index) in dicts('grade')" :value="item.name">{{item.title}}</Option>
								</Select>
							</Form-item>
							<Form-item label="校区" prop="bid" class="col-md-6 col-sm-6">
								<Select v-model="search_field.bid">
									<Option v-for="(item,index) in branchs" :value="item.bid">{{item.short_name||item.branch_name}}</Option>
								</Select>
							</Form-item>
							<Form-item label="年龄" prop="age" class="col-md-6 col-sm-6">
								<select-age v-model="search_field.age"></select-age>
							</Form-item>
	            		</Form>
            		</template> -->
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
		                                    	:src="item.student.photo_url" 
		                                    	:name="item.student.student_name" 
		                                    	:nickname="item.student.nick_name"
		                                    	:sex="item.student.sex"
		                                    	>
	                                    	</avatar-and-name>
                                    	</div>
                                   	</td>
                                    <td><div class="ivu-table-cell">{{getAge(item.student.birth_time)}}</div></td>
                                    <td><div class="ivu-table-cell">{{labelDicts(item.student.school_grade,'grade')||'-'}}</div></td>
                                    <td><div class="ivu-table-cell">{{Number(item.student.money)}}</div></td>
                                    <td>
                                    	<div class="ivu-table-cell">
                                    		{{Number(item.student.student_lesson_remain_hours)}} / {{Number(item.student.student_lesson_hours)}}
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
            <span class="footer-selected pull-left" v-if="!multiple"><i>已选择:</i>{{labelText}}</span>
            <Button type="default" @click="cancel">取消</Button>
            <Button type="primary" @click="ok">确定</Button>
        </div>
	</Modal>
</template>
<script>
	import util from '@/libs/util'
	import grid from '@/libs/grid.mixin'
	import modal from '@/libs/modal.mixin'
	import common from '@/libs/common.mixin'
	import directive from '@/libs/directive.mixin'
	import globals from '@/libs/globals.mixin'
	import AvatarAndName from 'c%/AvatarAndName.vue'

	const prefixCls = 'select-list';
	const resName   = 'student'
	const idField   = 'sid'
	const textField = 'student_name'

	export default {
		name: 'ClassStudentList',
		components:{
			AvatarAndName
		},
		mixins: [grid,common,directive,globals,modal],
		props: {
			value: {
				type: Boolean,
				default: false
			},
			cid: {
				type: Number,
				default: 0
			},
			width: {
				type: String,
				default: ''
			},
			title: {
				type: String,
				default: '选择班级学员'
			},
			multiple: {
				type: Boolean,
				default: false,
			},
			selected: {
				type: [Array, Number, String],
				default: () => {
					return [];
				}
			},
		},
		data() {
			return {
				rest_api: 'class_students',
				selIds: [],
				is_data_init:false,
	            search_field: {
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
		},
		methods: {
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
	            this.$emit('input',false)
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
				var deal_list = [];
				data.list.forEach(item => {
					var deal_item = util.copy(item);
					Object.assign(deal_item,item.student);
					deal_list.push(deal_item);
				})
	            if(data.list.length > 0){
	                this.$store.commit('buildIdTextMap',{
	                   list:deal_list,
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
				
				params.cid = this.cid
				params.with = 'student'

				for(let o in search_obj) {
					let property = search_obj[o]
					if(property&&property!=-1){
						params[o] = property
					}
				}
			},
			search() {
				this.pagenation(1)
        	},
			resetSearch () {
				this.search()
			},
			toggleBranch(id) {
				this.pageIndex = 1
            	this.pageSize = 10
				this.search_field.bid = id
			},
			updateSelected (id) {
				if(id.length === 0 || id === '' || id === 0) {
	        		this.selIds = []
	        		this.refreshData(this.data)
	        	}
	            if(this.multiple){
//	                id.forEach(_id=>{
//	                    if(this.selIds.indexOf(_id) == -1){
//	                        this.selIds.push(_id)
//	                    }
//	                })
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
		},
		watch: {
	        'modal$.show': function (val){
	        	if(val){
	                this.init_data_cache()
	                this.$nextTick(()=>{
	                	if(this.$refs.nameInput){	                		
		                	this.$refs.nameInput.focus()	                	
	                	}
	                })
	            }
	            this.updateSelected(this.selected)
	        },
	        selected(id){
	        	this.updateSelected(id)
	        }
		}
	}
</script>