<template>
	<div class="c-grid">
		<ButtonGroup>
	        <Button :type="tab==1?'primary':'ghost'" @click="changeTab(1)">按课程设置</Button>
	        <Button :type="tab==2?'primary':'ghost'" @click="changeTab(2)">按班级设置</Button>
	        <Button :type="tab==3?'primary':'ghost'" @click="changeTab(3)">按科目设置</Button>	        
	    </ButtonGroup>
	    
	    <Input class="pull-right" style="width:360px" v-model="search_value" :placeholder="'请输入'+mapThead[tab]+'名称'" icon="ios-search"></Input>
	    
	    <Alert class="mt-3" show-icon type="info">作业模板优先级为：班级 > 课程 > 科目（若一个班级与其所属课程与科目都绑定了作业模板，则会优先选择班级所绑定的模板）</Alert>
	    <div class="mt-3">
			<Button type="primary" size="small" icon="wrench" :disabled="checkNum==0" @click="batchSetTpl">批量设置模板 {{checkNum}}</Button>
	    	<table class="modal-table" style="margin-top: 10px">
	    		<thead>
					<th style="width: 100px"><div class="ivu-table-cell"><Checkbox v-model="checkAll" @on-change="changeCheckAll">全选</Checkbox></div></th>
	    			<th><div class="ivu-table-cell">{{mapThead[tab]}}</div></th> 
	    			<th width="380px"><div class="ivu-table-cell">作业模板</div></th>
	    			<th width="350px"><div class="ivu-table-cell">操作</div></th>
	    		</thead>
	    		<tr v-for="(item,index) in filter_data">
	    			<td style="width: 100px"><div class="ivu-table-cell"><Checkbox v-model="item.check" @on-change="updateCheckAll"></Checkbox></div></td>
	    			<td><div class="ivu-table-cell">{{item[mapField[tab]]}}</div></td>
	    			<td>
	    				<div class="ivu-table-cell">
	    					<span :class="item.htts_name?'text-success':'text-danger'">{{item.htts_name?item.htts_name:'未设置模板'}}</span>
	    				</div>
	    			</td>
	    			<td>
	    				<div class="ivu-table-cell">
	    					<Button type="ghost" shape="circle" icon="edit" @click="edit(item)"></Button>
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
	
	export default{
		mixins: [grid,common],
		data () {
			return{
				rest_api: 'lessons?htts=1',
				pk: 'lid',
				tab: 1,
				search_value: '',
				currentIndex: -1,
				currentTplId: 0,
				data: [],
				mapThead: {1:'课程',2:'班级',3:'科目'},
				mapTab: {1:'按课程设置',2:'按班级设置',3:'按科目设置'},
				mapPk: {1:'lid',2:'cid',3:'sj_id'},
				mapApi: {1:'lessons',2:'classes',3:'subjects'},
				mapField: {1:'lesson_name',2:'class_name',3:'subject_name'},
				checkAll: false,
				checkNum: 0,
				tpl_data: []
			}
		},
		mounted () {
			this.init()

			this.$rest('homework_task_tpl_defines')
            .get({
                pagesize:100
            })
            .success(res => {
                this.tpl_data = res.list
            })
            .error(res => {
            })
		},
		watch: {
			tab: function (val) {
				this.rest_api = this.mapApi[val] + '?htts=1'
				this.pk = this.mapPk[val]
				
				this.search_value = ''
				this.init_data()
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
			}
		},
		methods: {
			batchSetTpl() {
				this.$Modal.open('components/SelectHomeWorkTaskTplModal.vue@modal',{
					on: {
						'on-select':(e)=>{
							this.batchSave(e.htts_id)
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
			edit (item) {
				this.$Modal.open('components/SelectHomeWorkTaskTplModal.vue@modal',{
                    props:{
						htts_name: item.htts_name,
						htts_id: item.htts_id
                    },
                    on:{
                        'on-select':(e)=>{
							this.currentTplId = e.htts_id
                            this.save(item)
                        }
                    }
                }).then(modal=>{
                    modal.show("选择作业模板")
                })
			},
			save (item) {
				let pk = this.mapPk[this.tab],
					param1 = [{
						htts_id: this.currentTplId,
						[pk]: item[pk]
					}],
					param2 = {
						htts_id: this.currentTplId,
						httd_id: item.httd_id,
						[pk]: item[pk]
					}
					
				
				let [uri,method,msg,param] = !item.httd_id?['homework_task_tpl_defines','post','设置成功',param1]:['homework_task_tpl_defines/'+item.httd_id,'put','修改成功',param2]
				
				
				this.$rest(uri)[method](param)
				.success(data=>{
					this.$Message.success(msg)
					this.init()				
				}).error(response=>{
					this.$Notice.error({
						title: '提示',
						desc: response.body.message||'设置失败'
					})
				})
			},
			batchSave (htts_id){
				let pkName = '';
                if(this.tab == 1) {
                    pkName = 'lid'
                }
                else if(this.tab == 2) {
                    pkName = 'cid'
                }
                else if(this.tab == 3) {
                    pkName = 'sj_id'
                }
				let objList = this.getCheckList()
				
                let hasSetTplList = [],
                    noSetTplList = []
                objList.forEach(item => {
					let pk = item[pkName];
					let httd = this.tpl_data.find(item2 => {
                        return item2[pkName] == pk
                    })

                    if(httd) {
                        hasSetTplList.push({
                            [pkName]: item[pkName],
                            htts_id: htts_id,
                            httd_id: item.httd_id
                        })
                    }
                    else {
                        noSetTplList.push({
                            [pkName]: item[pkName],
                            htts_id: htts_id
                        })
                    }
				})

                let p1 = this.$http.post('homework_task_tpl_defines',noSetTplList);
                let p2 = this.$http.put('homework_task_tpl_defines/batch_update',hasSetTplList);
                Promise.all([p1, p2]).then(values => {
                    this.$Message.success('批量修改成功')
                    this.init()
                },res => {
                    this.error(res.body.message)
                })
			},
			changeTab (val) {
				this.tab = val
			}
		}
		
	}
</script>
