<template>
    <div class="c-grid">
        <div class="box box-query">
            <Row class="basic">
                <Col span="6">
                    <Input class="input-search" size="small" v-model="params.search_value" v-focusme="'searchKey'">
                        <Select v-model="params.search_field" slot="prepend" style="width: 80px;">
                            <Option value="room_name">教室</Option>
                        </Select>
                        <Button-group class="input-search-append" slot="append" style="width: 25px;">
                            <Button class="btn-search" icon="ios-search" v-tooltip="'查询'" @click="search"></Button>
                        </Button-group>
                    </Input>
                </Col>
                <Col span="2">
                    <Button type="primary" icon="refresh" @click="resetSearch">重置</Button>
                </Col>
                <Col span="16"></Col>
            </Row>
        </div>
        <div class="box box-result">
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
                    <table class="table-list" v-loading="'classrooms'">
                        <thead>
                            <tr>
                                <th width="50">
                                    <div class="ivu-table-cell"><Checkbox v-model="selected.all" @on-change="toggleSelectAll" :disabled="data.length == 0"></Checkbox></div>
                                </th>
                                <th><div class="ivu-table-cell">教室名称</div></th>
                                <th><div class="ivu-table-cell">教室面积</div></th>
                                <th><div class="ivu-table-cell">额定座位数</div></th>
                                <th><div class="ivu-table-cell">允许听课数</div></th>
                                <th v-if="enable_classroom_live"><div class="ivu-table-cell">视频直播URL</div></th>
                                <th width="150"><div class="ivu-table-cell">操作</div></th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-if="action == 'add'">
								<td></td>
								
								<td><div class="ivu-table-cell">
									<Input size="small" v-model="nd.room_name" placeholder="输入教室名" style="width: 200px"></Input></div>
								</td>
								<td>
									<div class="ivu-table-cell">
										<Input size="small" v-model="nd.area" placeholder="输入教室面积" style="width: 200px">
											<span slot="append">㎡</span>
										</Input>
									</div>
								</td>
								<td><div class="ivu-table-cell">
									<InputNumber v-model="nd.seat_nums" size="small"></InputNumber></div>
								</td>
								<td><div class="ivu-table-cell">
									<InputNumber v-model="nd.listen_nums_limit" size="small"></InputNumber></div>
								</td>
                                <td v-if="enable_classroom_live">
                                    <div class="ivu-table-cell">
                                        <Input v-model="nd.camera_url" size="small"></Input>
                                    </div>
                                </td>
								<td><div class="ivu-table-cell">
									<Button-group>
										<Button type="primary" @click="save" :disabled="saving">确定</Button>
								        <Button @click="cancel" :disabled="saving">取消</Button>
								    </Button-group></div>
								</td>
                			</tr>
                            <tr v-for="item in data" v-if="data.length > 0" :key="item.cr_id">
                				<td><div class="ivu-table-cell">
                					<Checkbox v-model="item.$selected" @on-change="toggleselectOne"></Checkbox></div>
                				</td>                				
                				<td><div class="ivu-table-cell">
                					<Input v-if="item.$edit" size="small" v-model="item.room_name" placeholder="输入教室名"></Input>
                					<span v-else>{{item.room_name}}</span></div>
                				</td>
                				<td><div class="ivu-table-cell">
                					<Input v-if="item.$edit" size="small" v-model="item.area" placeholder="输入教室面积">
                						<span slot="append">㎡</span>
                					</Input>
                					<span v-else>{{item.area}} ㎡</span></div>
                				</td>
                				<td><div class="ivu-table-cell">
                					<InputNumber v-if="item.$edit" v-model="item.seat_nums" size="small"></InputNumber>
                					<span v-else>{{item.seat_nums}}</span></div>
                				</td>
                				<td><div class="ivu-table-cell">
                					<InputNumber v-if="item.$edit" v-model="item.listen_nums_limit" size="small"></InputNumber>
                					<span v-else>{{item.listen_nums_limit}}</span></div>
                				</td>
                                <td v-if="enable_classroom_live"><div class="ivu-table-cell">
                                    <Input v-if="item.$edit" v-model="item.camera_url" size="small"></Input>
                                    <span v-else>{{item.camera_url}}</span></div>
                                </td>
                				<td v-if="item.$edit"><div class="ivu-table-cell">
									<Button-group>
										<Button type="primary" @click="save(item)" :disabled="saving">确定</Button>
								        <Button @click="cancel(item)" :disabled="saving">取消</Button>
								    </Button-group></div>
                				</td>
                				<td v-else><div class="ivu-table-cell">
                					<Button type="ghost" shape="circle" size="small" @click="edit(item)" icon="edit"></Button>
                					<Button type="ghost" shape="circle" size="small" @click="seat(item)" icon="grid"></Button></div>
                				</td>
                			</tr>
                            <tr v-if="data.length == 0 && action !== 'add'">
                				<td :colspan="enable_classroom_live?6:5" style="text-align: center">当前校区还没有设置教室</td>
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
        <seat ref="ref_seat" @on-save-success="init_data"></seat>
    </div>
</template>
<script>
    import util from '@/libs/util'
    import grid from '@/libs/grid.mixin'
    import directive from '@/libs/directive.mixin'
    import globals from '@/libs/globals.mixin'
    import common from '@/libs/common.mixin'
    import ImportButton from 'c%/ImportButton.vue'
    import $rest from '@/libs/rest'
    import store from '@/store'
    import seat from './seat.vue'
    
    export default {
        mixins: [common, grid, directive, globals],
        components: {
        	seat,
            ImportButton
        },
        data() {
            return {
                rest_api: 'classrooms',
                action: '',
                selected: {
                    all: false,
                    none: true
                },
                nd: {
                    bid: 0,
                    area: 0,
                    room_name: '',
                    seat_nums: 16,
                    listen_nums_limit: 8,
                    camera_url:''
                }
            }
        },
        computed:{
			bid() {
				return this.$store.state.branch.id
			}
		},
        methods: {
        	seat (item) {
        		this.$r('ref_seat')
        		.set('info',item)
        		.show('座位布局','add')
        	},
            add() {
                if(this.action == '') {
                    this.action = 'add'
                }
            },
            del() {
                let ids = []
                this.data.forEach((item) => {
                    if(item.$selected == true) {
                        ids.push(item.cr_id)
                    }
                })
                $rest(this.rest_api).delete(ids)
                .success(response => {
                    this.action = ''
                    this.init_data()
                })
                .error(response => {
                    this.error(response.body.message)
                })
            },
            save(item) {
                if(!item.target){
					$rest(this.rest_api).add_url_param(item.cr_id)
					.put(item)
					.success(response=>{
						this.action = ''
						this.init_data()
					})
					.error(response=>{
						this.error(response.body.message)
					})
				}else{
					//add save
					if(this.nd.room_name == ''){
						this.$Message.error('请输入教室名')
						return false
					}
                    this.nd.bid = this.bid
					$rest(this.rest_api)
					.post(this.nd)
					.success(response=>{
						this.action = ''
						this.init_data()
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
            deal_data (data) {
            	this.$store.dispatch('updateGlobalVar','classrooms')
            	
            	return data.list
            },            
        },
        mounted() {
            this.params.search_field = 'room_name'
            this.init_data()
        },
        watch:{
			'$store.state.branch.id':{
	            handler:function(bid,old_bid){
                    this.init_data()
                    this.selected.all = false
                    this.selected.none = true
	            },
	            deep:true
	        }
		}
    }
</script>
<style lang="less" scoped>
    .ivu-table-wrapper {
        border-left: none;
    }
</style>