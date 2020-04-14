<template>
	<Modal v-drag-modal v-model="modalShow" :mask-closable="true" :width="width" :title="title" @on-cancel="closeModal">
		<div :class="classes">
    		<div class="list-main">
                <div class="list-condition">
                	<Row>
                		<Col span="8">
                			<Input v-model="search_field.student_name" placeholder="姓名" size="small" v-focusme="'searchkey'"></Input>
                		</Col>
                		<Col span="10">
                			<ButtonGroup class="m-l">
                				<Button type="primary" icon="ios-search" @click="search" size="small">查询</Button>
								<Button type="primary" :icon="toggleSearchIcon" size="small" @click="toggleSearch"></Button>
                			</ButtonGroup>
                            <Button type="primary" icon="refresh" @click="resetSearch" size="small">重置</Button>
                		</Col>
                	</Row>
					<template v-if="searchExpand">             	
	            		<Form ref="ref_search" :model="search_field" :label-width="50" class="filter-form row mt-2">
							<Form-item label="校区" prop="bid" class="col-md-6 col-sm-6">
								<Select v-model="search_field.bid">
									<Option :value="-1">不限校区</Option>
									<Option :value="0">当前校区</Option>
									<Option v-for="(item,index) in branchs" :key="index" :value="item.bid">{{item.short_name||item.branch_name}}</Option>
								</Select>
							</Form-item>
	            		</Form>
            		</template>
                </div>
                <div class="list-body">
                    <div class="list-body-wrap" v-loading.like="'students'">
                        <table class="modal-table">
                            <thead>
                                <tr>
                                    <th width="50" v-if="multiple"  @click="handleCheckAll">
                                    	<div class="ivu-table-cell"><Checkbox v-model="checkAll"></Checkbox></div>
                                    </th>
                                    <th><div class="ivu-table-cell">姓名</div></th>
                                    <th><div class="ivu-table-cell">家长</div></th>
									<th><div class="ivu-table-cell">剩余/总课时</div></th>
									<th v-if="forbid_uncheck_assign"><div class="ivu-table-cell">审核状态</div></th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr 
								:class="{'table-info':item.$selected}" 
								@click="toggleSelected(item)" 
								v-for="(item,index) in data"
								:key="index"
								>
                                    <td v-if="multiple">
                                        <div class="ivu-table-cell"><Checkbox v-model="item.$selected"></Checkbox></div>
                                    </td>
                                    <td>
										<avatar-and-name 
											:src="item.student.photo_url" 
											:name="item.student.student_name"
											:detail-action="2"
											:sid="item.student.sid">
										</avatar-and-name>
										<span v-if="bid$ != item.student.bid" style="color:#00f">({{item.student.bid|branch_name}})</span>
									</td>
                                    <td><div class="ivu-table-cell">{{item.student.first_family_name || item.student.second_family_name || "——"}}</div></td>
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
									<td v-if="forbid_uncheck_assign">
										<div class="ivu-table-cell">
											<span class="text-success" v-if="isOrderCheck(item)">已审核</span>
											<span class="text-danger" v-else>未审核</span>
										</div>
									</td>
                                </tr>
                                <tr v-if="data.length == 0">
                                    <td colspan="7" style="text-align: center"><p class="empty">没有找到学员</p></td>
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
                        <li 
						v-for="(item,index) in selectedList" 
						:key="index"
						>
                            <span>{{item.student_name}}</span>
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
	import moment from 'moment'
	import common from '@/libs/common.mixin'
	import globals from '@/libs/globals.mixin'
	import grid from '@/libs/grid.mixin'
	import directive from '@/libs/directive.mixin'
	import store from '@/store'
	import AvatarAndName from 'c%/AvatarAndName.vue'

	const prefixCls = 'select-list';
	const resName   = 'student'
	const idField   = 'sid'
	const textField = 'student_name'

	export default {
		name: 'StudentLesson',
		mixins: [common,grid,directive,globals],
		components: {
			AvatarAndName
		},
		props: {
			value: {
				type: [Array, Number, String],
				default: []
			},
			lid: {
				type: [Number,String],
				default: 0,
			},
			width: {
				type: [String,Number],
				default: ''
			},
			title: {
				type: String,
				default: '选择已报读该课程的学员'
			},
			multiple: {
				type: Boolean,
				default: false,
			},
		},
		data() {
			return {
				rest_api: 'student_lessons?with=student&lid='+this.lid,
				modalShow: false,
				selIds: [],
				is_data_init:false,	            
	            search_field: {
					student_name: '',
					bid:0
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
			
		},
		methods: {
			resetSearch () {
				this.search_field.student_name = ''
				this.init_data()
			},
			hook_get_param (params) {
				if(!/$\s*^/.test(this.search_field.student_name)){
					params.student_name = this.search_field.student_name 
				}
				if(this.search_field.bid !== 0){
					params.bid = this.search_field.bid
				}
			},
			formatAge(birth_time) {
				let age = ''
				if(birth_time != '0') {
					age = parseInt(moment(new Date()).format('YYYY')) - parseInt(moment(birth_time).format('YYYY'))  + '岁'
				} else {
					age = '——'
				}
				return age
			},
			formatSex(sex) {
				let map = {0: '未确定', 1: '男', 2: '女'}
				return map[sex]
			},
			ok(){
				let model = []
	            if(!this.selectedTotal){
	                this.$Message.error('没有选中任何学员')
	                return
	            }
	            if(this.multiple){	            	
	            	this.selectedList.forEach(s=>{
	            		model.push(s[idField])
	            	})
//	                this.$emit('on-select',this.selectedList)
	            }else{
	                let row = this.$store.getters.getMapObject(this.selIds[0],resName)
	                model = row[idField]	                
	            }
	            this.modalShow = false
	            this.$emit('input',model)
	            this.$emit('on-select',model)
	        },
	        cancel(){
	            this.modalShow = false
	            if(this.multiple) {
		            this.selIds = []
	            	this.value.forEach((item) => {
	            		this.selIds.push(item)
	            	})
	            	this.refreshData(this.data)
	            }else{
	            	this.selIds = []
	            	this.selIds.push(this.value)
	            	this.refreshData(this.data)
	            }	            
	        },
	        openModal() {
				this.modalShow = true
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
	            	let list = []
	            	data.list.forEach(l=>{
	            		list.push(l.student)
	            	})
	                this.$store.commit('buildIdTextMap',{
	                   list:list,
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
				if(this.forbid_uncheck_assign){
					if(!this.isOrderCheck(item)){
						this.$Message.error('订单未审核不能选择!')
						return false
					}
				}
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
					if(this.forbid_uncheck_assign){
						if(!this.isOrderCheck(item)){
							return
						}
					}
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
			isOrderCheck(item){
				if(!item.order_items || item.order_items.length == 0){
					return true
				}
				if(item.order_items[0].order && item.order_items[0].order.is_check == 1){
					return true
				}
				return false
			},
			studentLessonArrangePercent(item){
				return item.arrange_hours*100/item.total_lesson_hours
			},
			studentLessonRemainPercent(item){
				return item.remain_lesson_hours*100/item.total_lesson_hours
			},
		},
		watch: {
			modalShow (val) {
	            if(val){
	                this.init_data_cache()
	            }else{
	                if(this.params.search_value != ''){
	                    this.params.search_value = ''
	                    this.is_data_init = false
	                }
	            }
	        },
	        value(id){
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