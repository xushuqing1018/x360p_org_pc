<template>
	<Form :label-width="100" ref="form_employee_2" class="permission-tab-form row" :model="info.employee">
        	<div class="branchs-group col-md-12">
            	<div class="title">
            		<Checkbox v-model="select_all_bids" @on-change="toggleSelectAllBids">
            			<span>校区权限</span>
            		</Checkbox>
            	</div>
            	<div class="content clearfix">
            		<div style="background:#eee;padding:10px" v-if="companys.length>0">
	            		<Checkbox 
	            			v-model="item.select$" 
	            			v-for="item in companys" 
	            			@on-change="selectByCompany($event,item)">{{item.dpt_name}}
	            		</Checkbox>
	            	</div>
	                <CheckboxGroup v-model="info.employee.bids" class="checkboxs-group">
	                	<Checkbox 
	                		:label="item.bid" 
	                		v-for="item in branchs" 
	                		style="width:23%;padding:10px 10px 5px">
            				<span>{{item.branch_name}}</span>
            			</Checkbox>
	                </CheckboxGroup>
	                <div class="main-branch" v-if="branchs.length>1">
	                	<label>归属校区: </label>
	                	<Select 
	                		v-model="info.employee.bid" 
	                		size="small" 
	                		clearable
	                		style="width: 150px"
	                		>
	                		<Option :value="0"><空></Option>
	                		<Option 
	                			:value="item" 
	                			v-for="item in info.employee.bids">{{item|branch_name}}
	                		</Option>
	                	</Select>
	                </div>
	            </div>
            </div>
        	<div class="branchs-group col-md-12" v-if="enable_project">
            	<div class="title">
            		<Checkbox v-model="select_all_pj_ids" @on-change="toggleSelectAllPjIds">
            			<span>项目权限</span>
            		</Checkbox>
            	</div>
            	<div class="content clearfix">
	                <CheckboxGroup v-model="info.employee.pj_ids" class="checkboxs-group">
	                	<Checkbox 
	                		:label="item.pj_id" 
	                		v-for="item in projects" 
	                		style="width:23%;padding:10px 10px 5px">
            				<span>{{item.pj_name}}</span>
            			</Checkbox>
	                </CheckboxGroup>
	            </div>
            </div>						
        	<div class="roles-group col-md-12">
            	<div class="title">
            		<Checkbox v-model="select_all_rids" @on-change="toggleSelectAllRids">
            			<span>所属权限组</span>
            		</Checkbox>
                </div>
            	<div class="content checkboxs-group" v-if="showRoleList">
        			<Checkbox 
            			:value="item.flag" 
            			v-for="item in role_list" 
            			@on-change="selectOne($event,item)" 
            			style="width:23%;padding:10px 10px 5px">
        				<span>{{item.role_name}}</span>
        			</Checkbox>
            	</div>
            </div>
        </div>
    </Form>
