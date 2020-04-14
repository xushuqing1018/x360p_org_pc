<style lang="less">
@import '~@/style/mixin.less';
.table{
	.header-split{
		width:80px;
		position:relative;
		text-align:center;
		overflow:hidden;
		> span{
			position:absolute;
			font-size:10px;
			font-weight:normal;
			&.right{
				top:0;
				right:5px;
			}
			&.left{
				left:5px;
				bottom:0;
			}
			&.line{
				border:1px solid #f2f2f2;
				width:140px;
				height:0;
				left:-30px;
				top:50%;
				.rotation(35deg);
			}
		}
	}
}
.table-week{
	thead > tr > th{
		border:1px solid #f2f2f2;
		text-align:center;
		width:14.285%;
		background:#EAF4FE;
	}
	tbody > tr > td{
		border:1px solid #f2f2f2;
		padding:5px 2px;
	}
	tbody > tr.footer > td{
		background:#f2f2f2;
	}
	.time-section{
		&:empty{
			content:'没有设置时间段'
		}
	}
}
.time-section{
	>li{
		list-style: none;
		line-height:30px;
		border-bottom:1px dotted #f2f2f2;
		color:#666;

		>span.index{
			display:inline-block;
			background:#2D8CF0;
			text-align:center;
			font-size:9px;
			color:#fff;
			width:16px;
			height:16px;
			vertical-align:middle;
			line-height:16px;
			border-radius:8px;
		}
		>span.section{
			display:inline-block;
			line-height:16px;
			vertical-align:middle;
		}
		>a.btn-copy{
			display:inline-block;
			height:16px;
			line-height:16px;
			vertical-align:middle;
			color:#666;
			padding-left:3px;
			&:hover{
				color:#000;
			}
		}
	}
}
.empty{
	color:#ccc;
}
.v-narrow{
	p{margin:0;}
}
.side-branch{
	margin:5px 10px;
	border:1px solid #EBEBEB;
	.branch-list{
      margin-top:10px;
      margin-bottom:10px;
      p.empty{color:#999;}
      max-height:400px;
      overflow-y:auto;
      .item{
        >a{
          display:block;
          line-height:26px;
          padding-left:10px;
          padding-right:10px;
          display:block;
          .ivu-icon{
            float:right;
            margin-top:5px;
          }
          
          &:hover{
            background:#eee;
          }
          &.selected{
            background:#2D8CF0;
            color:#fff;
          }
        }
      }
    }
}
.lesson-date{
	margin-bottom:15px;
	position:relative;
	padding-left:100px;
	label{
		position:absolute;
		left:20px;
		top:5px;
	}
	button{
		position:absolute;
		top:0;
		left:305px;
	}

}

.type-bar {
	padding: 10px 10px;
	overflow: hidden;
}

.type-bar a {
	color: #39f !important;
	float: right;
}
</style>
<template>
	<div class="page page-config">
		<div class="type-bar">
			<a v-if="type=='branch'" @click="switchType">老师可用时段设置</a>
			<a v-if="type=='teacher'" @click="switchType">校区上课时段设置</a>
		</div>
		<div>
			<Alert style="margin-left:10px;"><Icon type="information-circled"></Icon> 提示：每个校区都可以设置自己校区单独的时间段，也可以不设置，如果不设置则沿用“默认”时间段</Alert>
			<Row>
				<Col span="4">
					<Card dis-hover class="side-branch">
						<div slot="title" v-if="type=='branch'">校区时间段设置</div>
						<div slot="title" v-if="type=='teacher'">老师可用时段设置</div>
						<div class="branch-filter">
							<Input size="small" v-model="key" icon="search" placeholder="输入校区名称过滤"></Input>
						</div>
						<div class="branch-list">
							<div v-if="type=='branch'" class="item">
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
			</Col>
			<Col span="20" v-if="type=='branch'"> 
				<Row>
					<Tabs type="card" v-model="time_sections.season" @on-click="get_data">
				        <Tab-pane :label="item.title+'('+item.name+')'" :name="item.name" v-for="item in seasons"></Tab-pane>
				   </Tabs>
				</Row>
				
				<div v-loading.like="'time_sections'">
					<div class="">
						<div class="d-inline-block">
							<label>开课日期:</label>
							<DatePicker 
							type="date"
							:value="getSeasonDate(season_date.int_day_start)" 
							@on-change="setSeasonDate($event,'int_day_start')" 
							format="yyyy-MM-dd" 
							placement="bottom-end" 
							placeholder="选择开课日期" 
							style="width:160px">
							</DatePicker>
						</div>
						<div class="ml-3 d-inline-block">
							<label>结课日期:</label>
							<DatePicker 
							type="date"
							:value="getSeasonDate(season_date.int_day_end)" 
							@on-change="setSeasonDate($event,'int_day_end')" 
							format="yyyy-MM-dd" 
							placement="bottom-end" 
							placeholder="选择开课日期" 
							style="width:160px">
							</DatePicker>
						</div>
						<div class="ml-3 d-inline-block">
							<Button type="primary" @click="saveSeasonDate">确定</Button>
						</div>
					</div>
					
					<table class="table table-border table-week m-t">
						<thead>
							<tr>
								<th><div class="header-week-day">周一</div></th>
								<th><div class="header-week-day">周二</div></th>
								<th><div class="header-week-day">周三</div></th>
								<th><div class="header-week-day">周四</div></th>
								<th><div class="header-week-day">周五</div></th>
								<th><div class="header-week-day">周六</div></th>
								<th><div class="header-week-day">周日</div></th>
							</tr>
						</thead>
						<tbody>
							<tr>
								<td>
									<ul class="time-section" v-if="week_day_times_w1.length > 0">
										<li v-for="(item,index) in week_day_times_w1"><span class="index">{{index+1}}</span> <span class="section">{{item.int_start_hour}}~{{item.int_end_hour}}</span>
										<a title="复制" @click="copy_time(item)" class="btn-copy"><Icon type="ios-copy"></Icon></a></li>
										

									</ul>
									<p class="empty" v-else>未设置时间段</p>
								</td>
								<td>
									<ul class="time-section" v-if="week_day_times_w2.length > 0">
										<li v-for="(item,index) in week_day_times_w2"><span class="index">{{index+1}}</span> <span class="section">{{item.int_start_hour}}~{{item.int_end_hour}}</span>
										<a title="复制" @click="copy_time(item)" class="btn-copy"><Icon type="ios-copy"></Icon></a></li>
										

									</ul>
									<p class="empty" v-else>未设置时间段</p>
								</td>
								<td>
									<ul class="time-section" v-if="week_day_times_w3.length > 0">
										<li v-for="(item,index) in week_day_times_w3"><span class="index">{{index+1}}</span> <span class="section">{{item.int_start_hour}}~{{item.int_end_hour}}</span>
										<a title="复制" @click="copy_time(item)" class="btn-copy"><Icon type="ios-copy"></Icon></a>
										</li>
										

									</ul>
									<p class="empty" v-else>未设置时间段</p>
								</td>
								<td>
									<ul class="time-section" v-if="week_day_times_w4.length > 0">
										<li v-for="(item,index) in week_day_times_w4"><span class="index">{{index+1}}</span> <span class="section">{{item.int_start_hour}}~{{item.int_end_hour}}</span>
										<a title="复制" @click="copy_time(item)" class="btn-copy"><Icon type="ios-copy"></Icon></a>
										</li>
										

									</ul>
									<p class="empty" v-else>未设置时间段</p>
								</td>
								<td>
									<ul class="time-section" v-if="week_day_times_w5.length > 0">
										<li v-for="(item,index) in week_day_times_w5"><span class="index">{{index+1}}</span> <span class="section">{{item.int_start_hour}}~{{item.int_end_hour}}</span>
										<a title="复制" @click="copy_time(item)" class="btn-copy"><Icon type="ios-copy"></Icon></a>
										</li>
										

									</ul>
									<p class="empty" v-else>未设置时间段</p>
								</td>
								<td>
									<ul class="time-section" v-if="week_day_times_w6.length > 0">
										<li v-for="(item,index) in week_day_times_w6"><span class="index">{{index+1}}</span> <span class="section">{{item.int_start_hour}}~{{item.int_end_hour}}</span>
										<a title="复制" @click="copy_time(item)" class="btn-copy"><Icon type="ios-copy"></Icon></a>
										</li>
										
										
									</ul>
									<p class="empty" v-else>未设置时间段</p>
								</td>
								<td>
									<ul class="time-section" v-if="week_day_times_w7.length > 0">
										<li v-for="(item,index) in week_day_times_w7"><span class="index">{{index+1}}</span> <span class="section">{{item.int_start_hour}}~{{item.int_end_hour}}</span>
										<a title="复制" @click="copy_time(item)" class="btn-copy"><Icon type="ios-copy"></Icon></a>
										</li>
									</ul>
									<p class="empty" v-else>未设置时间段</p>
								</td>
							</tr>
							<tr class="footer">
								<td><Button @click="edit_week_times(1)" size="small" type="primary" long><Icon type="ios-compose-outline"></Icon>设置</Button></td>
								<td><Button @click="edit_week_times(2)" size="small" type="primary" long><Icon type="ios-compose-outline"></Icon>设置</Button></td>
								<td><Button @click="edit_week_times(3)" size="small" type="primary" long><Icon type="ios-compose-outline"></Icon>设置</Button></td>
								<td><Button @click="edit_week_times(4)" size="small" type="primary" long><Icon type="ios-compose-outline"></Icon>设置</Button></td>
								<td><Button @click="edit_week_times(5)" size="small" type="primary" long><Icon type="ios-compose-outline"></Icon>设置</Button></td>
								<td><Button @click="edit_week_times(6)" size="small" type="primary" long><Icon type="ios-compose-outline"></Icon>设置</Button></td>
								<td><Button @click="edit_week_times(7)" size="small" type="primary" long><Icon type="ios-compose-outline"></Icon>设置</Button></td>							
							</tr>
						</tbody>
						
					</table>
				</div>
			</Col>
			<Col span="20" v-if="type=='teacher'">
				<TeacherTimeGrid :bid="active_branch_id"/>
			</Col>
			</Row>
		</div>
		<week-day-times-modal
		:bid="active_branch_id" 
		:season="time_sections.season" 
		:weekday="modal.edit_week_times.week_day"
		@on-times-change="get_data" 
		ref="wdt" 
		>
		</week-day-times-modal>
		<Modal v-drag-modal :mask-closable="false" v-model="modal.copy_time.show" :title="modal.copy_time.title">
			<div class="v-narrow" v-if="modal.copy_time.show">
				<p>要复制的时间段:<span class="section">{{modal.copy_time.data.int_start_hour}}~{{modal.copy_time.data.int_end_hour}}</span></p>
				<p>复制到: <Checkbox @on-change="select_week_days($event,['1','2','3','4','5'])">工作日</Checkbox> <Checkbox @on-change="select_week_days($event,['6','7'])">周末</Checkbox></p>
				<p>
					<Checkbox-group v-model="copy_time_week_days">
						<Checkbox label="1" :disabled="modal.copy_time.data.week_day == 1">周一</Checkbox>
						<Checkbox label="2" :disabled="modal.copy_time.data.week_day == 2">周二</Checkbox>
						<Checkbox label="3" :disabled="modal.copy_time.data.week_day == 3">周三</Checkbox>
						<Checkbox label="4" :disabled="modal.copy_time.data.week_day == 4">周四</Checkbox>
						<Checkbox label="5" :disabled="modal.copy_time.data.week_day == 5">周五</Checkbox>
						<Checkbox label="6" :disabled="modal.copy_time.data.week_day == 6">周六</Checkbox>
						<Checkbox label="7" :disabled="modal.copy_time.data.week_day == 7">周日</Checkbox>
					</Checkbox-group>
				</p>
			</div>
			<div slot="footer">
				<Button type="primary" :loading="saving" @click="do_copy_time">确定</Button>
			</div>
		</Modal>
    </div>
</template>

<script>
	import util from '@/libs/util'
	import grid from '@/libs/grid.mixin'
	import common from '@/libs/common.mixin'
	import globals from '@/libs/globals.mixin'
	import directive from '@/libs/directive.mixin'
    import WeekDayTimesModal from './time/week-day-times-modal.vue'
    import TeacherTimeGrid from './time/grid.vue'
    
	export default{
		mixins: [grid,globals,common,directive],
		components:{
			WeekDayTimesModal,
			TeacherTimeGrid
		},
		data () {
			return {
				type: 'branch',
				key:'',
				active_branch_id: 0,
				branch_list: [],
				branch_map:{},
				search_list: [
					{
						id: 'season',
						name: '季节'
					}
				],
				season_date:{
					sd_id:0,
					bid:0,
					year:0,
					season:'C',
					int_day_start:0,
					int_day_end:0
				},
				time_sections: {
					bid: null,
					season: 'C',
					date:['2017-09-01','2017-09-02'],
					time_list: []
				},
				modal:{
					edit_week_times:{
						show:false,
						title:'时间段设置',
						week_day:0
					},
					copy_time:{
						show:false,
						title:'复制时间段到其他周天',
						data:{}
					}
				},
				copy_time_week_days:[]
			}
		},
		mounted () {
			this.active_branch_id = 0
			this.time_sections.bid = 0	
			
			this.autoSeason()
			// this.selDefault()
		},
		methods: {
			switchType() {
				if(this.type == 'branch') {
					if(this.filterBranchs.length > 0) {
						this.active_branch_id = this.filterBranchs[0].bid
					}
					this.type = 'teacher'
				}
				else {
					this.type = 'branch'
				}
			},
			getSeasonDate(int_day){
				return this.$filter('season_int_day')(int_day)				 
			},
			setSeasonDate(date,field){
				this.season_date[field] = date
			},
			setTimeSectionsDate(date){
				this.time_sections.date.splice(0,2,date[0],date[1]);
			},
			autoSeason(){
				if(this.seasons.length > 0) {
					let season_by_date = this.get_season_by_date(new Date())
					if(this.season_names.indexOf(season_by_date) !== -1) {
						this.time_sections.season = season_by_date
					}else{
						if(this.season_names.indexOf('A') !== -1) {
							this.time_sections.season = 'A'
						}else{
							this.time_sections.season = this.season_names[0]
						}
					}
					this.get_data()
				}
			},
			selDefault(){
				this.active_branch_id = 0
				this.time_sections.bid = 0
				if(this.type=="branch") {
					this.get_data()
				}
			},
			selBranch(item){
				this.active_branch_id  = item.bid
				this.time_sections.bid = item.bid
				if(this.type=="branch") {
					this.get_data()
				}
			},
			week_day_times(week_day){
				return this.time_sections.time_list.filter(item=>item.week_day == week_day) || []
			},
			get_data(){
				this.$rest('time_sections').get({
					bid:this.time_sections.bid,
					season:this.time_sections.season,
					order_field:'time_index',
					order_sort:'asc'
				})
				.success(response=>{
					this.time_sections.time_list = response.list
				})
				this.get_season_day()
			},
			get_season_day(){
				let season_date      = null
				let current_year     = (new Date()).getFullYear()
				let season_date_list = this.$store.state.gvars.season_dates
				let year_bid_date,
					year_common_date,
					common_date

				year_bid_date    = season_date_list.find(item=>{
					return item.year == current_year && 
					       item.season == this.time_sections.season && 
					       item.bid == this.active_branch_id
				})
				if(year_bid_date){
					season_date = year_bid_date
				}

				if(!season_date){
					year_common_date = season_date_list.find(item=>{
						return item.year == current_year && 
							   item.season == this.time_sections.season &&
							   item.bid == 0
					})
					if(year_common_date){
						season_date = year_common_date
					}
				}

				if(!season_date){
					common_date = season_date_list.find(item=>{
						return item.year == 0 &&
							   item.season == this.time_sections.season &&
							   item.bid  == 0
					})
					if(common_date){
						season_date = common_date
					}
				}		
				if(season_date){
					this.season_date.bid  = this.active_branch_id
					this.season_date.year = current_year
					this.season_date.season = this.time_sections.season
					this.season_date.int_day_start = season_date.int_day_start
					this.season_date.int_day_end   = season_date.int_day_end
					this.season_date.sd_id  = season_date.sd_id					
				}

			},
			edit_week_times(week_day){
				let branch_name = this.branch_name(this.time_sections.bid)
				let season = this.$filter('season_name')(this.time_sections.season)
				let week   = this.week_name(week_day)
				this.modal.edit_week_times.week_day = week_day
				this.$nextTick(()=>{
					this.$r('wdt').init_data()
					.show(
						util.sprintf('%s %s %s上课时间段设置',branch_name,season,week)
					)
				})
				
			},
			branch_name(bid){
				if(bid == 0){
					return '默认设置'
				}
				return this.$filter('branch_name')(bid)
			},
			week_name(week_day){
				let t = [ '一', '二', '三', '四', '五', '六','日'];
				return '周'+t[week_day - 1]
			},
			copy_time(item){
				Object.assign(this.modal.copy_time.data,item)
				this.modal.copy_time.show = true
				this.copy_time_week_days.splice(0)
			},
			
			select_week_days(val,days){
				if(val){
					days.forEach(num=>{
						if(num == this.modal.copy_time.data.week_day){
							return
						}
						if(this.copy_time_week_days.indexOf(num) === -1){
							this.copy_time_week_days.push(num)
						}
					})
				}else{
					days.forEach(num=>{
						if(num == this.modal.copy_time.data.week_day){
							return
						}
						let pos = this.copy_time_week_days.indexOf(num);
						if(pos !== -1){
							this.copy_time_week_days.splice(pos,1)
						}
					})
				}
			},
			do_copy_time(){
				if(this.copy_time_week_days.length == 0){
					this.$Message.error('请选择要复制到的周天')
					return false
				}
				this.saving = true
				this.$rest('time_sections').add_url_param(this.modal.copy_time.data.tsid,'copy')
				.post({week_days:this.copy_time_week_days})
				.success(response=>{
					this.saving = false
					this.modal.copy_time.show = false
					this.get_data()

				})
				.error(response=>{
					this.saving = false
					this.error(response.body.message)
				})
			},
			saveSeasonDate(){
				if(!/^\d{4}-\d{2}-\d{2}$/.test(this.season_date.int_day_start)){
					this.$Message.error('请设置开课日期!');
					return false;
				}
				if(!/^\d{4}-\d{2}-\d{2}$/.test(this.season_date.int_day_end)){
					this.$Message.error('请设置结课日期!');
					return false;
				}
				this.season_date.int_day_start = this.$filter('season_int_day')(this.season_date.int_day_start)
				this.season_date.int_day_end   = this.$filter('season_int_day')(this.season_date.int_day_end)
				this.$rest('season_dates')
				.post(this.season_date)
				.success(response=>{
					this.$Message.success('开课日期段已经保存!')
					this.$store.dispatch('updateGlobalVar','season_dates')
				})
				.error(response=>{
					this.error(response.body.message)
				})


			}
		},
		computed: {	
			filterBranchs(){
			  let branchs = this.branchs
			  if(!this.is_admin) {
			  	branchs = branchs.filter(b => this.bids_user.indexOf(b.bid) > -1)
			  }
		      if(!/^\s*$/.test(this.key)){
		        branchs = branchs.filter(b=>b.branch_name.indexOf(this.key) !== -1 || b.short_name.indexOf(this.key) !== -1)
		      }

		      return branchs
		    },
			week_day_times_w1(){
				return this.week_day_times(1)
			},
			week_day_times_w2(){
				return this.week_day_times(2)
			},
			week_day_times_w3(){
				return this.week_day_times(3)
			},
			week_day_times_w4(){
				return this.week_day_times(4)
			},
			week_day_times_w5(){
				return this.week_day_times(5)
			},
			week_day_times_w6(){
				return this.week_day_times(6)
			},
			week_day_times_w7(){
				return this.week_day_times(7)
			},
			seasons(){
				return this.$store.state.gvars.dicts.season
			},
			season_names() {
				let data = []
				this.seasons.forEach(s => {
					data.push(s.name)
				})
				return data
			}
		},
		watch:{
			// 'time_sections.season':{
	  //           handler:function(bid,old_bid){
	  //               this.get_data()
	  //           },
	  //           // 深度观察
	  //           deep:true
	  //       }
		}
	}
</script>
