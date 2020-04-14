<template>
	<Modal v-model="modal$.show" :title="modal$.title" width="800" :mask-closable="false">
		<div class="row">
			<div class="content col-sm-8">
                <div class="content-body">
                    <Table 
                	ref="table"
                    v-loading.like="'center_schools'" 
                    :pageSize="pageSize" 
                    :page="pageIndex" 
                    :border="true" 
                    :stripe="true" 
                    :show-header="true" 
                    :data="data" 
                    :columns="columns" 
                    :no-data-text="$store.state.config.EMPTY_DATA_TEXT" 
                    :no-filtered-data-text="$store.state.config.EMPTY_FILTER_DATA_TEXT" 
                    @on-sort-change="sortChange"
                    @on-select-all="handleSelectAll"
                    > 
                    </Table>
                </div>
                <div class="content-footer mt-3">
                    <div class="pagenation">
                        <Page 
                        :total="total" 
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
			<div class="col-sm-4">
				<Card dis-hover>
                    <div slot="title">
                        <span>已选择：<span class="badge">{{selectedTotal}}</span></span>
                        <Button @click="clearSelectedId" class="pull-right" type="ghost" shape="circle" size="small" icon="trash-a" title="清空"></Button>
                    </div>
                    <ul class="multi-selected-list">
                        <li v-for="item in selectedList">
                            <span v-if="item">{{item.name}}</span>
                            <Button @click="cancelSelectedId(item)" class="pull-right" type="ghost" shape="circle" size="small" icon="trash-a" title="移除"></Button>
                        </li>
                    </ul>
                </Card>
			</div>
		</div>	
		
		<div slot="footer">
			<Button type="ghost" @click="cancel">取消</Button>
			<Button type="primary" @click="ok">确定</Button>
		</div>
	</Modal>
</template>

<script>
	import util from '@/libs/util'
	import modal from '@/libs/modal.mixin'
	import grid from '@/libs/grid.mixin'
	
	export default{
		mixins: [grid,modal],
		data () {
			return {
				rest_api: 'public_schools/1/center_schools',
				pk: 'id',
				column_keys: {
					checkbox: {
						type: 'selection',
                        width: 60,
                        align: 'center'
					},
					name: {
						title: '校区名称',
						show: true
					},
					address: {
						title: '地址',
						show: true
					}
				},
				column_render: {
					address (h,params){
						let row = params.row
						return h('span',util.sprintf('%s%s%s',row.province,row.city,row.district))
					}
				}
			}
		},
		methods: {
			ok () {
				
			},
			cancel () {
				this.close()
			},
			handleSelectAll (data) {
				console.log(data)
			},
			clearSelectedId (status) {
				this.$refs['table'].selection.selectAll(status)
			},
			cancelSelectedId (row) {
				
			},
			
		},
		computed: {
			selectedTotal () {
				return 0
			},
			selectedList () {
				return []
			}
		}
	}
</script>

<style>
</style>