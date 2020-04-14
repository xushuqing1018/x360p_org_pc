<template>
	<Modal v-drag-modal v-model="modal$.show" :title="modal$.title" :mask-closable="false" :width="600">
		<div class="c-grid">
			<!-- <div class="box box-query">
				<Form ref="ref_search" :model="search_field" :label-width="70" class="filter-form row">
					<Form-item label="加盟商" prop="fc_id" class="col-md-4 col-sm-6">
						<SelectFranchisee v-model="search_field.fc_id" @selected="init_data" />
					</Form-item>
					<Form-item label="业务日期" prop="int_day" class="col-md-4 col-sm-6">
						<DatePicker type="date" :value="search_field.int_day" @on-change="search_field.int_day = $event" placeholder="请选择业务日期" style="width: 100%"></DatePicker>
					</Form-item>
					<Form-item label="收支类型" prop="type" class="col-md-4 col-sm-6">
						<RadioGroup v-model="search_field.type" @on-change="init_data">
							<Radio :label="0">全部</Radio>
							<Radio :label="1">进账</Radio>
							<Radio :label="2">出账</Radio>
						</RadioGroup>
					</Form-item>
					<template v-if="searchExpand">
					</template>
				</Form>
				<div class="mt-2">
					<Button-group>
						<Button class="ml-2" type="primary" @click="search" icon="ios-search">查询</Button>
					</Button-group>
					<Button class="ml-2" type="primary" icon="md-refresh" @click="resetSearch">重置</Button>
				</div>
			</div> -->
			<div class="box box-result">
				<div class="toolbar">
					<Button class="ml-2" type="primary" icon="plus" @click="addInfo">添加教材</Button>
				</div>
				<div class="content">
					<div class="content-body">
						<Table
							v-loading.like="rest_api" 
							:data="data"
							:stripe="true"
							:page="pageIndex"
							:columns="columns"
							:show-header="true"
							:page-size="pageSize"
							:no-data-text="$store.state.config.EMPTY_DATA_TEXT"
							:no-filtered-data-text="$store.state.config.EMPTY_FILTER_DATA_TEXT"
							@on-sort-change="sortChange">
						</Table>
					</div>
					<div class="content-footer">
						<div class="pagenation">
							<Page
								:total="total"
								:current="pageIndex"
								:page-size="pageSize"
								:show-total="true"
								@on-change="pagenation">
							</Page>
						</div>
					</div>
				</div>
			</div>
		</div>
		<div slot="footer">
			<Button @click="close">关闭</Button>
		</div>
	</Modal>
</template>

<script>
import grid from '@/libs/grid.mixin'
import common from '@/libs/common.mixin'
import globals from '@/libs/globals.mixin'
import modal from '@/libs/modal.mixin'
import moment from 'moment'
import SelectTextbook from 'c%/SelectTextbook.vue'

const defaultSearchField = {
}

export default {
	mixins: [grid, common, modal, globals],
	components: {
		SelectTextbook
	},
	props: {
		cid: {
			type: Number,
			default: 0
		}
	},
	data() {
		return {
			rest_api: '',
			search_field: { ...defaultSearchField },
			column_keys: {
				textbook_name: {
					title: '教材名',
					show: true
				},
				tb_org_name: {
					title: '出版机构',
					show: true
				}
			},
			column_render: {
				textbook_name(h, params) {
					return h('span', params.row.textbook.tb_name)
				},
				tb_org_name(h, params) {
					return h('span', params.row.textbook.tb_org_name)
				}
			},
			operation_keys: {
				delete: {
					title: '删除',
					type: 'ios-trash'
				}
			},
			operation_func: {
				delete(params) {
					this.deleteInfo(params.row);
				}
			}
		}
	},
	created() {
		this.rest_api = `classes/${this.cid}/textbooks`;
	},
	mounted() {
		this.init_data();
	},
	methods: {
		addInfo() {
			this.$Modal.open('business/class/list/bind-textbook-info-modal.vue', {
				on: {
					update: () => {
						this.init_data();
					}
				},
				props: {
					cid: this.cid
				}
			})
			.then(modal => {
				modal.show('添加关联教材','add')
			})
		},
		deleteInfo(row) {
			this.$Modal.confirm({
				content: `确认删除该关联教材`,
				onOk:() => {
					this.deleteInfoAction(row);
				}
			})
		},
		deleteInfoAction(row) {
			let [method, url, msg] = ['delete', 'class_textbooks/' + row.ctb_id, '删除成功']

			this.$http.delete(url)
			.then(res => {
				this.$Message.success(msg)
				this.init_data()
			},res => {
				this.error(res.body.message)
			})
		},
		hook_get_param(params) {
			let search_obj = this.search_field;
			for(let o in search_obj) {
				let property = search_obj[o];
				if(property){
					params[o] = property;
				}
			}
		},
		resetSearch() {
			this.search_field = { ...defaultSearchField };
			this.search();
		}
	},
	filters: {
		nonEmpty(value) {
			if(value) {
				return value
			}
			else {
				return '-'
			}
		}
	}
}
</script>