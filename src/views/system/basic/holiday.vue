<style lang="less">
@import '~@/style/mixin.less';
.ivu-col{
	.calendar{
		margin:5px;
		border:1px solid #f2f2f2;
	}
	.page-title{
		background:#f2f2f2;
		padding:5px 10px;
		margin-bottom:10px;
	}
	.year-title{
		font-size:16px;
		text-align:center;
		font-weight:bold;
	}
}
.blank50{
	width:100%;
	display:block;
	visibility:hidden;
}
.side-list{
	border:1px solid #ebebeb;
	margin-left:10px;
	margin-right:5px;
	.day{
		font-weight:bold;
		color:#2D8CF0;
	}
	.ivu-card-extra {
		top: 10px;
	}
	.ivu-card-body {
		max-height: 730px;
		overflow: auto;
	}
	.holiday-list{
		.item{
			margin-bottom:5px;
		}
	}
}
</style>
<template>
	<div class="page page-config" v-loading="'holidays'">
		<Alert><Icon type="information-circled"></Icon> 提示：每个校区都可以设置自己单独的节假日，也可以不设置，如果不设置则沿用“默认”节假日设置</Alert>
		<div class="page-title">
			<Row>
				<Col span="8">
					<Button type="ghost" icon="chevron-left" @click="prevYear">上一年</Button>
				</Col>
				<Col span="8">
					<div class="year-title"><span v-if="active_branch_name != ''">{{active_branch_name}}</span> {{holiday.year}}年放假设置</div>
				</Col>
				<Col span="8">
					<Button class="pull-right" type="ghost" icon="chevron-right" @click="nextYear">下一年</Button>
				</Col>
			</Row>
		</div>
		<Row>
			<Col span="4">
				<Affix :offset-top="75">
					<Card shadow class="side-branch">
		                <div slot="title">校区</div>
		                <div class="branch-filter">
		                	<Input size="small" v-model="key" icon="search" placeholder="输入校区名称过滤"></Input>
		                </div>
		                <div class="branch-list">
		                	<div class="item">
		                		<a :class="{'selected':active_branch_id == 0}" @click="selDefault">
		                		默认设置
		                		<Icon type="ios-arrow-right" v-show="active_branch_id == 0"></Icon>
		                		</a>
		                	</div>
		                	<div class="item" v-for="item in filterBranchs">
					          <a :class="{'selected':active_branch_id == item.bid}" @click="selBranch(item)">
					          {{item.short_name || item.branch_name}}

					          <Icon type="ios-arrow-right" v-show="active_branch_id == item.bid"></Icon>
					          </a>
					        </div>
					        <p class="empty" v-if="filterBranchs.length == 0">没有搜索到匹配的校区</p>
		                </div>
		            </Card>
	            </Affix>
	            <div class="blank50">空白区域</div>
			</Col>
			<Col span="14">
				<Row>
					<Col span="12" v-for="month in months">
						<calendar :lunar="true" :events="holidays" :viewYear="holiday.year" :viewMonth="month" @select="daySelect"></calendar>
					</Col>
				</Row>
			</Col>
			<Col span="6">
				<Affix :offset-top="75">
					<Card shadow class="side-list">
		                <div slot="title">
			                共放假<span class="day">{{holidayTotal}}</span>天
		                </div>
		                <span slot="extra" v-if="mode == 'view'">
							<Button @click="edit" size="small" type="primary" icon="settings">设置</Button>
		                </span>
	                	<span slot="extra" v-if="mode == 'edit'">
	                		<Button @click="save" :loading="saving" size="small" type="primary">确定</Button>
    						<Button @click="cancel" size="small" type="ghost">取消</Button>
	                	</span>
		                <div class="holiday-list" v-if="mode == 'view'">
		                	<div class="item" v-for="item in holiday.list">
		                		<span class="day">{{item.int_day}}</span>
		                		<span class="name">{{item.name}}</span>
		                	</div>
		                	<div class="text-right">
		                		<a @click="fastSet" style="color:#2d8cf0">快捷设置</a>
		                	</div>
		                </div>
		                <div class="holiday-list holiday-list-edit" v-if="mode == 'edit'">
		                	<div class="item" v-for="(item,index) in edata.list">
		                		<span class="del" @click="del(index)">
		                			<Icon type="close-circled"></Icon>
		                		</span>
		                		<span class="day">{{item.int_day}}</span>
		                		<span class="name">
		                			<Input size="small" v-model="item.name" placeholder="请输入放假事由" style="width:160px;"></Input>
		                		</span>
		                		
		                	</div>
		                </div>
		            </Card>
	            </Affix>
			</Col>
		</Row>
    </div>
</template>

