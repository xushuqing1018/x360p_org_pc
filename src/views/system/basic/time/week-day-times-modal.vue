<template>
	<Modal v-drag-modal :mask-closable="false" width="780" v-model="modal$.show" :title="modal$.title" @on-cancel="close">
		<div class="c-grid">
			<div class="box box-result" style="box-shadow:none">
	            <div class="toolbar">
		            <Button-group>
		                <Button type="primary" size="small" @click="add" icon="plus">新增</Button>
		                <Button type="error" size="small" @click="del" icon="ios-close-empty" :disabled="selected.none">删除</Button>
		            </Button-group>   
	            </div>
	            <div class="content">
	                <div class="content-body">
	                	<table class="table">
	                		<thead>
	                			<tr>
	                				<th width="50"><Checkbox v-model="selected.all" @on-change="toggle_select_all"></Checkbox></th>
	                				<th width="50">序号</th>
	                				<th>开始时间</th>
	                				<th>结束时间</th>
	                				<th width="100">操作</th>
	                			</tr>
	                		</thead>
	                		<tbody>
	                			<tr v-if="action == 'add'">
									<td></td>
									<td></td>
									<td>
										<Time-picker confirm @on-change="nd.new_int_start_hour = $event" style="width:80px" size="small" :value="nd.int_start_hour" format="HH:mm" :steps="[1,15,15]" placeholder="选择时间"></Time-picker>
									</td>
									<td>
										<Time-picker confirm @on-change="nd.new_int_end_hour = $event" style="width:80px" size="small" :value="nd.int_end_hour" format="HH:mm" :steps="[1,15,15]" placeholder="选择时间"></Time-picker>
									</td>
									<td>
										<Button-group>
											<Button type="primary" @click="save" :disabled="saving">确定</Button>
									        <Button @click="cancel" :disabled="saving">取消</Button>
									    </Button-group>
									</td>
	                			</tr>
	                			<tr v-for="(item,index) in dataList" v-if="dataList.length > 0">
	                				<td>
	                					<Checkbox v-model="item.$selected" @on-change="refresh_select"></Checkbox>
	                				</td>
	                				<td>{{index+1}}</td>
	                				<td>
	                					<Time-picker @on-change="item.new_int_start_hour = $event" confirm style="width:80px;" size="small" :value="item.int_start_hour" format="HH:mm" :steps="[1,15]" placeholder="选择时间" v-if="item.$edit"></Time-picker>
	                					<span v-else>{{item.int_start_hour}}</span>
	                				</td>
	                				<td>
	                					<Time-picker confirm @on-change="item.new_int_end_hour = $event" style="width:80px;" size="small" :value="item.int_end_hour" format="HH:mm" :steps="[1,15]" placeholder="选择时间" v-if="item.$edit"></Time-picker>
	                					<span v-else>{{item.int_end_hour}}</span>
	                				</td>
	                				<td v-if="item.$edit">
										<Button-group>
											<Button type="primary" @click="save(item)" :disabled="saving">确定</Button>
									        <Button @click="cancel(item)" :disabled="saving">取消</Button>
									    </Button-group>
	                				</td>
	                				<td v-else>
	                					<Button size="small" @click="edit(item)" icon="edit"></Button>
	                				</td>
	                			</tr>
	                		</tbody>
	                	</table>
	                </div>
	            </div>
	        </div>
		</div>
		<div style="display:none;" slot="footer">
		</div>
	</Modal>
