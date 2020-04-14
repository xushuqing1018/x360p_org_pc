<template>
	<div>
	<div class="like-input">
		<Tag v-for="item in result" :name="item.lid" :key="item.lid" closable @on-close="del_result" style="margin:0">
			{{item.lesson_name}}
		</Tag>
	</div>
	<Button type="primary" size="small" @click="modal=true"><slot><Icon type="funnel"></Icon>选择课程</slot>
		<Modal :mask-closable="false" width="800" v-model="modal" title="选择课程">
			<Input class="mb-4" v-model="search_value" placeholder="请输入课程名称搜索">
				<Button icon="ios-search" slot="append"></Button>
			</Input>
			<div  style="max-height: 500px;overflow: auto;">
			<table class="modal-table">
				<thead>
					<th><div class="ivu-table-cell">#</div></th>
					<th width="80" style="text-align: center;"><div class="ivu-table-cell">封面</div></th>
					<th><div class="ivu-table-cell">课程</div></th>
					<th><div class="ivu-table-cell">售价</div></th>
					<th><div class="ivu-table-cell">课时数</div></th>
					<th><div class="ivu-table-cell">选择</div></th>
				</thead>
				<tr v-for="(item,index) in filter_data()" 
					@click.stop="check_row($event,item)">
					<td><div class="ivu-table-cell">{{index + 1}}</div></td>
					<td>
						<div class="ivu-table-cell">
							<div class="img-thumb">
		        				<img v-if="item.lesson_cover_picture" :src="item.lesson_cover_picture" class="img-thumb">
		        				<img v-else src="../../../static/img/avatars/8.jpg">
	        				</div>
        				</div>
					</td>
					<td>
						<div class="ivu-table-cell">
							<h5>{{item.lesson_name}}</h5>
		        			<p>简介： {{item.short_desc}}</p>
		        			<p>适应年龄： {{item.fit_age_start}} 到  {{item.fit_age_end}}</p>
		        			<p>适应年级： {{item.fit_grade_start}} 到  {{item.fit_grade_end}}</p>
						</div>
					</td>
					<td><div class="ivu-table-cell">{{label_currency}} {{item.sale_price}}</div></td>
					<td><div class="ivu-table-cell"><Icon type="ios-timer"></Icon> {{item.std_hours}}</div></td>
					<td>
						<div class="ivu-table-cell">
							<Radio @on-change="check_row($event,item)" :value="parseInt(active_lid)===parseInt(item.lid)"></Radio>							
						</div>
					</td>
				</tr>
			</table>
			</div>
			<div slot="footer">
				<Button type="text" @click="modal=false">取消</Button>
				<Button type="primary" @click="modal=false">确定</Button>
			</div>
		</Modal>
	</Button>	
	</div>
</template>

<script>
	export default{
		data () {
			return {
				data: [],
				modal: false,
				active_lid: 0,
				search_value: '',
				result:[]
			}
		},
		watch: {
			active_lid: function (value) {
				if(typeof this.data !== 'undefined' && typeof this.data.find(l=>l.lid===this.active_lid) !== 'undefined'){
					this.result = [this.data.find(l=>l.lid===this.active_lid)]
					this.$emit('choose-lesson',this.result)	
				}				
			}
		},
		mounted () {			
			this.init_data().then(()=>{
				if(typeof this.$route.query.lid !== 'undefined'){
					this.active_lid = parseInt(this.$route.query.lid)
				}		
			})					
		},
		methods: {
			check_row (value,row) {
				this.active_lid = row.lid
			},
			init_data () {				
				return new Promise((resolve,reject)=>{
					this.$http.get('lessons')
					.then(response=>{
						this.data = response.body.data.list
						resolve()
					}).catch(response=>{
						reject()
					})
				})
			},
			filter_data () {
				let value = this.search_value
				if(value === ''){
					return this.data
				}else{
					return this.data.filter(l=>l.lesson_name.indexOf(value)>-1)
				}
			},
			del_result (event,name) {
				this.result = []
				this.active_lid = 0
			}
		}
	}
</script>