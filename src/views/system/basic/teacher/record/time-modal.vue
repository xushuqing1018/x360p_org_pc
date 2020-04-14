<template>
	<Modal :mask-closable="false" @on-cancel="cancel" v-model="modal$.show" :title="modal$.title" width="800"> 
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
										<Time-picker v-model="addData.start" confirm style="width:80px" size="small" format="HH:mm" :steps="[1,15,15]" placeholder="选择时间"></Time-picker>
									</td>
									<td>
										<Time-picker v-model="addData.end" confirm style="width:80px" size="small" format="HH:mm" :steps="[1,15,15]" placeholder="选择时间"></Time-picker>
									</td>
									<td>
										<Button-group>
											<Button type="primary" @click="save" :disabled="saving">确定</Button>
									        <Button @click="cancel" :disabled="saving">取消</Button>
									    </Button-group>
									</td>
	                			</tr>
	                			<tr v-for="(item,index) in weekList" :key="index" v-if="weekList.length > 0">
	                				<td>
	                					<Checkbox v-model="item.$selected" @on-change="refresh_select"></Checkbox>
	                				</td>
	                				<td>{{index}}</td>
	                				<td>
	                					<Time-picker v-model="editData.start" confirm style="width:80px;" size="small" format="HH:mm" :steps="[1,15]" placeholder="选择时间" v-if="item.$edit"></Time-picker>
	                					<span v-else>{{item.int_start_hour}}</span>
	                				</td>
	                				<td>
	                					<Time-picker v-model="editData.end" confirm style="width:80px;" size="small" format="HH:mm" :steps="[1,15]" placeholder="选择时间" v-if="item.$edit"></Time-picker>
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
	import util from '@/libs/util'
	import modal from '@/libs/modal.mixin'
	import common from '@/libs/common.mixin'
	import moment from 'moment'
	
	export default{
		mixins: [modal,common],
		data () {
			return {
                action: '',
				selected: {
                    all:false,
                    none:true
                },
                addData: {
                    start: '',
                    end: ''
                },
                editData: {
                    start: '',
                    end: ''
                },
				weekList: [],
				week_day: 0,
				eid: 0
			}
		},
		watch: {
			'modal$.show': function(val) {
				if(val == true) {
					this.initData();
				}
			}
		},
		methods: {
			initData() {
				this.$http.get('employee_time_sections',{
					params: {
						eid: this.eid,
						week_day: this.week_day
					}
				})
				.then(res => {
					this.weekList = res.body.data.list.map(function(item) {
						item.$selected = false;
						item.$edit = false;
						return item;
					})
				})
			},
            toggle_select_all(val){
                if(val){
					this.weekList.forEach(function(item) {
						item.$selected = true;
					})
					this.selected.all = true;
					this.selected.none = false;
                }else{
					this.weekList.forEach(function(item) {
						item.$selected = false;
					})
					this.selected.none = true;
					this.selected.all = false;
                }
            },
            refresh_select() {
				var list_length = this.weekList.length;
				var array = this.weekList.filter(function(item) {
					return item.$selected == true;
				});
				if(array.length == 0) {
					this.selected.none = true;
					this.selected.all = false;
				}else if(list_length == array.length){
					this.selected.none = false;
					this.selected.all = true;
				}else {
					this.selected.none = false;
					this.selected.all = false;
				}
			},
			checkTime(start,end) {
				var _start = moment(start, "HH:mm");
				var _end = moment(end, "HH:mm");
				if(_start.isAfter(_end)) {
					return '开始时间不能大于结束时间！';
				}
				var isExist = false;
				for (let i = 0; i < this.weekList.length; i++) {
					const item = this.weekList[i];
					if(item.start == start&&item.end == end) {
						isExist = true;
						break;
					}
				}
				if(isExist) return '该时段已存在！';
				return true;
			},
			del() {
				var del_ids = [];
				this.weekList.forEach(function(item) {
					if(item.$selected) {
						del_ids.push(item.ets_id)
					}
				})
				this.$http.post('employee_time_sections/batch_delete',{
					ets_ids: del_ids
				})
				.then(res => {
					this.action = '';
					this.initData();
					this.$Message.success('删除成功')
				},res => {
					this.action = '';
					this.initData();
					this.$emit('on-ok');
					this.error(res.body.message)
				})
			},
            add() {
                if(this.action == '') {
                    this.action = 'add';
                }
            },
            edit(item) {
				if(this.action == '') {
					this.action = 'edit';
					item.$edit = true;
					this.editData.start = item.int_start_hour;
					this.editData.end = item.int_end_hour;
				}
            },
			cancel(item) {
                if(this.action == 'add') {
					this.addData = {};
					this.action = '';
                }
                else if(this.action == 'edit') {
					this.action = '';
					item.$edit = false;
                }
			},
			save(item) {
                if(this.action == 'add') {
					var checkRst = this.checkTime(this.addData.start,this.addData.end);
                    if(checkRst == true) {
						this.$http.post('employee_time_sections',{
							eid: this.eid,
							week_day: this.week_day,
							int_start_hour: this.addData.start,
							int_end_hour: this.addData.end
						})
						.then(res => {
							this.action = '';
							this.initData();
							this.$emit('on-ok');
							this.$Message.success('添加时段成功')
						},res => {
							this.action = '';
							this.initData();
							this.error(res.body.message)
						})
					}
					else {
						this.$Message.error(checkRst);
					}
                }
                else if(this.action == 'edit') {
					var checkRst = this.checkTime(this.editData.start,this.editData.end);
                    if(checkRst == true) {
						this.$http.put('employee_time_sections',{
							ets_id: item.ets_id,
							eid: this.eid,
							week_day: this.week_day,
							int_start_hour: this.editData.start,
							int_end_hour: this.editData.end
						})
						.then(res => {
							this.action = '';
							this.initData();
							this.$emit('on-ok');
							this.$Message.success('编辑时段成功')
						},res => {
							this.action = '';
							this.initData();
							this.error(res.body.message)
						})
					}
					else {
						this.$Message.error(checkRst);
					}
                }
			}
		}
	}
</script>