<script>
	import Vue from 'vue'
	import util from '@/libs/util'
	import common from '@/libs/common.mixin'
	import globals from '@/libs/globals.mixin'
	import directive from '@/libs/directive.mixin'
    import calendar from 'c%/Calendar.vue'

    
	export default{
		mixins: [globals,common,directive],
		components:{
			calendar
		},
		data () {
			return {
				key:'',
				active_branch_id:0,
				active_branch_name:'',
				mode:'view',
				holiday:{
					year:0,
					month:0,
					day:0,
					bid:0,
					list:[]
				},
				edata:{
					delete:[],
					list:[]
				},
				months:[0,1,2,3,4,5,6,7,8,9,10,11]
			}
		},
		created(){
			this.init()
		},
		mounted () {
			this.get_data()
		},
		methods: {
			init(){
				let now = new Date();
	            this.holiday.year = now.getFullYear()
	            this.holiday.month = now.getMonth()
	            this.holiday.day = now.getDate()
			},
			selDefault(){
				this.active_branch_id = 0
				this.active_branch_name= ''
				this.holiday.bid = 0
				this.get_data()
			},
			selBranch(item){
				this.active_branch_id  = item.bid
				this.active_branch_name = item.short_name || item.branch_name
				this.holiday.bid = item.bid
				this.get_data()
			},
			daySelect(e,day){
				if(this.mode == 'view'){
					this.$Message.info('请先点击右边的设置按钮，进入编辑模式')
					return false
				}
				let index = -1,
					row = {}
				row.int_day = [e[0],util.zeroPad(e[1]),util.zeroPad(e[2])].join('-')
				row.name    = (day.isGregorianFestival || day.isLunarFestival)?day.lunar:''
				row.year    = this.holiday.year
				row.bid     = this.holiday.bid
				for(let i=0,l=this.edata.list.length;i<l;i++){
					if(this.edata.list[i].int_day == row.int_day){
						index = i
						break
					}
				}	
				if(index > -1){
					this.del(index)
				}else{
					this.edata.list.push(row)
				}



			},
			prevYear(){
				this.holiday.year--
				this.get_data()
				this.view()
			},
			nextYear(){
				this.holiday.year++
				this.get_data()
				this.view()
			},
			get_data(){
				return new Promise((resolve,reject)=>{
					this.$rest('holidays').get({
						bid:this.holiday.bid,
						year:this.holiday.year,
						pagesize:100
					})
					.success(response=>{
						this.holiday.list = response.list
						resolve()
					})
				})
				
			},
			del(index){
				if(this.edata.list[index].hid > 0){
					this.edata.delete.push(this.edata.list[index].hid)
				}
				this.edata.list.splice(index,1)
			},
			save(){
				
				this.$rest('holidays').post(this.edata)
				.success(response=>{
					this.get_data().then(()=>{
						
						this.view()
						this.$store.dispatch('updateGlobalVar','holidays')
					})
				})
				.error(response=>{
					
					this.error(response.body.message)
				})
			},
			cancel(){
				this.view()
			},
			edit(){
				this.mode = 'edit'
				this.genEditList()
			},
			view(){
				this.mode = 'view'
				this.edata.list.splice(0,this.edata.list.length)
				this.edata.delete.splice(0,this.edata.delete.length)
			},
			genEditList(){
				this.edata.list.splice(0,this.edata.list.length)
				this.holiday.list.forEach(item=>{
					this.edata.list.push(util.copy(item))
				})
			},
			fastSet() {
				this.$Modal.open('system/basic/holiday/set-modal.vue',{
					props: {
						year: this.holiday.year,
						bid: this.holiday.bid
					},
					on: {
						success: () => {
							this.get_data()
							.then(()=>{
								this.view()
								this.$store.dispatch('updateGlobalVar','holidays')
							})
						}
					}
				})
				.then(modal => {
					modal.show('快捷设置节假日')
				})
			}
		},
		computed: {	
			filterBranchs(){
		      if(!/^\s*$/.test(this.key)){
		        return this.branchs.filter(b=>b.branch_name.indexOf(this.key) !== -1 || b.short_name.indexOf(this.key) !== -1)
		      }
		      return this.branchs
		    },
		    holidays(){
		    	let map = {}
		    	if(this.mode == 'view'){
		    		this.holiday.list.forEach(item=>{
		    			map[item.int_day] = '放假'
		    		})
		    	}else{
		    		this.edata.list.forEach(item=>{
		    			map[item.int_day] = '放假'
		    		})
		    	}

		    	return map
		    },
		    holidayTotal(){
		    	if(this.mode == 'view'){
		    		return this.holiday.list.length
		    	}else{
		    		return this.edata.list.length
		    	} 
		    }
		},
		watch:{
			
		}
	}
</script>
