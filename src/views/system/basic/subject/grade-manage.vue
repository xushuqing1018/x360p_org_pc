<template>
	<Modal v-drag-modal :mask-closable="false" width="780" v-model="modal$.show" :title="modal$.title" @on-cancel="close">
	    <div class="c-grid">
	        <div class="box box-result" style="box-shadow:none">
	            <div class="toolbar">
	                <Button type="primary" icon="plus" @click="add">新增</Button>
	                <Poptip
	                    confirm
	                    title="您确认要进行删除操作吗?"
	                    @on-ok="del"
	                    @on-cancel="cancel">
	                    <Button type="error" size="small" icon="ios-close-empty" :disabled="selected.none">删除</Button>
	                </Poptip>
	            </div>
	            <div class="content">
	                <div class="content-body">
	                    <div class="ivu-table-wrapper">
	                    <table class="table-list" v-loading="'subjects'">
	                        <thead>
	                            <tr>
	                                <th width="50"><div class="ivu-table-cell">
	                                    <Checkbox v-model="selected.all" @on-change="toggleSelectAll" :disabled="data.length == 0"></Checkbox></div>
	                                </th>
	                                <th><div class="ivu-table-cell">级别</div></th>
	                                <th><div class="ivu-table-cell">描述</div></th>
	                                <th><div class="ivu-table-cell">课时单价</div></th>
	                                <th><div class="ivu-table-cell">单课时分钟</div></th>
	                                <th><div class="ivu-table-cell">操作</div></th>
	                            </tr>
	                        </thead>
	                        <tbody>
	                            <tr v-if="action == 'add'">
									<td></td>
									<td><div class="ivu-table-cell">
										<InputNumber v-model="nd.grade" :min="0" size="small"></InputNumber></div>
									</td>
									<td><div class="ivu-table-cell">
										<Input v-model="nd.title" size="small" placeholder="请输入级别描述" style="width:150px"></Input></div>
									</td>
									<td>
										<div class="ivu-table-cell">
											<InputNumber size="small" v-model="nd.unit_price"></InputNumber>
										</div>
									</td>
									<td>
										<div class="ivu-table-cell">
											<InputNumber size="small" v-model="nd.per_lesson_hour_minutes"></InputNumber>
										</div>	
									</td>
									<td><div class="ivu-table-cell">
										<Button-group>
											<Button type="primary" @click="save" :disabled="saving">确定</Button>
									        <Button @click="cancel" :disabled="saving">取消</Button>
									    </Button-group></div>
									</td>
	                			</tr>
	                            <tr v-for="item in data" v-if="data.length > 0" :key="item.sg_id">
	                				<td><div class="ivu-table-cell">
	                					<Checkbox v-model="item.$selected" @on-change="toggleselectOne"></Checkbox></div>
	                				</td>
	                				<td><div class="ivu-table-cell">
	                					<InputNumber v-if="item.$edit" v-model="item.grade" :min="0" size="small"></InputNumber>
	                					<span v-else>{{item.grade}}</span></div>
	                				</td>
	                				<td><div class="ivu-table-cell">
	                					<Input v-if="item.$edit" size="small" v-model="item.title" placeholder="请输入级别描述"  style="width:150px"></Input>
	                					<span v-else>{{item.title}}</span></div>
	                				</td>
	                				<td><div class="ivu-table-cell">
	                					<InputNumber v-if="item.$edit" v-model="item.unit_price" :min="0" size="small"></InputNumber>
	                					<span v-else>{{item.unit_price}}</span></div>
	                				</td>
	                				<td><div class="ivu-table-cell">
	                					<InputNumber v-if="item.$edit" v-model="item.per_lesson_hour_minutes" :step="1" :min="0" size="small"></InputNumber>
	                					<span v-else>{{item.per_lesson_hour_minutes}}</span></div>
	                				</td>
	                				<td v-if="item.$edit"><div class="ivu-table-cell">
										<Button-group>
											<Button type="primary" @click="save(item)" :disabled="saving">确定</Button>
									        <Button @click="cancel(item)" :disabled="saving">取消</Button>
									    </Button-group></div>
	                				</td>
	                				<td v-else><div class="ivu-table-cell">
	                					<Button type="ghost" shape="circle" size="small" @click="edit(item)" icon="edit"></Button></div>
	                				</td>
	                			</tr>
	                            <tr v-if="data.length == 0 && action !== 'add'">
	                				<td colspan="6" style="text-align: center">当前科目还没有设置级别</td>
	                			</tr>
	                        </tbody>
	                    </table>
	                    </div>
	                </div>
	                <div class="content-footer">
	                    <div class="pagenation">
	                        <Page :total="total" :show-total="true" :current="pageIndex" :show-sizer="true" :page-size="pageSize" @on-change="pagenation" @on-page-size-change="pagesize">
	                        </Page>
	                    </div>
	                </div>
	            </div>
	        </div>
	    </div>
	    <div slot="footer">
	    	<Button type="ghost" @click="close">关闭</Button>
	    </div>
	</Modal>