</template>
<script>
	import util from '@/libs/util' 
	import modal from '@/libs/modal.mixin' 
	import common from '@/libs/common.mixin'
	import globals from '@/libs/globals.mixin'
	export default {
		mixins: [modal,common,globals],
		props: {
			info: {
				type: Object,
				default() {
					return {}
				}
			},
			modal: {
				type: Object,
				default() {
					return {}
				}
			}
		},
		data() {
			return {
				showRoleList:true,
				select_all_rids: false,
				select_all_bids: false,
				select_all_pj_ids: false,
				companys: [],
			}
		},
		created() {
			this.init_companys()
		},
		methods: {
			selectByCompany($event,item) {
				item.children.forEach(child => {
					let dpt_index = this.info.employee.bids.findIndex(bid => bid==child),
						branch = this.branchs.find(branch => branch.bid==child)
					if($event) {
						if(dpt_index==-1&&branch) {
							this.info.employee.bids.push(child)
						}
					}else{
						if(dpt_index>-1&&branch) {
							this.info.employee.bids.splice(dpt_index,1)
						}
					}
				})
				let index = this.info.employee.com_ids.indexOf(item.dpt_id)
				if($event) {
					if(index == -1) {
						this.info.employee.com_ids.push(item.dpt_id)
					}
				}else{
					if(index > -1) {
						this.info.employee.com_ids.splice(index,item.dpt_id)
					}
				}
			},
			toggleSelectAllRids(flag) {
	        	if(flag) {
	        		this.selectAllRids()
				}else{
					this.info.employee.rids.splice(0)
					this.select_all_bids = false
					this.info.employee.bids.splice(0)
				}
	        },
			selectAllRids(exclude_rid){
	        	exclude_rid = typeof exclude_rid == 'undefined'?0:exclude_rid
	        	this.info.employee.rids.splice(0)
	        	this.rids.forEach(rid=>{
	        		if(rid != exclude_rid){
		        		this.info.employee.rids.push(rid)
		        	}
	        	})
	    	},
	        toggleSelectAllBids(flag) {
	        	if(flag) {
	        		this.branchs.forEach(item => {
		        		if(this.info.employee.bids.indexOf(item.bid) == -1) {
		        			this.info.employee.bids.push(item.bid)
		        		}
		        	})
	        	}else{
	        		this.info.employee.bids.splice(0)
	        	}
			},
			toggleSelectAllPjIds(flag) {
	        	if(flag) {
	        		this.projects.forEach(item => {
		        		if(this.info.employee.pj_ids.indexOf(item.pj_id) == -1) {
		        			this.info.employee.pj_ids.push(item.pj_id)
		        		}
		        	})
	        	}else{
	        		this.info.employee.pj_ids.splice(0)
	        	}
			},
	        selectAllBids() {
	        	this.select_all_bids = true
	        	this.branchs.forEach(item => {
	        		if(this.info.employee.bids.indexOf(item.bid) == -1) {
	        			this.info.employee.bids.push(item.bid)
	        		}
	        	})
	        },
	        clearAllBids() {
	        	this.select_all_bids = false
	            this.info.employee.bids.splice(0)
	        },
	        selectOne(flag,item) {
	        	let rid   = item.rid,
	        		rids  = this.info.employee.rids,
	        		index = rids.indexOf(rid),
	        		isallbid = this.info.employee.bids.length === this.branchs.length
	        		if(index > -1) {
		        		rids.splice(index, 1)
		        	}else{
		        		rids.push(rid)
		        	}
	        	this.setSelectAllRids()
	        },
	        setSelectAllRids(){
	        	if(this.info.employee.rids.length == this.rids.length) {
	        		this.select_all_rids = true
	        	}else{
	        		this.select_all_rids = false
	        	}
	        },
	        setCompanySelected() {
	        	let bids = this.info.employee.bids
				this.companys.forEach(company => {

					let index = this.info.employee.com_ids.indexOf(company.dpt_id)

					if(company.children.length > 0) {

						let is_select = company.children.filter(child => bids.findIndex(bid => bid==child) > -1).length == company.children.length

						this.$set(company,'select$',is_select)
						
						if(is_select) {
							if(index == -1) {
								this.info.employee.com_ids.push(company.dpt_id)
							}
						}else{
							if(index > -1) {
								this.info.employee.com_ids.splice(index,company.dpt_id)
							}
						}

					}else{

						if(index == -1) {
							this.$set(company,'select$',false)
						}else{
							this.$set(company,'select$',true)
						}

					}
					
				})
	        },
	        setMainBranch() {
	        	let bid = this.info.employee.bid,
	        		bids = this.info.employee.bids
        		if(bids.indexOf(bid) === -1) {
        			if(bids.length > 0) {
        				this.info.employee.bid = bids[0]
        			}else{
        				this.info.employee.bid = 0
        			}
        		}
			},
	    				
	        init_companys() {
	        	let departments = util.copy(this.$store.state.gvars.departments),
	        		ret = []
        		function findParent(data,pid,ret,d) {
        			let parent = data.find(item => item.dpt_id==pid)
					if(parent) {
						if(parent.dpt_type==2) {
							let company = ret.find(r => r.dpt_id==parent.dpt_id)
							if(company) {
								company.children.push(d.bid)
							}
						}else{
							findParent(data,parent.pid,ret,d)
						}
					}
        		} 
        		departments.forEach(d => {
        			if(d.dpt_type==2) {
        				d.children = []
        				d.$select = false
        				ret.push(d)
        			}
         		})
        		departments.forEach(d => {
        			if(d.dpt_type==1){
        				findParent(departments,d.pid,ret,d)
        			}
        		})
        		this.companys = ret
	        }
		},
		computed: {
			is_admin_role(){
				return this.info.employee.rids.length > 0 && this.info.employee.rids.indexOf(10) !== -1
			},
			roles(){
				return this.$store.state.gvars.roles
			},
			rids() {
	        	let list = []
	        	this.roles.forEach(item => {
	        		list.push(item.rid)
	        	})
	        	return list
	        },
	        branchs() {
	        	return this.$store.state.gvars.branchs
			},
	        role_list() {
	        	let list = []
	        	let rids = this.info.employee.rids
	        	this.roles.forEach(item => {
	        		list.push({
	        			rid: item.rid,
	        			role_name: item.role_name,
	        			flag: rids.indexOf(item.rid) !== -1
	        		})
	        	})
	        	return list
	        }
		},
		watch: {
			'info.employee.bids': {
				handler: function(bids) {
					if(bids.length == this.branchs.length) {
						this.select_all_bids = true
					}else{
						this.select_all_bids = false
					}
					this.setMainBranch()
					this.setCompanySelected()
				},
				deep: true
			},
			'info.employee.pj_ids': {
				handler: function(pj_ids) {
					if(pj_ids.length == this.projects.length) {
						this.select_all_pj_ids = true
					}else{
						this.select_all_pj_ids = false
					}
				},
				deep: true
			},			
		}
	}
</script>