<template>
	<Modal v-drag-modal v-model="modal$.show" :mask-closable="false" :width="900" :title="modal$.title">
        <Form :label-width="70" class="filter-form row">
			<Form-item label="姓名/卡号" class="col-sm-4">
				<Input 
	            	ref="nameInput"
	            	v-model="search_field.name_and_card" 
	            	placeholder="姓名/卡号" 
	            	size="small" >
	            </Input>
			</Form-item>
            <Form-item label="校区" class="col-sm-4">
				<Select v-model="search_field.bid">
					<Option v-for="(item,index) in branchs" :value="item.bid" :key="index">{{item.short_name||item.branch_name}}</Option>
				</Select>
			</Form-item>
		</Form>
        <Row class="basic">
            <Col span="24" class="mt-2 mb-2">
            	<Button class="ml-2" type="primary" size="small" icon="ios-search" @click="search">查询</Button>
            	<Button class="ml-2" type="primary" size="small" icon="refresh" @click="resetSearch">重置</Button>
            </Col>
        </Row>
        <div class="content">
            <div class="content-body">
                <Table  
		            :page-size="pageSize" 
		            :page="pageIndex" 	
		            :stripe="true" 
		            :show-header="true" 
		            :data="data" 
		            :columns="columns" 
		            :no-data-text="$store.state.config.EMPTY_DATA_TEXT" 
		            :no-filtered-data-text="$store.state.config.EMPTY_FILTER_DATA_TEXT" 
		            @on-sort-change="sortChange">
	            </Table>
            </div>
            <div class="content-footer">
                <div class="clearfix">
                    <Page
	            	    class="pull-right mt-2"
	            	    size="small"
		                :total="total" 
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
            
        </div>
        <div slot="footer">
            <Button type="ghost" @click="close">关闭</Button>
        </div>
	</Modal>