</template>
<script>
import common from '@/libs/common.mixin'
import util   from '@/libs/util'
export default {
	name:'WeekDayTimesModal',
	mixins:[common],
	props:{
		bid:Number,
		season:String,
		weekday:Number
	},
	data(){
		return {
			
			action:'',
			selected:{
				all:false,
				none:true
			},
			nd:{
				int_start_hour:'',
				int_end_hour:'',
				time_index:0,
				bid:0,
				season:'',
				week_day:0
			},
			dataList:[],
			modal$:{
                show:false,
                title:'',
                action:''
            }
		}
	},
	methods:{
		show(title,action){
            action = action || 'list'
    		this.modal$.show        = true
            this.modal$.title       = title
            this.modal$.action      = action
            return this
    	},
    	close(){
    		this.modal$.show = false
            this.$emit('on-close')
            return this
    	},
		add(){
			if(this.action == ''){
				this.action = 'add'
			}
		},
		edit(item){
			if(item && this.action == ''){
				item.$edit = true
				this.action = 'edit'
			}
		},
		cancel(item){
			if(item){
				item.$edit = false
				this.action = ''
				item.new_int_start_hour = null
				item.new_int_end_hour   = null
			}else{
				this.action = ''
			}
		},
		save(item){	
			let reg_time = /^\d{2}:\d{2}$/
			if(!item.target){
				
				//edit save
				if(item.new_int_start_hour){
					item.int_start_hour = item.new_int_start_hour
					delete item.new_int_start_hour
				}

				if(item.new_int_end_hour){
					item.int_end_hour = item.new_int_end_hour
					delete item.new_int_end_hour
				}
			
				if(!reg_time.test(item.int_start_hour)){
					return false
				}
				if(!reg_time.test(item.int_end_hour)){
					return false
				}

				
				this.$rest('time_sections').add_url_param(item.tsid)
				.put(item)
				.success(response=>{
					this.clear()
					this.init_data()
					this.$emit('on-times-change',this.dataList)					
					this.$store.dispatch('updateGlobalVar','time_sections')
				})
				.error(response=>{
					this.error(response.body.message)
				})


			}else{
				//add save
	
				if(this.nd.new_int_start_hour){
					this.nd.int_start_hour = this.nd.new_int_start_hour
					delete this.nd.new_int_start_hour
				}
				if(this.nd.new_int_end_hour){
					this.nd.int_end_hour = this.nd.new_int_end_hour
					delete this.nd.new_int_end_hour
				}
				this.nd.bid = this.bid
				this.nd.season = this.season
				this.nd.week_day = this.weekday

				
				if(!reg_time.test(this.nd.int_start_hour)){
					return false
				}
				if(!reg_time.test(this.nd.int_end_hour)){
					return false
				}


				this.$rest('time_sections').post(this.nd)
				.success(response=>{					
					this.clear()
					this.init_data()
					this.$emit('on-times-change',this.dataList)
					this.$store.dispatch('updateGlobalVar','time_sections')
				})
				.error(response=>{
					this.error(response.body.message)
				})

			}
		},
		del(){
			let ids = [];
			this.dataList.forEach((item,key)=>{
				if(item.$selected === true){
					ids.push(item.tsid)
				}
			})
			this.$rest('time_sections').delete(ids)
			.success(response=>{
				this.init_data()				
				this.$store.dispatch('updateGlobalVar','time_sections')
				this.$emit('on-times-change',this.dataList)
			})
			.error(response=>{
				this.error(response.body.message)
			})
		},
		clear(){
			this.action = ''
		},
		init_data(){
			this.$rest('time_sections').get({
				bid:this.bid,
				season:this.season,
				week_day:this.weekday,
				order_field:'time_index',
				order_sort:'ASC'
			})
			.success(response=>{
				this.dataList = response.list
			})
			return this
		},
		refresh_select(){
			let sels = this.dataList.filter(it=>it.$selected === true)
			if(sels && sels.length > 0){
				this.selected.none = false
			}else{
				this.selected.none = true
			}
			if(sels.length == this.dataList.length){
				this.selected.all = true
			}else{
				this.selected.all = false
			}
		},
		toggle_select_all(val){
			if(val){
				this.dataList.forEach((item,key)=>{
					item.$selected = true
				})
				this.selected.none = false
			}else{
				this.dataList.forEach((item,key)=>{
					item.$selected = false
				})
				this.selected.none = true
			}
		}
	},
	mounted(){
	},
	
	watch:{
		
	}
}
</script>