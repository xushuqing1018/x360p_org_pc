<style lang="less">
	.like-input{
		display: inline-block;
	    width: 100%;
	    height: 32px;
	    border: 1px solid #dddee1;
	    vertical-align: middle;
	    border-radius: 3px;
    	padding: 4px 7px;
    	line-height: 1.5;
    	color: #bbbec4;	
	}	
	
</style>
<template>
	<div>		
		<div class="like-input" @click="modal=true" >
			<span v-if="result.length===0">点击{{title}}</span>
			<Tag v-for="item in result" :name="item[pk]" :key="item[pk]" closable @on-close="del_result" style="margin:0">
				{{item[pkName]}}
			</Tag>
		</div>
		<div v-if="mounted===true">
			<Modal :mask-closable="false" width="800" v-model="modal" :title="title">
				<Row>
					<Col span="6" v-if="hasBranch">
						<div  style="max-height: 500px;overflow: auto;">
							<branchs @change-branch="change_branch"></branchs>
						</div>
					</Col>
					<Col :span="hasBranch===true?18:24">
						<Input class="mb-4" v-model="search_value" placeholder="请输入姓名搜索">
							<Button icon="ios-search" slot="append"></Button>
						</Input>
						<div  style="max-height: 500px;overflow: auto;">
							<table class="modal-table">
								<thead>
									<th><div class="ivu-table-cell">#</div></th>
									<th><div class="ivu-table-cell">姓名</div></th>
									<th><div class="ivu-table-cell">手机号</div></th>
									<th><div class="ivu-table-cell">邮箱</div></th>
									<th><div class="ivu-table-cell">年龄</div></th>
									<th><div class="ivu-table-cell">选择</div></th>
								</thead>
								<tr v-for="(item,index) in filter_data()" 
									@mouseenter.stop="active_row = index"
                    				@mouseleave.stop="active_row = null"
									:class="(active_row === index && index % 2 === 0) ? 'ivu-table-row-hover' : 'ivu-table-row'" 
									@click.stop="check_row($event,item)">
									<td><div class="ivu-table-cell">{{index + 1}}</div></td>
									<td><div class="ivu-table-cell"><Icon :type="filter_sex(item.sex)"></Icon> {{item.ename}}</div></td>
									<td><div class="ivu-table-cell">{{item.mobile}}</div></td>
									<td><div class="ivu-table-cell">{{item.email}}</div></td>
									<td><div class="ivu-table-cell">{{filter_age(item.birth_time)}}</div></td>
									<td>
										<div class="ivu-table-cell">
										    <Checkbox v-if="isMuti" @on-change="check_row($event,item)" :value="result_muti.includes(item[pk])"></Checkbox>
										    <Radio v-else @on-change="check_row($event,item)" :value="active_eid===item[pk]"></Radio>
										</div>
									</td>
								</tr>
								<tr v-if="filter_data().length===0">
									<td colspan="6" style="text-align: center;">暂无数据</td>
								</tr>
							</table>
						</div>
					</Col>
				</Row>
				<div slot="footer">
					<Button type="text" @click="modal=false">取消</Button>
					<Button type="primary" @click="save">确认</Button>
				</div>
			</Modal>
		</div>
	</div>
</template>

<script>
	import moment from 'moment'
	import globals from '../../libs/globals.mixin'
	import Branchs from './Branchs'
	export default{
		mixins:[globals],
		components: {
			Branchs
		},
		data () {
			return {
				active_row: null,
				modal: false,
				mounted: false,
				active_branch_id: 0,
				active_eid: 0,
				search_value: '',
				result_muti: [],
				result: [],
				data: [],
			}
		},
		props: {
			res: {
				type: String,
				required: true
			},
			pk: {
				type: String,
				required: true
			},
			pkName: {
				type: String,
				required: true
			},
			hasBranch: Boolean,
			title: String,
			isMuti: {
				type: Boolean,
				default: true
			},
			value: Number
		},
		watch: {
			search_value: function (value) {
				this.filter_data()
			},
			value: function (value) {
				if(value !== null && value !== undefined){
					let employee = this.data.find(d=>d.eid === value)
					if(typeof employee !== 'undefined'){
						this.active_eid = value
						this.active_branch_id = employee.bids[0]
						this.result = []
						this.result.push(employee)	
					}
				}			
			}
		},
		mounted () {
			this.init_data()
			this.mounted = true
		},
		methods: {
			check_row (status,item) {
				let pk = this.pk
				this.active_eid = item[pk]	
				if(this.isMuti){
					if(status && this.result_muti.indexOf(item[pk])===-1){						
						this.result_muti.push(item[pk])
					}else{
						let index = muti.indexOf(item[pk])
						this.result_muti.splice(index,1)
					}					
				}
			},
			filter_sex (sex) {
				let map = {1: 'male', 2: 'female', 3: 'help'}				
				return map[sex]
			},
			filter_age (birth_time) {
				let age =  parseInt(moment(new Date()).format('YYYY')) - parseInt(moment(birth_time).format('YYYY'))
				return age
			},
			init_data () {
				let rid = ''
				switch(this.res) {					
					case 'tutor':
						rid = 2
						break
					case 'teacher':
					default:
						rid = 1
						break
				}
				this.$http.get('employees?bid=-1')
				.then(response=>{
					this.data = response.body.data.list.filter(e=>e.rids.indexOf(rid)>-1)					
				})
			},
			change_branch (bid) {
				this.active_branch_id = bid
			},
			filter_data () {				
				let result = this.data
				if(this.search_value === ''){
					if(this.hasBranch) return result.filter(r=>r.bids.indexOf(this.active_branch_id)>-1)
					
					return 	result
				}else{
					return result.filter(r=>r.bids.includes(this.active_branch_id)&&r[this.pkName].indexOf(this.search_value)>-1)
				}	
				
			},
			save () {
				this.result = []
				if(!this.isMuti){					
					this.result.push(this.data.find(d=>d[this.pk]===this.active_eid))
				}else{
					if(this.result_muti.length>0){						
						this.result_muti.forEach(rm=>{
							this.result.push(this.data.find(d=>d[this.pk]===parseInt(rm)))
						})						
					}
				}
				this.modal = false
				this.$emit('select-change',this.result)
			},
			del_result (event,name) {
				let index = this.result.findIndex(r=>r[this.pk]===name)
				if(this.isMuti){
					let muti_index = Array.from(this.result_muti).indexOf(name)					
					this.result_muti.splice(muti_index,1)
				}	
                this.result.splice(index, 1)
                this.$emit('select-change',this.result)
			}
		}
	}
</script>
