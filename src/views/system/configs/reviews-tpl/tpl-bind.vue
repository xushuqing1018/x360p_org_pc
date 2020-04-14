<template>
	<div class="c-grid">
		<ButtonGroup>
	        <Button :type="tab==1?'primary':'ghost'" @click="changeTab(1)">按课程设置</Button>
	        <Button :type="tab==2?'primary':'ghost'" @click="changeTab(2)">按班级设置</Button>
	        <Button :type="tab==3?'primary':'ghost'" @click="changeTab(3)">按科目设置</Button>	        
	    </ButtonGroup>
	    
	    <Input class="pull-right" style="width:360px" v-model="search_value" :placeholder="'请输入'+mapThead[tab]+'名称'" icon="ios-search"></Input>
	    
	    <Alert class="mt-3" show-icon type="info">点评模板优先级为：班级 > 课程 > 科目（若一个班级与其所属课程与科目都绑定了点评模板，则会优先选择班级锁绑定的模板）</Alert>
	    <div class="mt-3">
			<Button type="primary" size="small" icon="wrench" :disabled="checkNum==0" @click="batchSetTpl">批量设置模板 {{checkNum}}</Button>
	    	<table class="modal-table" style="margin-top: 10px">
	    		<thead>
					<th style="width: 100px"><div class="ivu-table-cell"><Checkbox v-model="checkAll" @on-change="changeCheckAll">全选</Checkbox></div></th>
	    			<th><div class="ivu-table-cell">{{mapThead[tab]}}</div></th>
	    			<th width="380px"><div class="ivu-table-cell">点评模板</div></th>
	    			<th width="350px"><div class="ivu-table-cell">操作</div></th>
	    		</thead>
	    		<tr v-for="(item,index) in filter_data">
	    			<td style="width: 100px"><div class="ivu-table-cell"><Checkbox v-model="item.check" @on-change="updateCheckAll"></Checkbox></div></td>
	    			<td><div class="ivu-table-cell">{{item[mapField[tab]]}}</div></td>
	    			<td>
	    				<div class="ivu-table-cell">
	    					<!-- <Select :value="getTplObj(item[mapPk[tab]]).rts_id" v-if="editable&&index==currentIndex" @on-change="changeCurrentTpl">
	    						<Option :value="0" v-if="getTplObj(item[mapPk[tab]]).rts_id==0">请选择点评模板</Option>
	    						<Option v-for="tpl in review_tpl_setting" :value="tpl.rts_id">{{tpl.name}}</Option>
	    					</Select> -->
								<select-review-tpl v-model="currentTplId" v-if="editable&&index==currentIndex"/>
	    					<span :class="item.rts_name?'text-success':'text-danger'" v-else>{{item.rts_name?item.rts_name:'未设置模板'}}</span>
	    				</div>
	    			</td>
	    			<td>
	    				<div class="ivu-table-cell">
	    					<div v-if="editable&&index==currentIndex">
		    					<Button type="ghost" shape="circle" icon="checkmark" @click="save(item[mapPk[tab]],item)"></Button>
		    					<Button type="ghost" shape="circle" icon="close" @click="cancel" class="ml-3"></Button>
	    					</div>
	    					<Button type="ghost" shape="circle" icon="edit" @click="edit(index)" v-else></Button>
	    				</div>
	    			</td>
	    		</tr>
	    	</table>
	    	<div class="mt-3 pagenation text-right">
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
	</div>
</template>

