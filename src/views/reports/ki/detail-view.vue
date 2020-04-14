<template>
	<Modal v-drag-modal v-model="modal$.show" :title="modal$.title" :mask-closable="false" width="700">
		<Table 
            v-loading.like="'report_keys/get_fields_detail'" 
            ref="tableExcel"
            :pageSize="pageSize" 
            :page="pageIndex" 
            :stripe="true" 
            :show-header="true" 
            :data="data"
            :columns="columns" 
            :no-data-text="$store.state.config.EMPTY_DATA_TEXT" 
            :no-filtered-data-text="$store.state.config.EMPTY_FILTER_DATA_TEXT" 
            @on-sort-change="sortChange"
            :height="400"
        > 
        </Table>
        <span style="line-height: 40px">共 {{total}} 条</span>
		<div slot="footer">
			<Button type="ghost" @click="close">关闭</Button>
		</div>
	</Modal>
</template>
<script>
	import util,{_} from '@/libs/util'
	import modal from '@/libs/modal.mixin'
	import common from '@/libs/common.mixin'
	import grid from '@/libs/grid.mixin'


	export default {
        mixins: [common,grid,modal],
        props: {
            type: {
                type: String,
                default: ''
            },
            startDate: {
                type: String,
                default: ''
            },
            endDate: {
                type: String,
                default: ''
            },
        },
		data() {
			return {
                rest_api: 'report_keys/get_fields_detail',
                columns: [],
                total: 0
			}
		},
		mounted() {
			this.init_data()
		},
		methods: {
            hook_get_param (params) {
                params.field = this.type;
                params.pagesize = 1000;
                params['start_date'] = this.startDate
                params['end_date'] = this.endDate
            },
            deal_data(data) {
                this.columns = data.columns;
                this.total = data.total;
                return data.list
            }
		}
	}
</script>