</template>
<script>
	import util from '@/libs/util'
	import grid from '@/libs/grid.mixin'
	import modal from '@/libs/modal.mixin'
	import common from '@/libs/common.mixin'
    import globals from '@/libs/globals.mixin'
    
    import TagLabel from 'c%/TagLabel.vue'

	export default {
		name: 'crossCampusRegistrationStudentList',
		mixins: [grid,common,globals,modal],
		data() {
			return {
                rest_api: 'students/neq_bids',
	            search_field: {
	            	bid: 0,
	            	name_and_card: ''
                },
                column_keys: {
					sid:{
						title:'ID',
						width:60,
						show:false
					},
					student_name: {
						title: '姓名',
						show: true,
						disabled:true
					},
					sex: {
						title: '性别',
						show: false
					},
					age: {
						title: '年龄',
						show: true
					},
					status: {
						title: '状态',
						show: true
					},
					lesson_rate: {
						title: '剩余课时/总课时',
						show: true
					},
					first_tel: {
						title: '手机号',
						show: true
					},
					first_family_rel: {
						title: '关系/姓名',
						show: true
					},
					first_openid: {
						title: '微信',
						show: true,
						width: 100
					},
					pj_ids:{
						title: '项目',
						show:false
					}
                },
                column_render: {
					student_name (h,params) {
						let map = {0:{icon:'help',text:'-'},1:{icon:'male',text:'男'},2:{icon:'female',text:'女'}}
						let nameElement = h('avatar-and-name',{
								attrs: {
									class: 'x-avatar-name'
								},
								style:{
									'display': 'inline-block'
								},
								on: {
									click: ()=>{
										this.studentDetail(params.row.sid)						
									}
								},
								props: {
									src: params.row.photo_url,
									name: params.row.student_name,
									sex: params.row.sex,
									nickname: params.row.nick_name
								} 
							}
						)
						//过滤私人标签
						let filterList = [];
						if(params.row.tags.length > 0) {
							filterList = params.row.tags.filter(item => {
								if(item.is_private == 0) {
									return true
								}
								else {
									let uid = this.uid$;
									if(uid == item.create_uid || this.ia_admin) {
										return true
									}
									else {
										return false
									}
								}
							})
						}
						let childEle = []
						childEle.push(nameElement)
						childEle.push(h(TagLabel, {
							props: {
								list: filterList,
								type: 1,
								id: params.row.sid,
								objName: params.row.student_name
							},
							style: {
								marginLeft: '5px'
							},
							on: {
								update: () => {
									this.init_data()
								}
							}
						}))
						if(this.is_app_chat_open){
							childEle.push(
								h('Icon',{
								props: {
									type:'chatbubble-working'
								},
								style: {
									marginLeft: '5px',
									cursor: 'pointer'
								},
								directives: [
									{
										name: 'per',
										value:'student.chat'
									}
								],
								nativeOn: {
									click:() => {
										this.chatbox
										.set('info',params.row)
										.reset()
										.show()
									}
								}
							})
							)
						}
						return h('span', childEle)
					},
					status(h,params) {
						let tag =  h('Tag',{
								props:{
									type:'border',
									color:this.ss_map[params.row.status].color
								}
							},
							this.ss_map[params.row.status].text
						)
						let result = [tag]
						if(params.row.status === 30) {
							let reason = params.row.stop_reason || '-'
							result.push(h('p','原因:'+reason))
						}
						return h('div',result)
					},
					lesson_rate (h,params) {						
						let row = params.row,
							percent = 0,
							status = 'normal',
							label = util.sprintf('%s/%s',row.student_lesson_remain_hours,row.student_lesson_hours)
						if(row.student_lesson_hours>0){
							percent = parseFloat(row.student_lesson_remain_hours/row.student_lesson_hours).toFixed(2)*100
						}
						if(row.student_lesson_remain_hours > 0 && row.student_lesson_remain_hours == row.student_lesson_hours) {
							status = 'success'
						}else{
							if(row.student_lesson_remain_hours <= this.lesson_warn_nums && row.student_lesson_hours > 0) {
								status = 'wrong'
							}
						}						
						
						return h('Progress',{
							props: {
								percent: percent,
								status: status
							}
						},label)
					},
					sex (h,params) {
						let map_sex = {0:'-',1:'男',2:'女'}
						return h('span',map_sex[params.row.sex])
                    },
					age (h,params) {
						return h('span',util.age(params.row.birth_time))
					},
					first_openid (h,params) {
						let label = '未绑定',
							color = '#657180';
						if(params.row.first_openid) {
							label = '已绑定';
							color = '#19be6b';
						}
						return h('span', {
							style: {
								color: color
							}
						}, label)
					},
					first_family_rel (h,params) {
						let row = params.row,
						rel = this.$filter('family_rel')(row.first_family_rel),
						name = row.first_family_name==''?'-':row.first_family_name,
						result = rel+' / '+name
						if(row.first_family_rel===1){
							result = rel
						}						
						return h('span',util.sprintf('%s',result)) 
					},
					first_tel (h,params) {
						return h('rich-tel',{
							props: {
								sence: 'student',
								row: params.row
							},
							on: {
								'on-success': ()=>{
									this.init_data()
								}
							}
						})
					}
				}
			}
		},
		mounted() {
			this.search_field.bid = this.bid$
		},
		methods: {
            hook_get_param(params) {
				if(this.search_field.name_and_card) {
					params.name_and_card = this.search_field.name_and_card
                }
                if(this.search_field.bid) {
					params.bid = this.search_field.bid
				}
			},
			resetSearch () {
				this.search_field.bid = this.bid$
                this.search_field.name_and_card = ''
                this.pageIndex = 1

				this.init_data()
            },
            search() {
				if(this.search_field.bid !== this.bid$) {
					if(this.search_field.name_and_card === '') {
						this.$Message.error('跨校区查询请输入学员姓名或卡号')
						return
					}
				}
				this.pagenation(1)
        	}
		}
	}
</script>