<script>
	import util,{_} from '@/libs/util'
	import grid from '@/libs/grid.mixin'
	import common from '@/libs/common.mixin'
	import SelectReviewTpl from 'c%/SelectReviewTpl.vue'
	
	export default{
		mixins: [grid,common],
		components: {
			SelectReviewTpl
		},
		data () {
			return{
				rest_api: 'lessons?rts=1',
				pk: 'lid',
				tab: 1,
				search_value: '',
				currentIndex: -1,
				editable: false,
				currentTplId: 0,
				data: [],
				mapThead: {1:'课程',2:'班级',3:'科目'},
				mapTab: {1:'按课程设置',2:'按班级设置',3:'按科目设置'},
				mapPk: {1:'lid',2:'cid',3:'sj_id'},
				mapApi: {1:'lessons',2:'classes',3:'subjects'},
				mapField: {1:'lesson_name',2:'class_name',3:'subject_name'},
				checkAll: false,
				checkNum: 0
			}
		},
		mounted () {
			this.init()
		},
		watch: {
			tab: function (val) {
				this.rest_api = this.mapApi[val] + '?rts=1'
				this.pk = this.mapPk[val]
				
				this.search_value = ''
				this.init_data()
				this.editable = false
				this.currentTplId = 0
				this.currentIndex = -1
				this.checkAll = false
				this.checkNum = 0
			}
		},
		computed: {
			filter_data () {
				let data = this.data,
					name = this.mapField[this.tab],
					result = data
				
				if(!/^\s*$/.test(this.search_value)){
					result = data.filter(d=>d[name].indexOf(this.search_value)>-1)
				}
				result.forEach(item => {
					item.check = false;
				})

				return result
			},
			tpl_data () {
				return util.copy(this.$store.state.gvars.review_tpl_define)
			}
		},
		methods: {
			batchSetTpl() {
				let list = this.getCheckList();
				this.$Modal.open('system/configs/reviews-tpl/batch-set-tpl.vue@modal',{
					props: {
						tplData: this.tpl_data,
						objList: list,
						tab: this.tab
					},
					on: {
						update: () => {
							this.init()
						}
					}
				})
				.then(modal => {
					modal.show('批量设置模板')
				})
			},
			getCheckList() {
				let rst = this.filter_data.filter(item => {
					return item.check
				})
				return rst;
			},
			changeCheckAll() {
				let checkAll = this.checkAll;
				this.filter_data.forEach(item => {
					item.check = checkAll
				})
				this.checkNum = checkAll?this.filter_data.length:0;
			},
			updateCheckAll() {
				let allCheck = this.filter_data.every(item => {
					return item.check == true
				})
				if(allCheck) {
					this.checkAll = true
				}
				else {
					this.checkAll = false
				}

				let rst = this.filter_data.filter(item => {
					return item.check
				})
				this.checkNum = rst.length;
			},
			init () {
				this.checkAll = false
				this.checkNum = 0
				this.init_data()
			},
			changeCurrentTpl (val) {
				this.currentTplId = val
			},
			edit (index) {
				this.currentIndex = index
				this.editable = true
			},
			save (value,item) {
				let pk = this.mapPk[this.tab],
					param1 = [{
						rts_id: this.currentTplId,
						[pk]: value
					}],
					param2 = {
						rts_id: this.currentTplId,
						[pk]: value
					}
					
				if(this.currentTplId==0){
					this.$Message.error('请先选择点评模板')
					return
				}
				
				let [uri,method,msg,param] = !item.rtd_id?['review_tpl_defines','post','设置成功',param1]:['review_tpl_defines/'+item.rtd_id,'put','修改成功',param2]
				
				
				this.$rest(uri)[method](param)
				.success(data=>{
					this.$Message.success(msg)
					this.$store.dispatch('updateGlobalVar','review_tpl_define')
					this.init()
					this.cancel()					
				}).error(response=>{
					this.$Notice.error({
						title: '提示',
						desc: response.body.message||'设置失败'
					})
				})
			},
			cancel () {
				this.editable = false
				this.currentTplId = 0
				this.currentIndex = -1
			},
			getTplObj (pk) {
				let id = this.mapPk[this.tab],
					data = this.tpl_data,
					result = {
						name: '未设置模板',
						rts_id: 0,
						rtd_id: 0
					}
				if(data.length>0){
					let obj = data.find(d=>d[id]==pk)
					if(obj) {
						let review_tpl_setting = this.review_tpl_setting.find(item => {
							return item.rts_id == obj.rts_id;
						})
						if(review_tpl_setting){
							result.name = review_tpl_setting.name
							result.rts_id = obj.rts_id
							result.rtd_id = obj.rtd_id
					}
					}
				}
				return result
			},
			changeTab (val) {
				this.tab = val
			}
		}
		
	}
</script>