</template>
<script>
	import modal from '@/libs/modal.mixin' 
    import util from '@/libs/util'
    import grid from '@/libs/grid.mixin'
    import globals from '@/libs/globals.mixin'
    import common from '@/libs/common.mixin'
    
    export default {
        mixins: [grid,globals,modal,common],
        data() {
            return {
                action: '',
                selected: {
                    all: false,
                    none: true
                },
                nd: {
                    grade: 1,
                    title: '',
                    unit_price: 0,
                    sj_id: 0,
                    per_lesson_hour_minutes:0
                }
            }
        },
        methods: {
            add() {
                if(this.action == '') {
                    this.action = 'add'
                }
            },
            del() {
                let ids = []
                this.data.forEach((item) => {
                    if(item.$selected == true) {
                        ids.push(item.sg_id)
                    }
                })
                this.$rest('subjects/delete_grade')
                .post({sg_ids:ids})
                .success(response => {
                	this.$Message.success('删除成功')
                	this.$store.dispatch('updateGlobalVar','subjects')
                    this.init_data()
                    this.reset()
                })
                .error(response => {
                    this.error(response.body.message)
                })
            },
            save(item) {
                if(!item.target){
                	if(!this.checkGrade(item)) {
                		this.$Message.error('科目级别不能重复')
                		return false
                	}
					this.$rest('subjects').add_url_param(this.nd.sj_id,'grade',this.nd.grade)
					.put({title:item.title,sg_id:item.sg_id,unit_price:item.unit_price})
					.success(response=>{
						this.$Message.success('编辑成功')
						this.$store.dispatch('updateGlobalVar','subjects')
						this.init_data()
						this.reset()
					})
					.error(response=>{
						this.error(response.body.message)
					})
				}else{
					//add save
					if(!this.checkGrade(this.nd)) {
                		this.$Message.error('科目级别不能重复')
                		return false
                	}
					this.$rest('subjects').add_url_param(this.nd.sj_id,'grade')
					.post(this.nd)
					.success(response=>{
						this.$Message.success('添加成功')
						this.$store.dispatch('updateGlobalVar','subjects')
						this.nd.title = ''
						this.nd.grade = 1
						this.init_data()
						this.reset()
					})
					.error(response=>{
						this.error(response.body.message)
					})
				}
            },
            edit(item){
				if(item && this.action == ''){
					item.$edit = true
					this.action = 'edit'
				}
			},
            cancel(item) {
                if(item) {
                    item.$edit = false
                    this.action = ''
                }else{
                    this.action = ''
                }
            },
            toggleSelectAll(val) {
                if(val){
					this.data.forEach((item,key)=>{
						item.$selected = true
					})
					this.selected.none = false
				}else{
					this.data.forEach((item,key)=>{
						item.$selected = false
					})
					this.selected.none = true
				}
            },
            toggleselectOne() {
                let sels = this.data.filter((item) => item.$selected === true)
                if(sels && sels.length > 0) {
                    this.selected.none = false
                }else{
                    this.selected.none = true
                }
                if(sels && sels.length === this.data.length) {
                    this.selected.all = true
                }else{
                    this.selected.all = false
                }
            },
            init_data() {
            	this.reset()
            	this.$rest('subjects').add_url_param(this.nd.sj_id,'grade')
            	.get({pagesize:10})
            	.success(res=>{
            		this.data = res.list
            		this.total = res.total
                	this.pageSize = parseInt(res.pagesize)
            	})
            	.error(res=>{
            		this.$Message.error(res.body.message)
            	})
            	return this
            },
            checkGrade(item) {
            	let sameGrade = this.data.find(i => i.grade===item.grade&&i.sg_id!==item.sg_id)
            	if(sameGrade) {
            		return false
            	}
            	return true
            },
            set(key,value) {
            	this.$set(this.nd,key,value)
            	return this
            },
            reset() {
            	this.selected.all = false
    			this.selected.none = true
    			this.action = ''
            }
        },
        watch: {
        	'modal$.show':function(val) {
        		if(!val) {
        			this.data.splice(0,this.data.length)
        		}
        	}
        }
    }
</script>
<style lang="less" scoped>
    .ivu-table-wrapper {
        border-left: none;
    }
</style>