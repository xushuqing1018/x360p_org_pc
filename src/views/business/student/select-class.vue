<template>
	<Modal v-drag-modal v-model="modal$.show" :title="modal$.title" :mask-closable="false" width="800">
		<div class="row">        	
    		<div class="col-sm-12">
    			<Input style="width: 280px" v-model="class_name" placeholder="姓名" size="small" icon="ios-search"></Input>
    			<Button size="small" type="primary" icon="ios-search" @click="search">搜索</Button>
    			<Button size="small" type="primary" icon="refresh" @click="resetSearch">重置</Button>
    		</div>
        </div>
		<div class="list-body">
			<div class="list-body-wrap" style="max-height: 480px;overflow: auto;">
				<table class="modal-table mt-3">
					<thead>
						<th><div class="ivu-table-cell">班级名称</div></th>
						<th><div class="ivu-table-cell">上课时间</div></th>
						<th><div class="ivu-table-cell">教室</div></th>
						<th><div class="ivu-table-cell">{{'老师'|translate}}</div></th>
						<th><div class="ivu-table-cell">学员</div></th>
					</thead>
					<tr v-for="item in data" 
						@click="onSelect(item)"
						:class="{
								['table-info']:item.cid==currentItem.cid,
								['bg-darker-gray']:item.student_nums==item.plan_student_nums
							}">
						<td><div class="ivu-table-cell">{{item.class_name}}</div></td>
						<td>
							<template v-if="item.schedules.length>0">	                                    	
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
						</td>
						<td><div class="ivu-table-cell">{{item.cr_id|classroom_name}}</div></td>
						<td><div class="ivu-table-cell">{{item.teach_eid|employee_name}}</div></td>
						<td><div class="ivu-table-cell">{{item.student_nums}}/{{item.plan_student_nums}}</div></td>
					</tr>
				</table>	
			</div>
			<div class="mt-3 text-right">
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
		
		<div slot="footer">
			<Button type="ghost" @click="cancel">关闭</Button>			
		</div>
	</Modal>
</template>

<script>
	import grid from '@/libs/grid.mixin'
	import common from '@/libs/common.mixin'
	import modal from '@/libs/modal.mixin'
	import globals from '@/libs/globals.mixin'
	
	export default{
		mixins: [ grid, globals, modal, common ],
		components: {
		},
		props: {
			sid: {
				type: [Number,String],
				default: ()=>{
					return 0
				}
			}
		},
		data () {
			return {
				class_name: '',
				rest_api: 'search/classes',
				data: [],
				cid: 0,
				gurls: [],
				currentItem: {},
				info: {},
				cids: []
			}
		},
		watch: {
			sid: function (val) {
				this.getStudentClass(val)
			}
		},
		methods: {
			getStudentClass (sid) {
				this.$rest('students').add_url_param(sid,'class')
				.get()
				.success(data=>{					
					this.cids = []
					if(data.length){
						data.forEach(d=>{
							this.cids.push(d.cid)
						})
					}
				}).error(response=>{
					this.$Notice.error({
						title: '失败',
						desc: response.body.message||'获取班级失败'
					})
				})
			},
			getData () {
				this.init_data()
				this.show('选择班级','add')
			},
			resetSearch () {
				this.class_name = ''
				this.search()
			},
			hook_get_param (params) {
				if(this.info.one_class){
					params.sj_id = this.info.one_class.sj_id					
				}
				if(!/^\s*$/.test(this.class_name)) {
					params.class_name = this.class_name
				}
			},
			onSelect (row) {
				if(row.plan_student_nums>row.student_nums){
					this.currentItem = row
					this.$emit('on-select',row)
					this.cancel()
				}
			},
			cancel () {
				this.close()
			}
		},
		computed: {
		}
	}
</script>
